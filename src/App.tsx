/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  setAccessTokenInMemory,
} from './services/firebaseAuth';
import { INITIAL_IA_NODES } from './services/knowledgeBase';
import { IANode, ContentCalendarItem, PostStatus, CarouselSlide, ChannelCredentials } from './types';
import { RepurposingPipeline } from './components/RepurposingPipeline';
import { SlideGraphicGenerator } from './components/SlideGraphicGenerator';
import { BrandVoiceGatekeeper } from './components/BrandVoiceGatekeeper';
import { ContentCalendarDispatch } from './components/ContentCalendarDispatch';
import { KnowledgeBaseExplorer } from './components/KnowledgeBaseExplorer';
import { ChannelCredentialsManager } from './components/ChannelCredentialsManager';
import { ConnectedAssetsDropdown } from './components/ConnectedAssetsDropdown';
import { ThemeAndPaletteControl } from './components/ThemeAndPaletteControl';
import { BrandLogo } from './components/BrandLogo';
import { loadSavedCredentials } from './services/credentialStorage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Table,
  HardDrive,
  LogOut,
  Cpu,
  Radio,
  ExternalLink,
  KeyRound,
} from 'lucide-react';

const INITIAL_CALENDAR_ITEMS: ContentCalendarItem[] = [
  {
    id: 'cal-seed-01',
    iaNodeId: 'node-pos-bias',
    channel: 'linkedin',
    title: 'Positional Bias in Retrieval-Augmented Generation (RAG)',
    hook: 'Most enterprise RAG architectures fail factual synthesis in the middle 70% of retrieved context blocks.',
    copy: `When language models process long retrieved context blocks, attention heads attenuate rapidly outside the initial and trailing token sequences.

In our Australian engineering benchmarks for positional bias in retrieval, factual recall drops by up to 43% when critical evidence is positioned in the middle quintile.

Key architectural takeaways:
1. Re-rank retrieved chunks using contextual entity salience before feeding synthesis prompts.
2. Structure schema graphs to resolve Lost-in-the-Middle Phenomenon explicitly against canonical Wikidata entities.
3. Replace verbose marketing prose with high-entropy technical definitions to optimise token density.

AEO systems require deterministic grounding over brute-force context stuffing.

Inspect the data: https://aeobility.com.au/research/positional-bias-rag-retrieval

#AEO #InformationRetrieval #VectorSearch`,
    overlayText: 'Recall Drop: -43.2% [Middle Quintile]',
    creativeAssetLink: 'https://drive.google.com/sample/slide-rag-01.png',
    scheduledDate: '2026-10-08',
    scheduledTime: '08:30',
    status: 'Scheduled',
    gatekeeperScore: 100,
    gatekeeperIssues: [],
    lastModified: '2026-10-07T14:20:00Z',
  },
  {
    id: 'cal-seed-02',
    iaNodeId: 'node-entity-salience',
    channel: 'instagram',
    title: 'Entity Salience & Knowledge Graph Extraction',
    hook: 'Why unanchored claims fail generative answer engine confidence scores.',
    copy: `Slide-by-slide architecture breakdown on semantic triplet extraction and knowledge graph grounding for Google AI Overviews and Perplexity.\n\nRead the full research paper via link in bio.\n\n#AEO #GenerativeSearch #KnowledgeGraph`,
    overlayText: 'Disambiguation Gain: +68.4% Confidence',
    creativeAssetLink: 'https://drive.google.com/sample/carousel-entity.png',
    scheduledDate: '2026-10-09',
    scheduledTime: '12:00',
    status: 'In Review',
    gatekeeperScore: 92,
    gatekeeperIssues: [],
    lastModified: '2026-10-07T12:00:00Z',
  },
  {
    id: 'cal-seed-03',
    iaNodeId: 'node-context-distill',
    channel: 'facebook',
    title: 'Context Distillation & Token Density for Lightweight SLMs',
    hook: 'Why marketing fluff is actively crippling your enterprise AI search results.',
    copy: `If your website relies on legacy keyword repetition, modern AI answer engines like Google AI Overviews and Perplexity often skip right past your key insights.

When AI models scan long documents, low-entropy sentences inflate KV cache memory overhead by nearly 4x with zero gain in answer synthesis.

To ensure your enterprise is accurately cited as the canonical authority, your content must be structured into dense, declarative semantic blocks.

View the research: https://aeobility.com.au/research/context-distillation-slm-compression`,
    overlayText: 'Cache Overhead: -3.8x Redundant Tokens',
    scheduledDate: '2026-10-10',
    scheduledTime: '15:30',
    status: 'Approved',
    gatekeeperScore: 95,
    gatekeeperIssues: [],
    lastModified: '2026-10-07T11:15:00Z',
  },
  {
    id: 'cal-seed-04',
    iaNodeId: 'node-zero-click',
    channel: 'youtube',
    title: 'Zero-Click AI Search Impression Modeling in 45 Seconds',
    hook: 'Over 64% of searches now terminate inside the AI preview without a single click.',
    copy: `[ON SCREEN: Red graph showing 64% zero-click search share]
Here is why your enterprise RAG pipeline is hallucinating.
When you feed an LLM five pages of context, attention heads focus heavily on the top and bottom.
The middle 70%? Recall drops by over 40%.
[ON SCREEN: Code snippet of Reciprocal Rank Fusion]
The fix isn't more tokens. It's entity re-ranking and semantic triplet extraction.
Anchor your canonical claims with structured schema so the generative engine cannot ignore them.
[ON SCREEN: URL: aeobility.com.au]
Inspect the full benchmarks on the AEObility engineering hub.

CTA: Inspect the data`,
    overlayText: 'GCS Correlation: r = 0.82 With Market Share',
    scheduledDate: '2026-10-11',
    scheduledTime: '18:00',
    status: 'Scheduled',
    gatekeeperScore: 88,
    gatekeeperIssues: [],
    lastModified: '2026-10-07T10:45:00Z',
  },
  {
    id: 'cal-seed-05',
    iaNodeId: 'node-semantic-drift',
    channel: 'gmb',
    title: 'Semantic Drift & Vector Cluster Stability Briefing',
    hook: 'Enterprise Technical Briefing: Semantic Drift & Vector Cluster Stability.',
    copy: `Enterprise Technical Briefing: Semantic Drift & Vector Cluster Stability in Embedding Indexing.\n\nIn recent retrieval benchmark studies conducted across Australian business search datasets, continual content updates were observed drifting vector embeddings outside of their original cluster neighbourhoods.\n\nTo ensure commercial knowledge bases maintain authoritative citation share in Google AI Overviews and Perplexity:\n1. Ensure canonical entity disambiguation via structured schema graphs.\n2. Monitor HNSW graph stability to prevent retrieval relevance drops.\n3. Track centroid drift across high-dimensional embeddings.\n\nAccess our full technical whitepaper and architectural benchmarks via the link below.`,
    overlayText: 'Drift Threshold: Max 0.04 Delta Cosine',
    scheduledDate: '2026-10-07',
    scheduledTime: '09:00',
    status: 'Published',
    liveUrl: 'https://maps.google.com/localposts/p_aeobility_0921',
    gatekeeperScore: 100,
    gatekeeperIssues: [],
    lastModified: '2026-10-07T09:00:00Z',
  },
];

