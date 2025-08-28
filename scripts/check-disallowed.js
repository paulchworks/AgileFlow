import fs from 'fs'; import path from 'path';
const BAD = [/base44/i, /https?:\/\/(?![^/]*execute-api)/i]; // blocks any raw http(s) host not API Gateway
const EXTS = new Set(['.js','.jsx','.ts','.tsx','.json','.html','.css']);
function walk(dir){ for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) walk(full);
  else if (EXTS.has(path.extname(e.name))) {
    const txt = fs.readFileSync(full,'utf8');
    for (const pat of BAD) if (pat.test(txt)) { console.error(`❌ Disallowed reference in: ${full}`); process.exit(1); }
  }
}}
walk('src'); console.log('✅ No disallowed endpoints found.');
