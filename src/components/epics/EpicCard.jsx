import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Calendar, List, Building, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EpicCard({ epic, stories, onEdit, onAddStory, projectName, showProject }) {
  const completedStories = stories.filter(s => s.status === 'done');
  const progress = stories.length > 0 ? Math.round((completedStories.length / stories.length) * 100) : 0;
  
  const statusColors = {
    todo: "bg-slate-100 text-slate-700 border-slate-200",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    done: "bg-emerald-100 text-emerald-700 border-emerald-200",
    on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full">
        <div className="h-2" style={{ backgroundColor: epic.color }} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-slate-900">{epic.name}</h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                  <div className="absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="font-semibold mb-1">Epic Progress:</div>
                    <div className="space-y-1">
                      <p>• {stories.length} total stories</p>
                      <p>• {completedStories.length} completed</p>
                      <p>• {stories.length - completedStories.length} remaining</p>
                    </div>
                    {epic.end_date && (
                      <p className="mt-2 text-slate-300">Target: {format(new Date(epic.end_date), "MMM d, yyyy")}</p>
                    )}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                </div>
              </div>
              {showProject && projectName && (
                <div className="flex items-center gap-1 mb-2">
                  <Building className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">{projectName}</span>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(epic)}>Edit Epic</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddStory(epic)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story to Epic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-slate-700 line-clamp-2">{epic.description}</p>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <Badge variant="secondary" className={`${statusColors[epic.status]} border font-medium self-start`}>
            {epic.status.replace('_', ' ')}
          </Badge>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Progress</span>
              <span className="font-medium text-slate-900">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <List className="w-3 h-3" />
              <span>{stories.length} stories</span>
            </div>
            {epic.end_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Due {format(new Date(epic.end_date), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
          
          {stories.length === 0 ? (
            <div className="mt-auto p-3 bg-slate-50 rounded-lg text-center">
              <p className="text-xs text-slate-600 mb-2">No stories yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddStory(epic)}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add First Story
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddStory(epic)}
              className="mt-auto self-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}