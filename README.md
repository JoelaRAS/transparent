# Transparence

Global map for immutable, geo-referenced visual evidence anchored on XRPL.

## Overview

- React + Vite single-page app showing a dark MapLibre map with neon markers.
- Multi-wallet XRPL connect (Xaman, Crossmark, GemWallet, WalletConnect) via `xrpl-connect`.
- Upload images/videos/PDF to IPFS (Pinata), then submit an XRPL Payment with a JSON Memo tagged `TRANSPARENCE_V1`.
- Read on-chain proofs from a journal XRPL account to rebuild the evidence feed.
- Geographic filtering by country polygons or adjustable-radius circle.
- Light AI helpers (stubbed) to prefill metadata and “verify” context.

## Tech stack

- React 19, TypeScript, Vite 6.
- MapLibre GL 4, Natural Earth GeoJSON, Carto dark tiles.
- XRPL SDK + `xrpl-connect` for wallet connection/signing.
- IPFS via Pinata.
- Tailwind CDN plus custom glass/neon components (`components/UI`).

## Quick start

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm build` (production bundle) and `pnpm preview` (serve the build).

## Environment (.env)

- `VITE_PINATA_JWT` (required): Pinata JWT for `pinFileToIPFS`.
- `VITE_XRPL_JOURNAL_ADDRESS` `r9SdkAXpbfcw4aDBixXSMoV3v7Aa3XYZmV`
- `VITE_XRPL_ENDPOINT` `wss://s.altnet.rippletest.net:51233`
- `VITE_XRPL_EXPLORER` `https://testnet.xrpl.org/transactions/`

## User flow

1. **Connect wallet** with `XRPLWalletConnector` (Xaman/Crossmark/GemWallet/WalletConnect). Address and status live in `WalletProvider`.
2. **Explore/filter**: click a country to filter, or click the map to set a circle center and adjust radius (km). The sidebar list applies the filter; map markers stay visible.
3. **Submit evidence**: FAB “NEW EVIDENCE” → pick map location → upload image/video/PDF. File goes to Pinata; then an XRPL Payment is submitted with Memo JSON (cid, url, lat/lon, title, tags, etc.).
4. **Inspect**: clicking a list item or marker opens `DetailModal` (media, coords, IPFS hash, XRPL hash with explorer link, tags, verified flag). “Run Analysis” returns the stubbed response from `geminiService`.

## Data flow and services

- **IPFS**: `services/ipfsService.ts` posts to Pinata and returns `cid` + gateway URL.
- **XRPL**: `services/walletService.ts` signs/submits a Payment with Memo `TRANSPARENCE_V1`; `services/xrplService.ts` reads `account_tx` on `VITE_XRPL_JOURNAL_ADDRESS` and parses memos into `EvidenceItem`.
- **Geolocation**: MapLibre clicks, Natural Earth country polygons with Turf `booleanPointInPolygon`, circle via `turf.circle`. Reverse geocode (OpenStreetMap Nominatim) in `UploadModal`.
- **AI (stub)**: `services/geminiService.ts` returns fixed values (no key needed).
