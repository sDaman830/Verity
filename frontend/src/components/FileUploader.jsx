import { useEffect, useState } from 'react'
import { uploadFile } from '../api'
import { useNetwork } from '../network-context'
import Cid from './Cid'

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`
}

export default function FileUploader() {
  const { peers, refresh } = useNetwork()
  const [file, setFile] = useState(null)
  const [target, setTarget] = useState('')
  const [dragging, setDragging] = useState(false)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState(null) // { filename, cid }
  const [error, setError] = useState('')

  // Default to the first peer, and recover if the selected one disappears.
  useEffect(() => {
    if (peers.length === 0) return
    const addrs = peers.map((p) => p.addr)
    if (!target || !addrs.includes(target)) setTarget(addrs[0])
  }, [peers, target])

  function choose(next) {
    setFile(next)
    setResult(null)
    setError('')
  }

  async function handleUpload() {
    if (!file || !target || pending) return
    setPending(true)
    setError('')
    try {
      const res = await uploadFile(file, target)
      setResult(res)
      setFile(null)
      refresh() // pull the new name into the content index immediately
    } catch (err) {
      setError(err.message || 'Upload failed')
      setResult(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <label
        className={`dropzone ${dragging ? 'dropzone--active' : ''} ${
          file ? 'dropzone--filled' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.[0]) choose(e.dataTransfer.files[0])
        }}
      >
        <input
          type="file"
          onChange={(e) => choose(e.target.files?.[0] || null)}
          aria-label="Choose a file to upload"
        />
        {file ? (
          <>
            <span className="text-sm font-medium">{file.name}</span>
            <span className="label">{formatBytes(file.size)}</span>
          </>
        ) : (
          <>
            <span className="text-sm">
              Drop a file here, or <span className="underline">browse</span>
            </span>
            <span className="label">It will be hashed into a CID on arrival</span>
          </>
        )}
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="field sm:flex-1"
          disabled={peers.length === 0}
          aria-label="Target peer"
        >
          {peers.length === 0 ? (
            <option>no peers available</option>
          ) : (
            peers.map((p) => (
              <option key={p.uuid} value={p.addr}>
                {p.addr}
              </option>
            ))
          )}
        </select>
        <button
          onClick={handleUpload}
          className="btn"
          disabled={!file || !target || pending}
        >
          {pending && <span className="spinner" />}
          {pending ? 'Hashing…' : 'Upload'}
        </button>
      </div>

      {error && (
        <div className="row flex items-center gap-2">
          <span className="badge badge--err">FAILED</span>
          <span className="text-xs text-[var(--color-ink-2)]">{error}</span>
        </div>
      )}

      {result && (
        <div className="row flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{result.filename}</span>
            <span className="badge badge--ok">STORED</span>
          </div>
          <Cid value={result.cid} head={14} tail={8} />
        </div>
      )}
    </>
  )
}
