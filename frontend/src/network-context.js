import { createContext, useContext } from 'react'

// Shared snapshot of the network: peers, their libp2p identities, and the
// content index. Provided by <NetworkProvider> in state.jsx.
export const NetworkContext = createContext(null)

export function useNetwork() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used inside <NetworkProvider>')
  return ctx
}
