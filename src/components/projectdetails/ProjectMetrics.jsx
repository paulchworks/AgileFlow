import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, List, AlertTriangle, Zap } from 'lucide-react';

const MetricsCard = ({ title, value, icon: Icon, isLoading }) => {
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-800">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
};

export default function ProjectMetrics({ stories, issues, sprints, isLoading }) {
  const storyPoints = stories.reduce((acc, s) => acc + (s.story_points || 0), 0);
  const completedStoryPoints = stories
    .filter(s => s.status === 'done')
    .reduce((acc, s) => acc + (s.story_points || 0), 0);
  const progress = storyPoints > 0 ? Math.round((completedStoryPoints / storyPoints) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCard title="Progress" value={`${progress}%`} icon={Target} isLoading={isLoading} />
      <MetricsCard title="Total Stories" value={stories.length} icon={List} isLoading={isLoading} />
      <MetricsCard title="Open Issues" value={issues.filter(i => i.status !== 'done').length} icon={AlertTriangle} isLoading={isLoading} />
      <MetricsCard title="Sprints" value={sprints.length} icon={Zap} isLoading={isLoading} />
    </div>
  );
}