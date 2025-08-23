
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectOverview({ projects, stories, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProjectProgress = (projectId) => {
    const projectStories = stories.filter(s => s.project_id === projectId);
    const completedStories = projectStories.filter(s => s.status === 'done');
    return projectStories.length ? Math.round((completedStories.length / projectStories.length) * 100) : 0;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-900">Active Projects</CardTitle>
        <Link to={createPageUrl("Projects")}>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-800 mb-4">No active projects</p>
            <Link to={createPageUrl("Projects")}>
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.slice(0, 3).map((project) => {
              const progress = getProjectProgress(project.id);
              const projectStories = stories.filter(s => s.project_id === project.id);
              
              return (
                <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{project.name}</h4>
                      <p className="text-sm text-slate-800 mt-1">{project.description}</p>
                    </div>
                    <Badge 
                      style={{ backgroundColor: `${project.color}20`, color: project.color, borderColor: `${project.color}50` }}
                      className="border"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-800 mb-3">
                    {project.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due {format(new Date(project.end_date), "MMM d")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{projectStories.length} stories</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-800">Progress</span>
                      <span className="font-medium text-slate-900">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
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
