// src/utils/date.js
const SGT_FORMATTER = new Intl.DateTimeFormat('en-SG', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

// Accepts Date | number (ms) | ISO string | null/undefined
export function toValidDate(input) {
  if (input == null) return null;

  // If already a Date
  if (Object.prototype.toString.call(input) === '[object Date]') {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  // Numeric epoch in ms (or numeric string)
  if (typeof input === 'number' || (/^\d+$/.test(String(input)))) {
    const d = new Date(Number(input));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // String: try strict ISO first; if it lacks timezone, append 'Z'
  if (typeof input === 'string') {
    const s = input.trim();
    let d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;

    // Try treating 'YYYY-MM-DD HH:mm' as UTC by appending 'Z'
    // (or change to '+08:00' if your API returns local SGT without offset)
    d = new Date(`${s.replace(' ', 'T')}Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

export function formatDateTime(input, fallback = '—') {
  const d = toValidDate(input);
  return d ? SGT_FORMATTER.format(d) : fallback;
}
