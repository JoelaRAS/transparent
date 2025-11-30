import React from 'react';
import { ArrowRight, ShieldCheck, MapPin, Database } from 'lucide-react';

type LandingPageProps = {
  onEnter: () => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#0A0F14] text-slate-100 flex flex-col">
      <header className="w-full py-6 px-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <img
            src="/Google_AI_Studio_2025-11-30T03_05_53.719Z.png"
            alt="Transparence"
            className="w-12 h-12 rounded-full bg-black"
          />
          <div>
            <div className="text-lg font-semibold tracking-wide">TRANSPARENCE</div>
            <div className="text-xs text-slate-500 uppercase tracking-[0.2em]">On-Chain Evidence</div>
          </div>
        </div>
        <button
          onClick={onEnter}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-slate-50 px-4 py-2 rounded-full border border-white/10 text-sm font-semibold transition"
        >
          Launch Map
          <ArrowRight size={16} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-6 py-16 gap-12">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs uppercase tracking-[0.2em] border border-emerald-500/20">
            Censorship Resistant • IPFS + XRPL
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Uncensorable visual evidence anchored on XRPL.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Upload images, videos, and documents to IPFS, sign a proof on XRPL, and geo-pin events on a live map.
            No backend, no gatekeepers—just verifiable truth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onEnter}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition shadow-[0_0_25px_rgba(34,211,238,0.25)]"
            >
              Enter the Map
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <Feature icon={<ShieldCheck className="w-6 h-6" />} title="Immutable Proofs" desc="Signed on XRPL with Memo metadata." />
          <Feature icon={<Database className="w-6 h-6" />} title="Decentralized Storage" desc="Media stored on IPFS via Pinata." />
          <Feature icon={<MapPin className="w-6 h-6" />} title="Geo Anchored" desc="Point-in-country/radius filtering on a live map." />
        </div>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3 items-start text-left">
    <div className="text-cyan-300">{icon}</div>
    <div className="text-lg font-semibold text-white">{title}</div>
    <div className="text-sm text-slate-400">{desc}</div>
  </div>
);

export default LandingPage;
