import React, { useState, useEffect } from 'react';
import { auditBrandVoice } from '../services/gatekeeper';
import { requestAutoFix } from '../services/geminiClient';
import { GatekeeperReport, GatekeeperIssue } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Wand2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface BrandVoiceGatekeeperProps {
  initialText?: string;
  initialCta?: string;
  onApplyFix?: (fixedText: string) => void;
}

export const BrandVoiceGatekeeper: React.FC<BrandVoiceGatekeeperProps> = ({
  initialText = '',
  initialCta = '',
  onApplyFix,
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [ctaText, setCtaText] = useState(initialCta);
  const [report, setReport] = useState<GatekeeperReport>(
    auditBrandVoice(initialText, initialCta)
  );
  const [isFixing, setIsFixing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setCtaText(initialCta);
      setReport(auditBrandVoice(initialText, initialCta));
    }
  }, [initialText, initialCta]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    setReport(auditBrandVoice(text, ctaText));
  };

  const handleCtaChange = (cta: string) => {
    setCtaText(cta);
    setReport(auditBrandVoice(inputText, cta));
  };

  const handleRunAutoFix = async () => {
    setIsFixing(true);
    try {
      const fixed = await requestAutoFix(inputText);
      setInputText(fixed);
      setReport(auditBrandVoice(fixed, ctaText));
      if (onApplyFix) {
        onApplyFix(fixed);
      }
    } finally {
      setIsFixing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const auIssues = report.issues.filter((i) => i.type === 'au_spelling');
  const buzzIssues = report.issues.filter((i) => i.type === 'buzzword');
  const truncationIssues = report.issues.filter((i) => i.type === 'truncation');
  const ctaIssues = report.issues.filter((i) => i.type === 'cta_length');

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#00FF85] border-[#00FF85]/50 bg-[#00FF85]/15'; // Neon Green
    if (score >= 70) return 'text-[#F59E0B] border-[#F59E0B]/50 bg-[#F59E0B]/15'; // Cyber Amber
    return 'text-[#EF4444] border-[#EF4444]/50 bg-[#EF4444]/15'; // Crimson Red
  };

  return (
    <div className="bg-black/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7B2EFF]/15 border border-[#7B2EFF]/40 flex items-center justify-center text-[#7B2EFF]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              Brand Voice Gatekeeper
            </h3>
            <p className="text-xs text-zinc-400">
              Evaluates copy against Australian English (en-AU), eliminates 16 buzzwords, and tests the 120-char fold hook.
            </p>
          </div>
        </div>

        {/* Live Score Gauge & Auto-Fix */}
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono text-xs font-bold ${getScoreColor(report.score)}`}>
            {report.score >= 85 ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF85]" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            )}
            <span>SCORE: {report.score}/100</span>
          </div>

          <button
            onClick={handleRunAutoFix}
            disabled={isFixing || report.score === 100}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7B2EFF] hover:bg-[#6820df] text-white text-xs font-semibold transition shadow-md shadow-purple-950/40 cursor-pointer disabled:opacity-40"
            title="Automatically rewrite text using Gemini to achieve 100% Brand Voice compliance"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            {isFixing ? 'Fixing...' : 'Auto-Fix'}
          </button>
        </div>
      </div>

      {/* Grid: 4 Verification Checks Top Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <div className={`p-2.5 rounded-lg border text-xs ${
          auIssues.length === 0
            ? 'bg-zinc-950 border-emerald-500/30 text-zinc-300'
            : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center justify-between font-mono mb-1">
            <span className="font-semibold">AU English</span>
            {auIssues.length === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          </div>
          <p className="text-[11px] text-slate-400">
            {auIssues.length === 0 ? 'All UK/AU spellings valid' : `${auIssues.length} US spelling flags`}
          </p>
        </div>

        <div className={`p-3 rounded-lg border text-xs ${
          buzzIssues.length === 0
            ? 'bg-slate-950/40 border-emerald-500/30 text-slate-300'
            : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center justify-between font-mono mb-1">
            <span className="font-semibold">Buzzwords</span>
            {buzzIssues.length === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          </div>
          <p className="text-[11px] text-slate-400">
            {buzzIssues.length === 0 ? 'Zero marketing cliches' : `${buzzIssues.length} forbidden terms found`}
          </p>
        </div>

        <div className={`p-3 rounded-lg border text-xs ${
          truncationIssues.length === 0
            ? 'bg-slate-950/40 border-emerald-500/30 text-slate-300'
            : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
        }`}>
          <div className="flex items-center justify-between font-mono mb-1">
            <span className="font-semibold">First-Fold Hook</span>
            {truncationIssues.length === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <p className="text-[11px] text-slate-400">
            {report.firstFoldLength} chars {report.firstFoldLength <= 120 ? '(Under 120 char fold)' : '(May truncate)'}
          </p>
        </div>

        <div className={`p-3 rounded-lg border text-xs ${
          ctaIssues.length === 0
            ? 'bg-slate-950/40 border-emerald-500/30 text-slate-300'
            : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
        }`}>
          <div className="flex items-center justify-between font-mono mb-1">
            <span className="font-semibold">Single CTA</span>
            {ctaIssues.length === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <p className="text-[11px] text-slate-400">
            {report.ctaWords} words {report.ctaWords >= 2 && report.ctaWords <= 4 ? '(2-4 word rule met)' : '(Must be 2-4 words)'}
          </p>
        </div>
      </div>

      {/* Editor & Issue Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Editor (Col 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              LIVE DRAFT INSPECTOR
            </span>
            <div className="flex items-center gap-3">
              <span>{report.wordCount} words / {report.charCount} chars</span>
              <button
                onClick={handleCopy}
                className="hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-indigo-500"
            placeholder="Paste or write social post copy to evaluate against brand rules..."
          />

          <div className="flex items-center gap-3 pt-1">
            <div className="w-full">
              <label className="text-[11px] text-slate-400 font-mono mb-1 block">
                Target CTA Eyebrow (Must be 2–4 words):
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => handleCtaChange(e.target.value)}
                placeholder="e.g. Inspect the data"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Detailed Issue Breakdown (Col 5) */}
        <div className="lg:col-span-5 bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Rule Infractions & Recommendations</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {report.issues.length} {report.issues.length === 1 ? 'item' : 'items'}
              </span>
            </h4>

            {report.issues.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs font-medium text-slate-200">
                  Flawless Brand Voice Compliance
                </p>
                <p className="text-[11px] text-slate-400">
                  AU English spellings verified, zero prohibited buzzwords, first fold hook lands under 120 characters, and CTA complies with the 2-4 word rule.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {report.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs ${
                      issue.severity === 'error'
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold font-mono text-[11px]">
                        [{issue.type.toUpperCase()}]
                      </span>
                      {issue.suggestion && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Use: "{issue.suggestion}"
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {issue.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Pre-Flight Gatekeeper Gate: 85%+ Required</span>
            <span className={report.passed ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {report.passed ? 'PASSED FOR QUEUE' : 'BLOCKED FROM PUBLISHING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
