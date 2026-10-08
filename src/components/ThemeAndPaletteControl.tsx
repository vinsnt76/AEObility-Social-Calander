import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Palette, Check } from 'lucide-react';

export const ThemeAndPaletteControl: React.FC = () => {
  const { mode, toggleTheme, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {/* 1-Click Dark/Light Toggle Icon */}
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition cursor-pointer border ${
          mode === 'dark'
            ? 'bg-black border-zinc-800 text-[#00E5FF] hover:border-zinc-700'
            : 'bg-white border-slate-200 text-amber-500 hover:border-slate-300'
        }`}
        title={`Switch to ${mode === 'dark' ? 'Light' : 'Deep Black'} mode`}
      >
        {mode === 'dark' ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Palette Tokens Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition cursor-pointer border ${
          mode === 'dark'
            ? 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
        }`}
        title="View AEObility Color Design System"
      >
        <Palette className="w-3.5 h-3.5" />
      </button>

      {/* Palette Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 top-full mt-2 w-72 rounded-xl border p-3 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
              mode === 'dark'
                ? 'bg-black/95 border-zinc-800 text-zinc-100 shadow-black'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Color Design System
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono font-bold">
                8 Tokens
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {colors.map((c) => (
                <div
                  key={c.name}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 ${
                    mode === 'dark'
                      ? 'bg-zinc-950 border-zinc-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold truncate leading-tight" style={{ color: c.hex }}>
                      {c.label}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono leading-tight">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
