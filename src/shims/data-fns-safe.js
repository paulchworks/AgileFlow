// src/shims/date-fns-safe.js
import * as real from 'date-fns-real';
export * from 'date-fns-real'; // re-export all other helpers

import { toValidDate } from '@/utils/date';

export function formatDistance(date, baseDate, options) {
  const d = toValidDate(date);
  const b = toValidDate(baseDate ?? new Date());
  if (!d || !b) return options?.fallback ?? '—';
  return real.formatDistance(d, b, options);
}
