import { useState } from 'react'
import { searchAcrossPeers } from '../api'
import { useNetwork } from '../network-context'
import Cid from './Cid'

export default function FileBrowser() {
  const { peers } = useNetwork()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    const q = query.trim()
    if (!q || searching) return
    setSearching(true)
    try {
      const found = await searchAcrossPeers(q, peers.map((p) => p.addr))
      setResults(found)
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="filename or bafkrei…"
          className="field sm:flex-1"
          aria-label="Search files across peers"
        />
        <button
          onClick={handleSearch}
          className="btn btn--ghost"
          disabled={!query.trim() || searching}
        >
          {searching && <span className="spinner" />}
          {searching ? 'Querying…' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <>
          <p className="label">
            {results.length} match{results.length === 1 ? '' : 'es'} across{' '}
            {peers.length} peer{peers.length === 1 ? '' : 's'}
          </p>
          <ul className="list">
            {results.map((r) => (
              <li key={r.cid} className="row flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium truncate">
                    {r.filename || '(unnamed)'}
                  </span>
                  {r.holders[0] && (
                    <a
                      href={`http://${r.holders[0]}/download?cid=${r.cid}&filename=${encodeURIComponent(
                        r.filename || r.cid
                      )}`}
                      className="text-xs font-semibold text-[var(--color-accent)] hover:underline shrink-0"
                    >
                      Download ↓
                    </a>
                  )}
                </div>
                <Cid value={r.cid} />
                <span className="label">
                  {r.holders.length
                    ? `${r.holders.length} holder${r.holders.length === 1 ? '' : 's'} · ${r.holders.join(', ')}`
                    : 'no known holders'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {searched && results.length === 0 && !searching && (
        <div className="empty">
          <span>No content matched that query.</span>
          <span className="label">Try a partial filename, or paste a full CID</span>
        </div>
      )}
    </>
  )
}
