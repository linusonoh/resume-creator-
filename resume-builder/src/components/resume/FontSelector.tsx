'use client';

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { FONT_PAIRINGS } from '@/config/fonts';
import { Type } from 'lucide-react';

export default function FontSelector() {
  const { currentFontId, setFontId } = useResumeStore();

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
      <div className="p-3 bg-slate-900/30 border-b border-slate-800 flex items-center gap-2">
        <span className="text-indigo-400"><Type size={16} /></span>
        <span className="text-sm font-semibold text-slate-200">Typography Pairing</span>
      </div>
      <div className="p-3.5 space-y-2">
        {FONT_PAIRINGS.map((pairing) => {
          const isActive = currentFontId === pairing.id;
          return (
            <button
              key={pairing.id}
              onClick={() => setFontId(pairing.id)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 cursor-pointer
                ${isActive 
                  ? 'bg-indigo-950/40 border-indigo-500/80 text-white' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200'}`}
            >
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold">{pairing.name}</span>
                {isActive && (
                  <span className="text-[9px] bg-indigo-600/30 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">{pairing.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
