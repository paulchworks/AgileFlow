
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Target, TrendingUp } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function SprintHeader({ 
  project, 
  sprint, 
  projects, 
  sprints, 
  onProjectChange, 
  onSprintChange, 
  onAddStory 
}) {
  const daysRemaining = sprint?.end_date ? 
    Math.max(0, differenceInDays(new Date(sprint.end_date), new Date())) : 0;

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Select 
                value={project?.id} 
                onValueChange={(value) => {
                  const selectedProject = projects.find(p => p.id === value);
                  onProjectChange(selectedProject);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(proj => (
                    <SelectItem key={proj.id} value={proj.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        />
                        {proj.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={sprint?.id} 
                onValueChange={(value) => {
                  const selectedSprint = sprints.find(s => s.id === value);
                  onSprintChange(selectedSprint);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select sprint..." />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map(spr => (
                    <SelectItem key={spr.id} value={spr.id}>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={spr.status === 'active' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {spr.status}
                        </Badge>
                        {spr.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sprint && (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{sprint.name}</h1>
                <p className="text-slate-800 mb-4">{sprint.goal}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-800">
                      {sprint.start_date && format(new Date(sprint.start_date), "MMM d")} - {sprint.end_date && format(new Date(sprint.end_date), "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-800">{daysRemaining} days remaining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-800">Capacity: {sprint.capacity} points</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={onAddStory}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Story
          </Button>
        </div>
      </div>
    </div>
  );
}
