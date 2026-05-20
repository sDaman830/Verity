import { NetworkProvider } from './state'
import { useNetwork } from './network-context'
import Logo from './components/Logo'
import FileUploader from './components/FileUploader'
import FileBrowser from './components/FileBrowser'
import PeerList from './components/PeerList'
import FileMap from './components/FileMap'

export default function App() {
  return (
    <NetworkProvider>
      <div className="shell">
        <TopBar />
        <StatStrip />

        <main className="grid gap-4 mt-4 lg:grid-cols-2">
          <Card
            index="01"
            title="Ingest"
            hint="Hash a file and pin it to a peer."
            slug="upload"
          >
            <FileUploader />
          </Card>
          <Card
            index="02"
            title="Resolve"
            hint="Fuzzy filename match, or a direct CID lookup."
            slug="discover"
          >
            <FileBrowser />
          </Card>
          <Card
            index="03"
            title="Content index"
            hint="Every peer's name → CID view, merged."
            slug="filemap"
          >
            <FileMap />
          </Card>
          <Card
            index="04"
            title="Network"
            hint="Live nodes and their libp2p identities."
            slug="peers"
          >
            <PeerList />
          </Card>
        </main>

        <Footer />
      </div>
    </NetworkProvider>
  )
}

function TopBar() {
  const { peers, status } = useNetwork()

  const dot =
    status === 'online' ? 'dot dot--live' : status === 'offline' ? 'dot dot--down' : 'dot'
  const text =
    status === 'online'
      ? `${peers.length} peer${peers.length === 1 ? '' : 's'} online`
      : status === 'offline'
        ? 'network unreachable'
        : 'connecting…'

  return (
    <header>
      <div className="topbar">
        <div className="brand">
          <Logo className="brand__mark" />
          <div>
            <h1 className="brand__name">Verity</h1>
            <p className="label" style={{ marginTop: '0.15rem' }}>
              Content-addressed storage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="pill">
            <span className={dot} />
            {text}
          </span>
        </div>
      </div>

      <div className="mt-8 mb-7 max-w-2xl">
        <h2 className="display">
          Every byte, addressed by its own hash.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
          Files are named by the SHA-256 of their contents and re-verified on
          every fetch, so a peer can never hand you tampered data. Each node
          carries its own libp2p identity — no central server required.
        </p>
      </div>
    </header>
  )
}

function StatStrip() {
  const { peers, files, status, lastSync } = useNetwork()

  const identified = peers.filter((p) => p.peerID).length

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="Peers online" value={peers.length} accent={status === 'online'} />
      <Stat label="libp2p identities" value={identified} />
      <Stat label="Names indexed" value={Object.keys(files).length} />
      <Stat
        label="Last sync"
        value={lastSync ? lastSync.toLocaleTimeString([], { hour12: false }) : '—'}
      />
    </div>
  )
}

function Stat({ label, value, accent = false }) {
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className={`stat__value ${accent ? 'stat__value--accent' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function Card({ index, title, hint, slug, children }) {
  return (
    <section aria-labelledby={`${slug}-heading`} className="card">
      <div>
        <div className="card__head">
          <span className="label">{index}</span>
          <h3 id={`${slug}-heading`} className="card__title">
            {title}
          </h3>
        </div>
        <p className="card__hint mt-1.5">{hint}</p>
      </div>
      {children}
    </section>
  )
}

function Footer() {
  const { status } = useNetwork()

  return (
    <footer className="mt-10 pt-5 border-t border-[var(--color-line)] flex flex-wrap items-center justify-between gap-3">
      <p className="label">
        Verity · libp2p · Kademlia DHT · CIDv1 / SHA-256
      </p>
      <p className="label">
        {status === 'online' ? 'Decentralized mode' : 'Awaiting peers'}
      </p>
    </footer>
  )
}
