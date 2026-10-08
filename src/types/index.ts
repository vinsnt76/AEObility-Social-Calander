export interface IANode {
  id: string;
  title: string;
  canonicalUrl: string;
  primaryKeyphrase: string;
  targetIntent: string;
  coreEntities: string[];
  takeaways: string[];
  suggestedMetric: string;
  dateAdded: string;
}

export type SocialChannel = 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'gmb';

export type PostStatus = 'Draft' | 'In Review' | 'Approved' | 'Scheduled' | 'Published';

export interface LinkedInPost {
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  characterCount: number;
}

export interface CarouselSlide {
  slideNumber: number;
  slideType: 'hook' | 'problem' | 'analysis' | 'solution' | 'cta';
  headlineH1: string; // Max 8-10 words, sentence case, zero hype
  subheadBadge: string; // Precision data badge (Geist Mono telemetry style)
  bodyText: string;
}

export interface InstagramCarouselPost {
  title: string;
  slides: CarouselSlide[];
  caption: string;
  hashtags: string[];
}

export interface FacebookPost {
  hook: string;
  body: string;
  callToAction: string;
}

export interface YouTubeShortPost {
  title: string;
  hook: string;
  script45s: string;
  visualPrompts: string[];
  callToAction: string;
}

export interface GoogleBusinessPost {
  title: string;
  summary1500Char: string;
  callToAction: 'LEARN_MORE' | 'CALL_NOW' | 'SIGN_UP';
  actionUrl: string;
  characterCount: number;
}

export interface GeneratedSocialBundle {
  iaNodeId: string;
  generatedAt: string;
  linkedIn: LinkedInPost;
  instagram: InstagramCarouselPost;
  facebook: FacebookPost;
  youtube: YouTubeShortPost;
  gmb: GoogleBusinessPost;
}

export interface ContentCalendarItem {
  id: string;
  iaNodeId: string;
  channel: SocialChannel;
  title: string;
  hook: string;
  copy: string;
  overlayText?: string;
  creativeAssetLink?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: PostStatus;
  liveUrl?: string;
  calendarEventId?: string;
  gatekeeperScore: number;
  gatekeeperIssues: string[];
  lastModified: string;
}

export interface GatekeeperIssue {
  type: 'au_spelling' | 'buzzword' | 'truncation' | 'cta_length' | 'voice';
  severity: 'error' | 'warning' | 'info';
  term?: string;
  suggestion?: string;
  message: string;
  position?: number;
}

export interface GatekeeperReport {
  score: number; // 0 - 100
  passed: boolean;
  issues: GatekeeperIssue[];
  wordCount: number;
  charCount: number;
  firstFoldLength: number;
  ctaText: string;
  ctaWords: number;
}

export interface DriveFolderInfo {
  id: string;
  name: string;
  url: string;
  description: string;
  badge: string;
  accentColor: string;
}

export interface SlideTemplateConfig {
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:5';
  theme: 'telemetry' | 'blueprint_notebook' | 'neon_purple' | 'hot_pink' | 'light_editorial' | 'amber_steel' | 'blue_theme' | 'style_a_dark_cinematic' | 'style_b_charcoal_container' | 'style_c_red_accent' | 'style_d_workspace_notes';
  showGrid: boolean;
  showBadge: boolean;
  showPatternInterrupt: boolean; // AI Bill smug visual pattern interrupt
  characterType?: 'ai_bill_suit' | 'ai_bill_compliance' | 'ai_bill_auditor' | 'custom_character';
  logoType?: 'delta_triangle' | 'monogram' | 'blueprint_seal' | 'custom_logo';
  customCharacterUrl?: string;
  customLogoUrl?: string;
  highlightKeyword: string; // Selective keyword highlighting (e.g. "trade business", "facts", "passages")
  highlightColor: string; // Yellow/Amber or Neon Green
  footerAnchorText: string; // Consistent Slide 1 hook repeated across footer
  brandName: string;
  handle: string;
}

export interface DispatchLog {
  id: string;
  timestamp: string;
  itemId: string;
  channel: SocialChannel;
  status: 'success' | 'failed' | 'queued';
  endpoint: string;
  payload: Record<string, unknown>;
  responseCode: number;
  liveUrl?: string;
  latencyMs: number;
}

export interface ChannelCredentials {
  linkedIn: {
    accessToken: string;
    organizationUrn: string;
    authorUrn: string;
    isConnected: boolean;
    lastTested?: string;
  };
  meta: {
    pageAccessToken: string;
    pageId: string;
    instagramAccountId: string;
    apiVersion: string;
    isConnected: boolean;
    lastTested?: string;
  };
  youtube: {
    apiKeyOrToken: string;
    channelId: string;
    defaultPrivacy: 'public' | 'unlisted' | 'private';
    isConnected: boolean;
    lastTested?: string;
  };
  googleBusiness: {
    useWorkspaceToken: boolean;
    customToken?: string;
    accountId: string;
    locationId: string;
    isConnected: boolean;
    lastTested?: string;
  };
  webhook: {
    enabled: boolean;
    endpointUrl: string;
    secretHeader: string;
  };
}

