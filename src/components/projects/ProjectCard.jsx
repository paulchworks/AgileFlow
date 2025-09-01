import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, ListChecks, Calendar, Edit, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  planning: "bg-slate-100 text-slate-800 border-slate-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  on_hold: "bg-amber-100 text-amber-800 border-amber-200"
};

export default function ProjectCard({ project, stories, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-2 w-full mt-4" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    );
  }

  const progress = stories.length > 0 ? 
    Math.round((stories.filter(s => s.status === 'done').length / stories.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 flex flex-col flex-grow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <Link 
              to={createPageUrl(`ProjectDetails?id=${project.id}`)}
              className="group flex-1"
            >
              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {project.name}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors[project.status]} border text-xs font-medium`}>
                {project.status.replace('_', ' ')}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(project)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {project.description && (
            <p className="text-sm text-slate-700 pt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="flex items-center justify-between text-sm text-slate-800 mb-2">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="mt-4 space-y-2 text-sm text-slate-800">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-slate-600" />
              <span>{stories.length} stories</span>
            </div>
            {project.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span>Due {format(new Date(project.end_date), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50/50 p-4 flex justify-end">
          <Link to={createPageUrl(`Backlog?project_id=${project.id}`)}>
            <Button variant="outline" size="sm">
              View Backlog
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}