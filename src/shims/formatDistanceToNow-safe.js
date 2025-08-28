// Safe wrapper for date-fns/formatDistanceToNow
import realFormatDistanceToNow from 'date-fns/formatDistanceToNow';
import { toValidDate } from '@/utils/date';

export default function formatDistanceToNow(input, options = {}) {
  const d = toValidDate(input);
  if (!d) return options?.fallback ?? '—';
  const opts = { addSuffix: true, ...options };
  try {
    return realFormatDistanceToNow(d, opts);
  } catch {
    return options?.fallback ?? '—';
  }
}
