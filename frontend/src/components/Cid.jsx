import { useEffect, useState } from 'react'

// CIDs are ~60 chars of base32 — too long to read, too important to hide.
// Show head and tail with a middle ellipsis, and copy the full value on click.
function truncate(cid, head = 10, tail = 6) {
  if (cid.length <= head + tail + 1) return cid
  return `${cid.slice(0, head)}…${cid.slice(-tail)}`
}

export default function Cid({ value, head, tail }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(id)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard blocked (non-secure origin, denied permission) — the full
      // value is still in the title attribute for manual selection.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Copied' : `${value} — click to copy`}
      className={`cid ${copied ? 'cid--copied' : ''}`}
    >
      <span className="truncate">{truncate(value, head, tail)}</span>
      <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      <span className="sr-only">{copied ? 'Copied' : 'Copy content ID'}</span>
    </button>
  )
}
