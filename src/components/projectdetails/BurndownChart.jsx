import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays, addDays, format } from 'date-fns';

export default function BurndownChart({ sprint, stories }) {
  if (!sprint) {
    return (
      <Card className="shadow-lg border-0 h-full">
        <CardHeader>
          <CardTitle>Sprint Burndown</CardTitle>
          <CardDescription>No active sprint for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-slate-600">
            Select or start a sprint to see the burndown chart.
          </div>
        </CardContent>
      </Card>
    );
  }

  const sprintStories = stories.filter(s => s.sprint_id === sprint.id);
  const totalStoryPoints = sprintStories.reduce((sum, story) => sum + (story.story_points || 0), 0);
  
  const startDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);
  const sprintDuration = differenceInDays(endDate, startDate) + 1;

  const idealData = Array.from({ length: sprintDuration }, (_, i) => {
    const dailyReduction = totalStoryPoints / (sprintDuration - 1);
    return {
      date: format(addDays(startDate, i), 'MMM d'),
      ideal: Math.max(0, totalStoryPoints - dailyReduction * i),
    };
  });

  const actualData = Array.from({ length: sprintDuration }, (_, i) => {
    const currentDate = addDays(startDate, i);
    const completedPoints = sprintStories
      .filter(s => s.status === 'done' && new Date(s.updated_date) <= currentDate)
      .reduce((sum, story) => sum + (story.story_points || 0), 0);
    return {
      date: format(currentDate, 'MMM d'),
      actual: totalStoryPoints - completedPoints,
    };
  });
  
  const chartData = idealData.map((ideal, i) => ({ ...ideal, ...actualData[i] }));

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>{sprint.name} Burndown Chart</CardTitle>
        <CardDescription>
          Tracking remaining work in the sprint vs. the ideal pace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fontSize: 12 }} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
              />
              <Area type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" fillOpacity={0} name="Ideal" />
              <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}