


1. Install dependencies:
   `pnpm install`
2. Create `.env.local` with:
   - `VITE_PINATA_JWT` (obligatoire pour uploader sur IPFS via Pinata)
   - `VITE_XRPL_JOURNAL_ADDRESS` (adresse XRPL qui recevra les Memos, différente de l’adresse du wallet connecté, sinon la transaction est rejetée)
   - `VITE_XAMAN_API_KEY` (optionnel pour Xaman)
   - `VITE_WALLETCONNECT_PROJECT_ID` (optionnel pour WalletConnect)
   - `VITE_XRPL_EXPLORER` (optionnel, ex: `https://testnet.xrpl.org/transactions/`)
   - `VITE_XRPL_ENDPOINT` (optionnel, ex: `wss://s.altnet.rippletest.net:51233`)
3. Run the app:
   `pnpm dev`
