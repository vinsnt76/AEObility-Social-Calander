import React, { useState } from 'react';
import { IANode } from '../types';
import {
  BRAND_STYLEGUIDE,
  CHANNEL_MATRIX,
  CONFIGURED_DRIVE_FOLDERS,
  BRAND_LOGO_PRESETS,
  CHARACTER_CUTOUT_PRESETS,
} from '../services/knowledgeBase';
import {
  FolderGit2,
  FileText,
  FileSpreadsheet,
  Layers,
  ExternalLink,
  BookOpen,
  Sliders,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Sparkles,
  Smile,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react';
import { listDriveFiles, DriveItem } from '../services/googleWorkspace';
import { getAccessToken } from '../services/firebaseAuth';

interface KnowledgeBaseExplorerProps {
  nodes: IANode[];
  onSelectNodeForPipeline: (node: IANode) => void;
  userToken: string | null;
}

export const KnowledgeBaseExplorer: React.FC<KnowledgeBaseExplorerProps> = ({
  nodes,
  onSelectNodeForPipeline,
  userToken,
}) => {
  const [activeTab, setActiveTab] = useState<'ia_slm' | 'styleguide' | 'matrix' | 'brand_assets' | 'drive_files'>('ia_slm');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(CONFIGURED_DRIVE_FOLDERS[0].id);
  const [driveFiles, setDriveFiles] = useState<DriveItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  const handleFetchDriveFiles = async (folderIdToFetch?: string) => {
    const targetFolder = folderIdToFetch || selectedFolderId;
    if (!userToken) {
      setDriveError('Please sign in with Google to explore your live Google Drive files.');
      return;
    }
    setIsLoadingFiles(true);
    setDriveError(null);
    try {
      const files = await listDriveFiles(userToken, targetFolder);
      setDriveFiles(files);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDriveError(`Failed to list Drive files: ${msg}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  return (
    <div className="bg-black/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              Grounded Knowledge Base
            </h3>
            <p className="text-xs text-zinc-400">
              Canonical topics, brand styleguide, channel matrix, and connected Drive asset folders.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ia_slm', label: 'IA Topics', icon: FileSpreadsheet, color: '#00E5FF' },
            { id: 'styleguide', label: 'Brand Voice', icon: BookOpen, color: '#7B2EFF' },
            { id: 'matrix', label: 'Matrix', icon: Sliders, color: '#00FF85' },
            { id: 'brand_assets', label: 'Logos & Characters', icon: Sparkles, color: '#FF007A' },
            { id: 'drive_files', label: 'Drive Files', icon: FolderGit2, color: '#F59E0B' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'drive_files' && driveFiles.length === 0 && userToken) {
                    handleFetchDriveFiles(selectedFolderId);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 shadow-xs border-zinc-700'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                style={isActive ? { borderColor: tab.color } : {}}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: IA & SLM Nodes */}
      {activeTab === 'ia_slm' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 font-mono flex items-center justify-between">
            <span>CANONICAL NODES REPOSITORY (DRIVE SPREADSHEET SYNC)</span>
            <span>{nodes.length} Grounded Topics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {node.targetIntent}
                    </span>
                    <span className="text-slate-500">Added: {node.dateAdded}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{node.title}</h4>
                  <a
                    href={node.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-mono mt-1"
                  >
                    {node.canonicalUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {node.coreEntities.map((ent, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    "{node.takeaways[0]}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400">
                    {node.suggestedMetric}
                  </span>
                  <button
                    onClick={() => onSelectNodeForPipeline(node)}
                    className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer transition"
                  >
                    Repurpose Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Brand Styleguide */}
      {activeTab === 'styleguide' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Brand Persona</span>
              <h4 className="text-xs font-semibold text-slate-200">{BRAND_STYLEGUIDE.persona}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{BRAND_STYLEGUIDE.tone}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase">First-Fold Rule</span>
              <h4 className="text-xs font-semibold text-slate-200">Max 120 Characters</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{BRAND_STYLEGUIDE.firstFoldRule}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Single CTA Rule</span>
              <h4 className="text-xs font-semibold text-slate-200">2 to 4 Words Only</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{BRAND_STYLEGUIDE.ctaRule}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spelling Rules */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 font-mono uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Australian English Canonical Dictionary
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {BRAND_STYLEGUIDE.spellingRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 font-mono text-[11px]">
                    <span className="text-emerald-400">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Forbidden Buzzwords */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-rose-300 font-mono uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Strictly Forbidden Buzzwords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {BRAND_STYLEGUIDE.forbiddenBuzzwords.map((bw, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300"
                  >
                    ✕ {bw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Design Style Variations (Hooks, Typography, Blueprint Aesthetic) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-[#00E5FF]/30 space-y-3">
            <h4 className="text-xs font-bold text-[#00E5FF] font-mono uppercase flex items-center justify-between">
              <span>Design Style Variations & Hook Frameworks</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                Blueprint Notebook Specs
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-mono text-[10px] text-[#F59E0B] uppercase font-bold block">
                  1. Use of Hooks
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Direct Value & Outcome Hook (Slide 1):</strong> Starts with specific numbers and results (e.g. <em>"$995 got one trade business clearer citations in two crawl cycles"</em>), pairing hard metrics with concrete outcomes.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong>Humorous Pattern-Interrupt:</strong> Uses a cut-out of <em>AI Bill</em> looking proud/smug in a suit to stop social feed scrolling.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong>Action-Driven Headers:</strong> Subsequent slides use instructional statements (e.g. <em>"What AI facts need first"</em>, <em>"Build passages one clean block at a time"</em>).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-mono text-[10px] text-[#00FF85] uppercase font-bold block">
                  2. Typography & Hierarchy
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Modern Geometric Sans-Serif:</strong> High contrast between heavy bold headlines and light/regular body text.
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Selective Keyword Highlighting:</strong> Single words within headlines (e.g. <em>"trade business"</em>, <em>"facts"</em>, <em>"passages"</em>, <em>"Blueprint"</em>) are highlighted in yellow/olive green pills.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong>Consistent Footer Anchor:</strong> The initial hook line is repeated across the bottom of every card in uniform weight.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-mono text-[10px] text-[#7B2EFF] uppercase font-bold block">
                  3. Blueprint Notebook Aesthetic
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Graph / Grid Lines:</strong> Subtle light-gray graph lines form the background, reinforcing technical precision.
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Cross-Hatch & Tactile UI:</strong> Top-right cross-hatch icon, rounded card corners, and active orange pill carousel dot indicators.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Channel Matrix */}
      {activeTab === 'matrix' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Format Specification</th>
                <th className="py-3 px-4">Char Limit</th>
                <th className="py-3 px-4">Link Placement Strategy</th>
                <th className="py-3 px-4">Voice Guideline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {CHANNEL_MATRIX.map((cm) => (
                <tr key={cm.channel} className="hover:bg-slate-800/20">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {cm.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs">{cm.format}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{cm.charLimit}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">{cm.linkPlacement}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{cm.toneSpec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Brand Assets (Logos & Characters Folders) */}
      {activeTab === 'brand_assets' && (
        <div className="space-y-6">
          {/* Drive Folders Directory Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <span className="font-mono text-xs text-[#00E5FF] font-bold flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                CONFIGURED GOOGLE DRIVE ASSET FOLDERS
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Grounded Identity & Creative Repositories
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {CONFIGURED_DRIVE_FOLDERS.map((folder) => (
                <div
                  key={folder.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  style={{ borderLeftColor: folder.accentColor, borderLeftWidth: '3px' }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{
                          backgroundColor: `${folder.accentColor}20`,
                          color: folder.accentColor,
                        }}
                      >
                        {folder.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-100">{folder.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {folder.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <a
                      href={folder.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono font-semibold hover:underline flex items-center gap-1"
                      style={{ color: folder.accentColor }}
                    >
                      Open in Drive <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setActiveTab('drive_files');
                        if (userToken) {
                          handleFetchDriveFiles(folder.id);
                        }
                      }}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition cursor-pointer"
                    >
                      Browse Files →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Logos Folder Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF007A]/15 border border-[#FF007A]/30 flex items-center justify-center text-[#FF007A]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    Logos & Brand Identity Folder
                    <span className="text-[10px] px-2 py-0.2 rounded bg-[#FF007A]/20 text-[#FF007A] font-mono">
                      1sYwEbr26nS4oHJ44DZicJPyhDPUTMqEt
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    High-resolution vector marks, SVG files, and transparent PNG slide anchors.
                  </p>
                </div>
              </div>

              <a
                href="https://drive.google.com/drive/folders/1sYwEbr26nS4oHJ44DZicJPyhDPUTMqEt?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2.5 py-1 rounded-lg bg-[#FF007A]/10 hover:bg-[#FF007A]/20 text-[#FF007A] border border-[#FF007A]/30 font-mono font-bold flex items-center gap-1.5 transition"
              >
                <span>Open Logos Folder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BRAND_LOGO_PRESETS.map((logo) => (
                <div
                  key={logo.id}
                  className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{logo.name}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: logo.color }}
                    />
                  </div>

                  {/* SVG / Vector visual representation */}
                  <div className="h-20 rounded bg-slate-950 flex items-center justify-center border border-slate-800">
                    {logo.id === 'delta_triangle' && (
                      <div className="flex items-center gap-2 text-[#00E5FF]">
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="50,15 90,85 10,85" fill="none" stroke="#00E5FF" strokeWidth="6" />
                          <polygon points="50,35 75,78 25,78" fill="#00E5FF" fillOpacity="0.25" />
                        </svg>
                        <span className="font-mono text-xs font-bold">AEOBILITY</span>
                      </div>
                    )}
                    {logo.id === 'monogram' && (
                      <div className="flex items-center gap-2 text-[#00FF85]">
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="#00FF85" strokeWidth="5" />
                          <text x="50" y="58" textAnchor="middle" fill="#00FF85" fontSize="24" fontFamily="monospace" fontWeight="bold">AEO</text>
                        </svg>
                        <span className="font-mono text-xs font-bold">TELEMETRY</span>
                      </div>
                    )}
                    {logo.id === 'blueprint_seal' && (
                      <div className="flex items-center gap-2 text-[#F59E0B]">
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="4 2" />
                          <circle cx="50" cy="50" r="28" fill="#F59E0B" fillOpacity="0.15" />
                          <text x="50" y="55" textAnchor="middle" fill="#F59E0B" fontSize="16" fontFamily="monospace" fontWeight="bold">SEAL</text>
                        </svg>
                        <span className="font-mono text-xs font-bold">BLUEPRINT</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">{logo.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Characters Folder Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    Characters & Pattern-Interrupt Cutouts Folder
                    <span className="text-[10px] px-2 py-0.2 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-mono">
                      1AOdLv6iBaVdCalem7WJ21uNsfwEO45bn
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Humorous feed pattern-interrupt avatars (AI Bill) contrasting against technical subject matter to stop scrolling.
                  </p>
                </div>
              </div>

              <a
                href="https://drive.google.com/drive/folders/1AOdLv6iBaVdCalem7WJ21uNsfwEO45bn?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2.5 py-1 rounded-lg bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 font-mono font-bold flex items-center gap-1.5 transition"
              >
                <span>Open Characters Folder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CHARACTER_CUTOUT_PRESETS.map((char) => (
                <div
                  key={char.id}
                  className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{char.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[#00E5FF] font-mono">
                      CUTOUT
                    </span>
                  </div>

                  {/* Character Illustration Preview */}
                  <div className="h-28 rounded bg-slate-950 flex flex-col items-center justify-center border border-slate-800 p-2 relative">
                    <div className="w-12 h-12 rounded-full border-2 border-[#00E5FF] bg-slate-900 flex items-center justify-center relative shadow-md">
                      <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center relative">
                        {/* Sunglasses */}
                        <div className="w-6 h-2 bg-black rounded-xs absolute top-2.5"></div>
                        {/* Smile */}
                        <div className="w-3 h-1 border-b-2 border-black rounded-full absolute bottom-1.5"></div>
                      </div>
                    </div>
                    {/* Suit Collar & Tie */}
                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Suit</span>
                      <span className="px-1.5 py-0.2 rounded" style={{ backgroundColor: `${char.tieColor}25`, color: char.tieColor }}>
                        {char.tieColor === '#EF4444' ? 'Red Tie' : char.tieColor === '#00E5FF' ? 'Cyan Tie' : 'Neon Tie'}
                      </span>
                    </div>
                    <span className="mt-1 text-[9px] font-mono px-2 py-0.5 rounded bg-black/80 text-[#00E5FF] border border-[#00E5FF]/40">
                      {char.calloutText}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {char.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Live Drive Files */}
      {activeTab === 'drive_files' && (
        <div className="space-y-4">
          {/* Multi-Folder Selector Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#00E5FF]" />
                SELECT DRIVE FOLDER TO QUERY:
              </span>

              <button
                onClick={() => handleFetchDriveFiles(selectedFolderId)}
                disabled={isLoadingFiles}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                {isLoadingFiles ? 'Fetching Drive...' : 'Fetch Folder Files'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CONFIGURED_DRIVE_FOLDERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFolderId(f.id);
                    if (userToken) {
                      handleFetchDriveFiles(f.id);
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedFolderId === f.id
                      ? 'bg-slate-800 border-[#00E5FF] text-white shadow-xs font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold truncate">{f.name.split(' ')[0]}</span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded"
                      style={{ backgroundColor: `${f.accentColor}20`, color: f.accentColor }}
                    >
                      {f.badge.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate">ID: {f.id}</span>
                </button>
              ))}
            </div>

            {/* Selected Folder Metadata & Direct URL */}
            {(() => {
              const currentFolder = CONFIGURED_DRIVE_FOLDERS.find((f) => f.id === selectedFolderId) || CONFIGURED_DRIVE_FOLDERS[0];
              return (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">ACTIVE:</span>
                    <span className="font-bold text-slate-200">{currentFolder.name}</span>
                  </div>
                  <a
                    href={currentFolder.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline inline-flex items-center gap-1 font-bold"
                    style={{ color: currentFolder.accentColor }}
                  >
                    Open in Google Drive <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })()}
          </div>

          {driveError && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-mono">
              {driveError}
            </div>
          )}

          {driveFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {driveFiles.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{f.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{f.mimeType}</p>
                    </div>
                  </div>
                  {f.webViewLink && (
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline p-1 text-[11px] font-mono flex items-center gap-1 shrink-0"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : !driveError ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 font-mono text-xs">
              {userToken ? 'No files returned or click "Fetch Folder Files" above to inspect this Drive folder.' : 'Sign in with Google in the top bar to inspect live Google Drive files from this folder.'}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
