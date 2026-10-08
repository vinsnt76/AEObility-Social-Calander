import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ChannelPost } from '../components/ChannelTabPanel';
import { IANode } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
const MODEL_NAME = 'gemini-2.5-flash';

export interface SlideContent {
  title: string;
  body: string;
  badge?: string;
}

export interface ChannelGeneratePayload {
  node: {
    title: string;
    description?: string;
    content?: string;
    suggestedMetric?: string;
    url?: string;
  } | IANode;
  promptModifier?: string;
  theme?: string;
}

// Helper to strip markdown fencing if returned
function cleanJsonText(raw: string): string {
  return raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
}

/**
 * 1. LinkedIn Generator (Thought Leadership, structured formatting)
 */
export async function generateLinkedInPost(payload: ChannelGeneratePayload): Promise<Partial<ChannelPost>> {
  const { node, promptModifier } = payload;

  const prompt = `
You are a senior B2B content strategist. Repurpose the following source asset for LinkedIn:
SOURCE TITLE: ${node.title}
SOURCE CONTENT: ${(node as any).content || (node as any).description || (node as any).summary || 'No raw content provided.'}
${promptModifier ? `ADDITIONAL USER ANGLE/DIRECTIVES: ${promptModifier}` : ''}

LinkedIn Format Requirements:
- Hook the reader in the first 2 lines (before the "see more" cutoff).
- Deliver 3-5 punchy takeaways or actionable framework points using clean line breaks.
- Include 3-5 relevant hashtags at the bottom.
- Tone: Crisp, insightful, and authoritative.

Respond strictly in JSON matching this schema:
{
  "body": "Full formatted post string"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
  return {
    copy: parsed.body || '',
    originalGeneratedCopy: parsed.body || '',
  };
}

/**
 * 2. Instagram Carousel Generator (Slide-by-slide structure + caption)
 */
export async function generateInstagramCarousel(payload: ChannelGeneratePayload): Promise<Partial<ChannelPost>> {
  const { node, promptModifier } = payload;

  const prompt = `
You are an expert Instagram visual content creator. Repurpose this asset into a multi-slide carousel:
SOURCE TITLE: ${node.title}
SOURCE CONTENT: ${(node as any).content || (node as any).description || (node as any).summary || 'No raw content provided.'}
METRIC TO EMPHASIZE: ${node.suggestedMetric || 'None'}
${promptModifier ? `ADDITIONAL USER ANGLE/DIRECTIVES: ${promptModifier}` : ''}

Instagram Carousel Requirements:
- Generate between 4 and 7 progressive slides.
- Slide 1: High-impact scroll-stopping title and subhead.
- Slides 2 to N-1: Single conceptual takeaways per slide with punchy body text.
- Final Slide: Strong call to action.
- Caption: Conversational feed caption with 10-15 contextual hashtags.

Respond strictly in JSON matching this schema:
{
  "caption": "Full Instagram caption text",
  "carouselTitle": "Short title for the carousel package",
  "slides": [
    { "title": "Slide Headline", "body": "1-2 concise sentences for the slide", "badge": "Step 1 or Key Metric" }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
  return {
    copy: parsed.caption || '',
    originalGeneratedCopy: parsed.caption || '',
    title: parsed.carouselTitle || node.title,
    slides: (parsed.slides || []) as any[],
    metric: node.suggestedMetric,
  };
}

/**
 * 3. Facebook Generator (Conversational community post + link prompt)
 */
export async function generateFacebookPost(payload: ChannelGeneratePayload): Promise<Partial<ChannelPost>> {
  const { node, promptModifier } = payload;

  const prompt = `
You are a social media copywriter writing a conversational Facebook business page post:
SOURCE TITLE: ${node.title}
SOURCE CONTENT: ${(node as any).content || (node as any).description || (node as any).summary || 'No raw content provided.'}
${promptModifier ? `ADDITIONAL USER ANGLE/DIRECTIVES: ${promptModifier}` : ''}

Facebook Requirements:
- Open with a relatable question or observation.
- Summarize the core value in 2 short, readable paragraphs.
- Add a clear question to spark comments in the discussion.
- Tone: Accessible, engaging, and professional.

Respond strictly in JSON:
{
  "body": "Full Facebook post text"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
  return {
    copy: parsed.body || '',
    originalGeneratedCopy: parsed.body || '',
  };
}

/**
 * 4. YouTube Generator (Community Post / Video Description + Title)
 */
export async function generateYouTubePost(payload: ChannelGeneratePayload): Promise<Partial<ChannelPost>> {
  const { node, promptModifier } = payload;

  const prompt = `
You are a YouTube strategist creating a YouTube Community tab post and video description:
SOURCE TITLE: ${node.title}
SOURCE CONTENT: ${(node as any).content || (node as any).description || (node as any).summary || 'No raw content provided.'}
${promptModifier ? `ADDITIONAL USER ANGLE/DIRECTIVES: ${promptModifier}` : ''}

YouTube Requirements:
- Create a compelling Community Tab post summarizing the core thesis.
- Include a 16:9 thumbnail concept suggestion in 1 sentence.
- Tone: High-energy, community-driven, curiosity-inducing.

Respond strictly in JSON:
{
  "body": "Formatted YouTube Community post copy",
  "suggestedVideoTitle": "High CTR Video / Post Title"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
  return {
    copy: parsed.body || '',
    originalGeneratedCopy: parsed.body || '',
    title: parsed.suggestedVideoTitle || node.title,
  };
}

/**
 * 5. Google Business Profile Generator (Local update / Brief snippet)
 */
export async function generateGMBPost(payload: ChannelGeneratePayload): Promise<Partial<ChannelPost>> {
  const { node, promptModifier } = payload;

  const prompt = `
You are a local marketing specialist drafting a Google Business Profile (GBP) update:
SOURCE TITLE: ${node.title}
SOURCE CONTENT: ${(node as any).content || (node as any).description || (node as any).summary || 'No raw content provided.'}
${promptModifier ? `ADDITIONAL USER ANGLE/DIRECTIVES: ${promptModifier}` : ''}

GBP Requirements:
- Must be concise (under 150 words).
- Focus on direct news, helpful educational takeaway, or capability.
- End with a direct call to action ("Learn more", "Read full article").
- No hashtags.

Respond strictly in JSON:
{
  "body": "Concise GBP post text"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
  return {
    copy: parsed.body || '',
    originalGeneratedCopy: parsed.body || '',
  };
}

import { autoFixBrandVoice } from './gatekeeper';

export async function requestAutoFix(text: string): Promise<string> {
  try {
    const res = await fetch('/api/gatekeeper-fix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.fixedText) {
        return data.fixedText;
      }
    }
  } catch (err: unknown) {
    console.warn('Falling back to local auto-fix algorithm:', err);
  }

  // Fallback to local rule engine
  return autoFixBrandVoice(text).fixedText;
}