function AppContent() {
  const { mode } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // App State
  const [iaNodes, setIaNodes] = useState<IANode[]>(INITIAL_IA_NODES);
  const [selectedNode, setSelectedNode] = useState<IANode>(INITIAL_IA_NODES[0]);
  const [calendarItems, setCalendarItems] = useState<ContentCalendarItem[]>(INITIAL_CALENDAR_ITEMS);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'pipeline' | 'graphics' | 'gatekeeper' | 'calendar' | 'knowledge' | 'credentials'>('pipeline');
  const [channelCredentials, setChannelCredentials] = useState<ChannelCredentials>(loadSavedCredentials);

  // Slide generator state
  const [activeSlides, setActiveSlides] = useState<CarouselSlide[]>([]);
  const [slideTitle, setSlideTitle] = useState<string>('');
  const [slideMetric, setSlideMetric] = useState<string>('');
  const [activeCalendarItemForGraphic, setActiveCalendarItemForGraphic] = useState<ContentCalendarItem | null>(null);

  // Gatekeeper state
  const [gatekeeperInspectText, setGatekeeperInspectText] = useState<string>(
    INITIAL_CALENDAR_ITEMS[0].copy
  );
  const [gatekeeperInspectCta, setGatekeeperInspectCta] = useState<string>('Inspect the data');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Workspace Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setUserToken(token);
        setAccessTokenInMemory(token);
      },
      () => {
        setCurrentUser(null);
        setUserToken(null);
        setAccessTokenInMemory(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthNotice(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setUserToken(res.accessToken);
        setAccessTokenInMemory(res.accessToken);
        setAuthNotice('Google Workspace connected successfully.');
      } else {
        setAuthNotice('Sign-in popup was dismissed. You can re-open anytime or continue with grounded knowledge base mode.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Google Sign In Notice:', msg);
      setAuthNotice('Could not connect Google account. Grounded knowledge base mode remains fully operational.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setUserToken(null);
    setAuthNotice('Disconnected from Google Workspace.');
  };

  // Pipeline Handler: Add batch items to calendar
  const handleSendToCalendar = (newItems: ContentCalendarItem[]) => {
    setCalendarItems((prev) => [...newItems, ...prev]);
  };

  // Pipeline Handler: Inspect copy in Gatekeeper
  const handleInspectInGatekeeper = (text: string, cta: string) => {
    setGatekeeperInspectText(text);
    setGatekeeperInspectCta(cta);
    setActiveTab('gatekeeper');
  };

  // Pipeline Handler: Send slides to graphic generator
  const handleSendToGraphicGenerator = (slides: CarouselSlide[], title: string, metric: string) => {
    setActiveSlides(slides);
    setSlideTitle(title);
    setSlideMetric(metric);
    setActiveCalendarItemForGraphic(null);
    setActiveTab('graphics');
  };

  // Calendar Handler: Update item status & live URL
  const handleUpdateItemStatus = (id: string, status: PostStatus, liveUrl?: string) => {
    setCalendarItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              liveUrl: liveUrl || item.liveUrl,
              lastModified: new Date().toISOString(),
            }
          : item
      )
    );
  };

  // Calendar Handler: Delete item
  const handleDeleteCalendarItem = (id: string) => {
    setCalendarItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calendar Handler: Open Graphic generator for item
  const handleSelectCalendarItemForGraphic = (item: ContentCalendarItem) => {
    setActiveCalendarItemForGraphic(item);
    setActiveSlides([
      {
        slideNumber: 1,
        slideType: 'hook',
        headlineH1: item.overlayText || item.title.slice(0, 50),
        subheadBadge: `${item.channel.toUpperCase()} DISPATCH`,
        bodyText: item.hook,
      },
    ]);
    setActiveTab('graphics');
  };

  // Calendar Handler: Audit item in gatekeeper
  const handleSelectCalendarItemForGatekeeper = (item: ContentCalendarItem) => {
    setGatekeeperInspectText(item.copy);
    setGatekeeperInspectCta('Inspect the data');
    setActiveTab('gatekeeper');
  };

  // Save graphic creative link back into active calendar item
  const handleSaveCreativeAssetToItem = (assetUrl: string, overlayH1: string) => {
    if (activeCalendarItemForGraphic) {
      setCalendarItems((prev) =>
        prev.map((i) =>
          i.id === activeCalendarItemForGraphic.id
            ? { ...i, creativeAssetLink: assetUrl, overlayText: overlayH1 }
            : i
        )
      );
    }
  };

  const isDark = mode === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-black text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Telemetry Header */}
      <header
        className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors ${
          isDark
            ? 'border-zinc-800/80 bg-black/95 text-white'
            : 'border-slate-200 bg-white/95 text-slate-900 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Official AEObility Wordmark & Streamlined Header */}
          <BrandLogo interactive={true} />

          {/* Right Toolbar: Assets Dropdown, Theme/Palette Controls, & Google Workspace Auth */}
          <div className="flex items-center gap-2">
            {/* Connected Drive Folders & Project Dropdown */}
            <ConnectedAssetsDropdown />

            {/* 1-Click Dark/Light Mode & Palette Dropdown */}
            <ThemeAndPaletteControl />

            {/* Google Workspace Connection & User Status */}
            {currentUser ? (
              <div
                className={`flex items-center gap-2 border rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-[#00FF85] shadow-[0_0_6px_#00FF85]" />
                <span className={`font-semibold max-w-[120px] truncate ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className={`p-1 rounded transition cursor-pointer ${
                    isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-200 text-slate-600'
                  }`}
                  title="Disconnect Workspace"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 border border-slate-200"
                title="Connect your Google Drive, Sheets, and Calendar"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="hidden sm:inline">{isSigningIn ? 'Connecting...' : 'Connect Workspace'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Streamlined Navigation Bar: Clean Icon-First Tabs & Compact Mobile Switcher */}
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between border-t py-1.5 ${
            isDark ? 'border-zinc-800/60' : 'border-slate-200'
          }`}
        >
          {/* Desktop / Tablet Icon-First Tabs */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto w-full">
            {[
              { id: 'pipeline', label: 'Pipeline', icon: Sparkles, accent: '#00E5FF' },
              { id: 'graphics', label: 'Graphics Studio', icon: Layers, accent: '#FF007A' },
              { id: 'gatekeeper', label: 'Voice Gatekeeper', icon: ShieldCheck, accent: '#7B2EFF' },
              {
                id: 'calendar',
                label: 'Calendar & Dispatch',
                icon: Table,
                accent: '#00FF85',
                badge: calendarItems.filter((i) => i.status === 'In Review').length,
              },
              { id: 'knowledge', label: 'Knowledge Base', icon: HardDrive, accent: '#F59E0B' },
              { id: 'credentials', label: 'Channel Credentials', icon: KeyRound, accent: '#00E5FF' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isActive
                      ? isDark
                        ? 'bg-zinc-900 text-white shadow-xs border-zinc-700'
                        : 'bg-white text-slate-900 shadow-xs border-slate-300'
                      : isDark
                      ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  style={isActive ? { borderColor: tab.accent } : {}}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: tab.accent }} />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-mono font-bold">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Mobile View Dropdown to Save Space */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <span className="text-xs font-mono text-zinc-400 font-semibold">VIEW:</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className={`text-xs font-mono font-semibold py-1 px-3 rounded-lg border outline-none cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="pipeline">✨ Pipeline</option>
              <option value="graphics">🎨 Graphics Studio</option>
              <option value="gatekeeper">🛡️ Voice Gatekeeper</option>
              <option value="calendar">📅 Calendar & Dispatch</option>
              <option value="knowledge">📁 Knowledge Base</option>
              <option value="credentials">🔑 Channel Credentials</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {/* Auth Notice (if any) */}
        {authNotice && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs font-mono flex items-center justify-between shadow-lg ${
              isDark
                ? 'bg-zinc-950 border-[#00E5FF]/40 text-[#00E5FF]'
                : 'bg-cyan-50 border-cyan-300 text-cyan-900'
            }`}
          >
            <span>{authNotice}</span>
            <button
              onClick={() => setAuthNotice(null)}
              className={`text-xs px-2 py-0.5 rounded cursor-pointer ${
                isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300' : 'bg-cyan-200 hover:bg-cyan-300 text-cyan-900'
              }`}
            >
              Dismiss ✕
            </button>
          </div>
        )}

        {/* Active Tab View */}
        {activeTab === 'pipeline' && (
          <RepurposingPipeline
            nodes={iaNodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onSendToCalendar={handleSendToCalendar}
            onSendToGatekeeper={handleInspectInGatekeeper}
            onSendToGraphicGenerator={handleSendToGraphicGenerator}
          />
        )}

        {activeTab === 'graphics' && (
          <SlideGraphicGenerator
            slides={activeSlides}
            initialTitle={slideTitle}
            initialMetric={slideMetric}
            activeCalendarItem={activeCalendarItemForGraphic}
            onSaveCreativeAsset={handleSaveCreativeAssetToItem}
          />
        )}

        {activeTab === 'gatekeeper' && (
          <BrandVoiceGatekeeper
            initialText={gatekeeperInspectText}
            initialCta={gatekeeperInspectCta}
            onApplyFix={(fixed) => setGatekeeperInspectText(fixed)}
          />
        )}

        {activeTab === 'calendar' && (
          <ContentCalendarDispatch
            items={calendarItems}
            onUpdateItemStatus={handleUpdateItemStatus}
            onDeleteItem={handleDeleteCalendarItem}
            onSelectForGraphic={handleSelectCalendarItemForGraphic}
            onSelectForGatekeeper={handleSelectCalendarItemForGatekeeper}
            onNavigateToCredentials={() => setActiveTab('credentials')}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer
            nodes={iaNodes}
            onSelectNodeForPipeline={(node) => {
              setSelectedNode(node);
              setActiveTab('pipeline');
            }}
            userToken={userToken}
          />
        )}

        {activeTab === 'credentials' && (
          <ChannelCredentialsManager
            credentials={channelCredentials}
            onUpdateCredentials={setChannelCredentials}
            workspaceToken={userToken}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 text-center text-xs font-mono transition-colors ${
          isDark
            ? 'border-slate-900 bg-slate-950 text-slate-500'
            : 'border-slate-200 bg-white text-slate-600'
        }`}
      >
        AEObility Autonomous Social Engine • Google Drive Grounded • Google Sheets Headless DB • Google Calendar Dispatch
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
