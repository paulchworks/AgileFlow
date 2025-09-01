import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInWeeks, startOfWeek, format, isAfter, subWeeks } from 'date-fns';
import { ArrowUp, ArrowDown, TrendingUp, CheckCircle, ListTodo } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon: Icon }) => (
  <div className="bg-slate-50/50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-slate-600" />
      <h4 className="text-sm font-medium text-slate-700">{title}</h4>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    {change && (
      <div className={`flex items-center text-xs font-medium ${changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
        {changeType === 'increase' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        {change}% vs last week
      </div>
    )}
  </div>
);

export default function ProductivityReport({ stories, isLoading }) {
  const productivityData = useMemo(() => {
    if (!stories || stories.length === 0) {
      return { chartData: [], stats: { totalCompleted: 0, totalPoints: 0, weeklyVelocity: 0, pointVelocity: 0 } };
    }
    
    const completedStories = stories.filter(s => s.status === 'done' && s.updated_date);
    const now = new Date();
    const fourWeeksAgo = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 3);

    const weeklyData = {};

    completedStories.forEach(story => {
      const completionDate = new Date(story.updated_date);
      if (isAfter(completionDate, fourWeeksAgo)) {
        const weekStart = format(startOfWeek(completionDate, { weekStartsOn: 1 }), 'MMM d');
        if (!weeklyData[weekStart]) {
          weeklyData[weekStart] = { stories: 0, points: 0 };
        }
        weeklyData[weekStart].stories += 1;
        weeklyData[weekStart].points += story.story_points || 0;
      }
    });

    const chartData = Object.keys(weeklyData)
      .map(week => ({ week, ...weeklyData[week] }))
      .sort((a, b) => new Date(a.week) - new Date(b.week));

    const totalCompleted = completedStories.length;
    const totalPoints = completedStories.reduce((sum, s) => sum + (s.story_points || 0), 0);
    
    const lastTwoWeeks = chartData.slice(-2);
    const weeklyVelocity = lastTwoWeeks.length > 0 ? lastTwoWeeks.reduce((sum, w) => sum + w.stories, 0) / lastTwoWeeks.length : 0;
    const pointVelocity = lastTwoWeeks.length > 0 ? lastTwoWeeks.reduce((sum, w) => sum + w.points, 0) / lastTwoWeeks.length : 0;
    
    let storyChange = null;
    if (lastTwoWeeks.length === 2) {
      const [prev, current] = lastTwoWeeks;
      if (prev.stories > 0) {
        storyChange = Math.round(((current.stories - prev.stories) / prev.stories) * 100);
      } else if (current.stories > 0) {
        storyChange = 100;
      }
    }

    return {
      chartData,
      stats: {
        totalCompleted,
        totalPoints,
        weeklyVelocity: weeklyVelocity.toFixed(1),
        pointVelocity: pointVelocity.toFixed(1),
        storyChange,
      }
    };
  }, [stories]);

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        {/* Skeleton loader can be added here */}
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Productivity Insights</CardTitle>
            <p className="text-slate-600">Performance overview based on completed stories.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Stories Done" 
            value={productivityData.stats.totalCompleted} 
            icon={CheckCircle}
          />
          <StatCard 
            title="Total Story Points" 
            value={productivityData.stats.totalPoints}
            icon={ListTodo}
          />
          <StatCard 
            title="Avg. Weekly Velocity" 
            value={productivityData.stats.weeklyVelocity} 
            icon={TrendingUp}
            change={productivityData.stats.storyChange}
            changeType={productivityData.stats.storyChange >= 0 ? 'increase' : 'decrease'}
          />
          <StatCard 
            title="Avg. Point Velocity" 
            value={productivityData.stats.pointVelocity}
            icon={TrendingUp}
          />
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="week" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="stories" fill="#10b981" name="Stories Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="points" fill="#8b5cf6" name="Story Points" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}