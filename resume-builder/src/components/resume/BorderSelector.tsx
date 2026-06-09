'use client';

import React from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Square, Palette } from 'lucide-react';

const BORDER_STYLES = [
  { id: 'none', name: 'No Border', desc: 'Clean, borderless page layout' },
  { id: 'single', name: 'Single Box', desc: 'Simple solid outer border' },
  { id: 'double', name: 'Double Box', desc: 'Elegant double-line border' },
  { id: 'thin', name: 'Thin Frame', desc: 'Light full-page professional frame' },
  { id: 'thick', name: 'Bold Frame', desc: 'Strong executive outer frame' },
  { id: 'dashed', name: 'Dashed Frame', desc: 'Modern dashed document outline' },
  { id: 'dotted', name: 'Dotted Frame', desc: 'Subtle dotted page outline' },
  { id: 'inset', name: 'Inset Frame', desc: 'Inner framed resume page edge' },
  { id: 'top-bottom', name: 'Top & Bottom', desc: 'Sleek top and bottom framing lines' },
  { id: 'left-accent', name: 'Left Accent', desc: 'Bold vertical line on the left side' },
  { id: 'right-accent', name: 'Right Accent', desc: 'Bold vertical line on the right side' },
  { id: 'side-rails', name: 'Side Rails', desc: 'Balanced vertical rails on both sides' },
  { id: 'top-accent', name: 'Top Accent', desc: 'Strong header-edge accent line' },
  { id: 'bottom-accent', name: 'Bottom Accent', desc: 'Clean footer-edge accent line' },
  { id: 'bracket', name: 'Corner Bracket', desc: 'Minimal corner-framed layout' },
];

const BORDER_COLORS = [
  { id: 'accent', name: 'Theme Accent', desc: 'Dynamically matches theme accent' },
  { id: 'slate', name: 'Charcoal', desc: 'Executive dark charcoal line' },
  { id: 'muted', name: 'Subtle Gray', desc: 'Very light grey minimalist line' },
  { id: 'black', name: 'True Black', desc: 'Crisp formal black line' },
  { id: 'navy', name: 'Deep Navy', desc: 'Classic navy blue frame' },
  { id: 'indigo', name: 'Royal Indigo', desc: 'Polished blue-purple line' },
  { id: 'emerald', name: 'Emerald', desc: 'Confident green accent' },
  { id: 'teal', name: 'Teal', desc: 'Calm blue-green accent' },
  { id: 'sky', name: 'Sky Blue', desc: 'Light modern blue accent' },
  { id: 'gold', name: 'Classic Gold', desc: 'Warm professional amber/gold line' },
  { id: 'bronze', name: 'Bronze', desc: 'Warm muted metallic tone' },
  { id: 'rose', name: 'Crimson Red', desc: 'Distinguished crimson red line' },
  { id: 'purple', name: 'Purple', desc: 'Creative deep purple accent' },
];

export default function BorderSelector() {
  const { borderStyle, borderColor, setBorderStyle, setBorderColor, accentColor } = useResumeStore();

  const activeStyle = borderStyle || 'none';
  const activeColor = borderColor || 'accent';
  const selectedStyle = BORDER_STYLES.find((style) => style.id === activeStyle) || BORDER_STYLES[0];
  const selectedColor = BORDER_COLORS.find((color) => color.id === activeColor) || BORDER_COLORS[0];

  // Map color ID to bg color classes for the visual indicator dots
  const getDotColorClass = (colorId: string) => {
    if (colorId === 'accent') {
      const accentMap: Record<string, string> = {
        slate: 'bg-slate-500',
        zinc: 'bg-zinc-500',
        neutral: 'bg-neutral-500',
        black: 'bg-black',
        blue: 'bg-blue-500',
        indigo: 'bg-indigo-500',
        violet: 'bg-violet-500',
        purple: 'bg-purple-500',
        fuchsia: 'bg-fuchsia-500',
        pink: 'bg-pink-500',
        red: 'bg-red-500',
        orange: 'bg-orange-500',
        lime: 'bg-lime-500',
        emerald: 'bg-emerald-500',
        teal: 'bg-teal-500',
        cyan: 'bg-cyan-500',
        sky: 'bg-sky-500',
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
      };
      return accentMap[accentColor] || 'bg-indigo-500';
    }
    const map: Record<string, string> = {
      slate: 'bg-slate-700',
      muted: 'bg-slate-300',
      black: 'bg-black',
      navy: 'bg-blue-950',
      indigo: 'bg-indigo-700',
      emerald: 'bg-emerald-600',
      teal: 'bg-teal-600',
      sky: 'bg-sky-500',
      gold: 'bg-amber-600',
      bronze: 'bg-orange-700',
      rose: 'bg-rose-600',
      purple: 'bg-purple-700',
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
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Border Design</label>
          <select
            value={activeStyle}
            onChange={(e) => setBorderStyle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            {BORDER_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            <div className="text-xs font-bold text-slate-200">{selectedStyle.name}</div>
            <div className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">{selectedStyle.desc}</div>
          </div>
        </div>

        {/* Color Selection (Collapsible / Disabled if style is 'none') */}
        {activeStyle !== 'none' && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-1 duration-150">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Palette size={11} className="text-indigo-400" /> Border Color
            </label>
            <select
              value={activeColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              {BORDER_COLORS.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full shrink-0 border border-white/10 ${getDotColorClass(selectedColor.id)}`} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200">{selectedColor.name}</div>
                <div className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">{selectedColor.desc}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
