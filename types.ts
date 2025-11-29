export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface EvidenceItem {
  id: string;
  type: MediaType;
  lat: number;
  lng: number;
  locationSource?: 'auto' | 'manual';
  country?: string; // Added for filtering
  city?: string;    // Added for filtering
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  fullUrl: string;
  ipfsHash: string;
  xrplTxHash: string;
  walletAddress: string;
  timestamp: number;
  verified: boolean;
}

export type ZoneType = 'COUNTRY' | 'RADIUS' | 'NONE';

export interface ZoneConfig {
  mode: ZoneType;
  selectedCountry?: string | null; // Name of the selected country
  center?: { lat: number; lng: number } | null;
  radiusKm?: number;
}

export type MapMode = 'VIEW' | 'PICK_LOCATION';
