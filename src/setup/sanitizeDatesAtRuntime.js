// Intercept Response.json() globally and sanitize any "date-like" fields.
// Works for ALL fetch calls in the app (including 3rd-party code).

// Heuristic: keys that look like dates
const DATE_KEY_RE = /(^|_)(date|time)$|(_at$)|(^start$)|(^end$)|(^due$)|(^deadline$)|(^created$)|(^updated$)/i;

const toISOorNull = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const sanitize = (val) => {
  if (Array.isArray(val)) return val.map(sanitize);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (DATE_KEY_RE.test(k)) out[k] = toISOorNull(v);
      else out[k] = sanitize(v);
    }
    return out;
  }
  return val;
};

if (typeof window !== 'undefined' && !window.__FETCH_JSON_SANITIZED__) {
  const origFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const res = await origFetch(...args);

    // If not JSON, return as-is.
    const ct = res.headers && res.headers.get && res.headers.get('content-type');
    if (!ct || !ct.includes('application/json')) return res;

    // Proxy only overrides .json() to return a sanitized tree.
    const proxied = new Proxy(res, {
      get(target, prop, receiver) {
        if (prop === 'json') {
          return async () => {
            const data = await target.json();
            return sanitize(data);
          };
        }
        const v = Reflect.get(target, prop, receiver);
        return typeof v === 'function' ? v.bind(target) : v;
      },
    });

    return proxied;
  };

  window.__FETCH_JSON_SANITIZED__ = true;
}
