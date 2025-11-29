/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PINATA_JWT?: string;
  readonly VITE_XRPL_JOURNAL_ADDRESS?: string;
  readonly VITE_XAMAN_API_KEY?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
