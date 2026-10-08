import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateSocialBundleWithGemini, autoFixWithGemini } from './src/server/geminiHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.post('/api/generate', async (req, res) => {
  try {
    const { node, customInstructions } = req.body;
    const result = await generateSocialBundleWithGemini(node, customInstructions);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Server /api/generate error:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

app.post('/api/gatekeeper-fix', async (req, res) => {
  try {
    const { text } = req.body;
    const fixed = await autoFixWithGemini(text);
    res.json({ success: true, fixedText: fixed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Server /api/gatekeeper-fix error:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

// Serve static frontend files if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AEObility Social Media Engine server running on port ${PORT}`);
});
