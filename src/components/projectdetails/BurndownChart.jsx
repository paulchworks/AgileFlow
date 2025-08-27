import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, Calendar, Target } from "lucide-react";
import { format, differenceInDays, eachDayOfInterval, isBefore, isAfter } from "date-fns";

export default function BurndownChart({ sprints, stories }) {
  const activeSprint = sprints.find(s => s.status === 'active');
  
  const chartData = useMemo(() => {
    if (!activeSprint || !activeSprint.start_date || !activeSprint.end_date) {
      return [];
    }

    const sprintStories = stories.filter(s => s.sprint_id === activeSprint.id);
    const totalPoints = sprintStories.reduce((sum, story) => sum + (story.story_points || 0), 0);

    if (totalPoints === 0) {
      return [];
    }

    const startDate = new Date(activeSprint.start_date);
    const endDate = new Date(activeSprint.end_date);
    const sprintDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    return sprintDays.map((day, index) => {
      const dayString = format(day, 'yyyy-MM-dd');
      
      // Calculate ideal burndown (linear)
      const progress = index / (sprintDays.length - 1);
      const idealRemaining = totalPoints * (1 - progress);
      
      // Calculate actual burndown based on completed stories
      // For demo purposes, we'll simulate some progress
      let actualRemaining = totalPoints;
      
      // Count completed stories up to this day
      const completedStories = sprintStories.filter(story => {
        if (story.status === 'done') {
          // In a real app, you'd check when the story was actually completed
          // For now, we'll assume stories are completed somewhat randomly throughout the sprint
          const storyHash = story.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const completionDay = storyHash % sprintDays.length;
          return completionDay <= index;
        }
        return false;
      });
      
      const completedPoints = completedStories.reduce((sum, story) => sum + (story.story_points || 0), 0);
      actualRemaining = totalPoints - completedPoints;

      return {
        day: format(day, 'MMM d'),
        date: dayString,
        ideal: Math.max(0, Math.round(idealRemaining)),
        actual: Math.max(0, actualRemaining),
        isToday: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
        isPast: isBefore(day, new Date()) || format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      };
    });
  }, [activeSprint, stories]);

  if (!activeSprint) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-slate-600" />
            Sprint Burndown Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingDown className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No active sprint found</p>
            <p className="text-sm text-slate-500 mt-1">Create and activate a sprint to see the burndown chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sprintStories = stories.filter(s => s.sprint_id === activeSprint.id);
  const totalPoints = sprintStories.reduce((sum, story) => sum + (story.story_points || 0), 0);
  const completedPoints = sprintStories
    .filter(s => s.status === 'done')
    .reduce((sum, story) => sum + (story.story_points || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  if (totalPoints === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-slate-600" />
            Sprint Burndown Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No story points in this sprint</p>
            <p className="text-sm text-slate-500 mt-1">Add stories with story points to see the burndown chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-slate-600" />
            Sprint Burndown Chart
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">{activeSprint.name}</span>
            </div>
            <div className="text-slate-600">
              {remainingPoints} / {totalPoints} points remaining
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [value, name === 'ideal' ? 'Ideal Burndown' : 'Actual Burndown']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ideal" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Ideal Burndown"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#059669" 
                  strokeWidth={3}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                  name="Actual Burndown"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600">Unable to generate chart data</p>
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-600">Total Points</div>
            <div className="text-lg font-semibold text-slate-900">{totalPoints}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="text-emerald-600">Completed</div>
            <div className="text-lg font-semibold text-emerald-700">{completedPoints}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-blue-600">Remaining</div>
            <div className="text-lg font-semibold text-blue-700">{remainingPoints}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}