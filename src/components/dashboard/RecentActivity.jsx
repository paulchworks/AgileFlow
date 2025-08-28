import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Safe date helpers (no external deps)
const SGT_FORMATTER = new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium', timeStyle: 'short' });
function toValidDate(input) {
  if (input == null || input === "") return null;

  // Already a Date
  if (Object.prototype.toString.call(input) === "[object Date]") {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  // Epoch ms or numeric string
  if (typeof input === "number" || /^\d+$/.test(String(input))) {
    const d = new Date(Number(input));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // String parsing with fallbacks
  if (typeof input === "string") {
    const s = input.trim();
    let d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;

    // Handle "YYYY-MM-DD HH:mm[:ss]" → try local, then UTC
    const isoish = s.replace(" ", "T");
    d = new Date(isoish); // treat as local if parsable
    if (!Number.isNaN(d.getTime())) return d;

    d = new Date(`${isoish}Z`); // treat as UTC if still not parsable
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}
function formatDateTime(input, fallback = "—") {
  const d = toValidDate(input);
  return d ? SGT_FORMATTER.format(d) : fallback;
}
function timeAgo(input) {
  const d = toValidDate(input);
  if (!d) return "—";
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

const statusIcons = {
  done: CheckCircle,
  in_progress: Clock,
  todo: AlertCircle,
  in_review: ArrowRight,
};

const statusColors = {
  done: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  todo: "bg-slate-100 text-slate-800 border-slate-200",
  in_review: "bg-amber-100 text-amber-700 border-amber-200",
  backlog: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function RecentActivity({ stories = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dev-only: log any items with bad timestamps so you can fix upstream
  if (import.meta?.env?.DEV) {
    const offenders = stories.filter((s) => !toValidDate(s.updated_date));
    if (offenders.length) {
      console.warn("[RecentActivity] invalid updated_date:", offenders.map(o => ({
        id: o.id ?? "(no-id)",
        updated_date: o.updated_date
      })));
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {(stories || []).map((story) => {
            const StatusIcon = statusIcons[story?.status] || AlertCircle;

            return (
              <div key={story.id ?? story.title} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-slate-600 to-slate-500 text-white">
                      {story?.assignee ? String(story.assignee).charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">
                    {story?.title ?? "(untitled)"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${statusColors[story?.status] ?? statusColors.todo} border`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {(story?.status ?? "todo").replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-slate-700">
                      {/* ✅ Never throws; shows relative time or an absolute fallback */}
                      {toValidDate(story?.updated_date)
                        ? timeAgo(story.updated_date)
                        : formatDateTime(story?.updated_date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
