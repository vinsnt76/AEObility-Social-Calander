const fs = require('fs');
const path = 'src/components/RepurposingPipeline.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix duplicates
content = content.replace("import { CHARACTER_CUTOUT_PRESETS } from '../services/knowledgeBase';\r\nimport { CHARACTER_CUTOUT_PRESETS } from '../services/knowledgeBase';", "import { CHARACTER_CUTOUT_PRESETS } from '../services/knowledgeBase';");
content = content.replace("const [primaryCharacter, setPrimaryCharacter] = useState('');\r\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');\r\n  const [primaryCharacter, setPrimaryCharacter] = useState('');\r\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');", "const [primaryCharacter, setPrimaryCharacter] = useState('');\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');");
content = content.replace("const [primaryCharacter, setPrimaryCharacter] = useState('');\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');\n  const [primaryCharacter, setPrimaryCharacter] = useState('');\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');", "const [primaryCharacter, setPrimaryCharacter] = useState('');\n  const [secondaryCharacter, setSecondaryCharacter] = useState('');");

// Insert the dropdowns
const target = `              </select>
            </div>

            <div className="mt-3">
              <input`;

const dropdowns = `              </select>
            </div>

            <div className="mt-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Primary Character (Optional)
              </span>
              <select 
                value={primaryCharacter}
                onChange={e => setPrimaryCharacter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#00E5FF] cursor-pointer"
              >
                <option value="">None</option>
                {CHARACTER_CUTOUT_PRESETS.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Secondary Character (Optional)
              </span>
              <select 
                value={secondaryCharacter}
                onChange={e => setSecondaryCharacter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#00E5FF] cursor-pointer"
              >
                <option value="">None</option>
                {CHARACTER_CUTOUT_PRESETS.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <input`;

// Normalizing line endings for the target string to match file contents which may be CRLF or LF
const regexTarget = target.replace(/\r?\n/g, '\\r?\\n\\s*');
const targetRegex = new RegExp(regexTarget);

content = content.replace(targetRegex, dropdowns);

fs.writeFileSync(path, content);
console.log('Fixed RepurposingPipeline.tsx');
