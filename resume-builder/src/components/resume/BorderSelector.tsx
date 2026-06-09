'use client';

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Square, Palette } from 'lucide-react';

const BORDER_STYLES = [
  { id: 'none', name: 'No Border', desc: 'Clean, borderless page layout' },
  { id: 'single', name: 'Single Box', desc: 'Simple solid outer border' },
  { id: 'double', name: 'Double Box', desc: 'Elegant double-line border' },
  { id: 'top-bottom', name: 'Top & Bottom', desc: 'Sleek top and bottom framing lines' },
  { id: 'left-accent', name: 'Left Accent', desc: 'Bold vertical line on the left side' },
];

const BORDER_COLORS = [
  { id: 'accent', name: 'Theme Accent', desc: 'Dynamically matches theme accent' },
  { id: 'slate', name: 'Charcoal', desc: 'Executive dark charcoal line' },
  { id: 'muted', name: 'Subtle Gray', desc: 'Very light grey minimalist line' },
  { id: 'gold', name: 'Classic Gold', desc: 'Warm professional amber/gold line' },
  { id: 'rose', name: 'Crimson Red', desc: 'Distinguished crimson red line' },
];

export default function BorderSelector() {
  const { borderStyle, borderColor, setBorderStyle, setBorderColor, accentColor } = useResumeStore();

  const activeStyle = borderStyle || 'none';
  const activeColor = borderColor || 'accent';

  // Map color ID to bg color classes for the visual indicator dots
  const getDotColorClass = (colorId: string) => {
    if (colorId === 'accent') {
      const accentMap: Record<string, string> = {
        slate: 'bg-slate-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
      };
      return accentMap[accentColor] || 'bg-indigo-500';
    }
    const map: Record<string, string> = {
      slate: 'bg-slate-700',
      muted: 'bg-slate-300',
      gold: 'bg-amber-600',
      rose: 'bg-rose-600',
    };
    return map[colorId] || 'bg-slate-700';
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
      <div className="p-3 bg-slate-900/30 border-b border-slate-800 flex items-center gap-2">
        <span className="text-indigo-400"><Square size={16} /></span>
        <span className="text-sm font-semibold text-slate-200">Page Borders</span>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Style Selection */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Border Design</label>
          <div className="grid grid-cols-1 gap-1.5">
            {BORDER_STYLES.map((style) => {
              const isActive = activeStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setBorderStyle(style.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all duration-150 cursor-pointer flex items-center justify-between
                    ${isActive 
                      ? 'bg-indigo-950/40 border-indigo-500/80 text-white' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200'}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold">{style.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 leading-none">{style.desc}</div>
                  </div>
                  {isActive && (
                    <span className="text-[8px] bg-indigo-600/30 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Selection (Collapsible / Disabled if style is 'none') */}
        {activeStyle !== 'none' && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-1 duration-150">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Palette size={11} className="text-indigo-400" /> Border Color
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {BORDER_COLORS.map((color) => {
                const isActive = activeColor === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setBorderColor(color.id)}
                    className={`w-full text-left p-2 rounded-lg border transition-all duration-150 cursor-pointer flex items-center justify-between
                      ${isActive 
                        ? 'bg-indigo-950/40 border-indigo-500/80 text-white' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 border border-white/10 ${getDotColorClass(color.id)}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{color.name}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5 leading-none">{color.desc}</div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-[8px] bg-indigo-600/30 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
