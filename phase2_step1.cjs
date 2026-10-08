const fs = require('fs');
const path = require('path');

// 1. Update ChannelTabPanel.tsx types
const tabPanelPath = path.join(__dirname, 'src', 'components', 'ChannelTabPanel.tsx');
let tabContent = fs.readFileSync(tabPanelPath, 'utf8');

tabContent = tabContent.replace(
  /export type PostLifecycleStatus = 'empty' \| 'generated' \| 'edited' \| 'ready' \| 'dispatched';/,
  "export type PostLifecycleStatus = 'empty' | 'idle' | 'generating' | 'generated' | 'edited' | 'ready' | 'dispatched' | 'failed';"
);

tabContent = tabContent.replace(
  /export interface ChannelPost \{([\s\S]*?)\}/,
  (match, p1) => {
    if (!p1.includes('errorMessage?: string;')) {
      return `export interface ChannelPost {${p1}  errorMessage?: string;\n}`;
    }
    return match;
  }
);

fs.writeFileSync(tabPanelPath, tabContent);

// 2. Break down geminiClient.ts
const geminiClientPath = path.join(__dirname, 'src', 'services', 'geminiClient.ts');
let geminiContent = fs.readFileSync(geminiClientPath, 'utf8');

const newClientFunctions = `

export interface ChannelGeneratePayload {
  node: IANode;
  promptModifier?: string;
  theme?: string;
}

export async function generateLinkedInPost(payload: ChannelGeneratePayload): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fallback = generateDeterministicFallbackBundle(payload.node);
      resolve({
        copy: fallback.linkedIn.body,
        originalGeneratedCopy: fallback.linkedIn.body,
        title: fallback.linkedIn.hook
      });
    }, 2500);
  });
}

export async function generateInstagramCarousel(payload: ChannelGeneratePayload): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fallback = generateDeterministicFallbackBundle(payload.node);
      resolve({
        copy: fallback.instagram.caption,
        originalGeneratedCopy: fallback.instagram.caption,
        slides: fallback.instagram.slides,
        title: fallback.instagram.title
      });
    }, 6000);
  });
}

export async function generateFacebookPost(payload: ChannelGeneratePayload): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fallback = generateDeterministicFallbackBundle(payload.node);
      resolve({
        copy: fallback.facebook.body,
        originalGeneratedCopy: fallback.facebook.body,
        title: fallback.facebook.hook
      });
    }, 2200);
  });
}

export async function generateYouTubePost(payload: ChannelGeneratePayload): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fallback = generateDeterministicFallbackBundle(payload.node);
      resolve({
        copy: fallback.youtube.script45s,
        originalGeneratedCopy: fallback.youtube.script45s,
        title: fallback.youtube.title
      });
    }, 3100);
  });
}

export async function generateGMBPost(payload: ChannelGeneratePayload): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fallback = generateDeterministicFallbackBundle(payload.node);
      resolve({
        copy: fallback.gmb.summary1500Char,
        originalGeneratedCopy: fallback.gmb.summary1500Char,
        title: fallback.gmb.title
      });
    }, 1800);
  });
}
`;

if (!geminiContent.includes('export async function generateLinkedInPost')) {
  geminiContent += newClientFunctions;
  fs.writeFileSync(geminiClientPath, geminiContent);
}

console.log('Milestone 2.1 completed.');
