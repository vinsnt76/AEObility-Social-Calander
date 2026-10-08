import React from 'react';

interface AEOBilityWordmarkProps {
  className?: string;
  height?: number | string;
  withDeepBlackBg?: boolean;
}

export const AEOBilityWordmark: React.FC<AEOBilityWordmarkProps> = ({
  className = '',
  height = 36,
  withDeepBlackBg = false,
}) => {
  return (
    <div
      className={`inline-flex items-center select-none ${
        withDeepBlackBg ? 'bg-black px-3 py-1.5 rounded-lg' : ''
      } ${className}`}
    >
      <svg
        height={height}
        viewBox="0 0 380 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto max-w-full overflow-visible"
        aria-label="AEObility Wordmark"
      >
        <defs>
          {/* Luminous Cyan Neon Glow Filter */}
          <filter id="cyanNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Chromatic Edge Glow for AEO */}
          <filter id="chromaticAura" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-1" dy="1" stdDeviation="2" floodColor="#FF007A" floodOpacity="0.4" />
            <feDropShadow dx="2" dy="-1" stdDeviation="3" floodColor="#00E5FF" floodOpacity="0.8" />
          </filter>

          {/* Soft ambient aura around bility */}
          <filter id="ambientCyanAura" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" result="ambient" />
            <feComponentTransfer in="ambient" result="boost">
              <feFuncA type="linear" slope="0.75" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="boost" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background bloom matching the uploaded image aura */}
        <ellipse cx="250" cy="50" rx="110" ry="32" fill="#00E5FF" opacity="0.14" filter="blur(16px)" />
        <ellipse cx="70" cy="50" rx="60" ry="25" fill="#00E5FF" opacity="0.08" filter="blur(12px)" />

        {/* AEO: White with Chromatic & Cyan Halo Shift */}
        <g filter="url(#chromaticAura)">
          {/* Cyan underlying rim */}
          <text
            x="8"
            y="66"
            fontFamily="'Inter', 'Arial Black', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="68"
            letterSpacing="-1.5"
            fill="#00E5FF"
            opacity="0.85"
            dx="1.5"
            dy="-1"
          >
            AEO
          </text>
          {/* Main White Face */}
          <text
            x="8"
            y="66"
            fontFamily="'Inter', 'Arial Black', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="68"
            letterSpacing="-1.5"
            fill="#FFFFFF"
          >
            AEO
          </text>
        </g>

        {/* bility: Glowing Neon Cyan #00E5FF */}
        <g filter="url(#ambientCyanAura)">
          {/* Extra Neon Glow Layer */}
          <text
            x="170"
            y="66"
            fontFamily="'Inter', 'Arial Black', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="68"
            letterSpacing="-1"
            fill="#00E5FF"
            filter="url(#cyanNeonGlow)"
            opacity="0.75"
          >
            bility
          </text>

          {/* Core crisp text face */}
          <text
            x="170"
            y="66"
            fontFamily="'Inter', 'Arial Black', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="68"
            letterSpacing="-1"
            fill="#00E5FF"
          >
            bility
          </text>
        </g>
      </svg>
    </div>
  );
};
