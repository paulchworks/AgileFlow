// Safe wrapper for date-fns/formatDistance
import realFormatDistance from 'date-fns/formatDistance';
import { toValidDate } from '@/utils/date';

export default function formatDistance(date, baseDate = new Date(), options = {}) {
  const d = toValidDate(date);
  const b = toValidDate(baseDate) || new Date();
  if (!d) return options?.fallback ?? '—';
  try {
    return realFormatDistance(d, b, options);
  } catch {
    return options?.fallback ?? '—';
  }
}
