const fs = require('fs');

const filePath = 'src/components/RepurposingPipeline.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Extract the Top Selector Card and Selected Node Details Box
const startIndex = content.indexOf('{/* Top Selector Card: Grounded IA Node Selection */}');
const endIndex = content.indexOf('{/* Step 3: Generate Action */}');

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find boundaries for the UI extraction.");
  process.exit(1);
}

const leftSidebarUI = content.substring(startIndex, endIndex);

const newContent = `import React, { useState, useMemo } from 'react';
import { IANode, ContentCalendarItem } from '../types';
import { requestGenerateSocialBundle } from '../services/geminiClient';
import { PipelineOverlayDrawer } from './PipelineOverlayDrawer';
import { ChannelTabPanel, ChannelKey, ChannelPost, ActiveContext } from './ChannelTabPanel';
import { CHANNEL_CONFIGS } from '../config/channelPresets';
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
${leftSidebarUI}
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
                  className={\`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 \${
                    isCurrent ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }\`}
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
`;

fs.writeFileSync(filePath, newContent);
console.log("Updated RepurposingPipeline.tsx successfully");
