const fs = require('fs');
const path = require('path');

// 1. Fix ChannelTabPanel.tsx to export SlideContent and update ChannelPost slides type
const tabPanelPath = path.join(__dirname, 'src', 'components', 'ChannelTabPanel.tsx');
let tabContent = fs.readFileSync(tabPanelPath, 'utf8');

if (!tabContent.includes('export interface SlideContent')) {
  tabContent = tabContent.replace(
    /export interface VisualAsset/,
    `export interface SlideContent {
  title: string;
  body: string;
  badge?: string;
}

export interface VisualAsset`
  );

  tabContent = tabContent.replace(
    /slides\?: any\[\]; \/\/ for IG carousel/,
    `slides?: SlideContent[];`
  );
  fs.writeFileSync(tabPanelPath, tabContent);
}

// 2. Fix geminiClient.ts requestAutoFix export
const geminiClientPath = path.join(__dirname, 'src', 'services', 'geminiClient.ts');
let geminiContent = fs.readFileSync(geminiClientPath, 'utf8');

geminiContent = geminiContent.replace(
  /\/\/ Ensure the deterministic fallback exists in case we need it elsewhere \(or gatekeeper\)\r?\nexport \{ requestAutoFix \} from '\.\/gatekeeperMock\.js';/,
  `import { autoFixBrandVoice } from './gatekeeper';

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
`
);
fs.writeFileSync(geminiClientPath, geminiContent);

console.log('Fixed types and autoFix');
