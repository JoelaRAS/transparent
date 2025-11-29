import { Client } from 'xrpl';

type ProofMeta = {
  version?: number;
  cid: string;
  url: string;
  mediaType?: string;
  lat: number;
  lon: number;
  title: string;
  description: string;
  tags: string[];
  locationSource?: 'auto' | 'manual';
  createdAt?: number;
};

const MEMO_TYPE = 'TRANSPARENCE_V1';
const DEFAULT_ENDPOINT = 'wss://s.altnet.rippletest.net:51233';
const EXPLORER_DEFAULT = 'https://testnet.xrpl.org/transactions/';

const hexToString = (hex: string) => {
  try {
    return decodeURIComponent(hex.replace(/\s+/g, '').replace(/[0-9a-f]{2}/gi, (match) => {
      return '%' + match;
    }));
  } catch {
    return '';
  }
};

export const getExplorerBase = () =>
  import.meta.env.VITE_XRPL_EXPLORER || EXPLORER_DEFAULT;

export const fetchProofs = async () => {
  const endpoint = import.meta.env.VITE_XRPL_ENDPOINT || DEFAULT_ENDPOINT;
  const destination = import.meta.env.VITE_XRPL_JOURNAL_ADDRESS;
  if (!destination) {
    console.warn('No VITE_XRPL_JOURNAL_ADDRESS set; skipping on-chain fetch.');
    return [];
  }

  const client = new Client(endpoint);
  await client.connect();

  const resp = await client.request({
    command: 'account_tx',
    account: destination,
    ledger_index_min: -1,
    ledger_index_max: -1,
    limit: 200,
  });

  const results: any[] = resp.result.transactions || [];
  const items = results
    .filter((tx) => tx?.tx?.TransactionType === 'Payment' && Array.isArray(tx?.tx?.Memos))
    .map((tx) => {
      const memo = tx.tx.Memos.find((m: any) => {
        const memoTypeHex = m?.Memo?.MemoType;
        const memoType = memoTypeHex ? hexToString(memoTypeHex) : '';
        return memoType === MEMO_TYPE;
      });
      if (!memo) return null;
      const memoDataHex = memo.Memo?.MemoData;
      const memoStr = memoDataHex ? hexToString(memoDataHex) : '';
      let meta: ProofMeta | null = null;
      try {
        meta = JSON.parse(memoStr);
      } catch {
        meta = null;
      }
      if (!meta || !meta.cid || !meta.url || typeof meta.lat !== 'number' || typeof meta.lon !== 'number') return null;

      const mediaType = meta.mediaType || 'image';
      const mapType = mediaType.includes('video')
        ? 'VIDEO'
        : mediaType.includes('pdf') || mediaType.includes('doc')
          ? 'DOCUMENT'
          : 'IMAGE';

      const hash = tx?.tx?.hash || tx?.hash || '';
      return {
        id: hash || `${meta.cid}-${meta.createdAt || ''}`,
        type: mapType,
        lat: meta.lat,
        lng: meta.lon,
        country: '',
        city: '',
        locationSource: meta.locationSource || 'manual',
        title: meta.title || 'On-chain evidence',
        description: meta.description || '',
        tags: meta.tags || [],
        thumbnailUrl: meta.url,
        fullUrl: meta.url,
        ipfsHash: meta.cid,
        xrplTxHash: hash,
        walletAddress: tx?.tx?.Account || '',
        timestamp: meta.createdAt || tx?.tx?.date || Date.now(),
        verified: true,
      };
    })
    .filter(Boolean);

  await client.disconnect();
  return items;
};
