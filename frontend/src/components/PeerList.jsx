import { useNetwork } from '../network-context'

export default function PeerList() {
  const { peers, status } = useNetwork()

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    )
  }

  if (peers.length === 0) {
    return (
      <div className="empty">
        <span>No peers registered.</span>
        <span className="label">Start a node: ./bin/verity -peers=3</span>
      </div>
    )
  }

  return (
    <ul className="list">
      {peers.map((p) => (
        <li key={p.uuid} className="row flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="dot dot--live" />
              <span className="mono">{p.addr}</span>
            </span>
            <span className={`badge ${p.peerID ? 'badge--ok' : ''}`}>
              {p.peerID ? 'LIBP2P' : 'HTTP'}
            </span>
          </div>
          {p.peerID && (
            <span className="label truncate" title={p.peerID}>
              {p.peerID}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
