import React from 'react';
import { NeonButton, GlassPanel } from './UI/NeonComponents';
import { Globe, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="relative w-full h-screen bg-[#0A0F14] overflow-hidden flex flex-col items-center justify-center text-center z-[5000]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D4FF] rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FFB3] rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl px-6">
        <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00D4FF] to-[#00FFB3] shadow-[0_0_50px_rgba(0,212,255,0.6)] animate-pulse"></div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter">
          TRANSPARENCE
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light max-w-2xl mx-auto">
          The global map of immutable visual evidence. 
          <span className="text-[#00FFB3]"> Verify. Anchor. Reveal.</span>
        </p>

        <NeonButton 
          onClick={onEnter} 
          className="px-12 py-4 text-xl tracking-widest font-bold shadow-[0_0_30px_rgba(0,212,255,0.4)]"
        >
          ENTER THE MAP
        </NeonButton>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <GlassPanel className="p-6 flex flex-col items-center">
            <Globe className="text-[#00D4FF] mb-4" size={32} />
            <h3 className="text-white font-bold mb-2">Global Coverage</h3>
            <p className="text-sm text-gray-400">Real-time visualization of events worldwide.</p>
          </GlassPanel>
          <GlassPanel className="p-6 flex flex-col items-center">
            <ShieldCheck className="text-[#00FFB3] mb-4" size={32} />
            <h3 className="text-white font-bold mb-2">Immutable Proof</h3>
            <p className="text-sm text-gray-400">Anchored on XRPL. Impossible to censor or alter.</p>
          </GlassPanel>
          <GlassPanel className="p-6 flex flex-col items-center">
            <Zap className="text-yellow-400 mb-4" size={32} />
            <h3 className="text-white font-bold mb-2">Instant Verify</h3>
            <p className="text-sm text-gray-400">AI-powered analysis and community verification.</p>
          </GlassPanel>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-xs text-gray-600 font-mono">
        POWERED BY XRPL & IPFS
      </div>
    </div>
  );
};

export default LandingPage;