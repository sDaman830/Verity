import { useNetwork } from '../network-context'
import Cid from './Cid'

export default function FileMap() {
  const { files, status } = useNetwork()
  const entries = Object.entries(files)

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="empty">
        <span>Nothing indexed yet.</span>
        <span className="label">Upload a file to give this node a name → CID entry</span>
      </div>
    )
  }

  return (
    <ul className="list">
      {entries.map(([filename, entry]) => (
        <li key={filename} className="row flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium truncate">{filename}</span>
            <span className="badge">
              {(entry.holders || []).length} holder
              {(entry.holders || []).length === 1 ? '' : 's'}
            </span>
          </div>
          <Cid value={entry.cid} />
          <span className="label truncate">
            {(entry.holders || []).join(', ') || 'no known holders'}
          </span>
        </li>
      ))}
    </ul>
  )
}
