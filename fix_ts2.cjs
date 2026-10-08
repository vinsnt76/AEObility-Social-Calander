const fs = require('fs');
const path = require('path');

// 1. Fix App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(
  /onSendToGatekeeper=\{[^}]+\}\s+onSendToGraphicGenerator=\{[^}]+\}\s+onPreviewPost=\{[^}]+\}/g,
  ''
);
// In case the props are on different lines:
appContent = appContent.replace(/onSendToGatekeeper=\{[^}]+\}/g, '');
appContent = appContent.replace(/onSendToGraphicGenerator=\{[^}]+\}/g, '');
appContent = appContent.replace(/onPreviewPost=\{[^}]+\}/g, '');
fs.writeFileSync(appPath, appContent);

// 2. Fix RepurposingPipeline.tsx
const pipelinePath = path.join(__dirname, 'src', 'components', 'RepurposingPipeline.tsx');
let pipelineContent = fs.readFileSync(pipelinePath, 'utf8');

pipelineContent = pipelineContent.replace(
  /gatekeeperScore: post\.voiceScore,/g,
  'gatekeeperScore: post.voiceScore || 0,'
);

// Specifically fix line 171 and 185 by adding `|| 0` to `post.voiceScore`
pipelineContent = pipelineContent.replace(
  /voiceScore: bundlePosts\[channel\]\.voiceScore,/g,
  'voiceScore: bundlePosts[channel].voiceScore || 0,'
);

fs.writeFileSync(pipelinePath, pipelineContent);

// 3. Fix SlideGraphicGenerator.tsx
const graphicPath = path.join(__dirname, 'src', 'components', 'SlideGraphicGenerator.tsx');
let graphicContent = fs.readFileSync(graphicPath, 'utf8');

graphicContent = graphicContent.replace(
  /char\.calloutText/g,
  "(char.calloutText || 'AI ASSISTANT')"
);

fs.writeFileSync(graphicPath, graphicContent);

console.log('Fixed TS errors');
