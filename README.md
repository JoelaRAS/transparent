<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UFdgt8rnLQtI4VrNPXk98ST150P8rnK3

## Run Locally

**Prerequisites:**  Node.js


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
