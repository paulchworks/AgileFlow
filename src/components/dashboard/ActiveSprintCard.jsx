
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Target, ArrowRight, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActiveSprintCard({ sprints, stories, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSprint = sprints[0];

  if (!activeSprint) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Active Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-800 mb-4">No active sprint found</p>
            <Link to={createPageUrl("Projects")}>
              <Button variant="outline">Start a Sprint</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sprintStories = stories.filter(s => s.sprint_id === activeSprint.id);
  const completedStories = sprintStories.filter(s => s.status === 'done');
  const progressPercentage = sprintStories.length ? 
    Math.round((completedStories.length / sprintStories.length) * 100) : 0;

  const daysRemaining = activeSprint.end_date ? 
    differenceInDays(new Date(activeSprint.end_date), new Date()) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-2">
                Active Sprint
              </Badge>
              <h3 className="text-2xl font-bold">{activeSprint.name}</h3>
              <p className="text-emerald-100 mt-1">{activeSprint.goal}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{Math.max(0, daysRemaining)} days left</span>
              </div>
              {activeSprint.end_date && (
                <p className="text-emerald-100 text-sm">
                  Ends {format(new Date(activeSprint.end_date), "MMM d")}
                </p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-800">Sprint Progress</span>
              <span className="font-semibold text-slate-900">
                {completedStories.length} of {sprintStories.length} stories
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{sprintStories.filter(s => s.status === 'todo').length}</p>
                <p className="text-xs text-slate-700 uppercase tracking-wide">To Do</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{sprintStories.filter(s => s.status === 'in_progress').length}</p>
                <p className="text-xs text-slate-700 uppercase tracking-wide">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{completedStories.length}</p>
                <p className="text-xs text-slate-700 uppercase tracking-wide">Done</p>
              </div>
            </div>

            <Link to={createPageUrl("SprintBoard")} className="block">
              <Button className="w-full mt-4 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600">
                View Sprint Board
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
