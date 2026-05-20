import { useCallback, useEffect, useState } from 'react'
import { getAllPeers, getFiles, getP2PInfo } from './api'
import { NetworkContext } from './network-context'

// One poller for the whole dashboard. Every card used to fetch /peers on its
// own timer, which meant three requests per tick and three different ideas of
// who was online. The provider polls once and hands the same snapshot to the
// stat strip, the uploader's peer picker, the peer list and the content index.
const POLL_MS = 4000

export function NetworkProvider({ children }) {
  // peers: [{ uuid, addr, peerID }] — peerID is filled in when libp2p is on.
  const [peers, setPeers] = useState([])
  const [files, setFiles] = useState({})
  const [status, setStatus] = useState('loading') // loading | online | offline
  const [lastSync, setLastSync] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const registry = await getAllPeers()
      const list = Object.entries(registry).map(([uuid, addr]) => ({ uuid, addr }))

      // Ask each peer for its libp2p identity in parallel; a peer running
      // without libp2p simply has no PeerID to show.
      await Promise.all(
        list.map(async (p) => {
          try {
            const info = await getP2PInfo(p.addr)
            if (info.enabled) p.peerID = info.peerID
          } catch {
            // Peer unreachable or libp2p disabled — leave peerID undefined.
          }
        })
      )

      // In decentralized mode /files is a node-local view — each peer only
      // knows the names it uploaded itself. Union every peer's view so the
      // dashboard shows one index for the network, merging the holder lists
      // when the same name is known to more than one node.
      const map = {}
      await Promise.all(
        list.map(async (p) => {
          try {
            const view = await getFiles(p.addr)
            for (const [filename, entry] of Object.entries(view || {})) {
              const holders = new Set([
                ...(map[filename]?.holders || []),
                ...(entry.holders || []),
              ])
              map[filename] = { cid: entry.cid, holders: [...holders] }
            }
          } catch {
            // Peer unreachable this tick — its names just miss this snapshot.
          }
        })
      )

      setPeers(list)
      setFiles(map)
      setStatus('online')
      setLastSync(new Date())
    } catch {
      setPeers([])
      setFiles({})
      setStatus('offline')
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_MS)
    return () => clearInterval(id)
  }, [refresh])

  return (
    <NetworkContext.Provider value={{ peers, files, status, lastSync, refresh }}>
      {children}
    </NetworkContext.Provider>
  )
}
