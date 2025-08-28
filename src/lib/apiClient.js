// Single source of truth for HTTP calls, allowlisted to your API Gateway host
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/,'') || '';
const ALLOWLIST = [ new URL(API_BASE).host ];

function allow(urlLike) {
  const u = new URL(urlLike, API_BASE);
  if (!ALLOWLIST.includes(u.host)) {
    throw new Error(`Blocked outbound request to disallowed host: ${u.host}`);
  }
  return u.toString();
}

async function j(res, verb, path) {
  if (!res.ok) throw new Error(`${verb} ${path} failed: ${res.status}`);
  return res.json();
}

export const BoardsAPI = {
  get:   async (id)           => j(await fetch(allow(`/boards/${id}`)), 'GET',  `/boards/${id}`),
  save:  async (id, data, v)  => j(await fetch(allow(`/boards/${id}`), {
    method: 'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify({ data, version: v })
  }), 'PUT', `/boards/${id}`),
  create:async (id, data)     => j(await fetch(allow(`/boards`), {
    method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id, data })
  }), 'POST', `/boards`),
  del:   async (id)           => j(await fetch(allow(`/boards/${id}`), { method:'DELETE' }), 'DELETE', `/boards/${id}`)
};
