// src/components/projectdetails/ProjectActivityFeed.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toValidDate } from "@/utils/date";

// Prefer updated_* fields, then modified_*, then created_* as a last resort
const pickUpdatedTs = (it) =>
  it?.updated_date ?? it?.updated_at ?? it?.updatedAt ??
  it?.modified_at ?? it?.modifiedAt ??
  it?.created_date ?? it?.created_at ?? it?.createdAt ?? null;

export default function ProjectActivityFeed({ stories = [], issues = [] }) {
  const combinedActivity = [...stories, ...issues]
    .slice() // do not mutate props
    .sort((a, b) => {
      const da = toValidDate(pickUpdatedTs(a));
      const db = toValidDate(pickUpdatedTs(b));
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return tb - ta; // newest first
    })
    .slice(0, 10);

  return (
    <Card className="shadow-lg border-0 h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {combinedActivity.map((item) => {
            const ts = pickUpdatedTs(item);
            const d = toValidDate(ts);
            const isIssue = !!item.issue_type;

            return (
              <div key={item.id || `${isIssue ? 'issue' : 'story'}-${ts || Math.random()}`} className="flex items-center justify-between">
                <p className="font-medium text-slate-900 truncate pr-4">
                  {item.title || '(untitled)'}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={isIssue ? 'destructive' : 'secondary'}>
                    {isIssue ? 'Issue' : 'Story'}
                  </Badge>
                  <span className="text-xs text-slate-600">
                    {d ? formatDistanceToNow(d, { addSuffix: true }) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
