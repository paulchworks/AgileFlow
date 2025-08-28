// src/utils/date.js

// Friendly absolute date-time for Singapore users
const SGT_FORMATTER = new Intl.DateTimeFormat('en-SG', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// Accepts: Date | number(ms) | numeric string | ISO string |
//          "YYYY-MM-DD HH:mm[:ss]" | null/undefined | ''
export function toValidDate(input) {
  if (input == null || input === '') return null;

  // Already a Date
  if (Object.prototype.toString.call(input) === '[object Date]') {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  // Epoch in ms (or numeric string)
  if (typeof input === 'number' || /^\d+$/.test(String(input))) {
    const d = new Date(Number(input));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // String parsing with fallbacks
  if (typeof input === 'string') {
    const s = input.trim();
    let d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;

    // Handle "YYYY-MM-DD HH:mm[:ss]" → treat as UTC by appending Z
    const isoish = s.replace(' ', 'T');
    d = new Date(/\+\d{2}:\d{2}|Z$/.test(isoish) ? isoish : `${isoish}Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

export function formatDateTime(input, fallback = '—') {
  const d = toValidDate(input);
  return d ? SGT_FORMATTER.format(d) : fallback;
}
