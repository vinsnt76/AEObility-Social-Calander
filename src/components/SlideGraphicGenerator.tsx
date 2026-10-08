import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CarouselSlide, SlideTemplateConfig, ContentCalendarItem } from '../types';
import {
  HOOK_STYLE_PRESETS,
  BRAND_LOGO_PRESETS,
  CHARACTER_CUTOUT_PRESETS,
  CONFIGURED_DRIVE_FOLDERS,
} from '../services/knowledgeBase';
import {
  Download,
  CloudUpload,
  Layers,
  CheckCircle2,
  AlertCircle,
  Highlighter,
  Smile,
  Anchor,
  Compass,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { uploadGraphicToDrive } from '../services/googleWorkspace';
import { getAccessToken } from '../services/firebaseAuth';

interface SlideGraphicGeneratorProps {
  slides?: CarouselSlide[];
  initialTitle?: string;
  initialMetric?: string;
  onSaveCreativeAsset?: (assetUrl: string, overlayH1: string) => void;
  activeCalendarItem?: ContentCalendarItem | null;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    slideNumber: 1,
    slideType: 'hook',
    headlineH1: '$995 got one trade business clearer citations in two crawl cycles',
    subheadBadge: 'ROI: 2 Crawl Cycles [Direct Lift]',
    bodyText: 'Pairing hard metrics with a concrete outcome to immediately establish curiosity and credibility.',
  },
  {
    slideNumber: 2,
    slideType: 'problem',
    headlineH1: 'What AI facts need first before indexing',
    subheadBadge: 'Step 1: Semantic Triplets',
    bodyText: 'Search engines resolve subject-predicate-object semantic triplets before text generation starts.',
  },
  {
    slideNumber: 3,
    slideType: 'analysis',
    headlineH1: 'Build passages one clean block at a time',
    subheadBadge: 'Step 2: Token Density',
    bodyText: 'Low-entropy marketing prose inflates KV cache overhead by 3.8x with zero marginal lift in answer synthesis.',
  },
  {
    slideNumber: 4,
    slideType: 'solution',
    headlineH1: 'Resolve unanchored claims with Wikidata entity graphs',
    subheadBadge: 'Step 3: Graph Disambiguation',
    bodyText: 'Explicit entity disambiguation reduces synthetic hallucination risk by 68% in industry benchmark queries.',
  },
  {
    slideNumber: 5,
    slideType: 'cta',
    headlineH1: 'Deploy the complete enterprise AEO citation Blueprint',
    subheadBadge: 'Canonical Node: aeobility.com.au',
    bodyText: 'Inspect our full technical whitepaper and architectural benchmarks on the research portal.',
  },
];

