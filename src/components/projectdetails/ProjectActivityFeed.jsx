import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function ProjectActivityFeed({ stories, issues }) {
  const combinedActivity = [...stories, ...issues]
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 10);

  return (
    <Card className="shadow-lg border-0 h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {combinedActivity.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <p className="font-medium text-slate-900 truncate pr-4">{item.title}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={item.issue_type ? 'destructive' : 'secondary'}>
                  {item.issue_type ? 'Issue' : 'Story'}
                </Badge>
                <span className="text-xs text-slate-600">
                  {formatDistanceToNow(new Date(item.updated_date), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}