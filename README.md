


1. Install dependencies:
   `pnpm install`
2. Create `.env.local` with:
   - `VITE_PINATA_JWT` (obligatoire pour uploader sur IPFS via Pinata)
   - `VITE_XRPL_JOURNAL_ADDRESS` `r9SdkAXpbfcw4aDBixXSMoV3v7Aa3XYZmV`
   - `VITE_XRPL_EXPLORER` `https://testnet.xrpl.org/transactions/`
   - `VITE_XRPL_ENDPOINT`  `wss://s.altnet.rippletest.net:51233`
3. Run the app:
   `pnpm dev`
