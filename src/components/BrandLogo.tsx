import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <div className={`relative inline-flex items-center gap-3 select-none ${className}`}>
      <img src="/logo.png" alt="AEObility Social Calendar" className="h-10 object-contain" />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2.5">
          <span className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            AEObility
          </span>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00FF85] font-semibold"
            title="Autonomous Dispatch Engine Active"
          >
            <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-pulse shadow-[0_0_8px_#00FF85]" />
            <span className="hidden md:inline">LIVE</span>
          </span>
        </div>
        <p className={`text-[11px] font-sans hidden sm:block ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Autonomous multi-channel social engine grounded on Google Drive knowledge.
        </p>
      </div>
    </div>
  );
};
