// src/shims/formatDistance-safe.js
import { toValidDate } from '@/utils/date';
import { formatDistance as realFormatDistance } from 'date-fns-real';

export default function formatDistance(date, baseDate, options) {
  const d = toValidDate(date);
  const b = toValidDate(baseDate ?? new Date());
  if (!d || !b) return options?.fallback ?? '—';
  return realFormatDistance(d, b, options);
}