export const SlideGraphicGenerator: React.FC<SlideGraphicGeneratorProps & { initialTheme?: string | null, initialRatio?: string | null }> = ({
  slides: propSlides,
  initialTheme,
  initialRatio,
  onSaveCreativeAsset,
  activeCalendarItem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>(
    propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES
  );

  const [config, setConfig] = useState<SlideTemplateConfig>({
    aspectRatio: (initialRatio as any) || '1:1',
    theme: (initialTheme as any) || 'blueprint_notebook',
    showGrid: true,
    showBadge: true,
    showPatternInterrupt: true,
    characterType: 'ai-bill',
    logoType: 'delta_triangle',
    highlightKeyword: 'trade business',
    highlightColor: '#F59E0B',
    footerAnchorText: '$995 got one trade business clearer citations in two crawl cycles',
    brandName: 'AEOBILITY SYSTEMS',
    handle: '@aeobility.aeo',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [customLogoImg, setCustomLogoImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (config.customLogoUrl) {
      const img = new Image();
      img.onload = () => setCustomLogoImg(img);
      img.src = config.customLogoUrl;
    } else {
      setCustomLogoImg(null);
    }
  }, [config.customLogoUrl]);

  useEffect(() => {
    if (propSlides && propSlides.length > 0) {
      setSlides(propSlides);
      setActiveSlideIndex(0);
      if (propSlides[0]?.headlineH1) {
        setConfig((prev) => ({
          ...prev,
          footerAnchorText: propSlides[0].headlineH1,
        }));
      }
    }
  }, [propSlides]);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  // Apply a hook preset
  const handleSelectHookPreset = (presetId: string) => {
    const preset = HOOK_STYLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const updated = [...slides];
    updated[0] = {
      ...updated[0],
      headlineH1: preset.slide1H1,
      subheadBadge: preset.subheadBadge,
      bodyText: preset.bodyText,
    };
    setSlides(updated);
    setConfig((prev) => ({
      ...prev,
      highlightKeyword: preset.highlightWord,
      footerAnchorText: preset.footerAnchor,
    }));
  };

  // Render graphic onto HTML5 Canvas
  const renderSlideToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1080;
    let height = 1080;
    if (config.aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (config.aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    } else if (config.aspectRatio === '4:5') {
      width = 1080;
      height = 1350;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Background styling
    const isBlueprint = config.theme === 'blueprint_notebook';
    const isLightEditorial = config.theme === 'light_editorial';

    if (isBlueprint) {
      // Clean "Notebook / Blueprint" Aesthetic
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle, light-gray graph/grid lines
      if (config.showGrid) {
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Card-based tactile border with rounded corners feel
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Top-right cross-hatch icon in Cyber Amber / Yellow (#F59E0B)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      const crossX = width - 100;
      const crossY = 80;
      // Cross 1
      ctx.beginPath();
      ctx.moveTo(crossX, crossY - 10);
      ctx.lineTo(crossX, crossY + 10);
      ctx.moveTo(crossX - 10, crossY);
      ctx.lineTo(crossX + 10, crossY);
      ctx.stroke();
      // Cross 2
      ctx.beginPath();
      ctx.moveTo(crossX + 24, crossY - 10);
      ctx.lineTo(crossX + 24, crossY + 10);
      ctx.moveTo(crossX + 14, crossY);
      ctx.lineTo(crossX + 34, crossY);
      ctx.stroke();
    } else if (config.theme === 'telemetry') {
      ctx.fillStyle = '#080C14';
      ctx.fillRect(0, 0, width, height);

      if (config.showGrid) {
        ctx.strokeStyle = 'rgba(55, 65, 81, 0.45)';
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Neon Green markers
      ctx.fillStyle = '#00FF85';
      ctx.fillRect(36, 36, 14, 3);
      ctx.fillRect(36, 36, 3, 14);
      ctx.fillRect(width - 50, 36, 14, 3);
      ctx.fillRect(width - 39, 36, 3, 14);
    } else if (config.theme === 'neon_purple') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0E0620');
      grad.addColorStop(1, '#1A0C38');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(123, 46, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    } else if (config.theme === 'hot_pink') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#190414');
      grad.addColorStop(1, '#2B0824');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 0, 122, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    } else if (config.theme === 'light_editorial') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1E40AF';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    } else {
      ctx.fillStyle = '#0F141E';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);
    }

    // Header bar: Brand & Slide Indicator
    const paddingX = 75;
    const startY = 110;

    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    if (isBlueprint) {
      ctx.fillStyle = '#1E293B';
    } else if (isLightEditorial) {
      ctx.fillStyle = '#1E40AF';
    } else if (config.theme === 'neon_purple') {
      ctx.fillStyle = '#00E5FF';
    } else if (config.theme === 'hot_pink') {
      ctx.fillStyle = '#FF007A';
    } else if (config.theme === 'amber_steel') {
      ctx.fillStyle = '#F59E0B';
    } else {
      ctx.fillStyle = '#00FF85';
    }
    if (config.logoType === 'custom_logo' && customLogoImg) {
      // Draw uploaded custom logo, scaled to 32px height
      const scale = 32 / customLogoImg.height;
      const imgWidth = customLogoImg.width * scale;
      ctx.drawImage(customLogoImg, paddingX, startY - 24, imgWidth, 32);
      ctx.fillText(`${config.brandName}`, paddingX + imgWidth + 12, startY);
    } else {
      const logoSymbol = config.logoType === 'monogram' ? '⬢' : config.logoType === 'blueprint_seal' ? '◎' : '▲';
      ctx.fillText(`${logoSymbol} ${config.brandName}`, paddingX, startY);
    }

    // Slide Number Tracker
    const slideIndicator = `CARD 0${currentSlide.slideNumber} / 0${slides.length}`;
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillStyle = isBlueprint ? '#64748B' : '#64748B';
    const indicatorWidth = ctx.measureText(slideIndicator).width;
    ctx.fillText(slideIndicator, width - paddingX - indicatorWidth - 80, startY);

    // Divider line
    ctx.strokeStyle = isBlueprint ? 'rgba(203, 213, 225, 0.8)' : 'rgba(55, 65, 81, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, startY + 28);
    ctx.lineTo(width - paddingX, startY + 28);
    ctx.stroke();

    // 2. Data Badge / Telemetry Subhead
    let currentY = startY + 105;
    if (config.showBadge && currentSlide.subheadBadge) {
      const badgeText = `[ ${currentSlide.subheadBadge} ]`;
      ctx.font = '700 22px "JetBrains Mono", monospace';
      const badgeWidth = ctx.measureText(badgeText).width + 36;
      const badgeHeight = 44;

      if (isBlueprint) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        ctx.strokeStyle = '#F59E0B';
      } else if (isLightEditorial) {
        ctx.fillStyle = 'rgba(30, 64, 175, 0.08)';
        ctx.strokeStyle = '#1E40AF';
      } else if (config.theme === 'neon_purple') {
        ctx.fillStyle = 'rgba(123, 46, 255, 0.18)';
        ctx.strokeStyle = '#7B2EFF';
      } else {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.strokeStyle = '#00E5FF';
      }

      ctx.fillRect(paddingX, currentY - 30, badgeWidth, badgeHeight);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(paddingX, currentY - 30, badgeWidth, badgeHeight);

      ctx.fillStyle = isBlueprint ? '#B45309' : isLightEditorial ? '#1E40AF' : '#00FF85';
      ctx.fillText(badgeText, paddingX + 18, currentY);

      currentY += 75;
    }

    // 3. Main Headline H1 with Selective Keyword Highlighting
    // Modern Geometric Sans-Serif font (Inter)
    ctx.font = '800 56px "Inter", sans-serif';
    const maxTextWidth = width - paddingX * 2 - (config.showPatternInterrupt ? 180 : 0);
    const words = currentSlide.headlineH1.split(' ');
    const lineHeight = 76;
    const highlightTarget = (config.highlightKeyword || '').trim().toLowerCase();

    // Wrap words into lines
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = ctx.measureText(word + ' ').width;
      if (currentLineWidth + wordWidth > maxTextWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [word];
        currentLineWidth = wordWidth;
      } else {
        currentLine.push(word);
        currentLineWidth += wordWidth;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Render lines with word-by-word selective highlighting
    for (const lineWords of lines) {
      let drawX = paddingX;

      for (const w of lineWords) {
        const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase();
        const isHighlight =
          highlightTarget &&
          (cleanWord === highlightTarget ||
            highlightTarget.split(' ').includes(cleanWord) ||
            w.startsWith('*') ||
            w.endsWith('*'));

        const displayText = w.replace(/\*/g, '');
        const wordMetric = ctx.measureText(displayText);
        const wWidth = wordMetric.width;

        if (isHighlight) {
          // Draw yellow/amber/neon highlight pill behind word
          ctx.save();
          ctx.fillStyle = config.highlightColor || '#F59E0B';
          const pillPaddingX = 8;
          const pillPaddingY = 6;
          const pillHeight = 58;

          // Rounded rectangle pill
          const pillX = drawX - pillPaddingX;
          const pillY = currentY - pillHeight + 14;
          const pillW = wWidth + pillPaddingX * 2;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillHeight, 8);
          ctx.fill();

          // High contrast black text on highlight pill
          ctx.fillStyle = '#000000';
          ctx.fillText(displayText, drawX, currentY);
          ctx.restore();
        } else {
          // Regular text color based on theme
          ctx.fillStyle = isBlueprint || isLightEditorial ? '#0F172A' : '#F8FAFC';
          ctx.fillText(displayText, drawX, currentY);
        }

        drawX += wWidth + ctx.measureText(' ').width;
      }
      currentY += lineHeight;
    }

    // Subtle accent rule line under H1
    ctx.fillStyle = isBlueprint ? '#F59E0B' : isLightEditorial ? '#EF4444' : '#00E5FF';
    ctx.fillRect(paddingX, currentY - 10, 80, 4);
    currentY += 45;

    // 4. Secondary Body Text (Light/Regular weight, high skimmability)
    if (currentSlide.bodyText) {
      ctx.font = '400 30px "Inter", sans-serif';
      ctx.fillStyle = isBlueprint || isLightEditorial ? '#475569' : '#94A3B8';
      const bodyWords = currentSlide.bodyText.split(' ');
      let bodyLine = '';
      const bodyLineHeight = 44;

      for (let i = 0; i < bodyWords.length; i++) {
        const testLine = bodyLine + bodyWords[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && i > 0) {
          ctx.fillText(bodyLine.trim(), paddingX, currentY);
          bodyLine = bodyWords[i] + ' ';
          currentY += bodyLineHeight;
        } else {
          bodyLine = testLine;
        }
      }
      ctx.fillText(bodyLine.trim(), paddingX, currentY);
    }

    // 5. Humorous Visual Pattern-Interrupt: "AI Bill" cut-out avatar (from Characters Folder)
    if (config.showPatternInterrupt) {
      const activeChar =
        CHARACTER_CUTOUT_PRESETS.find((c) => c.id === config.characterType) ||
        CHARACTER_CUTOUT_PRESETS[0];

      const avatarX = width - paddingX - 70;
      const avatarY = startY + 160;

      // Draw Avatar Circle Container
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, 54, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.strokeStyle = activeChar.tieColor || '#00E5FF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Illustrated Character Cutout in suit & sunglasses
      // Suit shoulders
      ctx.beginPath();
      ctx.ellipse(avatarX, avatarY + 48, 44, 26, 0, 0, Math.PI * 2);
      ctx.fillStyle = activeChar.suitColor || '#1E293B';
      ctx.fill();

      // White dress shirt collar
      ctx.beginPath();
      ctx.moveTo(avatarX - 12, avatarY + 22);
      ctx.lineTo(avatarX, avatarY + 44);
      ctx.lineTo(avatarX + 12, avatarY + 22);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Tie with preset color
      ctx.beginPath();
      ctx.moveTo(avatarX - 5, avatarY + 30);
      ctx.lineTo(avatarX + 5, avatarY + 30);
      ctx.lineTo(avatarX + 3, avatarY + 54);
      ctx.lineTo(avatarX, avatarY + 60);
      ctx.lineTo(avatarX - 3, avatarY + 54);
      ctx.closePath();
      ctx.fillStyle = activeChar.tieColor || '#EF4444';
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(avatarX, avatarY - 8, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24';
      ctx.fill();

      // Black Sunglasses
      ctx.fillStyle = '#000000';
      ctx.fillRect(avatarX - 20, avatarY - 14, 18, 10);
      ctx.fillRect(avatarX + 2, avatarY - 14, 18, 10);
      ctx.fillRect(avatarX - 2, avatarY - 12, 4, 3);

      // Smug smile
      ctx.beginPath();
      ctx.arc(avatarX, avatarY + 2, 10, 0.2, Math.PI - 0.2, false);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Speech bubble / pattern-interrupt pill below AI Bill
      const calloutText = activeChar.calloutText || 'AI BILL: PROUD & COMPLIANT';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      const calloutW = ctx.measureText(calloutText).width + 16;
      ctx.fillStyle = '#000000';
      ctx.roundRect(avatarX - calloutW / 2, avatarY + 62, calloutW, 22, 5);
      ctx.fill();
      ctx.strokeStyle = activeChar.tieColor || '#00E5FF';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = activeChar.tieColor || '#00E5FF';
      ctx.fillText(calloutText, avatarX - calloutW / 2 + 8, avatarY + 77);

      ctx.restore();
    }

    // 6. Consistent Footer Anchor: Slide 1 hook repeated across deck
    const footerY = height - 90;

    // Divider line above footer
    ctx.strokeStyle = isBlueprint ? 'rgba(203, 213, 225, 0.8)' : 'rgba(55, 65, 81, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, footerY - 45);
    ctx.lineTo(width - paddingX, footerY - 45);
    ctx.stroke();

    // Footer Anchor Text in smaller uniform font
    const anchorText = `⚓ HOOK ANCHOR: "${config.footerAnchorText || slides[0]?.headlineH1 || ''}"`;
    ctx.font = '500 18px "Inter", sans-serif';
    ctx.fillStyle = isBlueprint ? '#475569' : '#94A3B8';
    ctx.fillText(anchorText, paddingX, footerY - 15);

    // Carousel Progress Pill Indicators (Tactile Card UI)
    const totalDots = slides.length;
    const dotSpacing = 16;
    const startDotX = width - paddingX - (totalDots * dotSpacing + 20);

    for (let d = 0; d < totalDots; d++) {
      const isCurrent = d === activeSlideIndex;
      const dotX = startDotX + d * dotSpacing;

      if (isCurrent) {
        // Active elongated pill in orange/amber
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(dotX - 10, footerY - 24, 28, 9, 4);
        ctx.fill();
      } else {
        // Inactive circular dot
        ctx.fillStyle = isBlueprint ? '#CBD5E1' : '#475569';
        ctx.beginPath();
        ctx.arc(dotX + 2, footerY - 20, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Handle branding
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillStyle = isBlueprint ? '#64748B' : '#00E5FF';
    ctx.fillText(config.handle, paddingX, footerY + 12);
  }, [config, currentSlide, slides, activeSlideIndex, customLogoImg]);

  useEffect(() => {
    renderSlideToCanvas();
  }, [renderSlideToCanvas]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `aeobility-slide-${currentSlide.slideNumber}-${config.theme}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleUploadToDrive = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google to upload directly to your Google Drive.');
      }

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `aeobility-blueprint-slide-${currentSlide.slideNumber}-${Date.now()}.png`;
      const result = await uploadGraphicToDrive(token, dataUrl, filename);

      const link = result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`;
      setUploadStatus(`Saved to Drive: ${result.id}`);

      if (onSaveCreativeAsset) {
        onSaveCreativeAsset(link, currentSlide.headlineH1);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadStatus(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateCurrentH1 = (newH1: string) => {
    const updated = [...slides];
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      headlineH1: newH1,
    };
    setSlides(updated);
  };

  const handleUpdateCurrentBadge = (newBadge: string) => {
    const updated = [...slides];
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      subheadBadge: newBadge,
    };
    setSlides(updated);
  };

  const h1WordCount = currentSlide.headlineH1.trim().split(/\s+/).filter(Boolean).length;
  const isH1WithinLimit = h1WordCount <= 10;

  return (
    <div className="bg-black/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF007A]/10 border border-[#FF007A]/30 flex items-center justify-center text-[#FF007A]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              Slide & Graphic Studio
            </h3>
            <p className="text-xs text-zinc-400">
              Generates high-contrast visual cards with value hooks, keyword highlights, and avatar cutouts.
            </p>
          </div>
        </div>

        {/* Toolbar: Hook Strategy Dropdown & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown for Hook Strategy to Save Space */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1">
            <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
            <select
              onChange={(e) => e.target.value && handleSelectHookPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent text-xs text-zinc-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Load Hook Preset...</option>
              {HOOK_STYLE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-zinc-900 text-white">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium transition cursor-pointer"
            title="Download PNG to local drive"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={handleUploadToDrive}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00FF85] hover:bg-[#00e075] text-black text-xs font-bold transition shadow-md shadow-green-950/40 cursor-pointer disabled:opacity-50"
            title="Upload directly to Google Drive"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            {isUploading ? 'Uploading...' : 'Save to Drive'}
          </button>
        </div>
      </div>

      {/* Main Grid: Preview on Left, Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Canvas Preview Box */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-950 rounded-xl p-3.5 border border-zinc-800/80 relative">
          <div className="w-full flex items-center justify-between mb-2.5 text-xs text-zinc-400 px-1 font-mono">
            <span className="flex items-center gap-1.5 text-[#00E5FF]">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
              CANVAS: {config.aspectRatio === '1:1' ? '1080 × 1080' : config.aspectRatio === '9:16' ? '1080 × 1920' : '1920 × 1080'}
            </span>
            <span className="text-zinc-400 uppercase font-semibold text-[11px]">
              {config.theme.replace('_', ' ')}
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className="max-w-full overflow-hidden flex items-center justify-center p-2 rounded-lg bg-black/60 border border-zinc-800">
            <canvas
              ref={canvasRef}
              className="max-h-[440px] w-auto object-contain rounded shadow-2xl transition-all duration-200"
            />
          </div>

          {/* Slide Navigator Pills */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 w-full">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                  activeSlideIndex === idx
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/60 shadow-xs font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Card {s.slideNumber}: {s.slideType.toUpperCase()}
              </button>
            ))}
          </div>

          {uploadStatus && (
            <div className={`mt-3 w-full p-2.5 rounded-lg text-xs flex items-center gap-2 font-mono ${
              uploadStatus.startsWith('Saved')
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
            }`}>
              {uploadStatus.startsWith('Saved') ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span className="truncate">{uploadStatus}</span>
            </div>
          )}
        </div>

        {/* Right: Template Customisation & Rule Verification */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Theme Palette Dropdown Selector */}
          <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Visual Theme Palette:
              </label>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:border-[#00E5FF] focus:outline-none cursor-pointer"
              >
                <option value="blueprint_notebook">Blueprint Notebook (Yellow)</option>
                <option value="blue_theme">Blue Theme (Deck 2)</option>
                <option value="style_a_dark_cinematic">Style A: Dark Cinematic</option>
                <option value="style_b_charcoal_container">Style B: Muted Charcoal Container</option>
                <option value="style_c_red_accent">Style C: Before/After Red Accent</option>
                <option value="style_d_workspace_notes">Style D: Workspace Notes</option>
                <option value="telemetry">Dark Telemetry (Neon Green)</option>
                <option value="neon_purple">Purple & Cyan (#7B2EFF)</option>
                <option value="hot_pink">Hot Pink (#FF007A)</option>
                <option value="light_editorial">Light Editorial (#1E40AF)</option>
                <option value="amber_steel">Amber & Steel (#374151)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <label className="text-xs font-medium text-zinc-300">
                Canvas Ratio:
              </label>
              <select
                value={config.aspectRatio}
                onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value as any })}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:border-[#00E5FF] focus:outline-none cursor-pointer"
              >
                <option value="1:1">Square (1:1)</option>
                <option value="4:5">Portrait (4:5)</option>
                <option value="9:16">Story/Reel (9:16)</option>
                <option value="16:9">Landscape (16:9)</option>
              </select>
            </div>
          </div>

          {/* Selective Keyword Highlighting Controls */}
          <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Highlighter className="w-3.5 h-3.5 text-[#F59E0B]" />
                Selective Keyword Highlighting
              </span>
              <span className="text-[10px] text-[#F59E0B] font-mono">YELLOW / AMBER PILL</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={config.highlightKeyword}
                onChange={(e) => setConfig({ ...config, highlightKeyword: e.target.value })}
                placeholder="e.g. trade business, facts, Blueprint..."
                className="sm:col-span-8 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#F59E0B]"
              />
              <div className="sm:col-span-4 flex items-center gap-1.5">
                {[
                  { hex: '#F59E0B', label: 'Yellow' },
                  { hex: '#00FF85', label: 'Green' },
                  { hex: '#00E5FF', label: 'Cyan' },
                  { hex: '#FF007A', label: 'Pink' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setConfig({ ...config, highlightColor: color.hex })}
                    className={`w-6 h-6 rounded-md border transition cursor-pointer ${
                      config.highlightColor === color.hex ? 'border-white scale-110 shadow-xs' : 'border-black/40'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Anchors reader attention onto core keywords with high-contrast highlight background pills.
            </p>
          </div>

          {/* Brand Logo & Character Cutout (From Connected Drive Folders) */}
          <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800 space-y-3.5">
            {/* Logo Mark Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="text-[#FF007A]">▲</span>
                  Brand Logo Mark
                </label>
                <a
                  href="https://drive.google.com/drive/folders/1sYwEbr26nS4oHJ44DZicJPyhDPUTMqEt?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#FF007A] hover:underline flex items-center gap-1 font-mono font-bold"
                  title="Open Logos Drive Folder (1sYwEbr...)"
                >
                  Logos Folder <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {BRAND_LOGO_PRESETS.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => setConfig({ ...config, logoType: logo.id as any })}
                    className={`p-2 rounded-lg text-left transition cursor-pointer border text-[11px] font-mono flex items-center gap-1.5 ${
                      config.logoType === logo.id
                        ? 'bg-slate-800 border-[#FF007A] text-white shadow-xs font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: logo.color }}
                    />
                    <span className="truncate">{logo.name.split(' ')[1] || logo.name}</span>
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <label className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-medium border border-dashed rounded-lg cursor-pointer text-slate-400 border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white hover:border-[#FF007A] transition-colors">
                  <CloudUpload className="w-4 h-4" />
                  Upload Custom Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          // Basic implementation - saves to state (will need canvas rendering support)
                          setConfig({ ...config, customLogoUrl: event.target?.result as string, logoType: 'custom_logo' });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Pattern-Interrupt (AI Bill) & Characters Selector */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPatternInterrupt}
                    onChange={(e) => setConfig({ ...config, showPatternInterrupt: e.target.checked })}
                    className="rounded border-slate-700 text-[#00E5FF] focus:ring-0"
                  />
                  <Smile className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="font-semibold">AI Bill Pattern-Interrupt Cutout</span>
                </label>

                <a
                  href="https://drive.google.com/drive/folders/1AOdLv6iBaVdCalem7WJ21uNsfwEO45bn?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#F59E0B] hover:underline flex items-center gap-1 font-mono font-bold"
                  title="Open Characters Drive Folder (1AOdLv6...)"
                >
                  Characters Folder <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {config.showPatternInterrupt && (
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {CHARACTER_CUTOUT_PRESETS.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => setConfig({ ...config, characterType: char.id as any })}
                      className={`p-2 rounded-lg text-left transition cursor-pointer border text-xs flex items-center justify-between ${
                        config.characterType === char.id
                          ? 'bg-slate-800 border-[#F59E0B] text-white shadow-xs font-semibold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate text-[11px]">{char.name}</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ml-2"
                        style={{ backgroundColor: `${char.tieColor}20`, color: char.tieColor }}
                      >
                        {char.calloutText.split(':')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Consistent Footer Anchor */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1 font-mono">
                <Anchor className="w-3 h-3 text-[#00FF85]" />
                Consistent Footer Anchor Line (Repeated across deck):
              </label>
              <input
                type="text"
                value={config.footerAnchorText}
                onChange={(e) => setConfig({ ...config, footerAnchorText: e.target.value })}
                placeholder="Hook repeated across all cards..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-[#00FF85]"
              />
            </div>
          </div>

          {/* Active Slide Text Inputs */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Card Headline (H1 Action Statement)
                </label>
                <span className={`text-[11px] font-mono ${isH1WithinLimit ? 'text-[#00FF85]' : 'text-[#F59E0B] font-semibold'}`}>
                  {h1WordCount}/10 words {isH1WithinLimit ? '✓' : '(Exceeds 10 words)'}
                </span>
              </div>
              <textarea
                value={currentSlide.headlineH1}
                onChange={(e) => handleUpdateCurrentH1(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#00E5FF] font-medium"
                placeholder="Action-driven statement..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Subhead Metric Badge
                </label>
                <span className="text-[10px] text-[#00FF85] font-mono">TELEMETRY</span>
              </div>
              <input
                type="text"
                value={currentSlide.subheadBadge}
                onChange={(e) => handleUpdateCurrentBadge(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-[#00FF85] font-mono focus:outline-none focus:border-[#00FF85]"
                placeholder="e.g. ROI: 2 Crawl Cycles [Direct Lift]"
              />
            </div>

            {activeCalendarItem && (
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                Target Row: {activeCalendarItem.channel.toUpperCase()} ({activeCalendarItem.status})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
