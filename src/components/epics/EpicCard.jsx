import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Calendar, List } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EpicCard({ epic, stories, onEdit }) {
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
            <h3 className="font-bold text-lg text-slate-900 mb-1">{epic.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(epic)}>Edit Epic</DropdownMenuItem>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}