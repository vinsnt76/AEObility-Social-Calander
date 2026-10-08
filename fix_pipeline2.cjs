const fs = require('fs');
const path = 'src/components/RepurposingPipeline.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert the dropdowns using robust replacement
const searchTarget = `              </select>
            </div>
            {/* Aspect Ratio dropdown removed in favor of platform-adaptive defaults */}

            <div className="mt-3">
              <input`;

const replacementString = `              </select>
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
            {/* Aspect Ratio dropdown removed in favor of platform-adaptive defaults */}

            <div className="mt-3">
              <input`;

// Normalizing line endings for the target string to match file contents which may be CRLF or LF
const regexTarget = searchTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n\\s*');
const targetRegex = new RegExp(regexTarget);

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacementString);
  fs.writeFileSync(path, content);
  console.log('Successfully injected dropdowns!');
} else {
  console.log('Target regex not found.');
}
