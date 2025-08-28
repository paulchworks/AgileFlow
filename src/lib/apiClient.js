// src/lib/apiClient.js

// ---- base URL ----
const RAW_BASE =
  (typeof window !== 'undefined' && window.__APP_API_BASE) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  '';
const API_BASE = String(RAW_BASE).replace(/\/+$/, ''); // trim trailing slash

const allow = (path) => `${API_BASE}${path}`;

// ---- date sanitizers ----
const DATE_KEY_RE =
  /(^|_)(date|time)$|(_at$)|(^start$)|(^end$)|(^due$)|(^deadline$)|(^created$)|(^updated$)/i;

const toISOorNull = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const sanitizeDeep = (val) => {
  if (Array.isArray(val)) return val.map(sanitizeDeep);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (DATE_KEY_RE.test(k)) out[k] = toISOorNull(v);
      else out[k] = sanitizeDeep(v);
    }
    return out;
  }
  return val;
};

// Ensure we never write invalid date strings
const scrubMetaDates = (data = {}) => {
  const meta = data.meta || {};
  const cleaned = { ...meta };
  cleaned.start_date = toISOorNull(meta.start_date ?? meta.startDate ?? meta.start);
  cleaned.end_date   = toISOorNull(meta.end_date   ?? meta.endDate   ?? meta.end);
  cleaned.created_at = toISOorNull(meta.created_at ?? meta.createdAt ?? meta.created) || new Date().toISOString();
  if (meta.updated_at ?? meta.updatedAt) {
    cleaned.updated_at = toISOorNull(meta.updated_at ?? meta.updatedAt);
  }
  return { ...data, meta: { ...meta, ...cleaned } };
};

// ---- JSON helpers ----
const parseJsonSanitized = async (res) => {
  const ct = res.headers?.get?.('content-type') || '';
  if (!ct.includes('application/json')) return null;
  const j = await res.json();
  return sanitizeDeep(j);
};

const handle = async (res, method, path) => {
  if (!res.ok) {
    const body = await (async () => {
      try { return await res.text(); } catch { return ''; }
    })();
    throw new Error(`HTTP ${res.status} ${method} ${path} ${body ? `- ${body}` : ''}`);
  }
  return parseJsonSanitized(res);
};

// ---- API surface used by the app ----
export const BoardsAPI = {
  async get(id) {
    const path = `/boards/${id}`;
    const r = await fetch(allow(path));
    return handle(r, 'GET', path);
  },

  async save(id, data, version) {
    const path = `/boards/${id}`;
    const body = JSON.stringify({ data: scrubMetaDates(data), version });
    const r = await fetch(allow(path), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body,
    });
    return handle(r, 'PUT', path);
  },

  async create(id, data) {
    const path = `/boards`;
    const body = JSON.stringify({ id, data: scrubMetaDates(data) });
    const r = await fetch(allow(path), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    return handle(r, 'POST', path);
  },

  async del(id) {
    const path = `/boards/${id}`;
    const r = await fetch(allow(path), { method: 'DELETE' });
    return handle(r, 'DELETE', path);
  },
};

export default BoardsAPI;

