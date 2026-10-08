import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Palette, ChevronDown, ChevronUp } from 'lucide-react';

export const ColorPaletteBar: React.FC = () => {
  const { mode, toggleTheme, colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`transition-colors border-b px-4 sm:px-6 py-2 text-xs font-mono ${
        mode === 'dark'
          ? 'bg-slate-950/90 border-slate-800/80 text-slate-300'
          : 'bg-white border-slate-200 text-slate-700 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Design System summary */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="font-semibold text-cyber-cyan">AEObility Color System:</span>

          {/* Mini preview dots */}
          <div className="flex items-center gap-1.5 ml-1">
            {colors.map((c) => (
              <span
                key={c.name}
                className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                style={{ backgroundColor: c.hex }}
                title={`${c.label}: ${c.hex} (${c.usage})`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Specs' : 'Show Specs'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Right: Dark / Light Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 uppercase font-medium">Theme Mode:</span>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
              mode === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyber-cyan'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:border-cyber-cyan'
            }`}
            title="Toggle between Dark and Light mode"
          >
            {mode === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Dark Telemetry</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-cyber-amber" />
                <span>Light Editorial</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Palette Specs Drawer */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {colors.map((c) => (
            <div
              key={c.name}
              className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                mode === 'dark'
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div
                className="w-5 h-5 rounded-md mb-1 shadow-xs border border-white/20"
                style={{ backgroundColor: c.hex }}
              />
              <span className="font-bold text-[11px]" style={{ color: c.hex }}>
                {c.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{c.hex}</span>
              <span className="text-[9px] text-slate-500 truncate w-full mt-0.5">{c.usage}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
