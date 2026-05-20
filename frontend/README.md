# Verity — dashboard

React + Vite front end for [Verity](../README.md). Talks directly to each peer's
HTTP API; there is no backend-for-frontend in between.

```bash
npm install
npm run dev     # http://localhost:5173
npm run lint
npm run build
```

The backend must be running first (`cd ../backend && make build && ./bin/verity -peers=3`),
otherwise every card renders its offline state.

## Layout

| Path | Role |
|------|------|
| `src/api.js` | Thin wrappers over the peer HTTP API (`/upload`, `/search`, `/files`, `/peers`, `/p2p/info`) |
| `src/state.jsx` | `NetworkProvider` — one 4s poller shared by the whole dashboard |
| `src/network-context.js` | The context + `useNetwork()` hook |
| `src/components/` | The four cards, plus the `Cid` chip and `Logo` mark |
| `src/index.css` | Design tokens (Tailwind v4 `@theme`) and component classes |

Peer discovery is bootstrapped from `DEFAULT_PEER` in `src/api.js` (`127.0.0.1:5001`);
every other address is learned from that peer's `/peers` response at runtime.

In decentralized mode `/files` is a **node-local** view — each peer only knows the
names it ingested itself — so the provider unions every peer's view into the single
content index the dashboard shows.
