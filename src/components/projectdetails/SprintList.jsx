
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, Edit, Play, Pause, CheckCircle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const statusColors = {
  planning: "bg-slate-100 text-slate-800 border-slate-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200"
};

const storyStatusColors = {
  todo: "bg-slate-100 text-slate-800",
  in_progress: "bg-blue-100 text-blue-800",
  in_review: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  backlog: "bg-gray-100 text-gray-800"
};

export default function SprintList({ sprints, stories, onEditSprint }) {
  const [expandedSprintId, setExpandedSprintId] = useState(null);

  const getSprintProgress = (sprint) => {
    const sprintStories = stories.filter(s => s.sprint_id === sprint.id);
    const completedStories = sprintStories.filter(s => s.status === 'done');
    return sprintStories.length ? Math.round((completedStories.length / sprintStories.length) * 100) : 0;
  };

  const getSprintStats = (sprint) => {
    const sprintStories = stories.filter(s => s.sprint_id === sprint.id);
    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.story_points || 0), 0);
    const completedPoints = sprintStories
      .filter(s => s.status === 'done')
      .reduce((sum, s) => sum + (s.story_points || 0), 0);
    
    return {
      totalStories: sprintStories.length,
      completedStories: sprintStories.filter(s => s.status === 'done').length,
      totalPoints,
      completedPoints
    };
  };

  const handleStatusChange = async (sprint, newStatus) => {
    try {
      // This is a simplified way to reload. A more advanced implementation
      // would re-fetch data without a full page reload.
      const { Sprint } = await import("@/api/entities");
      const { updateProjectStatus } = await import("@/components/utils/projectStatusUpdater");
      
      await Sprint.update(sprint.id, { ...sprint, status: newStatus });
      
      // Update project status after sprint status changes
      await updateProjectStatus(sprint.project_id);
      
      window.location.reload();
    } catch (error) {
      console.error("Error updating sprint status:", error);
    }
  };

  const handleToggleExpand = (sprintId) => {
    setExpandedSprintId(prevId => (prevId === sprintId ? null : sprintId));
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    const nameParts = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').split(' ');
    return nameParts.map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (sprints.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Sprint List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No sprints created yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first sprint to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          Sprint List ({sprints.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const progress = getSprintProgress(sprint);
            const stats = getSprintStats(sprint);
            const daysRemaining = sprint.end_date ? 
              Math.max(0, differenceInDays(new Date(sprint.end_date), new Date())) : 0;
            const sprintStories = stories.filter(s => s.sprint_id === sprint.id);

            return (
              <div key={sprint.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{sprint.name}</h4>
                      <Badge className={`${statusColors[sprint.status]} border text-xs font-medium`}>
                        {sprint.status}
                      </Badge>
                    </div>
                    {sprint.goal && (
                      <p className="text-sm text-slate-700 mb-2">{sprint.goal}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSprint(sprint)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    {sprint.status === 'planning' && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleStatusChange(sprint, 'active')}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Sprint
                      </Button>
                    )}
                    {sprint.status === 'active' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(sprint, 'completed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress ({stats.completedPoints}/{stats.totalPoints} pts)</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{stats.totalStories} stories</span>
                    </div>
                    {sprint.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{daysRemaining} days left</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <Link to={createPageUrl(`SprintBoard?project_id=${sprint.project_id}&sprint=${sprint.id}`)}>
                    <Button variant="outline" size="sm">
                      View on Board <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleExpand(sprint.id)}
                    disabled={sprintStories.length === 0}
                  >
                    {sprintStories.length > 0 ? (sprintStories.length === 1 ? "1 Story" : `${sprintStories.length} Stories`) : "No Stories"}
                    {expandedSprintId === sprint.id ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {expandedSprintId === sprint.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        {sprintStories.map(story => (
                          <div key={story.id} className="flex items-center justify-between p-3 rounded-md bg-slate-50/70 border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-800 truncate">{story.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={`${storyStatusColors[story.status]} text-xs font-medium`}>{story.status.replace('_', ' ')}</Badge>
                                <Badge variant="outline" className="text-xs">{story.story_points || 0} pts</Badge>
                              </div>
                            </div>
                            {story.assignee && (
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-slate-500 hidden sm:inline">{story.assignee.split('@')[0]}</span>
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="text-xs bg-slate-200 text-slate-700 font-medium">
                                    {getInitials(story.assignee)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
