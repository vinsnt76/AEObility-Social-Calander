import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AEOBilityWordmark } from './AEOBilityWordmark';
import { ExternalLink, Check, ChevronDown, FolderGit2, Image, User } from 'lucide-react';

export type LogoVariant = 'delta_triangle' | 'monogram' | 'blueprint_seal';

interface BrandLogoProps {
  variant?: LogoVariant;
  onVariantChange?: (v: LogoVariant) => void;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  interactive?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'delta_triangle',
  onVariantChange,
  size = 'md',
  showText = true,
  interactive = true,
  className = '',
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [currentVariant, setCurrentVariant] = useState<LogoVariant>(variant);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeVariant = onVariantChange ? variant : currentVariant;

  const handleSelectVariant = (newVariant: LogoVariant) => {
    if (onVariantChange) {
      onVariantChange(newVariant);
    } else {
      setCurrentVariant(newVariant);
    }
    setIsDropdownOpen(false);
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const wordmarkHeights = {
    sm: 22,
    md: 28,
    lg: 34,
  };

  return (
    <div className={`relative inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Mark with Dropdown Trigger */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => interactive && setIsDropdownOpen(!isDropdownOpen)}
          className={`relative ${iconSizes[size]} rounded-lg flex items-center justify-center p-1.5 transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-black border border-zinc-800 shadow-sm hover:border-[#00E5FF]/60 hover:shadow-[0_0_12px_rgba(0,229,255,0.25)]'
              : 'bg-white border border-slate-200 shadow-xs hover:border-[#00E5FF]/60'
          }`}
          title="Click to view Drive folders and brand marks"
        >
          {/* Subtle Glow */}
          <div className="absolute inset-0 rounded-lg blur-xs opacity-60 bg-gradient-to-br from-[#00E5FF]/20 via-[#7B2EFF]/20 to-transparent" />

          {/* SVG Glyph Mark */}
          {activeVariant === 'delta_triangle' && (
            <svg
              className="w-full h-full relative z-10 transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="50,12 88,84 12,84"
                stroke="#00E5FF"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <polygon points="50,12 50,62 12,84" fill="#00E5FF" fillOpacity="0.5" />
              <polygon points="50,12 88,84 50,62" fill="#7B2EFF" fillOpacity="0.6" />
              <circle cx="50" cy="62" r="6" fill="#FFFFFF" />
            </svg>
          )}

          {activeVariant === 'monogram' && (
            <svg
              className="w-full h-full relative z-10 transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="50,10 88,31 88,69 50,90 12,69 12,31"
                stroke="#00FF85"
                strokeWidth="6"
                fill="rgba(0, 255, 133, 0.15)"
              />
              <text
                x="50"
                y="58"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="24"
                fontFamily="monospace"
                fontWeight="bold"
              >
                AEO
              </text>
            </svg>
          )}

          {activeVariant === 'blueprint_seal' && (
            <svg
              className="w-full h-full relative z-10 transition-transform duration-200 group-hover:rotate-6"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="4" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="28" fill="#F59E0B" fillOpacity="0.2" />
              <polygon points="50,26 71,67 29,67" fill="#F59E0B" />
            </svg>
          )}

          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-[#00E5FF] transition-colors">
            <ChevronDown className="w-2 h-2" />
          </div>
        </button>

        {/* Assets & Brand Dropdown */}
        {interactive && isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            <div
              className={`absolute top-full left-0 mt-2 w-72 rounded-xl border p-2.5 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-black/95 border-zinc-800 text-zinc-100 shadow-black'
                  : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
              }`}
            >
              {/* Header */}
              <div className="px-2 py-1 border-b border-zinc-800/80 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Connected Assets & Marks
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono font-bold">
                  Live Drive
                </span>
              </div>

              {/* Connected Google Drive Folders */}
              <div className="space-y-1 mb-2">
                <a
                  href="https://drive.google.com/drive/folders/1sYwEbr26nS4oHJ44DZicJPyhDPUTMqEt?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition ${
                    isDark ? 'hover:bg-zinc-900 text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 text-[#FF007A]" />
                    <div>
                      <p className="font-semibold text-xs">Logos & Vectors</p>
                      <p className="text-[10px] text-zinc-400 font-mono">1sYwEbr26nS4oHJ...</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>

                <a
                  href="https://drive.google.com/drive/folders/1AOdLv6iBaVdCalem7WJ21uNsfwEO45bn?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition ${
                    isDark ? 'hover:bg-zinc-900 text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <div>
                      <p className="font-semibold text-xs">Characters & Avatars</p>
                      <p className="text-[10px] text-zinc-400 font-mono">1AOdLv6iBaVdCal...</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>

                <a
                  href="https://drive.google.com/drive/folders/1H4ZFpqFpQf_hNkeEIY4xYz_9W9l6VSFB?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition ${
                    isDark ? 'hover:bg-zinc-900 text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <div>
                      <p className="font-semibold text-xs">Knowledge Base Root</p>
                      <p className="text-[10px] text-zinc-400 font-mono">1H4ZFpqFpQf_hNk...</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </div>

              {/* Brand Glyph Picker */}
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5 px-1">
                  Brand Mark Style
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'delta_triangle' as LogoVariant, label: 'Delta Prism', color: '#00E5FF' },
                    { id: 'monogram' as LogoVariant, label: 'Monogram', color: '#00FF85' },
                    { id: 'blueprint_seal' as LogoVariant, label: 'Tech Seal', color: '#F59E0B' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectVariant(m.id)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 transition cursor-pointer border ${
                        activeVariant === m.id
                          ? isDark
                            ? 'bg-zinc-800 text-white border-zinc-600'
                            : 'bg-slate-200 text-slate-900 border-slate-400'
                          : isDark
                          ? 'border-transparent text-zinc-400 hover:bg-zinc-900'
                          : 'border-transparent text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Official AEOBility Glowing Wordmark & Streamlined Single-Line Description */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2.5">
            {/* The exact logo wordmark uploaded by the user */}
            <AEOBilityWordmark height={wordmarkHeights[size]} />

            {/* Compact live status indicator */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00FF85] font-semibold"
              title="Autonomous Dispatch Engine Active"
            >
              <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-pulse shadow-[0_0_8px_#00FF85]" />
              <span className="hidden md:inline">LIVE</span>
            </span>
          </div>

          {/* Single shorter description incorporating former eyebrows */}
          <p
            className={`text-[11px] font-sans hidden sm:block ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}
          >
            Autonomous multi-channel social engine grounded on Google Drive knowledge.
          </p>
        </div>
      )}
    </div>
  );
};
