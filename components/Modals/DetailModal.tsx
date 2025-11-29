import React, { useState } from 'react';
import { EvidenceItem } from '../../types';
import { GlassPanel, NeonButton, Badge } from '../UI/NeonComponents';
import { X, CheckCircle, ExternalLink, Bot, MapPin, FileText, Globe } from 'lucide-react';
import { verifyEventContext } from '../../services/geminiService';

interface DetailModalProps {
  item: EvidenceItem | null;
  onClose: () => void;
  onCenterMap: (item: EvidenceItem) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, onCenterMap }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!item) return null;

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Call Gemini Service
    const result = await verifyEventContext(item.title + " " + item.tags.join(" "));
    setAnalysis(result || "Analysis unavailable.");
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col md:flex-row overflow-hidden border-[#00D4FF]/20">
        
        {/* Media Section */}
        <div className="w-full md:w-1/2 bg-black/40 h-64 md:h-auto relative">
          {item.type === 'DOCUMENT' ? (
            <iframe
              src={item.fullUrl}
              title={item.title}
              className="w-full h-full"
            />
          ) : item.type === 'VIDEO' ? (
            <video
              src={item.fullUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : (
            <img 
              src={item.fullUrl} 
              alt={item.title} 
              className="w-full h-full object-cover" 
            />
          )}
          <button onClick={onClose} className="absolute top-4 left-4 md:hidden bg-black/50 p-2 rounded-full text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
               <div className="flex gap-2 mb-2">
                 <Badge color={item.type === 'VIDEO' ? 'green' : item.type === 'DOCUMENT' ? 'yellow' : 'blue'}>{item.type}</Badge>
                 {item.verified && <Badge color="green"><CheckCircle size={10} className="inline mr-1"/> XRPL VERIFIED</Badge>}
               </div>
               <h2 className="text-2xl font-bold text-white leading-tight">{item.title}</h2>
            </div>
            <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <p className="text-gray-300 font-light">{item.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 border-t border-white/10 pt-4">
              <div>
                <span className="block text-gray-500 uppercase tracking-wider mb-1">Coordinates</span>
                <span className="text-white flex items-center gap-2">
                  {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                  <button onClick={() => onCenterMap(item)} className="text-[#00D4FF] hover:underline"><MapPin size={12} /></button>
                  {item.locationSource && (
                    <span className="text-[10px] text-gray-500">
                      {item.locationSource === 'auto' ? 'Auto (GPS)' : 'Pingé'}
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 uppercase tracking-wider mb-1">Timestamp</span>
                <span className="text-white">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-gray-500 uppercase tracking-wider mb-1">XRPL Transaction</span>
                <span className="text-[#00FFB3] font-mono break-all flex items-center gap-2">
                  {item.xrplTxHash || 'pending'}
                  {item.xrplTxHash && (
                    <a
                      href={`${import.meta.env.VITE_XRPL_EXPLORER || 'https://testnet.xrpl.org/transactions/'}${item.xrplTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00D4FF] hover:underline flex items-center gap-1"
                    >
                      <Globe size={12} /> Explorer
                    </a>
                  )}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-gray-500 uppercase tracking-wider mb-1">IPFS Hash</span>
                <span className="text-blue-400 font-mono break-all cursor-pointer hover:underline">{item.ipfsHash}</span>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="mt-6 bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-lg p-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[#00D4FF] text-sm font-bold flex items-center gap-2">
                   <Bot size={16} /> AI VERIFICATION
                 </h3>
                 {!analysis && (
                   <button 
                    onClick={handleAIAnalysis} 
                    disabled={isAnalyzing}
                    className="text-xs text-[#00D4FF] hover:text-white underline disabled:opacity-50"
                   >
                     {isAnalyzing ? "Processing..." : "Run Analysis"}
                   </button>
                 )}
               </div>
               {analysis ? (
                 <p className="text-xs text-gray-300 leading-relaxed italic border-l-2 border-[#00D4FF] pl-3">
                   "{analysis}"
                 </p>
               ) : (
                 <p className="text-xs text-gray-500">
                   Tap "Run Analysis" to verify this event context with Gemini AI.
                 </p>
               )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
            <NeonButton className="flex-1 flex items-center justify-center gap-2" variant="primary">
               View on Ledger <ExternalLink size={16} />
            </NeonButton>
          </div>
        </div>

      </GlassPanel>
    </div>
  );
};

export default DetailModal;
