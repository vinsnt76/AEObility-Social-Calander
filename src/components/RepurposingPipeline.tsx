import React, { useState } from 'react';
import { IANode, GeneratedSocialBundle, SocialChannel, ContentCalendarItem } from '../types';
import { requestGenerateSocialBundle } from '../services/geminiClient';
import { auditBrandVoice } from '../services/gatekeeper';
import {
  Sparkles,
  Layers,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Store,
  ExternalLink,
  Send,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface RepurposingPipelineProps {
  nodes: IANode[];
  selectedNode: IANode;
  onSelectNode: (node: IANode) => void;
  onSendToCalendar: (items: ContentCalendarItem[]) => void;
  onSendToGatekeeper: (text: string, cta: string) => void;
  onSendToGraphicGenerator: (slides: any[], title: string, metric: string) => void;
}

export const RepurposingPipeline: React.FC<RepurposingPipelineProps> = ({
  nodes,
  selectedNode,
  onSelectNode,
  onSendToCalendar,
  onSendToGatekeeper,
  onSendToGraphicGenerator,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeChannelTab, setActiveChannelTab] = useState<SocialChannel>('linkedin');
  const [bundle, setBundle] = useState<GeneratedSocialBundle | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [insertedToCalendar, setInsertedToCalendar] = useState(false);
  const [useGridView, setUseGridView] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setInsertedToCalendar(false);
    try {
      const generated = await requestGenerateSocialBundle(selectedNode, customPrompt);
      setBundle(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyChannelCopy = (text: string, channelKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channelKey);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  const handleBatchInsertToCalendar = () => {
    if (!bundle) return;

    const today = new Date();
    const formatDate = (daysAhead: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    const newCalendarItems: ContentCalendarItem[] = [
      {
        id: `cal-li-${Date.now()}`,
        iaNodeId: selectedNode.id,
        channel: 'linkedin',
        title: selectedNode.title,
        hook: bundle.linkedIn.hook,
        copy: `${bundle.linkedIn.body}\n\n${bundle.linkedIn.callToAction}: ${selectedNode.canonicalUrl}\n\n${bundle.linkedIn.hashtags.join(' ')}`,
        overlayText: bundle.linkedIn.hook.slice(0, 80),
        scheduledDate: formatDate(1),
        scheduledTime: '08:30',
        status: 'In Review',
        gatekeeperScore: auditBrandVoice(bundle.linkedIn.body, bundle.linkedIn.callToAction).score,
        gatekeeperIssues: auditBrandVoice(bundle.linkedIn.body, bundle.linkedIn.callToAction).issues.map(
          (i) => i.message
        ),
        lastModified: new Date().toISOString(),
      },
      {
        id: `cal-ig-${Date.now()}`,
        iaNodeId: selectedNode.id,
        channel: 'instagram',
        title: bundle.instagram.title,
        hook: bundle.instagram.slides[0]?.headlineH1 || selectedNode.title,
        copy: `${bundle.instagram.caption}\n\n${bundle.instagram.hashtags.join(' ')}`,
        overlayText: bundle.instagram.slides[0]?.headlineH1 || '',
        creativeAssetLink: `drive://templates/carousel-${selectedNode.id}`,
        scheduledDate: formatDate(2),
        scheduledTime: '12:15',
        status: 'In Review',
        gatekeeperScore: auditBrandVoice(bundle.instagram.caption).score,
        gatekeeperIssues: auditBrandVoice(bundle.instagram.caption).issues.map((i) => i.message),
        lastModified: new Date().toISOString(),
      },
      {
        id: `cal-fb-${Date.now()}`,
        iaNodeId: selectedNode.id,
        channel: 'facebook',
        title: selectedNode.title,
        hook: bundle.facebook.hook,
        copy: `${bundle.facebook.hook}\n\n${bundle.facebook.body}\n\n${bundle.facebook.callToAction}: ${selectedNode.canonicalUrl}`,
        overlayText: bundle.facebook.hook.slice(0, 80),
        scheduledDate: formatDate(3),
        scheduledTime: '15:00',
        status: 'In Review',
        gatekeeperScore: auditBrandVoice(bundle.facebook.body, bundle.facebook.callToAction).score,
        gatekeeperIssues: auditBrandVoice(bundle.facebook.body, bundle.facebook.callToAction).issues.map(
          (i) => i.message
        ),
        lastModified: new Date().toISOString(),
      },
      {
        id: `cal-yt-${Date.now()}`,
        iaNodeId: selectedNode.id,
        channel: 'youtube',
        title: bundle.youtube.title,
        hook: bundle.youtube.hook,
        copy: `${bundle.youtube.script45s}\n\nCTA: ${bundle.youtube.callToAction}`,
        overlayText: bundle.youtube.hook,
        scheduledDate: formatDate(4),
        scheduledTime: '18:00',
        status: 'In Review',
        gatekeeperScore: auditBrandVoice(bundle.youtube.script45s, bundle.youtube.callToAction).score,
        gatekeeperIssues: auditBrandVoice(bundle.youtube.script45s, bundle.youtube.callToAction).issues.map(
          (i) => i.message
        ),
        lastModified: new Date().toISOString(),
      },
      {
        id: `cal-gmb-${Date.now()}`,
        iaNodeId: selectedNode.id,
        channel: 'gmb',
        title: bundle.gmb.title,
        hook: bundle.gmb.summary1500Char.slice(0, 100),
        copy: bundle.gmb.summary1500Char,
        overlayText: selectedNode.title,
        scheduledDate: formatDate(5),
        scheduledTime: '10:00',
        status: 'In Review',
        gatekeeperScore: auditBrandVoice(bundle.gmb.summary1500Char, 'Learn More').score,
        gatekeeperIssues: auditBrandVoice(bundle.gmb.summary1500Char).issues.map((i) => i.message),
        lastModified: new Date().toISOString(),
      },
    ];

    onSendToCalendar(newCalendarItems);
    setInsertedToCalendar(true);
  };

  return (
    <div className="space-y-5">
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
                Grounds Gemini on your Drive knowledge base to generate 5 brand-aligned channel drafts.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? 'Synthesising 5 Channels...' : 'Generate 5-Channel Bundle'}
          </button>
        </div>

        {/* Dropdown Node Selector to Save Massive Space */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-zinc-300">
              Grounded Knowledge Topic:
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
              <span className="font-semibold text-slate-200">Canonical Grounding:</span>
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
            <div className="text-xs text-slate-400 flex flex-wrap gap-1.5 items-center">
              <span className="text-slate-500 font-mono text-[11px]">Core Entities:</span>
              {selectedNode.coreEntities.map((ent, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                >
                  {ent}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-300 space-y-1 pt-1">
              <span className="text-slate-400 font-semibold block text-[11px]">Key Technical Takeaways:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                {selectedNode.takeaways.slice(0, 2).map((takeaway, i) => (
                  <li key={i} className="line-clamp-1">{takeaway}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-3 md:pt-0">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Grounded Metric Badge
              </span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 block font-semibold">
                {selectedNode.suggestedMetric}
              </span>
            </div>

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

      {/* Generation Results View (5 Channels) */}
      {bundle ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-5">
          {/* Top Bar with Channel Selector Tabs & Batch Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, hex: '#00E5FF' },
                { id: 'instagram', label: 'Instagram / Carousel', icon: Instagram, hex: '#FF007A' },
                { id: 'facebook', label: 'Facebook', icon: Facebook, hex: '#1E40AF' },
                { id: 'youtube', label: 'YouTube Short', icon: Youtube, hex: '#EF4444' },
                { id: 'gmb', label: 'Google Business', icon: Store, hex: '#00FF85' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeChannelTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChannelTab(tab.id as SocialChannel)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      isActive
                        ? 'bg-slate-800 text-slate-100 shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    style={isActive ? { borderColor: tab.hex, boxShadow: `0 0 10px ${tab.hex}30` } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: tab.hex }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchInsertToCalendar}
                disabled={insertedToCalendar}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-60 transition"
              >
                {insertedToCalendar ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    Inserted to Content Calendar (In Review)
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send All 5 Rows to Content Calendar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Channel Details */}
          {activeChannelTab === 'linkedin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4 text-sky-400" />
                  FOUNDER-LED FIRST-PERSON NARRATIVE
                </span>
                <div className="flex items-center gap-3">
                  <span>{bundle.linkedIn.characterCount} Chars</span>
                  <button
                    onClick={() => handleCopyChannelCopy(bundle.linkedIn.body, 'linkedin')}
                    className="hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedChannel === 'linkedin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedChannel === 'linkedin' ? 'Copied' : 'Copy Post'}
                  </button>
                </div>
              </div>

              {/* 3-Line First-Fold Hook Highlight */}
              <div className="p-3.5 rounded-lg bg-sky-950/20 border border-sky-800/40 space-y-1">
                <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold">
                  First-Fold Hook (Visible Before 'See More'):
                </span>
                <p className="text-xs text-sky-200 font-medium leading-relaxed">
                  {bundle.linkedIn.hook}
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {bundle.linkedIn.body}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-emerald-400 font-mono">
                    CTA: {bundle.linkedIn.callToAction} → {selectedNode.canonicalUrl}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {bundle.linkedIn.hashtags.join(' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() =>
                    onSendToGatekeeper(bundle.linkedIn.body, bundle.linkedIn.callToAction)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Audit in Brand Voice Gatekeeper
                </button>
              </div>
            </div>
          )}

          {activeChannelTab === 'instagram' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  5-SLIDE CAROUSEL SCRIPT WITH TELEMETRY OVERLAYS
                </span>
                <button
                  onClick={() =>
                    onSendToGraphicGenerator(
                      bundle.instagram.slides,
                      bundle.instagram.title,
                      selectedNode.suggestedMetric
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer transition"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Render in Slide & Graphic Generator
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {bundle.instagram.slides.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-[#00E5FF]/50 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-2">
                        <span>CARD 0{s.slideNumber}</span>
                        <span className={`uppercase px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          idx === 0
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                            : idx === 4
                            ? 'bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {idx === 0 ? 'VALUE HOOK' : idx === 4 ? 'ACTION CTA' : 'ACTION HEADER'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#00FF85] block mb-1">
                        [{s.subheadBadge}]
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 leading-snug">
                        {s.headlineH1}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed font-sans">
                      {s.bodyText}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300">
                <span className="font-mono text-[10px] text-slate-500 block mb-1">
                  POST CAPTION & HASHTAGS:
                </span>
                <p className="whitespace-pre-wrap">{bundle.instagram.caption}</p>
                <div className="mt-2 text-emerald-400 font-mono text-[11px]">
                  {bundle.instagram.hashtags.join(' ')}
                </div>
              </div>
            </div>
          )}

          {activeChannelTab === 'facebook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-400" />
                  PRACTICAL PLAIN-ENGLISH EXPLAINER (OPERATOR ORIENTED)
                </span>
                <button
                  onClick={() => handleCopyChannelCopy(bundle.facebook.body, 'facebook')}
                  className="hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedChannel === 'facebook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedChannel === 'facebook' ? 'Copied' : 'Copy Update'}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs text-slate-200 space-y-3 leading-relaxed">
                <p className="font-semibold text-slate-100">{bundle.facebook.hook}</p>
                <p className="whitespace-pre-wrap">{bundle.facebook.body}</p>
                <div className="pt-3 border-t border-slate-800 text-emerald-400 font-mono">
                  CTA: {bundle.facebook.callToAction} → {selectedNode.canonicalUrl}
                </div>
              </div>
            </div>
          )}

          {activeChannelTab === 'youtube' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-400" />
                  45-SECOND SPOKEN SHORT SCRIPT WITH VISUAL PROMPTS
                </span>
                <button
                  onClick={() => handleCopyChannelCopy(bundle.youtube.script45s, 'youtube')}
                  className="hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedChannel === 'youtube' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedChannel === 'youtube' ? 'Copied' : 'Copy Script'}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">{bundle.youtube.title}</span>
                  <span className="text-red-400">Pacing: 45s (~110-120 words)</span>
                </div>
                <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {bundle.youtube.script45s}
                </div>
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    SUGGESTED VISUAL ASSETS / OVERLAYS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bundle.youtube.visualPrompts.map((vp, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        [CUE {idx + 1}: {vp}]
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChannelTab === 'gmb' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-400" />
                  GOOGLE BUSINESS PROFILE (LOCAL AUTHORITY UPDATE)
                </span>
                <span className="text-emerald-400">
                  {bundle.gmb.characterCount} / 1,500 Chars Limit
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">{bundle.gmb.title}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                    Action: {bundle.gmb.callToAction}
                  </span>
                </div>
                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {bundle.gmb.summary1500Char}
                </p>
                <div className="pt-3 border-t border-slate-800 text-emerald-400 font-mono text-xs">
                  Button Action Destination: {bundle.gmb.actionUrl}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">
            Pipeline Ready to Synthesise
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Generate 5-Channel Bundle" above to run Gemini against "{selectedNode.title}" and produce 5 grounded, platform-optimised outputs.
          </p>
        </div>
      )}
    </div>
  );
};
