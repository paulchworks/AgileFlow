// src/lib/dates.js
import { format as dfFormat, formatDistanceToNow as dfFormatDistanceToNow } from "date-fns";

export const toDateSafe = (v) => {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (v === null || v === undefined || v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const safeFormat = (v, fmt, fallback = "") => {
  const d = toDateSafe(v);
  if (!d) return fallback;
  try { return dfFormat(d, fmt); } catch { return fallback; }
};

export const safeFormatDistanceToNow = (v, opts, fallback = "") => {
  const d = toDateSafe(v);
  if (!d) return fallback;
  try { return dfFormatDistanceToNow(d, opts); } catch { return fallback; }
};
