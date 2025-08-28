// src/lib/dates.js
// Safe wrappers around date-fns so bad inputs never throw

import {
  format as dfFormat,
  formatDistance as dfFormatDistance,
  formatDistanceToNow as dfFormatDistanceToNow,
  parseISO as dfParseISO,
  isValid as dfIsValid,
} from 'date-fns';

import { toValidDate } from '@/utils/date';

// Absolute formatter with fallback (default: "PP p" e.g., "Aug 28, 2025 4:32 PM")
export function format(dateInput, fmt = 'PP p', options = {}) {
  const d = toValidDate(dateInput);
  if (!d) return options.fallback ?? '—';
  try {
    return dfFormat(d, fmt, options);
  } catch {
    return options.fallback ?? '—';
  }
}

// "x minutes ago" between two dates
export function formatDistance(dateInput, baseDateInput = new Date(), options = {}) {
  const d = toValidDate(dateInput);
  const b = toValidDate(baseDateInput) || new Date();
  if (!d) return options.fallback ?? '—';
  try {
    return dfFormatDistance(d, b, options);
  } catch {
    return options.fallback ?? '—';
  }
}

// "x minutes ago" from now (addSuffix: true by default)
export function formatDistanceToNow(dateInput, options = {}) {
  const d = toValidDate(dateInput);
  if (!d) return options.fallback ?? '—';
  try {
    const opts = { addSuffix: true, ...options };
    return dfFormatDistanceToNow(d, opts);
  } catch {
    return options.fallback ?? '—';
  }
}

// Safe parseISO (returns Date | null)
export function parseISO(input) {
  try {
    const d = dfParseISO(input);
    return dfIsValid(d) ? d : null;
  } catch {
    return null;
  }
}

// Convenience validator
export const isValid = (dateInput) => !!toValidDate(dateInput);

// (Optional) re-export helpers so callers can import from one place
export { toValidDate } from '@/utils/date';

