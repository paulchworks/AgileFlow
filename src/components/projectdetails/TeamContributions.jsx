import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function TeamContributions({ stories, users }) {
  const contributions = useMemo(() => {
    const userContributions = {};

    stories.forEach(story => {
      if (story.assignee) {
        if (!userContributions[story.assignee]) {
          userContributions[story.assignee] = { completed_points: 0, total_points: 0 };
        }
        const points = story.story_points || 0;
        userContributions[story.assignee].total_points += points;
        if (story.status === 'done') {
          userContributions[story.assignee].completed_points += points;
        }
      }
    });

    return Object.entries(userContributions)
      .map(([email, data]) => {
        const user = users.find(u => u.email === email);
        return {
          ...data,
          email,
          name: user?.full_name || email,
          avatar: user?.avatar_url,
          initials: user?.full_name ? user.full_name[0] : email[0].toUpperCase(),
        };
      })
      .sort((a, b) => b.completed_points - a.completed_points);
  }, [stories, users]);

  return (
    <Card className="shadow-lg border-0 h-full">
      <CardHeader>
        <CardTitle>Team Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contributions.length > 0 ? (
            contributions.map(contrib => (
              <div key={contrib.email}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contrib.avatar} />
                      <AvatarFallback>{contrib.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-900">{contrib.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {contrib.completed_points} / {contrib.total_points} pts
                  </span>
                </div>
                <Progress value={contrib.total_points > 0 ? (contrib.completed_points / contrib.total_points) * 100 : 0} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-slate-600 text-center py-8">No assigned stories with points yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}