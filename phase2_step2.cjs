const fs = require('fs');
const path = require('path');

const pipelinePath = path.join(__dirname, 'src', 'components', 'RepurposingPipeline.tsx');
let pipelineContent = fs.readFileSync(pipelinePath, 'utf8');

// 1. Update imports
pipelineContent = pipelineContent.replace(
  /import \{ requestGenerateSocialBundle \} from '\.\.\/services\/geminiClient';/,
  `import { 
  generateLinkedInPost,
  generateInstagramCarousel,
  generateFacebookPost,
  generateYouTubePost,
  generateGMBPost,
  ChannelGeneratePayload 
} from '../services/geminiClient';`
);

// 2. Define CHANNEL_RUNNERS inside the component or outside
const channelRunnersCode = `
const CHANNEL_RUNNERS: Record<ChannelKey, (payload: ChannelGeneratePayload) => Promise<Partial<ChannelPost>>> = {
  linkedin: generateLinkedInPost,
  instagram: generateInstagramCarousel,
  facebook: generateFacebookPost,
  youtube: generateYouTubePost,
  googleBusiness: generateGMBPost,
};
`;

if (!pipelineContent.includes('CHANNEL_RUNNERS')) {
  pipelineContent = pipelineContent.replace(
    /const INITIAL_BUNDLE_STATE/,
    channelRunnersCode + '\nconst INITIAL_BUNDLE_STATE'
  );
}

// 3. Replace handleGenerate
const handleGenerateRegex = /const handleGenerate = async \(\) => \{[\s\S]*?\};\r?\n/;
const newHandleGenerate = `  const handleParallelGenerate = (channelsToRun: ChannelKey[] = Object.keys(CHANNEL_RUNNERS) as ChannelKey[]) => {
    setIsGenerating(true);
    setBundlePosts(prev => {
      const next = { ...prev };
      channelsToRun.forEach(ch => {
        next[ch] = { ...next[ch], status: 'generating', errorMessage: undefined };
      });
      return next;
    });

    const payload: ChannelGeneratePayload = {
      node: selectedNode,
      promptModifier: customPrompt,
      theme: designStyle,
    };

    let completed = 0;

    channelsToRun.forEach(channel => {
      CHANNEL_RUNNERS[channel](payload)
        .then(result => {
          setBundlePosts(prev => ({
            ...prev,
            [channel]: {
              ...prev[channel],
              ...result,
              status: 'generated',
            },
          }));
        })
        .catch(err => {
          setBundlePosts(prev => ({
            ...prev,
            [channel]: {
              ...prev[channel],
              status: 'failed',
              errorMessage: err?.message || 'Failed to generate copy',
            },
          }));
        })
        .finally(() => {
          completed++;
          if (completed === channelsToRun.length) {
            setIsGenerating(false);
          }
        });
    });
  };

`;

pipelineContent = pipelineContent.replace(handleGenerateRegex, newHandleGenerate);

// 4. Update the "Generate Assets" button to call handleParallelGenerate
pipelineContent = pipelineContent.replace(
  /onClick=\{handleGenerate\}/,
  'onClick={() => handleParallelGenerate()}'
);

// 5. Pass onRetry property to ChannelTabPanel if it doesn't exist
if (!pipelineContent.includes('onRetry=')) {
  pipelineContent = pipelineContent.replace(
    /<ChannelTabPanel\s+activeChannel=\{activeChannelTab\}\s+posts=\{bundlePosts\}\s+onSelectChannel=\{setActiveChannelTab\}\s+onOpenTool=\{handleOpenTool\}\s+\/>/,
    `<ChannelTabPanel 
          activeChannel={activeChannelTab} 
          posts={bundlePosts} 
          onSelectChannel={setActiveChannelTab} 
          onOpenTool={handleOpenTool} 
          onRetry={(channel) => handleParallelGenerate([channel])}
        />`
  );
}

fs.writeFileSync(pipelinePath, pipelineContent);

// 6. Update ChannelTabPanel.tsx
const tabPanelPath = path.join(__dirname, 'src', 'components', 'ChannelTabPanel.tsx');
let tabContent = fs.readFileSync(tabPanelPath, 'utf8');

if (!tabContent.includes('onRetry?: (channel: ChannelKey) => void;')) {
  // Add onRetry to Props
  tabContent = tabContent.replace(
    /onUpdateStatus: \(status: PostLifecycleStatus\) => void;/,
    `onUpdateStatus: (status: PostLifecycleStatus) => void;\n  onRetry?: (channel: ChannelKey) => void;`
  );
}

// Destructure onRetry
tabContent = tabContent.replace(
  /onOpenTool,/,
  `onOpenTool,\n  onRetry,`
);

// Update Status icon map
tabContent = tabContent.replace(
  /const STATUS_ICONS: Record<string, React\.ReactNode> = \{[\s\S]*?\};/,
  `const STATUS_ICONS: Record<string, React.ReactNode> = {
  empty: <CircleDashed size={14} className="text-slate-600" />,
  generating: <Loader2 size={14} className="text-blue-400 animate-spin" />,
  generated: <CheckCircle2 size={14} className="text-slate-400" />,
  edited: <CheckCircle2 size={14} className="text-blue-400" />,
  ready: <CheckCircle2 size={14} className="text-emerald-500" />,
  dispatched: <Send size={14} className="text-purple-500" />,
  failed: <AlertCircle size={14} className="text-red-500" />,
};`
);

// We need to import Loader2 and AlertCircle in ChannelTabPanel
if (!tabContent.includes('Loader2')) {
  tabContent = tabContent.replace(
    /import \{([\s\S]*?)\} from 'lucide-react';/,
    `import {$1  Loader2,\n  AlertCircle,\n} from 'lucide-react';`
  );
}

// Modify the content rendering for 'generating' and 'failed'
const oldContentRender = /<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900\/50">[\s\S]*?<div className="h-full max-w-4xl mx-auto flex flex-col">[\s\S]*?<div className="flex items-center gap-3 mb-6">/;

const newContentRender = `<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/50">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          
          {post.status === 'generating' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Generating Content...</p>
              <div className="w-full max-w-md space-y-3 mt-8">
                <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}

          {post.status === 'failed' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <AlertCircle size={48} className="text-red-500" />
              <h3 className="text-xl font-bold text-slate-200">Generation Failed</h3>
              <p className="text-slate-400 max-w-md text-center">{post.errorMessage || 'An error occurred during generation.'}</p>
              <button 
                onClick={() => onRetry && onRetry(activeChannel)}
                className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={16} />
                Retry ${'${CONFIGS[activeChannel].label}'}
              </button>
            </div>
          )}

          {post.status !== 'empty' && post.status !== 'generating' && post.status !== 'failed' && (
            <>
              <div className="flex items-center gap-3 mb-6">`;

if (!tabContent.includes("post.status === 'generating'")) {
  // Import RefreshCw
  tabContent = tabContent.replace(
    /import \{([\s\S]*?)\} from 'lucide-react';/,
    `import {$1  RefreshCw,\n} from 'lucide-react';`
  );

  // We need to inject the skeleton and error state correctly.
  tabContent = tabContent.replace(
    /<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900\/50">\s*<div className="h-full max-w-4xl mx-auto flex flex-col">\s*<div className="flex items-center gap-3 mb-6">/,
    newContentRender
  );
  
  // Close the fragment at the end of the content area
  tabContent = tabContent.replace(
    /<\/textarea>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
    `</textarea>\n              </div>\n            </>\n          )}\n        </div>\n      </div>`
  );
}

fs.writeFileSync(tabPanelPath, tabContent);
console.log('Milestones 2.2 & 2.3 completed.');
