import React from 'react';
import { EvidenceItem, ZoneConfig } from '../../types';
import { GlassPanel, Badge } from '../UI/NeonComponents';
import { Image, Film, MapPin, Globe, Search, FileText } from 'lucide-react';

interface EvidenceListProps {
  items: EvidenceItem[];
  onSelect: (item: EvidenceItem) => void;
  isOpen: boolean;
  zoneConfig: ZoneConfig;
}

const EvidenceList: React.FC<EvidenceListProps> = ({ items, onSelect, isOpen, zoneConfig }) => {
  if (!isOpen) return null;

  const isZoneActive = 
    zoneConfig.mode === 'NONE' ||
    (zoneConfig.mode === 'COUNTRY' && zoneConfig.selectedCountry) ||
    (zoneConfig.mode === 'RADIUS' && zoneConfig.center);

  return (
    <GlassPanel className="fixed right-0 top-0 bottom-0 w-80 md:w-96 z-[500] flex flex-col pt-24 pb-6 px-4 border-l border-white/10 transition-transform duration-300 transform translate-x-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          EVIDENCE FEED
          {zoneConfig.mode !== 'NONE' && (
             <Badge color="blue">{zoneConfig.mode}</Badge>
          )}
        </h2>
        <p className="text-xs text-gray-400 mt-1">Immutable records on XRPL</p>
      </div>

      {!isZoneActive ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6">
          <Globe size={48} className="mb-4 text-[#00D4FF]" />
          <h3 className="text-white font-bold mb-2">Explore the Map</h3>
          <p className="text-sm text-gray-400">
            Select a <span className="text-[#00FFB3]">Country</span> or define a <span className="text-[#00FFB3]">Radius</span> to view local evidence.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6">
          <Search size={48} className="mb-4 text-gray-500" />
          <h3 className="text-white font-bold mb-2">No Evidence Found</h3>
          <p className="text-sm text-gray-400">
            No immutable records found in this area yet. Be the first to anchor evidence here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest border-b border-white/10 pb-2">
            {zoneConfig.mode === 'COUNTRY'
              ? `Showing results for ${zoneConfig.selectedCountry}`
              : zoneConfig.mode === 'RADIUS'
              ? 'Showing results in zone'
              : 'Showing all evidence'}
          </div>
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="group cursor-pointer bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3">
                {item.type === 'DOCUMENT' ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#0A0F14] via-[#111827] to-[#0A0F14] flex items-center justify-center text-[#FFD166]">
                    <FileText size={32} />
                  </div>
                ) : item.type === 'VIDEO' ? (
                  <video
                    src={item.thumbnailUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute top-2 right-2">
                  <Badge color={item.type === 'VIDEO' ? 'green' : item.type === 'DOCUMENT' ? 'yellow' : 'blue'}>
                    {item.type === 'VIDEO' ? <Film size={12} /> : item.type === 'DOCUMENT' ? <FileText size={12} /> : <Image size={12} />}
                  </Badge>
                </div>
              </div>
              
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{item.title}</h3>
              
              <div className="flex items-center text-xs text-gray-400 mb-2">
                <MapPin size={10} className="mr-1" />
                <span>{item.city || item.country || `${item.lat.toFixed(2)}, ${item.lng.toFixed(2)}`}</span>
                {item.locationSource && (
                  <span className="ml-2 text-[9px] uppercase tracking-widest text-gray-500">
                    {item.locationSource === 'auto' ? 'AUTO' : 'PING'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-black/30 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
};

export default EvidenceList;
