import React, { useState, useEffect } from 'react';
import { GlassPanel, NeonButton } from '../UI/NeonComponents';
import { X, Upload, MapPin, Loader2, Sparkles } from 'lucide-react';
import { analyzeImageForMetadata } from '../../services/geminiService';

const selectedFileIsPdf = (file: File | null) => !!file && file.type.includes('pdf');

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number | null;
  lng: number | null;
  locationSource: 'auto' | 'manual' | null;
  onPickLocation: () => void;
  onUseMyLocation: () => void;
  onSubmit: (data: any) => Promise<void> | void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, lat, lng, locationSource, onPickLocation, onUseMyLocation, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Reverse Geocode
  useEffect(() => {
    if (lat && lng && isOpen) {
      setLocationName("Locating...");
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const country = data.address?.country || '';
            setLocationName([city, country].filter(Boolean).join(', '));
        })
        .catch(() => setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`));
    }
  }, [lat, lng, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Only run AI helper for images
      if (selectedFile.type.startsWith('image/')) {
        setIsAiLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const metadata = await analyzeImageForMetadata(base64);
          setTitle(metadata.title);
          setDescription(metadata.description);
          setTags(metadata.tags.join(', '));
          setIsAiLoading(false);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setIsAiLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lat === null || lng === null || !file) return;

    setIsProcessing(true);
    try {
      await onSubmit({
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        file,
        lat,
        lng
      });
      onClose();
      // Reset form
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      setTags('');
    } catch (err) {
      console.warn('Upload failed', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-lg rounded-xl overflow-hidden border-[#00FFB3]/20">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#00FFB3]/5">
          <h2 className="text-lg font-bold text-[#00FFB3] tracking-widest">UPLOAD EVIDENCE</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* File Input */}
            <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center relative hover:border-[#00FFB3] transition-colors cursor-pointer bg-black/20">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*,application/pdf" />
              {preview ? (
                selectedFileIsPdf(file) ? (
                  <div className="h-full w-full flex items-center justify-center bg-black/40 text-[#FFD166] rounded-lg">
                    <span className="text-xs font-mono">PDF prêt</span>
                  </div>
                ) : (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg opacity-50" />
                )
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Upload image / video / PDF</span>
                </>
              )}
               {isAiLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                   <div className="text-[#00D4FF] flex flex-col items-center gap-2">
                     <Loader2 className="animate-spin" />
                     <span className="text-xs font-mono">AI Analysis...</span>
                   </div>
                 </div>
               )}
            </div>

            {/* Inputs */}
            <div>
                <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                    <span>TITLE</span>
                    {isAiLoading && <Sparkles size={12} className="text-[#00D4FF] animate-pulse" />}
                </label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-[#00FFB3] focus:outline-none"
                    placeholder="e.g. Flood in Downtown"
                    required
                />
            </div>

            <div>
                <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                    <span>DESCRIPTION</span>
                    {isAiLoading && <Sparkles size={12} className="text-[#00D4FF] animate-pulse" />}
                </label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-[#00FFB3] focus:outline-none h-20"
                    placeholder="Describe the event..."
                    required
                />
            </div>

            <div>
                <label className="block text-xs text-gray-400 mb-1">TAGS</label>
                <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-[#00FFB3] focus:outline-none"
                    placeholder="pollution, water, urgent"
                />
            </div>

            {/* Location Picker */}
            <div className="flex flex-col gap-2 bg-white/5 p-3 rounded border border-white/10">
              <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-300">
                      <MapPin size={16} className="mr-2 text-[#00FFB3]" />
                      {lat && lng ? (
                          <span>{locationName}</span>
                      ) : (
                          <span className="text-gray-500 italic">No location selected</span>
                      )}
                  </div>
                  {locationSource && (
                    <span className="text-[10px] px-2 py-1 rounded bg-black/40 border border-white/10 text-gray-400">
                      {locationSource === 'auto' ? 'Auto (GPS)' : 'Pingé manuellement'}
                    </span>
                  )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={onUseMyLocation}
                  className="text-xs bg-[#00FFB3]/10 text-[#00FFB3] px-3 py-1 rounded hover:bg-[#00FFB3]/20 flex-1"
                >
                  Utiliser ma position
                </button>
                <button 
                  type="button"
                  onClick={onPickLocation}
                  className="text-xs bg-[#00D4FF]/10 text-[#00D4FF] px-3 py-1 rounded hover:bg-[#00D4FF]/20 flex-1"
                >
                  Pinger sur la carte
                </button>
              </div>
            </div>

            <div className="pt-2">
                <NeonButton 
                    variant="secondary" 
                    className="w-full flex justify-center items-center" 
                    disabled={!lat || !file || isProcessing}
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "ANCHOR TO XRPL"}
                </NeonButton>
            </div>

        </form>
      </GlassPanel>
    </div>
  );
};

export default UploadModal;
