// src/lib/http.js
import { toValidDate } from '@/utils/date';

// ---- API base resolution: runtime (either key) > env VITE_API_BASE > VITE_API_PREFIX > '/api'
const runtimeBase =
  (typeof window !== 'undefined' && (
    // accept both keys for backwards-compat
    window.__API_BASE ||
    window.__APP_API_BASE ||
    (typeof document !== 'undefined' &&
      document.querySelector?.('meta[name="x-api-base"]')?.content)
  )) || '';

const envBase   = (import.meta?.env?.VITE_API_BASE   || '').trim();
const envPrefix = (import.meta?.env?.VITE_API_PREFIX || '').trim();

export const API_PREFIX = (runtimeBase || envBase || envPrefix || '/api').replace(/\/+$/, '');
export const API_BASE = API_PREFIX; // back-compat

function ensureLeadingSlash(p) {
  return p && p.startsWith('/') ? p : `/${p || ''}`;
}

async function parseJSON(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json();
    return sanitizeDates(data);
  }
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

