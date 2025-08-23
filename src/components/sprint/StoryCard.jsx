
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, AlertTriangle, Flag, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200"
};

const priorityIcons = {
  low: Flag,
  medium: Flag,
  high: AlertTriangle,
  urgent: AlertTriangle
};

export default function StoryCard({ story, tasks, onEdit }) {
  const PriorityIcon = priorityIcons[story.priority] || Flag;
  
  const getInitials = (email) => {
    if (!email) return 'U';
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const completedTasks = tasks ? tasks.filter(t => t.status === 'done').length : 0;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-slate-900 text-sm leading-tight mb-2">
              {story.title}
            </h4>
            {story.description && (
              <p className="text-xs text-slate-700 line-clamp-2">
                {story.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                Edit Story
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${priorityColors[story.priority]} border text-xs font-medium`}
            >
              <PriorityIcon className="w-3 h-3 mr-1" />
              {story.priority}
            </Badge>
            
            {story.story_points > 0 && (
              <Badge variant="outline" className="text-xs font-medium">
                {story.story_points} pts
              </Badge>
            )}

            {tasks && tasks.length > 0 && (
              <Badge variant="outline" className="text-xs font-medium flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {completedTasks}/{tasks.length}
              </Badge>
            )}
          </div>

          {story.assignee && (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-gradient-to-r from-slate-600 to-slate-500 text-white">
                {getInitials(story.assignee)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {story.epic && (
          <div className="mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Users className="w-3 h-3" />
              <span className="truncate">{story.epic}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
