import React from 'react';

export type ChannelKey = 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'googleBusiness';
export type PostLifecycleStatus = 'empty' | 'generated' | 'edited' | 'ready' | 'dispatched';
export type ActiveTool = 'graphics' | 'gatekeeper' | null;

export interface VisualAsset {
  aspectRatio: '4:5' | '16:9' | '1:1' | '1.91:1' | '4:3';
  assetUrl?: string;
  layers?: Record<string, unknown>[];
  designThemeId: string;
}

export interface ChannelPost {
  channel: ChannelKey;
  copy: string;
  originalGeneratedCopy: string;
  status: PostLifecycleStatus;
  voiceScore?: number;
  voiceAuditNotes?: string[];
  visuals?: VisualAsset;
  scheduledTime?: string;
  slides?: any[]; // for IG carousel
  title?: string;
  metric?: string;
}

export const ChannelTabPanel: React.FC<{
  post: ChannelPost;
  onOpenTool: (tool: ActiveTool) => void;
  onUpdateStatus: (status: PostLifecycleStatus) => void;
  onSingleDispatch: () => void;
}> = ({ post, onOpenTool, onSingleDispatch }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">
          Status: <span className="text-[#00E5FF] capitalize">{post.status}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTool('graphics')}
            className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            🎨 Graphic Studio {post.visuals?.assetUrl ? '✓' : ''}
          </button>
          <button
            onClick={() => onOpenTool('gatekeeper')}
            className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            🛡️ Brand Voice {post.voiceScore ? `(${post.voiceScore}/100)` : ''}
          </button>
          <button
            onClick={onSingleDispatch}
            disabled={post.status === 'dispatched' || post.status === 'empty'}
            className="px-3 py-1.5 text-sm bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded-md hover:bg-[#00E5FF]/30 disabled:opacity-50 transition cursor-pointer font-semibold"
          >
            {post.status === 'dispatched' ? 'Dispatched' : 'Send to Calendar'}
          </button>
        </div>
      </div>
      
      {/* Editor Content Area */}
      <textarea
        value={post.copy}
        className="w-full h-48 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-200 font-sans leading-relaxed focus:outline-none focus:border-[#00E5FF] resize-none"
        readOnly
      />
    </div>
  );
};
