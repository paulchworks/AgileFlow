
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, List, Target, Folder } from "lucide-react";

export default function BacklogHeader({ 
  project, 
  projects, 
  onProjectChange, 
  onAddStory, 
  totalStories, 
  totalPoints 
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Product Backlog
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Select 
              value={project?.id || "all"} 
              onValueChange={(value) => {
                if (value === "all") {
                  onProjectChange(null);
                } else {
                  const selectedProject = projects.find(p => p.id === value);
                  onProjectChange(selectedProject);
                }
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.length === 0 ? (
                  <SelectItem value={null} disabled>No projects available</SelectItem>
                ) : (
                  projects.map(proj => (
                    <SelectItem key={proj.id} value={proj.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        />
                        {proj.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Badge variant="outline" className="flex items-center gap-1 font-medium">
                <List className="w-3 h-3" />
                {totalStories} stories
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 font-medium">
                <Target className="w-3 h-3" />
                {totalPoints} points
              </Badge>
            </div>
          </div>
        </div>

        <Button 
          onClick={onAddStory}
          disabled={!project}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Story
        </Button>
      </div>

      {projects.length === 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">No Projects Found</span>
          </div>
          <p className="text-amber-700 mt-1">Create a project first to start managing your product backlog.</p>
        </div>
      )}
    </div>
  );
}
