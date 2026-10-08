import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  FolderGit2,
  Image,
  User,
  ExternalLink,
  ChevronDown,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';

export const ConnectedAssetsDropdown: React.FC = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const PROJECT_ID = 'antigravity-cli-and-adk-500010';

  const FOLDERS = [
    {
      id: '1H4ZFpqFpQf_hNkeEIY4xYz_9W9l6VSFB',
      name: 'Knowledge Base Root',
      desc: 'IA Nodes & SLM Docs',
      icon: FolderGit2,
      color: '#00E5FF',
      url: 'https://drive.google.com/drive/folders/1H4ZFpqFpQf_hNkeEIY4xYz_9W9l6VSFB?usp=drive_link',
    },
    {
      id: '1sYwEbr26nS4oHJ44DZicJPyhDPUTMqEt',
      name: 'Logos & Vectors',
      desc: 'Wordmark & Brand Marks',
      icon: Image,
      color: '#FF007A',
      url: 'https://drive.google.com/drive/folders/1sYwEbr26nS4oHJ44DZicJPyhDPUTMqEt?usp=drive_link',
    },
    {
      id: '1AOdLv6iBaVdCalem7WJ21uNsfwEO45bn',
      name: 'Characters & Cutouts',
      desc: 'AI Bill Pattern-Interrupts',
      icon: User,
      color: '#F59E0B',
      url: 'https://drive.google.com/drive/folders/1AOdLv6iBaVdCalem7WJ21uNsfwEO45bn?usp=drive_link',
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
          isDark
            ? 'bg-black border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
        title="View connected Google Drive folders and Cloud Project"
      >
        <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
        <span className="font-semibold text-[11px] hidden sm:inline">Drive & Project</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
          3 Folders
        </span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 mt-2 w-80 rounded-xl border p-3 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-black/95 border-zinc-800 text-zinc-100 shadow-black'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Connected Workspace Resources
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                Live Synced
              </span>
            </div>

            {/* Cloud Project Info */}
            <div className={`p-2 rounded-lg mb-2 text-xs flex items-center justify-between ${
              isDark ? 'bg-zinc-950 border border-zinc-800/80' : 'bg-slate-50 border border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
                <div>
                  <p className="text-[10px] text-zinc-400 font-mono">Cloud Project</p>
                  <p className="font-mono text-xs font-semibold text-zinc-200">{PROJECT_ID}</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(PROJECT_ID, 'project')}
                className="p-1 rounded text-zinc-400 hover:text-white transition"
                title="Copy Project ID"
              >
                {copiedId === 'project' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Folders List */}
            <div className="space-y-1.5">
              {FOLDERS.map((folder) => {
                const Icon = folder.icon;
                return (
                  <div
                    key={folder.id}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      isDark ? 'hover:bg-zinc-900 bg-zinc-950/60' : 'hover:bg-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-zinc-200">{folder.name}</p>
                        <p className="text-[10px] text-zinc-400">{folder.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(folder.id, folder.id)}
                        className="p-1 text-zinc-400 hover:text-white transition"
                        title="Copy Folder ID"
                      >
                        {copiedId === folder.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <a
                        href={folder.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-zinc-400 hover:text-white transition"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
