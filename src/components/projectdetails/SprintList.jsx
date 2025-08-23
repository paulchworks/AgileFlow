import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, Play, Edit, Users } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  planning: "bg-slate-100 text-slate-800 border-slate-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function SprintList({ 
  sprints, 
  stories, 
  onEditSprint, 
  onStartSprint, 
  projectId,
  isLoading 
}) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSprintProgress = (sprintId) => {
    const sprintStories = stories.filter(s => s.sprint_id === sprintId);
    const completedStories = sprintStories.filter(s => s.status === 'done');
    return sprintStories.length ? Math.round((completedStories.length / sprintStories.length) * 100) : 0;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Sprints</CardTitle>
      </CardHeader>
      <CardContent>
        {sprints.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-800 mb-4">No sprints created yet</p>
            <p className="text-sm text-slate-600">Create your first sprint to start organizing work</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sprints.map((sprint) => {
              const progress = getSprintProgress(sprint.id);
              const sprintStories = stories.filter(s => s.sprint_id === sprint.id);
              const daysRemaining = sprint.end_date ? 
                Math.max(0, differenceInDays(new Date(sprint.end_date), new Date())) : 0;

              return (
                <div 
                  key={sprint.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link 
                        to={createPageUrl(`SprintBoard?project=${projectId}&sprint=${sprint.id}`)}
                        className="text-lg font-semibold text-slate-900 hover:text-emerald-600 transition-colors duration-200"
                      >
                        {sprint.name}
                      </Link>
                      <p className="text-sm text-slate-800 mt-1">{sprint.goal}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${statusColors[sprint.status]} border text-xs font-medium`}
                      >
                        {sprint.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditSprint(sprint)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-800 mb-3">
                    {sprint.start_date && sprint.end_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(sprint.start_date), "MMM d")} - {format(new Date(sprint.end_date), "MMM d")}
                        </span>
                      </div>
                    )}
                    {sprint.status === 'active' && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>{daysRemaining} days remaining</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{sprintStories.length} stories</span>
                    </div>
                  </div>

                  {sprintStories.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-800">Progress</span>
                        <span className="font-medium text-slate-900">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Link 
                      to={createPageUrl(`SprintBoard?project=${projectId}`)}
                      className="inline-block"
                    >
                      <Button variant="outline" size="sm">
                        View Sprint Board
                      </Button>
                    </Link>
                    
                    {sprint.status === 'planning' && (
                      <Button
                        onClick={() => onStartSprint(sprint)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Sprint
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}