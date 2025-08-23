import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, Edit, Folder } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCard({ project, stories, onEdit, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const completedStories = stories.filter(s => s.status === 'done');
  const progress = stories.length > 0 ? Math.round((completedStories.length / stories.length) * 100) : 0;
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 flex flex-col h-full bg-white">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 mb-2">
            <Link to={createPageUrl(`ProjectDetails?id=${project.id}`)} className="hover:underline">
              {project.name}
            </Link>
          </CardTitle>
          <Badge style={{ backgroundColor: `${project.color}20`, color: project.color, borderColor: `${project.color}50` }} className="border">
            {project.status}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
          <Edit className="w-4 h-4 text-slate-500" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-slate-800 mb-4 h-10 line-clamp-2">{project.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-medium text-slate-800">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center text-sm text-slate-800 border-t pt-4">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            <span>{stories.length} stories</span>
          </div>
          {project.end_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(project.end_date), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}