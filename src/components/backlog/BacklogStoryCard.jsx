
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreVertical,
  GripVertical,
  AlertTriangle,
  Flag,
  Users,
  Calendar,
  Target,
  CheckSquare
} from "lucide-react";
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

export default function BacklogStoryCard({ story, tasks, index, onEdit }) {
  const PriorityIcon = priorityIcons[story.priority] || Flag;

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };
  
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-all duration-200 border border-slate-200 bg-white group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <GripVertical className="w-4 h-4 text-slate-500 group-hover:text-slate-600 cursor-grab" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">{story.title}</h3>
                  {story.user_story && (
                    <p className="text-sm text-slate-700 italic mb-2">"{story.user_story}"</p>
                  )}
                  {story.description && (
                    <p className="text-sm text-slate-700 line-clamp-2">{story.description}</p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={onEdit}>
                      Edit Story
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={`${priorityColors[story.priority]} border font-medium`}
                  >
                    <PriorityIcon className="w-3 h-3 mr-1" />
                    {story.priority}
                  </Badge>

                  {story.story_points > 0 && (
                    <Badge variant="outline" className="font-medium">
                      <Target className="w-3 h-3 mr-1" />
                      {story.story_points} pts
                    </Badge>
                  )}
                  
                  {tasks.length > 0 && (
                    <Badge variant="outline" className="font-medium flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" />
                      {completedTasks}/{tasks.length}
                    </Badge>
                  )}

                  {story.epic && (
                    <Badge variant="outline" className="text-slate-700">
                      <Users className="w-3 h-3 mr-1" />
                      {story.epic}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {story.assignee && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Assigned to</span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gradient-to-r from-slate-600 to-slate-500 text-white">
                          {getInitials(story.assignee)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
