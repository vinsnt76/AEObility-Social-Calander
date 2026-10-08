import React, { useState, useMemo } from 'react';
import { IANode, ContentCalendarItem } from '../types';
import { requestGenerateSocialBundle } from '../services/geminiClient';
import { PipelineOverlayDrawer } from './PipelineOverlayDrawer';
import { ChannelTabPanel, ChannelKey, ChannelPost, ActiveContext } from './ChannelTabPanel';
import { CHANNEL_CONFIGS } from '../config/channelPresets';
import { CHARACTER_CUTOUT_PRESETS } from '../services/knowledgeBase';
import { CHARACTER_CUTOUT_PRESETS } from '../services/knowledgeBase';
import { SlideGraphicGenerator } from './SlideGraphicGenerator';
import { BrandVoiceGatekeeper } from './BrandVoiceGatekeeper';
import {
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface RepurposingPipelineProps {
  nodes: IANode[];
  selectedNode: IANode;
  onSelectNode: (node: IANode) => void;
  onSendToCalendar: (items: ContentCalendarItem[]) => void;
}

const INITIAL_BUNDLE_STATE: Record<ChannelKey, ChannelPost> = {
  linkedin: { channel: 'linkedin', copy: '', originalGeneratedCopy: '', status: 'empty' },
  instagram: { channel: 'instagram', copy: '', originalGeneratedCopy: '', status: 'empty' },
  facebook: { channel: 'facebook', copy: '', originalGeneratedCopy: '', status: 'empty' },
  youtube: { channel: 'youtube', copy: '', originalGeneratedCopy: '', status: 'empty' },
  googleBusiness: { channel: 'googleBusiness', copy: '', originalGeneratedCopy: '', status: 'empty' },
};

export const RepurposingPipeline: React.FC<RepurposingPipelineProps> = ({
  nodes,
  selectedNode,
  onSelectNode,
  onSendToCalendar,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [bundlePosts, setBundlePosts] = useState<Record<ChannelKey, ChannelPost>>(INITIAL_BUNDLE_STATE);
  const [activeChannelTab, setActiveChannelTab] = useState<ChannelKey>('linkedin');
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);
  
  const [useGridView, setUseGridView] = useState(false);
  const [activeAngles, setActiveAngles] = useState<string[]>([]);
  const [designStyle, setDesignStyle] = useState('blueprint_notebook');
  const [primaryCharacter, setPrimaryCharacter] = useState('');
  const [secondaryCharacter, setSecondaryCharacter] = useState('');
  
  React.useEffect(() => setActiveAngles([]), [selectedNode.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await requestGenerateSocialBundle(selectedNode, customPrompt);
      
      setBundlePosts({
        linkedin: { channel: 'linkedin', copy: generated.linkedIn.body, originalGeneratedCopy: generated.linkedIn.body, status: 'generated' },
        instagram: { channel: 'instagram', copy: generated.instagram.caption, originalGeneratedCopy: generated.instagram.caption, status: 'generated', slides: generated.instagram.slides, title: generated.instagram.title, metric: selectedNode.suggestedMetric },
        facebook: { channel: 'facebook', copy: generated.facebook.body, originalGeneratedCopy: generated.facebook.body, status: 'generated' },
        youtube: { channel: 'youtube', copy: generated.youtube.script45s, originalGeneratedCopy: generated.youtube.script45s, status: 'generated' },
        googleBusiness: { channel: 'googleBusiness', copy: generated.gmb.summary1500Char, originalGeneratedCopy: generated.gmb.summary1500Char, status: 'generated' },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenTool = (channel: ChannelKey, tool: 'graphics' | 'gatekeeper') => {
    setActiveContext({ channelKey: channel, tool });
  };

  const handleCloseDrawer = () => {
    setActiveContext(null);
  };

  const handleSaveGraphics = (channel: ChannelKey, assetUrl: string) => {
    setBundlePosts(prev => ({
      ...prev,
      [channel]: { 
        ...prev[channel], 
        status: prev[channel].status === 'generated' ? 'edited' : prev[channel].status,
        visuals: { 
          aspectRatio: CHANNEL_CONFIGS[channel].defaultRatio, 
          assetUrl, 
          designThemeId: designStyle 
        } 
      }
    }));
    handleCloseDrawer();
  };

  const handleApplyVoiceEdits = (channel: ChannelKey, newCopy: string, score: number) => {
    setBundlePosts(prev => ({
      ...prev,
      [channel]: { 
        ...prev[channel], 
        copy: newCopy,
        voiceScore: score,
        status: 'ready'
      }
    }));
    handleCloseDrawer();
  };

  const readyCount = useMemo(() => Object.values(bundlePosts).filter(p => p.status === 'ready').length, [bundlePosts]);

  const handleDispatchSingle = (channel: ChannelKey) => {
    const post = bundlePosts[channel];
    onSendToCalendar([{
      id: crypto.randomUUID(),
      iaNodeId: selectedNode.id,
      channel: post.channel === 'googleBusiness' ? 'gmb' : post.channel,
      title: post.title || selectedNode.title,
      hook: post.copy.slice(0, 100),
      copy: post.copy,
      overlayText: post.copy.slice(0, 50),
      creativeAssetLink: post.visuals?.assetUrl,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '12:00',
      status: 'In Review',
      gatekeeperScore: post.voiceScore,
      gatekeeperIssues: [],
      lastModified: new Date().toISOString()
    }]);
    
    setBundlePosts(prev => ({ ...prev, [channel]: { ...prev[channel], status: 'dispatched' } }));
  };

  const handleBatchDispatch = (onlyReady: boolean) => {
    const targets = Object.values(bundlePosts).filter(p => p.status !== 'empty' && p.status !== 'dispatched');
    const toDispatch = onlyReady ? targets.filter(p => p.status === 'ready') : targets;
    
    if (toDispatch.length === 0) return;

    onSendToCalendar(toDispatch.map(post => ({
      id: crypto.randomUUID(),
      iaNodeId: selectedNode.id,
      channel: post.channel === 'googleBusiness' ? 'gmb' : post.channel,
      title: post.title || selectedNode.title,
      hook: post.copy.slice(0, 100),
      copy: post.copy,
      overlayText: post.copy.slice(0, 50),
      creativeAssetLink: post.visuals?.assetUrl,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '12:00',
      status: 'In Review',
      gatekeeperScore: post.voiceScore,
      gatekeeperIssues: [],
      lastModified: new Date().toISOString()
    })));

    const dispatchedKeys = new Set(toDispatch.map(p => p.channel));
    setBundlePosts(prev => {
      const next = { ...prev };
      dispatchedKeys.forEach(key => {
        next[key] = { ...next[key], status: 'dispatched' };
      });
      return next;
    });
  };

  const activePost = activeContext ? bundlePosts[activeContext.channelKey] : null;

  return (
    <div className="space-y-5 relative">
{/* Top Selector Card: Grounded IA Node Selection */}
      <div className="bg-black/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                Multi-Channel Repurposing Pipeline
              </h3>
              <p className="text-xs text-zinc-400">
                Generate 5 brand-aligned social drafts from your knowledge base.
              </p>
            </div>
          </div>
        </div>

        {/* Dropdown Node Selector to Save Massive Space */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-[#00E5FF]">
              Step 1: Select Webpage to Repurpose
            </span>
            <button
              onClick={() => setUseGridView(!useGridView)}
              className="text-[11px] font-mono text-[#00E5FF] hover:underline cursor-pointer flex items-center gap-1"
            >
              {useGridView ? 'Collapse to Dropdown ↑' : 'Expand All Topic Cards ↓'}
            </button>
          </div>

          {!useGridView ? (
            /* Space-saving Dropdown Selector */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={selectedNode.id}
                onChange={(e) => {
                  const node = nodes.find((n) => n.id === e.target.value);
                  if (node) {
                    onSelectNode(node);
                    setInsertedToCalendar(false);
                  }
                }}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:border-[#00E5FF] focus:outline-none cursor-pointer"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title} — [{node.primaryKeyphrase}]
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {nodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      onSelectNode(node);
                      setInsertedToCalendar(false);
                    }}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 shadow-md'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {node.targetIntent.split('/')[0]}
                      </span>
                      <h4 className="text-xs font-medium text-zinc-200 mt-1.5 leading-snug line-clamp-2">
                        {node.title}
                      </h4>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/60 pt-2">
                      <span className="truncate max-w-[140px] text-emerald-400">{node.primaryKeyphrase}</span>
                      <span>{node.suggestedMetric.split(':')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Node Details Box */}
        <div className="bg-zinc-950/90 rounded-xl p-3.5 border border-zinc-800/80 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-200">Source Link:</span>
              <a
                href={selectedNode.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                {selectedNode.canonicalUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap gap-2 items-center pt-1">
              <span className="text-[#00E5FF] font-mono text-[11px] font-medium block w-full mb-1">Step 2: Select Content Angles (Click to toggle):</span>
              {selectedNode.coreEntities.map((ent, i) => {
                const isActive = activeAngles.includes(ent);
                return (
                  <button
                    key={i}
                    onClick={() => setActiveAngles(prev => isActive ? prev.filter(a => a !== ent) : [...prev, ent])}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer shadow-sm ${
                      isActive 
                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/50 shadow-[0_0_8px_rgba(0,229,255,0.2)]' 
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {ent}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-slate-300 space-y-1 pt-2">
              <span className="text-slate-400 font-semibold block text-[11px]">Key Technical Takeaways:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                {selectedNode.takeaways.slice(0, 2).map((takeaway, i) => (
                  <li key={i} className="line-clamp-1">{takeaway}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-3 md:pt-0">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Design Style
              </span>
              <select 
                value={designStyle}
                onChange={e => setDesignStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#00E5FF] cursor-pointer"
              >
                <option value="blueprint_notebook">Blueprint Notebook (Yellow)</option>
                <option value="blue_theme">Blue Theme (Deck 2)</option>
                <option value="style_a_dark_cinematic">Style A: Dark Cinematic</option>
                <option value="style_b_charcoal_container">Style B: Muted Charcoal Container</option>
                <option value="style_c_red_accent">Style C: Before/After Red Accent</option>
                <option value="style_d_workspace_notes">Style D: Workspace Notes</option>
                <option value="telemetry">Dark Telemetry</option>
                <option value="neon_purple">Neon Purple</option>
                <option value="hot_pink">Hot Pink</option>
              </select>
            </div>
            {/* Aspect Ratio dropdown removed in favor of platform-adaptive defaults */}

            <div className="mt-3">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Optional tuning prompt..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      
      {/* Step 3: Generate Action */}
      <div className="flex justify-center py-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-slate-950 text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer disabled:opacity-50 transition transform hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Synthesising 5 Channels...' : 'Step 3: Generate 5-Channel Bundle'}
        </button>
      </div>

      {/* Output Tray */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-5">
         <div className="flex gap-2 border-b border-zinc-800 pb-4">
            {(Object.keys(INITIAL_BUNDLE_STATE) as ChannelKey[]).map(key => {
              const post = bundlePosts[key];
              const isCurrent = activeChannelTab === key;
              return (
                <button 
                  key={key} 
                  onClick={() => setActiveChannelTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    isCurrent ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {CHANNEL_CONFIGS[key].label}
                  {post.status === 'ready' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  {post.status === 'dispatched' && <span className="text-xs text-emerald-400">✓</span>}
                </button>
              );
            })}
         </div>

         <ChannelTabPanel 
            post={bundlePosts[activeChannelTab]} 
            onOpenTool={(tool) => handleOpenTool(activeChannelTab, tool!)}
            onUpdateStatus={(status) => setBundlePosts(prev => ({ ...prev, [activeChannelTab]: { ...prev[activeChannelTab], status } }))}
            onSingleDispatch={() => handleDispatchSingle(activeChannelTab)}
         />

         {/* Granular Master Dispatch Bar */}
         <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
           <div className="text-sm text-zinc-600 dark:text-zinc-400">
             <span className="font-semibold text-zinc-900 dark:text-zinc-100">{readyCount}</span> of 5 posts marked ready
           </div>
           <div className="flex items-center gap-3">
             <button onClick={() => handleBatchDispatch(true)} disabled={readyCount === 0} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition">
               Dispatch Ready ({readyCount})
             </button>
             <button onClick={() => handleBatchDispatch(false)} className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-lg text-sm transition">
               Dispatch All (Force Drafts)
             </button>
           </div>
         </div>
      </div>

      <PipelineOverlayDrawer 
        isOpen={!!activeContext} 
        title={activeContext?.tool === 'graphics' ? '🎨 Graphic Studio' : '🛡️ Brand Voice Gatekeeper'}
        onClose={handleCloseDrawer}
      >
        {activeContext?.tool === 'graphics' && activePost && (
          <SlideGraphicGenerator 
            slides={activePost.slides && activePost.slides.length > 0 
              ? activePost.slides 
              : [{ slideType: 'hook', headlineH1: activePost.title || CHANNEL_CONFIGS[activeContext.channelKey].label, bodyText: activePost.copy }]
            }
            initialTheme={designStyle}
            initialRatio={CHANNEL_CONFIGS[activeContext.channelKey].defaultRatio}
            onSaveCreativeAsset={(url) => handleSaveGraphics(activeContext.channelKey, url)}
          />
        )}

        {activeContext?.tool === 'gatekeeper' && activePost && (
          <BrandVoiceGatekeeper 
            initialText={activePost.copy}
            onApplyEdits={(newCopy, score) => handleApplyVoiceEdits(activeContext.channelKey, newCopy, score)}
          />
        )}
      </PipelineOverlayDrawer>
    </div>
  );
};
