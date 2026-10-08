import React, { useState } from 'react';
import { ChannelCredentials } from '../types';
import {
  saveCredentials,
  clearCredentials,
  testChannelConnection,
} from '../services/credentialStorage';
import { useTheme } from '../context/ThemeContext';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Store,
  Webhook,
  Play,
  Save,
  Trash2,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface ChannelCredentialsManagerProps {
  credentials: ChannelCredentials;
  onUpdateCredentials: (newCreds: ChannelCredentials) => void;
  workspaceToken?: string | null;
}

export const ChannelCredentialsManager: React.FC<ChannelCredentialsManagerProps> = ({
  credentials,
  onUpdateCredentials,
  workspaceToken,
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [creds, setCreds] = useState<ChannelCredentials>(credentials);
  const [activeChannel, setActiveChannel] = useState<'linkedIn' | 'meta' | 'youtube' | 'googleBusiness' | 'webhook'>('linkedIn');
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleShowToken = (key: string) => {
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveCredentials(creds);
    onUpdateCredentials(creds);
    setSaveStatus('Credentials securely saved to browser storage.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestConnection = async (channelKey: 'linkedIn' | 'meta' | 'youtube' | 'googleBusiness' | 'webhook') => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testChannelConnection(channelKey, creds, workspaceToken);
      setTestResult(result);

      if (result.success) {
        const updated = { ...creds };
        if (channelKey === 'linkedIn') {
          updated.linkedIn.isConnected = true;
          updated.linkedIn.lastTested = new Date().toLocaleTimeString();
        } else if (channelKey === 'meta') {
          updated.meta.isConnected = true;
          updated.meta.lastTested = new Date().toLocaleTimeString();
        } else if (channelKey === 'youtube') {
          updated.youtube.isConnected = true;
          updated.youtube.lastTested = new Date().toLocaleTimeString();
        } else if (channelKey === 'googleBusiness') {
          updated.googleBusiness.isConnected = true;
          updated.googleBusiness.lastTested = new Date().toLocaleTimeString();
        }
        setCreds(updated);
        saveCredentials(updated);
        onUpdateCredentials(updated);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleConfirmClear = () => {
    clearCredentials();
    const emptyCreds: ChannelCredentials = {
      linkedIn: { accessToken: '', organizationUrn: '', authorUrn: '', isConnected: false },
      meta: { pageAccessToken: '', pageId: '', instagramAccountId: '', apiVersion: 'v20.0', isConnected: false },
      youtube: { apiKeyOrToken: '', channelId: '', defaultPrivacy: 'public', isConnected: false },
      googleBusiness: { useWorkspaceToken: true, customToken: '', accountId: '', locationId: '', isConnected: false },
      webhook: { enabled: false, endpointUrl: '', secretHeader: '' },
    };
    setCreds(emptyCreds);
    onUpdateCredentials(emptyCreds);
    setShowClearConfirm(false);
    setSaveStatus('All channel credentials have been cleared.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div
        className={`border rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-colors ${
          isDark ? 'bg-black/90 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                Channel Credentials
              </h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Configure API keys and tokens for direct automated publishing to social channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-300 border border-zinc-700 text-xs font-medium cursor-pointer transition"
              title="Clear all stored tokens"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00FF85] hover:bg-[#00e075] text-black text-xs font-bold transition shadow-md shadow-green-950/40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <span>
              Credentials are kept in browser memory and protected storage. Never transmit client secrets over unencrypted channels.
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            TLS Encrypted Handshake
          </span>
        </div>

        {saveStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#00FF85]/15 border border-[#00FF85]/40 text-[#00FF85] text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Channels Tab List on Left, Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Channel Selector Tabs (Col 4) */}
        <div className="lg:col-span-4 space-y-2">
          {[
            {
              id: 'linkedIn',
              label: 'LinkedIn UGC API',
              desc: 'Company Page & Founder Profile',
              icon: Linkedin,
              color: '#00E5FF',
              isConnected: creds.linkedIn.isConnected,
            },
            {
              id: 'meta',
              label: 'Meta Graph API',
              desc: 'Facebook Page & Instagram Reels',
              icon: Instagram,
              color: '#FF007A',
              isConnected: creds.meta.isConnected,
            },
            {
              id: 'youtube',
              label: 'YouTube Data API',
              desc: 'Shorts & Community Posts',
              icon: Youtube,
              color: '#EF4444',
              isConnected: creds.youtube.isConnected,
            },
            {
              id: 'googleBusiness',
              label: 'Google Business Profile',
              desc: 'Local Posts & Updates',
              icon: Store,
              color: '#00FF85',
              isConnected: creds.googleBusiness.isConnected,
            },
            {
              id: 'webhook',
              label: 'Webhook Dispatcher',
              desc: 'Make / Zapier / Apps Script',
              icon: Webhook,
              color: '#F59E0B',
              isConnected: creds.webhook.enabled,
            },
          ].map((ch) => {
            const Icon = ch.icon;
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChannel(ch.id as any);
                  setTestResult(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isActive
                    ? isDark
                      ? 'bg-slate-800/90 text-white shadow-md'
                      : 'bg-white text-slate-900 shadow-md border-slate-300'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
                style={isActive ? { borderColor: ch.color, boxShadow: `0 0 12px ${ch.color}25` } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0"
                    style={{
                      backgroundColor: `${ch.color}15`,
                      borderColor: `${ch.color}40`,
                      color: ch.color,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{ch.label}</h4>
                    <p className={`text-[11px] truncate max-w-[150px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ch.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ch.isConnected ? 'bg-[#00FF85]' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-mono font-semibold" style={{ color: ch.isConnected ? '#00FF85' : '#64748B' }}>
                    {ch.isConnected ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Channel Credential Configuration Form (Col 8) */}
        <div
          className={`lg:col-span-8 border rounded-xl p-5 shadow-2xl backdrop-blur-md space-y-5 transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Active Channel Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2">
                <span>Configure {activeChannel.toUpperCase()} API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  REST v2 / GRAPH
                </span>
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Enter and test the credentials required to post updates directly through the automated dispatch loop.
              </p>
            </div>

            <button
              onClick={() => handleTestConnection(activeChannel)}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-[#00E5FF] ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Pinging API...' : 'Test Connection'}
            </button>
          </div>

          {/* Test Result Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                testResult.success
                  ? 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]'
                  : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
              <span className="text-[10px] shrink-0 font-bold">{testResult.latencyMs}ms latency</span>
            </div>
          )}

          {/* Form: LinkedIn */}
          {activeChannel === 'linkedIn' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between mb-1.5">
                  <span>OAuth 2.0 User / Member Access Token</span>
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#00E5FF] hover:underline flex items-center gap-1 font-mono"
                  >
                    LinkedIn Developer Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showTokens['li_token'] ? 'text' : 'password'}
                    value={creds.linkedIn.accessToken}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        linkedIn: { ...creds.linkedIn, accessToken: e.target.value },
                      })
                    }
                    placeholder="AQV8... (Bearer Token with w_member_social or w_organization_social)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowToken('li_token')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showTokens['li_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Organization URN (Company Page)
                  </label>
                  <input
                    type="text"
                    value={creds.linkedIn.organizationUrn}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        linkedIn: { ...creds.linkedIn, organizationUrn: e.target.value },
                      })
                    }
                    placeholder="urn:li:organization:10492817"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Author URN (Founder Profile)
                  </label>
                  <input
                    type="text"
                    value={creds.linkedIn.authorUrn}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        linkedIn: { ...creds.linkedIn, authorUrn: e.target.value },
                      })
                    }
                    placeholder="urn:li:person:aeobility-founder"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form: Meta (Facebook & Instagram) */}
          {activeChannel === 'meta' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between mb-1.5">
                  <span>Meta Page Access Token (Never-Expiring)</span>
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#FF007A] hover:underline flex items-center gap-1 font-mono"
                  >
                    Meta App Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showTokens['meta_token'] ? 'text' : 'password'}
                    value={creds.meta.pageAccessToken}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        meta: { ...creds.meta, pageAccessToken: e.target.value },
                      })
                    }
                    placeholder="EAAB... (Requires pages_manage_posts and instagram_content_publish)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#FF007A]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowToken('meta_token')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showTokens['meta_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    value={creds.meta.pageId}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        meta: { ...creds.meta, pageId: e.target.value },
                      })
                    }
                    placeholder="e.g. 109284719284719"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#FF007A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Instagram Business Account ID
                  </label>
                  <input
                    type="text"
                    value={creds.meta.instagramAccountId}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        meta: { ...creds.meta, instagramAccountId: e.target.value },
                      })
                    }
                    placeholder="e.g. 17841400293847192"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#FF007A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form: YouTube */}
          {activeChannel === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between mb-1.5">
                  <span>YouTube Data API v3 Token or Key</span>
                  <a
                    href="https://console.cloud.google.com/apis/credentials?project=antigravity-cli-and-adk-500010"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#EF4444] hover:underline flex items-center gap-1 font-mono"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showTokens['yt_token'] ? 'text' : 'password'}
                    value={creds.youtube.apiKeyOrToken}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        youtube: { ...creds.youtube, apiKeyOrToken: e.target.value },
                      })
                    }
                    placeholder="OAuth Bearer Token with https://www.googleapis.com/auth/youtube.upload"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#EF4444]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowToken('yt_token')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showTokens['yt_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    YouTube Channel ID
                  </label>
                  <input
                    type="text"
                    value={creds.youtube.channelId}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        youtube: { ...creds.youtube, channelId: e.target.value },
                      })
                    }
                    placeholder="UC_AEOBILITY_SYSTEMS_SYD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#EF4444]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Default Upload Privacy
                  </label>
                  <select
                    value={creds.youtube.defaultPrivacy}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        youtube: {
                          ...creds.youtube,
                          defaultPrivacy: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#EF4444]"
                  >
                    <option value="public">Public (Direct Live Publish)</option>
                    <option value="unlisted">Unlisted (Review Draft)</option>
                    <option value="private">Private (Team Sandbox)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form: Google Business Profile */}
          {activeChannel === 'googleBusiness' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF85]" />
                  <span>Google Workspace OAuth Token Active</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-[#00FF85]">
                  <input
                    type="checkbox"
                    checked={creds.googleBusiness.useWorkspaceToken}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        googleBusiness: {
                          ...creds.googleBusiness,
                          useWorkspaceToken: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-700 text-[#00FF85] focus:ring-0"
                  />
                  <span>Inherit Workspace OAuth</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Account Resource Name
                  </label>
                  <input
                    type="text"
                    value={creds.googleBusiness.accountId}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        googleBusiness: { ...creds.googleBusiness, accountId: e.target.value },
                      })
                    }
                    placeholder="accounts/1029384756"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00FF85]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Location Resource Name
                  </label>
                  <input
                    type="text"
                    value={creds.googleBusiness.locationId}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        googleBusiness: { ...creds.googleBusiness, locationId: e.target.value },
                      })
                    }
                    placeholder="locations/8472910394"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00FF85]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form: Webhook Dispatcher */}
          {activeChannel === 'webhook' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">
                    Universal Dispatch Webhook URL (Make / Zapier / Apps Script)
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Trigger headless automations directly whenever rows reach 'Approved' or 'Scheduled' status.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#F59E0B]">
                  <input
                    type="checkbox"
                    checked={creds.webhook.enabled}
                    onChange={(e) =>
                      setCreds({
                        ...creds,
                        webhook: { ...creds.webhook, enabled: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-[#F59E0B] focus:ring-0"
                  />
                  <span>Enable Dispatch Webhook</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Webhook Target URL
                </label>
                <input
                  type="text"
                  value={creds.webhook.endpointUrl}
                  onChange={(e) =>
                    setCreds({
                      ...creds,
                      webhook: { ...creds.webhook, endpointUrl: e.target.value },
                    })
                  }
                  placeholder="https://hook.us1.make.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Secret Signature Header (X-AEO-Signature)
                </label>
                <input
                  type="text"
                  value={creds.webhook.secretHeader}
                  onChange={(e) =>
                    setCreds({
                      ...creds,
                      webhook: { ...creds.webhook, secretHeader: e.target.value },
                    })
                  }
                  placeholder="e.g. aeo_live_dispatch_sig_sec_99182"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing Credentials */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-100">
                Clear All Channel Credentials?
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete all stored OAuth access tokens and API keys? Automated dispatching will be paused until credentials are restored.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Clear All Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
