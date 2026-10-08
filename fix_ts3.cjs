const fs = require('fs');
const path = require('path');

// 1. Fix RepurposingPipeline.tsx slides type
const pipelinePath = path.join(__dirname, 'src', 'components', 'RepurposingPipeline.tsx');
let pipelineContent = fs.readFileSync(pipelinePath, 'utf8');

pipelineContent = pipelineContent.replace(
  /activePost\.slides && activePost\.slides\.length > 0 \r?\n\s*\? activePost\.slides/,
  'activePost.slides && activePost.slides.length > 0 \n              ? activePost.slides as any'
);

// Fallback regex if the first one failed
pipelineContent = pipelineContent.replace(
  /\? activePost\.slides \r?\n/,
  '? activePost.slides as any \n'
);

fs.writeFileSync(pipelinePath, pipelineContent);

// 2. Fix geminiClient.ts Node types
const clientPath = path.join(__dirname, 'src', 'services', 'geminiClient.ts');
let clientContent = fs.readFileSync(clientPath, 'utf8');

clientContent = clientContent.replace(
  /\$\{node\.content \|\| node\.description/g,
  '${(node as any).content || (node as any).description || (node as any).summary'
);

fs.writeFileSync(clientPath, clientContent);
console.log('Fixed TS errors again');
