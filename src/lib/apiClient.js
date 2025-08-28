// --- robust API base + allowlist ---
let API_BASE = (typeof window !== 'undefined' && window.__APP_API_BASE) || (import.meta.env?.VITE_API_BASE || '');
API_BASE = (API_BASE || '').replace(/\/+$/, ''); // trim trailing slashes

if (/\.execute-api\.[^/]+\.amazonaws\.com$/.test(API_BASE)) {
  API_BASE = API_BASE + '/prod'; // safety: add stage if missing
}
if (typeof window !== 'undefined') {
  window.__APP_API_BASE = API_BASE;
  console.log('[AgileFlow] API_BASE =', API_BASE);
}

const ALLOWLIST = API_BASE ? [new URL(API_BASE).host] : [];

// NOTE: strips any leading slashes from `path` and ALWAYS appends to API_BASE + '/'
function allow(path) {
  const base = API_BASE + '/';
  const cleanPath = String(path || '').replace(/^\/+/, ''); // <-- key line
  const u = new URL(cleanPath, base);
  if (!ALLOWLIST.includes(u.host)) {
    throw new Error(`Blocked outbound request to disallowed host: ${u.host}`);
  }
  return u.toString();
}

// ---- Public API ----
export const BoardsAPI = {
  get:    async (id)         => (await fetch(allow(`boards/${id}`))).json(),
  save:   async (id, d, v)   => (await fetch(allow(`boards/${id}`), {
                         method:'PUT', headers:{'content-type':'application/json'},
                         body: JSON.stringify({ data:d, version:v })
                       })).json(),
  create: async (id, d)      => (await fetch(allow('boards'), {
                         method:'POST', headers:{'content-type':'application/json'},
                         body: JSON.stringify({ id, data:d })
                       })).json(),
  del:    async (id)         => (await fetch(allow(`boards/${id}`), { method:'DELETE' })).json(),
};

