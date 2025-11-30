import React, { useState, useMemo, useEffect } from 'react';
import WorldMap from './components/Map/WorldMap';
import EvidenceList from './components/Sidebar/EvidenceList';
import DetailModal from './components/Modals/DetailModal';
import UploadModal from './components/Modals/UploadModal';
import { GlassPanel, NeonButton } from './components/UI/NeonComponents';
import { EvidenceItem, MapMode, ZoneConfig, ZoneType } from './types';
import { Menu, Plus, MapPin } from 'lucide-react';
import { uploadToIPFS } from './services/ipfsService';
import { sendProofTransaction } from './services/walletService';
import { useWalletManager } from './hooks/useWalletManager';
import { XRPLWalletConnector } from './components/Wallet/XRPLWalletConnector';
import { fetchProofs } from './services/xrplService';
import * as turf from '@turf/turf';
import LandingPage from './components/LandingPage';
import Logo from './components/Logo';

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const App: React.FC = () => {
  // App State
  const [allItems, setAllItems] = useState<EvidenceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>('VIEW');
  const { walletManager, walletAddress, setWalletAddress } = useWalletManager();
  const [draftLocationSource, setDraftLocationSource] = useState<'auto' | 'manual' | null>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  
  // Zone Configuration
  const [zoneConfig, setZoneConfig] = useState<ZoneConfig>({ 
    mode: 'NONE', 
    radiusKm: 50 // Default radius
  });

  // Upload Draft State
  const [draftLocation, setDraftLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loadingOnChain, setLoadingOnChain] = useState(false);

  // Load countries GeoJSON for point-in-polygon filtering
  useEffect(() => {
    const loadCountries = async () => {
      if (countriesGeoJson) return;
      try {
        const res = await fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson');
        const json = await res.json();
        setCountriesGeoJson(json);
      } catch (err) {
        console.warn('Failed to load countries GeoJSON', err);
      }
    };
    loadCountries();
  }, [countriesGeoJson]);

  // --- Filtering Logic ---
  const filteredItems = useMemo(() => {
    // If no zone active, show all items
    if (zoneConfig.mode === 'NONE') return allItems;

    if (zoneConfig.mode === 'COUNTRY') {
      const selected = zoneConfig.selectedCountry?.toLowerCase().trim();
      if (!selected) return []; // Waiting for selection

      // If we have country polygons, use point-in-polygon; otherwise fallback to string match
      if (countriesGeoJson) {
        const features = (countriesGeoJson.features || []).filter((f: any) => {
          const name = (f.properties?.name || f.properties?.name_en || f.properties?.NAME || '').toLowerCase().trim();
          return name === selected;
        });
        return allItems.filter(item => {
          const point = turf.point([item.lng, item.lat]);
          return features.some((f: any) => turf.booleanPointInPolygon(point, f));
        });
      }

      // Fallback if GeoJSON not loaded
      return allItems.filter(item => (item.country || '').toLowerCase().trim() === selected);
    }

    if (zoneConfig.mode === 'RADIUS' && zoneConfig.center && zoneConfig.radiusKm) {
       return allItems.filter(item => {
         const dist = getDistanceFromLatLonInKm(
           zoneConfig.center!.lat, 
           zoneConfig.center!.lng, 
           item.lat, 
           item.lng
         );
         return dist <= zoneConfig.radiusKm!;
       });
    }

    return allItems;
  }, [allItems, zoneConfig]);

  // Fetch on-chain proofs at load
  useEffect(() => {
    const loadOnChain = async () => {
      setLoadingOnChain(true);
      try {
        const proofs = await fetchProofs();
        setAllItems((prev) => {
          const map = new Map<string, EvidenceItem>();
          [...proofs, ...prev].forEach((item) => {
            map.set(item.id, item);
          });
          return Array.from(map.values());
        });
      } catch (err) {
        console.warn('Failed to fetch on-chain proofs', err);
      } finally {
        setLoadingOnChain(false);
      }
    };
    loadOnChain();
  }, []);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  // --- Handlers ---

  const handleZoneModeChange = (mode: ZoneType) => {
    setZoneConfig(prev => ({
      ...prev,
      mode,
      selectedCountry: null, // Reset country
      center: null,          // Reset center for radius
      radiusKm: mode === 'RADIUS' ? 50 : undefined // Set defaults
    }));
  };

  const handleCountrySelect = (countryName: string) => {
    if (zoneConfig.mode === 'COUNTRY') {
      setZoneConfig(prev => ({ ...prev, selectedCountry: countryName }));
      setSidebarOpen(true);
    }
  };

  const handleZoneCenterSet = (lat: number, lng: number) => {
    if (zoneConfig.mode === 'RADIUS') {
      setZoneConfig(prev => ({ ...prev, center: { lat, lng } }));
      setSidebarOpen(true);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoneConfig(prev => ({ ...prev, radiusKm: Number(e.target.value) }));
  };

  const handleItemSelect = (item: EvidenceItem) => {
    setSelectedItem(item);
  };

  const handleCenterMap = (item: EvidenceItem) => {
    setSelectedItem({...item}); 
  };

  const startUploadFlow = () => {
    if (!walletAddress) {
      alert("Please connect your XRPL wallet first.");
      return;
    }
    setDraftLocation(null);
    setDraftLocationSource(null);
    setIsUploadOpen(true);
  };

  const handlePickLocation = () => {
    setIsUploadOpen(false);
    setMapMode('PICK_LOCATION');
  };

  const handleLocationPicked = (lat: number, lng: number) => {
    if (mapMode === 'PICK_LOCATION') {
      setDraftLocation({ lat, lng });
      setDraftLocationSource('manual');
      setMapMode('VIEW');
      setIsUploadOpen(true);
    }
  };

  const handleUploadSubmit = async (data: any) => {
    if (!walletAddress) {
      alert("Please connect your XRPL wallet first.");
      return;
    }

    const fileType = data.file.type || '';
    const mediaType: EvidenceItem['type'] =
      fileType.includes('video')
        ? 'VIDEO'
        : fileType.includes('pdf')
          ? 'DOCUMENT'
          : 'IMAGE';

    let cid = '';
    let url = '';
    try {
      const uploaded = await uploadToIPFS(data.file);
      cid = uploaded.cid;
      url = uploaded.url;
    } catch (err) {
      console.warn("IPFS upload failed", err);
      alert("Upload IPFS échoué.");
      return;
    }

    // Build on-chain meta and send transaction via wallet
    const meta = {
      version: 1 as const,
      cid,
      url,
      mediaType: mediaType.toLowerCase(),
      lat: data.lat,
      lon: data.lng,
      title: data.title,
      description: data.description,
      tags: data.tags,
      locationSource: draftLocationSource || 'manual',
      createdAt: Date.now()
    };

    let txHash = 'pending';
    try {
      const res = await sendProofTransaction(walletAddress, meta, walletManager);
      txHash = res?.hash || res?.tx_hash || res?.tx?.hash || txHash;
    } catch (err) {
      console.warn("XRPL transaction failed", err);
      alert(
        err instanceof Error
          ? err.message
          : "Transaction failed or was rejected. Ensure Destination is a different account and try again."
      );
      return;
    }

    const newItem: EvidenceItem = {
      id: Date.now().toString(),
      type: mediaType,
      lat: data.lat,
      lng: data.lng,
      country: 'Unknown', // In a real app, we'd reverse geocode this
      locationSource: draftLocationSource || 'manual',
      title: data.title,
      description: data.description,
      tags: data.tags,
      thumbnailUrl: url,
      fullUrl: url,
      ipfsHash: cid,
      xrplTxHash: txHash,
      walletAddress: walletAddress,
      timestamp: Date.now(),
      verified: true
    };
    setAllItems([newItem, ...allItems]);
  };

  // --- Render ---

  const sidebarVisible = sidebarOpen;

  return (
    <div className="relative w-full h-screen bg-[#0A0F14] overflow-hidden">
      
      {/* 1. Header / Navbar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-none gap-4">
        
        {/* Logo & Title */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <GlassPanel className="px-5 py-3 rounded-full flex items-center gap-3 w-fit">
            <img src="/Google_AI_Studio_2025-11-30T03_05_53.719Z.png" alt="Transparence" className="w-10 h-10 rounded-full bg-black" />
            <div className="text-xl font-bold text-white tracking-wider">TRANSPARENCE</div>
          </GlassPanel>

          {/* Zone Selector */}
          <GlassPanel className="p-1.5 rounded-lg inline-flex gap-1 w-fit">
            {(['COUNTRY', 'RADIUS'] as ZoneType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleZoneModeChange(type)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all border border-transparent ${zoneConfig.mode === type ? 'bg-white/10 text-[#00D4FF] border-[#00D4FF]/30' : 'text-gray-500 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </GlassPanel>

          {/* Radius Slider Control (Only if Radius mode is active) */}
          {zoneConfig.mode === 'RADIUS' && (
             <GlassPanel className="p-3 rounded-lg w-64">
               <div className="flex justify-between text-xs text-[#00D4FF] mb-1 font-mono">
                 <span>RADIUS</span>
                 <span>{zoneConfig.radiusKm} KM</span>
               </div>
               <input 
                 type="range" 
                 min="10" 
                 max="500" 
                 step="10" 
                 value={zoneConfig.radiusKm} 
                 onChange={handleRadiusChange}
                 className="w-full accent-[#00D4FF] cursor-pointer" 
               />
               <div className="text-[10px] text-gray-500 mt-1">Click on map to set center</div>
             </GlassPanel>
          )}

          {/* Country Mode Helper */}
           {zoneConfig.mode === 'COUNTRY' && (
             <div className="text-[10px] bg-black/50 text-[#00FFB3] px-2 py-1 rounded backdrop-blur-sm w-fit border border-[#00FFB3]/20">
               Select a country on the map
             </div>
          )}
       </div>

        {/* Right Actions */}
        <div 
          className="flex gap-3 pointer-events-auto items-center absolute right-0 top-0 md:relative"
          style={{ right: sidebarVisible ? 'min(24rem, 80vw)' : '0' }}
        >
          <div className="hidden md:block">
            <XRPLWalletConnector
              walletManager={walletManager}
              onConnected={(addr) => setWalletAddress(addr)}
            />
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md border border-white/10"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* 2. Main Map */}
      <WorldMap 
        items={allItems} // Show all items on map as dots? Or only filtered? User said "Map displays live events", implies all are visible, but Sidebar is filtered. 
                         // However, typically you filter markers too. Let's pass 'allItems' but highlight logic handles filtering? 
                         // Standard UX: Show what is in the list. Let's pass `filteredItems` if we want map to clean up.
                         // BUT, user wants to see the map first. Let's keep `allItems` in the map, but filtering visual via sidebar. 
                         // actually, usually map reflects filters. Let's pass filteredItems IF filtering is active, else all?
                         // User said "if I select nothing sidebar is empty".
                         // Let's pass allItems to Map so we see dots globally, but filtering happens on interaction.
        selectedItem={selectedItem}
        onItemSelect={handleItemSelect}
        zoneConfig={zoneConfig}
        mapMode={mapMode}
        onLocationPicked={handleLocationPicked}
        onZoneCenterSet={handleZoneCenterSet}
        onCountrySelect={handleCountrySelect}
        tempMarker={draftLocation}
      />

      {/* 3. Floating Action Button (Upload) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-auto">
        <button 
          onClick={startUploadFlow}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full text-black font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(0,255,179,0.4)] transition-all transform hover:scale-105
            ${mapMode === 'PICK_LOCATION' ? 'bg-yellow-400' : 'bg-[#00FFB3]'}
          `}
        >
          {mapMode === 'PICK_LOCATION' ? (
            <>
              <MapPin size={20} /> TAP ON MAP TO SET LOCATION
            </>
          ) : (
            <>
              <Plus size={20} /> NEW EVIDENCE
            </>
          )}
        </button>
      </div>

      {/* 4. Sidebar */}
      <EvidenceList 
        items={filteredItems} 
        onSelect={handleItemSelect} 
        isOpen={sidebarVisible} 
        zoneConfig={zoneConfig}
      />

      {/* 5. Modals */}
      <DetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onCenterMap={handleCenterMap}
      />

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => {
            setIsUploadOpen(false);
            if (mapMode === 'PICK_LOCATION') setMapMode('VIEW');
        }}
        lat={draftLocation?.lat || null}
        lng={draftLocation?.lng || null}
        locationSource={draftLocationSource}
        onPickLocation={handlePickLocation}
        onSubmit={handleUploadSubmit}
      />

    </div>
  );
};

export default App;
