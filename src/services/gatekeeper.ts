import { GatekeeperReport, GatekeeperIssue } from '../types';

export const US_TO_AU_MAP: Record<string, string> = {
  optimization: 'optimisation',
  optimizations: 'optimisations',
  optimize: 'optimise',
  optimized: 'optimised',
  optimizing: 'optimising',
  optimizer: 'optimiser',
  analyze: 'analyse',
  analyzed: 'analysed',
  analyzing: 'analysing',
  analyzer: 'analyser',
  behavior: 'behaviour',
  behaviors: 'behaviours',
  center: 'centre',
  centers: 'centres',
  centered: 'centred',
  prioritize: 'prioritise',
  prioritized: 'prioritised',
  prioritizing: 'prioritising',
  prioritization: 'prioritisation',
  modeling: 'modelling',
  modeled: 'modelled',
  organization: 'organisation',
  organizations: 'organisations',
  customize: 'customise',
  customized: 'customised',
  customization: 'customisation',
  recognize: 'recognise',
  recognized: 'recognised',
  utilize: 'utilise',
  utilized: 'utilised',
  utilization: 'utilisation',
  catalog: 'catalogue',
  color: 'colour',
  colors: 'colours',
  neighbor: 'neighbour',
  defense: 'defence',
  program: 'programme',
};

export const FORBIDDEN_BUZZWORDS = [
  'game-changing',
  'game changing',
  'game changer',
  'unlock',
  'unlocking',
  'revolutionise',
  'revolutionize',
  'skyrocket',
  'supercharge',
  'supercharging',
  'secret sauce',
  'delve',
  'delving',
  'cutting-edge',
  'cutting edge',
  'harness the power',
  'dive deep',
  'unleash',
  'disrupt',
  'disruptive',
  'silver bullet',
  'synergy',
  'synergies',
  'paradigm shift',
  'magical',
  'seamless',
];

export function auditBrandVoice(text: string, customCta?: string): GatekeeperReport {
  const issues: GatekeeperIssue[] = [];
  const lowerText = text.toLowerCase();

  // 1. Australian English Check
  for (const [usWord, auWord] of Object.entries(US_TO_AU_MAP)) {
    const regex = new RegExp(`\\b${usWord}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: 'au_spelling',
        severity: 'error',
        term: match[0],
        suggestion: match[0][0] === match[0][0].toUpperCase()
          ? auWord.charAt(0).toUpperCase() + auWord.slice(1)
          : auWord,
        message: `Use Australian English spelling "${auWord}" instead of US spelling "${match[0]}".`,
        position: match.index,
      });
    }
  }

  // 2. Forbidden Buzzwords Check
  for (const buzz of FORBIDDEN_BUZZWORDS) {
    const regex = new RegExp(`\\b${buzz}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: 'buzzword',
        severity: 'error',
        term: match[0],
        message: `Remove marketing buzzword "${match[0]}". Use plain, technical, evidence-backed phrasing.`,
        position: match.index,
      });
    }
  }

  // 3. First-Fold Hook Check (120 characters before truncation)
  const firstParagraph = text.split('\n')[0] || '';
  const firstFoldLength = firstParagraph.length;
  if (firstFoldLength > 135) {
    issues.push({
      type: 'truncation',
      severity: 'warning',
      message: `First fold hook is ${firstFoldLength} characters. Keep under 120 chars so the core insight lands before "See more" truncation.`,
      position: 0,
    });
  }

  // 4. Single Eyebrow / CTA Check
  const cta = customCta || extractCtaFromText(text);
  const ctaWords = cta ? cta.trim().split(/\s+/).filter(Boolean).length : 0;
  if (cta && (ctaWords < 2 || ctaWords > 4)) {
    issues.push({
      type: 'cta_length',
      severity: 'warning',
      message: `CTA "${cta}" is ${ctaWords} words. AEObility brand rules require concise 2–4 word CTAs (e.g. "Inspect the data").`,
    });
  }

  // Score calculation
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'error') score -= 15;
    if (issue.severity === 'warning') score -= 8;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    passed: score >= 85,
    issues,
    wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    charCount: text.length,
    firstFoldLength,
    ctaText: cta,
    ctaWords,
  };
}

function extractCtaFromText(text: string): string {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return '';
  const lastLine = lines[lines.length - 1].trim();
  // If last line has -> or : or CTA-like prefix
  if (lastLine.includes('→') || lastLine.includes(':')) {
    const parts = lastLine.split(/[→:]/);
    return parts[parts.length - 1].trim();
  }
  if (lastLine.split(/\s+/).length <= 6) {
    return lastLine;
  }
  return 'Read the breakdown';
}

export function autoFixBrandVoice(text: string): { fixedText: string; fixedCount: number } {
  let fixed = text;
  let count = 0;

  // 1. Replace US spellings with AU spellings
  for (const [usWord, auWord] of Object.entries(US_TO_AU_MAP)) {
    const regex = new RegExp(`\\b${usWord}\\b`, 'gi');
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, (match) => {
        count++;
        return match[0] === match[0].toUpperCase()
          ? auWord.charAt(0).toUpperCase() + auWord.slice(1)
          : auWord;
      });
    }
  }

  // 2. Remove or replace forbidden buzzwords
  const buzzwordReplacements: Record<string, string> = {
    'game-changing': 'systemic',
    'game changing': 'systemic',
    'game changer': 'catalyst',
    'unlock': 'reveal',
    'unlocking': 'revealing',
    'revolutionise': 'restructure',
    'revolutionize': 'restructure',
    'skyrocket': 'accelerate',
    'supercharge': 'enhance',
    'supercharging': 'enhancing',
    'secret sauce': 'core mechanism',
    'delve': 'examine',
    'delving': 'examining',
    'cutting-edge': 'modern',
    'cutting edge': 'modern',
    'harness the power': 'utilise',
    'dive deep': 'evaluate',
    'unleash': 'deploy',
    'disrupt': 'shift',
    'disruptive': 'structural',
    'silver bullet': 'universal solution',
    'synergy': 'cohesion',
    'paradigm shift': 'methodology transition',
  };

  for (const [buzz, replacement] of Object.entries(buzzwordReplacements)) {
    const regex = new RegExp(`\\b${buzz}\\b`, 'gi');
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, () => {
        count++;
        return replacement;
      });
    }
  }

  return { fixedText: fixed, fixedCount: count };
}
