const fs = require('fs');
const path = require('path');

const pipelinePath = path.join(__dirname, 'src', 'components', 'RepurposingPipeline.tsx');
let content = fs.readFileSync(pipelinePath, 'utf8');

// 1. Add hook import
content = content.replace(
  /import \{ BrandVoiceGatekeeper \} from '\.\/BrandVoiceGatekeeper';/,
  `import { BrandVoiceGatekeeper } from './BrandVoiceGatekeeper';\nimport { usePipelineAutosave } from '../hooks/usePipelineAutosave';`
);

// 2. Replace useState for bundlePosts with usePipelineAutosave
content = content.replace(
  /const \[bundlePosts, setBundlePosts\] = useState<Record<ChannelKey, ChannelPost>>\(INITIAL_BUNDLE_STATE\);/,
  `const {
    bundlePosts,
    setBundlePosts,
    saveStatus,
    clearCurrentDraft,
  } = usePipelineAutosave(selectedNode.id, INITIAL_BUNDLE_STATE);`
);

// 3. Update handleBatchDispatch
const oldDispatchRegex = /const handleBatchDispatch = \(onlyReady: boolean\) => \{[\s\S]*?\}\)\)\);[\s\S]*?setBundlePosts\(prev => \(\{ \.\.\.prev, \[channel\]: \{ \.\.\.prev\[channel\], status: 'dispatched' \} \}\)\);/; // Wait, I need to match the whole handleBatchDispatch

const oldDispatchFull = /const handleBatchDispatch = \(onlyReady: boolean\) => \{[\s\S]*?\};\r?\n/;

// I'll just write a robust replacer for handleBatchDispatch
const replaceHandleBatchDispatch = `  const handleBatchDispatch = (onlyReady: boolean) => {
    const targets = Object.values(bundlePosts).filter(
      (p) => p.status !== 'empty' && p.status !== 'idle' && p.status !== 'generating' && p.status !== 'dispatched'
    );
    const toDispatch = onlyReady ? targets.filter((p) => p.status === 'ready') : targets;

    if (toDispatch.length === 0) return;

    onSendToCalendar(
      toDispatch.map((post) => ({
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
        gatekeeperScore: post.voiceScore || 0,
        gatekeeperIssues: [],
        lastModified: new Date().toISOString()
      } as ContentCalendarItem))
    );

    const dispatchedKeys = new Set(toDispatch.map((p) => p.channel));
    setBundlePosts((prev) => {
      const next = { ...prev };
      dispatchedKeys.forEach((key) => {
        next[key] = { ...next[key], status: 'dispatched' };
      });
      return next;
    });

    // If all generated items are now dispatched, purge local storage draft
    const allDispatched = Object.values(bundlePosts).every(
      (p) => p.status === 'empty' || p.status === 'idle' || dispatchedKeys.has(p.channel)
    );
    if (allDispatched) {
      clearCurrentDraft();
    }
  };

`;

content = content.replace(/const handleBatchDispatch = \(onlyReady: boolean\) => \{[\s\S]*?\}\)\)\);\r?\n\s*\};\r?\n/, replaceHandleBatchDispatch);


// 4. Update Header
const oldHeaderRegex = /<div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">[\s\S]*?Source: \{selectedNode\.title\}[\s\S]*?<\/h2>[\s\S]*?<\/div>[\s\S]*?<p className="text-xs text-zinc-500">[\s\S]*?Parallel multi-channel generation pipeline with independent channel workers\.[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?onClick=\{\(\) => handleParallelGenerate\(\)\}[\s\S]*?className="px-5 py-2\.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"[\s\S]*?>[\s\S]*?\{isGenerating && \([\s\S]*?<span className="w-3\.5 h-3\.5 border-2 border-white border-t-transparent rounded-full animate-spin" \/>[\s\S]*?\)\}[\s\S]*?\{isGenerating \? 'Synthesizing Channels\.\.\.' : 'Generate 5-Channel Bundle'\}[\s\S]*?<\/button>[\s\S]*?<\/div>/;

const newHeader = `<div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Source: {selectedNode.title}
            </h2>
            {/* Visual Autosave Badge */}
            {saveStatus === 'saving' && (
              <span className="text-[11px] font-medium text-amber-500 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Autosaving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                ✓ Draft saved locally
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Parallel multi-channel generation pipeline with independent channel workers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <button
              type="button"
              onClick={clearCurrentDraft}
              className="text-xs text-zinc-500 hover:text-rose-500 transition-colors px-2 py-1"
            >
              Reset Draft
            </button>
          )}

          <button
            type="button"
            onClick={() => handleParallelGenerate()}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isGenerating ? 'Synthesizing Channels...' : 'Generate 5-Channel Bundle'}
          </button>
        </div>
      </div>`;

content = content.replace(oldHeaderRegex, newHeader);

fs.writeFileSync(pipelinePath, content);
console.log('Applied Step 3 modifications.');
