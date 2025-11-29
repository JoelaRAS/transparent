/**
 * Very small GemWallet helper for sending a Payment with memo data.
 * Requires the GemWallet browser extension injected as `window.gemWallet`.
 */

type ProofMeta = {
  version: 1;
  cid: string;
  url: string;
  mediaType: string;
  lat: number;
  lon: number;
  title: string;
  description: string;
  tags: string[];
  locationSource: 'auto' | 'manual';
  createdAt: number;
};

declare global {
  interface Window {
    gemWallet?: any;
    gemwallet?: any; // some builds expose lowercase
  }
}

const toHex = (str: string) =>
  Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const getGemProvider = () => {
  if (typeof globalThis === 'undefined') return null;
  const w: any = globalThis as any;
  return w.gemWallet || w.gemwallet || null;
};

export const connectWallet = async (): Promise<string> => {
  const gem = getGemProvider();
  if (!gem) {
    throw new Error('GemWallet extension not detected. Install from https://gemwallet.app/');
  }
  const res = await gem.connect();
  if (typeof res === 'string') return res;
  if (res?.publicAddress) return res.publicAddress;
  throw new Error('No address returned by GemWallet');
};

export const sendProofTransaction = async (account: string, meta: ProofMeta, walletManager?: any) => {
  const destination = import.meta.env.VITE_XRPL_JOURNAL_ADDRESS || account;
  if (destination === account) {
    throw new Error(
      'Payment to self is rejected (temREDUNDANT). Configure VITE_XRPL_JOURNAL_ADDRESS to a different XRPL account.'
    );
  }

  // Try to set a LastLedgerSequence buffer to avoid expiry
  let lastLedgerSequence: number | undefined;
  try {
    const { Client } = await import('xrpl');
    const endpoint = import.meta.env.VITE_XRPL_ENDPOINT || 'wss://s.altnet.rippletest.net:51233';
    const client = new Client(endpoint);
    await client.connect();
    const currentIndex = await client.getLedgerIndex();
    lastLedgerSequence = currentIndex + 20;
    await client.disconnect();
  } catch (err) {
    console.warn('Could not fetch ledger index, continuing without LastLedgerSequence', err);
  }

  const payload = {
    TransactionType: 'Payment',
    Account: account,
    Destination: destination,
    Amount: '1', // 1 drop
    ...(lastLedgerSequence ? { LastLedgerSequence: lastLedgerSequence } : {}),
    Memos: [
      {
        Memo: {
          MemoType: toHex('TRANSPARENCE_V1'),
          MemoData: toHex(JSON.stringify(meta)),
        },
      },
    ],
  };

  if (walletManager && typeof walletManager.signAndSubmit === 'function') {
    const res = await walletManager.signAndSubmit(payload, true);
    return res;
  }

  const gem = getGemProvider();
  if (!gem) {
    throw new Error('GemWallet extension not detected. Install from https://gemwallet.app/');
  }

  // GemWallet API: sign & submit
  if (gem.submitTransaction) {
    const res = await gem.submitTransaction(payload);
    return res;
  }

  // Fallback: request signature only (will not submit)
  if (gem.signTransaction) {
    const res = await gem.signTransaction(payload);
    return res;
  }

  throw new Error('GemWallet API not available');
};
