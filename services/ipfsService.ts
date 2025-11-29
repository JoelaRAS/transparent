/**
 * Upload a single file to IPFS via Pinata.
 * Requires VITE_PINATA_JWT set to a valid Pinata JWT.
 */
export const uploadToIPFS = async (file: File): Promise<{ cid: string; url: string }> => {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) {
    throw new Error('Missing VITE_PINATA_JWT for Pinata');
  }

  const data = new FormData();
  data.append('file', file);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`IPFS upload failed: ${res.status}`);
  }

  const json = await res.json();
  const cid = json.IpfsHash || json.cid || '';
  if (!cid) throw new Error('No CID returned from Pinata');

  return {
    cid,
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
};
