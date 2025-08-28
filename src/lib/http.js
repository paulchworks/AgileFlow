// src/lib/http.js
import { toValidDate } from '@/utils/date';

// Use a relative prefix; map it to your backend via Vite dev proxy / prod reverse proxy.
export const API_PREFIX = (import.meta.env.VITE_API_PREFIX || '/api').replace(/\/+$/, '');
// Back-compat if other code references API_BASE:
export const API_BASE = API_PREFIX;

function ensureLeadingSlash(p) {
  return p.startsWith('/') ? p : `/${p}`;
}

async function parseJSON(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json();
    return sanitizeDates(data);
  }
  // Fallback for non-JSON responses
  return res.text();
}

export async function api(path, opts) {
  const url = `${API_PREFIX}${ensureLeadingSlash(path)}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return parseJSON(res);
}

// ---- date sanitizer ----
export function sanitizeDates(obj) {
  const DATE_KEYS = /(^|_)(date|time|at|on)$/i; // e.g., createdAt, updated_at, dueDate
  if (Array.isArray(obj)) return obj.map(sanitizeDates);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object' && !(v instanceof Date)) {
        out[k] = sanitizeDates(v);
      } else if (DATE_KEYS.test(k)) {
        const d = toValidDate(v);
        out[k] = d ? d.toISOString() : null;
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return obj;
}
