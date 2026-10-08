const fs = require('fs');

// 1. Fix ChannelTabPanel.tsx
const panelPath = 'src/components/ChannelTabPanel.tsx';
let panelContent = fs.readFileSync(panelPath, 'utf8');
if (!panelContent.includes('export interface ActiveContext')) {
  panelContent += `\nexport interface ActiveContext { channelKey: ChannelKey; tool: ActiveTool; }\n`;
  fs.writeFileSync(panelPath, panelContent);
}

// 2. Fix RepurposingPipeline.tsx
const pipelinePath = 'src/components/RepurposingPipeline.tsx';
let pipelineContent = fs.readFileSync(pipelinePath, 'utf8');

// Fix duplicate import
pipelineContent = pipelineContent.replace(
  /import { CHARACTER_CUTOUT_PRESETS } from '\.\.\/services\/knowledgeBase';\r?\nimport { CHARACTER_CUTOUT_PRESETS } from '\.\.\/services\/knowledgeBase';/,
  "import { CHARACTER_CUTOUT_PRESETS } from '../services/knowledgeBase';"
);

// Fix duplicate state (just in case they are still there due to carriage returns)
pipelineContent = pipelineContent.replace(
  /const \[primaryCharacter, setPrimaryCharacter\] = useState\(''\);\r?\n\s*const \[secondaryCharacter, setSecondaryCharacter\] = useState\(''\);\r?\n\s*const \[primaryCharacter, setPrimaryCharacter\] = useState\(''\);\r?\n\s*const \[secondaryCharacter, setSecondaryCharacter\] = useState\(''\);/g,
  "const [primaryCharacter, setPrimaryCharacter] = useState('');\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');"
);

// Add missing state for insertedToCalendar
if (!pipelineContent.includes('const [insertedToCalendar, setInsertedToCalendar]')) {
  pipelineContent = pipelineContent.replace(
    /const \[customPrompt, setCustomPrompt\] = useState\(''\);/,
    "const [customPrompt, setCustomPrompt] = useState('');\n  const [insertedToCalendar, setInsertedToCalendar] = useState(false);"
  );
}

// Fix BrandVoiceGatekeeper prop from onApplyEdits to onApplyFix
pipelineContent = pipelineContent.replace(
  /onApplyEdits=\{\(newCopy, score\) => handleApplyVoiceEdits\(activeContext\.channelKey, newCopy, score\)\}/,
  "onApplyFix={(newCopy) => handleApplyVoiceEdits(activeContext.channelKey, newCopy, 100)}"
);

fs.writeFileSync(pipelinePath, pipelineContent);
console.log('Fixed TypeScript errors');
