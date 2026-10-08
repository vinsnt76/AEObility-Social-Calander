import { GoogleGenAI } from '@google/genai';
import { IANode, GeneratedSocialBundle } from '../types';
import dotenv from 'dotenv';

dotenv.config();

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI();
}

export async function generateSocialBundleWithGemini(
  node: IANode,
  customInstructions?: string
): Promise<GeneratedSocialBundle> {
  const ai = getAiClient();

  const systemInstruction = `You are the lead content systems architect at AEObility, a premier Australian Answer Engine Optimisation (AEO) and semantic search consultancy.
Brand Rules, Persona & Design Style Variations:
1. VOICE & TONE: Founder-led, first-person authority, rigorous, analytical, concise. Zero fluff, zero marketing hype.
2. AUSTRALIAN ENGLISH: Strictly use Australian/British English spelling (optimisation, analyse, behaviour, centre, prioritise, modelling, licence).
3. FORBIDDEN BUZZWORDS: NEVER use words like "game-changing", "unlock", "revolutionise", "skyrocket", "delve", "supercharge", "secret sauce", "harness the power", "dive deep", "unleash", "disrupt".
4. DIRECT VALUE & OUTCOME HOOK (Slide 1 & First Fold): Start with specific numbers and concrete results (e.g. "$995 got one trade business clearer citations in two crawl cycles" or "43% recall decay in mid-context windows"), pairing hard metrics with concrete outcomes within the first 120 characters before truncation.
5. ACTION-DRIVEN SLIDE HEADERS: Subsequent carousel slides hook attention through concise, instructional problem-solving statements (e.g., "What AI facts need first", "Build passages one clean block at a time"), pulling the reader through a stepwise framework before delivering a clear call-to-action on the final card.
6. SELECTIVE KEYWORD HIGHLIGHTING: Mark 1 key anchor word/phrase per slide with asterisks (e.g. "*trade business*", "*facts*", "*passages*", "*Blueprint*") for visual highlight styling.
7. SINGLE EYEBROW / CTA: Concise 2 to 4 words (e.g. "Read the breakdown", "Audit your architecture", "View canonical entity").
`;

  const prompt = `Repurpose the following canonical IA & SLM knowledge base node into 5 channel-specific social assets:

Topic: ${node.title}
Canonical URL: ${node.canonicalUrl}
Primary Keyphrase: ${node.primaryKeyphrase}
Target Intent: ${node.targetIntent}
Core Entities: ${node.coreEntities.join(', ')}
Key Technical Takeaways:
${node.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}
Suggested Precision Metric: ${node.suggestedMetric}

${customInstructions ? `Additional Context/Instructions: ${customInstructions}` : ''}

Generate a strictly valid JSON object matching this schema:
{
  "linkedIn": {
    "hook": "string (first 120 chars must contain the core counter-intuitive insight)",
    "body": "string (founder-led authority narrative, 3-4 clean paragraphs with whitespace, zero hashtags in body)",
    "callToAction": "string (2-4 words, e.g. 'Read the breakdown')",
    "hashtags": ["string", "string", "string"],
    "characterCount": number
  },
  "instagram": {
    "title": "string",
    "slides": [
      {
        "slideNumber": 1,
        "slideType": "hook",
        "headlineH1": "string (Max 8-10 words, sentence case, zero hype)",
        "subheadBadge": "string (Precision data badge, e.g. '${node.suggestedMetric}')",
        "bodyText": "string (1-2 crisp sentences)"
      },
      {
        "slideNumber": 2,
        "slideType": "problem",
        "headlineH1": "string (Max 8-10 words)",
        "subheadBadge": "string (Telemetry badge)",
        "bodyText": "string"
      },
      {
        "slideNumber": 3,
        "slideType": "analysis",
        "headlineH1": "string (Max 8-10 words)",
        "subheadBadge": "string (Telemetry badge)",
        "bodyText": "string"
      },
      {
        "slideNumber": 4,
        "slideType": "solution",
        "headlineH1": "string (Max 8-10 words)",
        "subheadBadge": "string (Telemetry badge)",
        "bodyText": "string"
      },
      {
        "slideNumber": 5,
        "slideType": "cta",
        "headlineH1": "string (Max 8-10 words)",
        "subheadBadge": "string (Canonical URL badge)",
        "bodyText": "string"
      }
    ],
    "caption": "string (explanatory carousel caption with AU spelling)",
    "hashtags": ["string", "string", "string"]
  },
  "facebook": {
    "hook": "string (practical explainer hook for business operators)",
    "body": "string (accessible plain-English explainer without losing technical credibility)",
    "callToAction": "string (2-4 words)"
  },
  "youtube": {
    "title": "string (YouTube Short title, punchy)",
    "hook": "string (first 3-5 seconds spoken hook)",
    "script45s": "string (45-second spoken script with clear visual cues like [ON SCREEN: ...])",
    "visualPrompts": ["string", "string", "string"],
    "callToAction": "string (spoken 2-4 word CTA)"
  },
  "gmb": {
    "title": "string",
    "summary1500Char": "string (Local authority update capped at 1,500 characters, structured, AU spelling)",
    "callToAction": "LEARN_MORE",
    "actionUrl": "${node.canonicalUrl}",
    "characterCount": number
  }
}
Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text || '{}';
  const parsed = JSON.parse(text);

  return {
    iaNodeId: node.id,
    generatedAt: new Date().toISOString(),
    linkedIn: {
      hook: parsed.linkedIn?.hook || '',
      body: parsed.linkedIn?.body || '',
      callToAction: parsed.linkedIn?.callToAction || 'Read the breakdown',
      hashtags: parsed.linkedIn?.hashtags || ['#AEO', '#SemanticSearch', '#InformationRetrieval'],
      characterCount: (parsed.linkedIn?.body || '').length,
    },
    instagram: {
      title: parsed.instagram?.title || node.title,
      slides: parsed.instagram?.slides || [],
      caption: parsed.instagram?.caption || '',
      hashtags: parsed.instagram?.hashtags || ['#AEO', '#SearchArchitecture', '#DataRetrieval'],
    },
    facebook: {
      hook: parsed.facebook?.hook || '',
      body: parsed.facebook?.body || '',
      callToAction: parsed.facebook?.callToAction || 'View the research',
    },
    youtube: {
      title: parsed.youtube?.title || `${node.title} in 45 Seconds`,
      hook: parsed.youtube?.hook || '',
      script45s: parsed.youtube?.script45s || '',
      visualPrompts: parsed.youtube?.visualPrompts || [],
      callToAction: parsed.youtube?.callToAction || 'Inspect the data',
    },
    gmb: {
      title: parsed.gmb?.title || node.title,
      summary1500Char: parsed.gmb?.summary1500Char || '',
      callToAction: 'LEARN_MORE',
      actionUrl: parsed.gmb?.actionUrl || node.canonicalUrl,
      characterCount: (parsed.gmb?.summary1500Char || '').length,
    },
  };
}

export async function autoFixWithGemini(originalText: string): Promise<string> {
  const ai = getAiClient();
  const prompt = `Review and rewrite this social post to ensure 100% compliance with AEObility's Brand Rules:
1. Convert all US spellings to Australian English (e.g. optimisation, analyse, behaviour, centre, prioritise, modelling).
2. Eliminate all marketing buzzwords (game-changing, unlock, revolutionise, skyrocket, delve, supercharge, secret sauce, harness the power).
3. Ensure the primary counter-intuitive hook lands within the first 120 characters.
4. Keep the closing CTA strictly 2 to 4 words.
5. Preserve technical credibility and precise terminology.

Original text:
${originalText}

Return ONLY the rewritten post text without commentary.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      temperature: 0.2,
    },
  });

  return response.text?.trim() || originalText;
}
