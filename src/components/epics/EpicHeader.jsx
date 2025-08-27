import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function EpicHeader({ project, projects, onProjectChange, onAddEpic }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Epics
          </h1>
          <Select
            value={project?.id || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onProjectChange(null);
              } else {
                const selected = projects.find(p => p.id === value);
                onProjectChange(selected);
              }
            }}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Epics</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={onAddEpic}
          disabled={!project}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Epic
        </Button>
      </div>

      {!project && projects.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">
            Viewing epics from all projects. Select a specific project to create new epics.
          </p>
        </div>
      )}

      {projects.length === 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 font-medium">
            No projects found. Create a project first to start managing epics.
          </p>
        </div>
      )}
    </div>
  );
}