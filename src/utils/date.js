// src/utils/date.js
const SGT_FORMATTER = new Intl.DateTimeFormat('en-SG', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// Accepts Date | number (ms) | ISO string | null/undefined | ''
export function toValidDate(input) {
  if (input == null || input === '') return null;

  if (Object.prototype.toString.call(input) === '[object Date]') {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  // numeric epoch (or numeric string)
  if (typeof input === 'number' || /^\d+$/.test(String(input))) {
    const d = new Date(Number(input));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // string: try native parse, then add timezone if missing
  if (typeof input === 'string') {
    const s = input.trim();
    // Try as-is
    let d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;

    // If it's like "YYYY-MM-DD HH:mm[:ss]" or "YYYY-MM-DDTHH:mm"
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
