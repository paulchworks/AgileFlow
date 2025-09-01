import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EpicHeader({ project, projects, onProjectChange, onAddEpic }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-slate-900">
              Epics
            </h1>
            <div className="group relative">
              <Info className="w-5 h-5 text-slate-500 hover:text-slate-700 cursor-help transition-colors" />
              <div className="absolute left-0 top-8 w-80 p-4 bg-slate-900 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="font-semibold mb-2">What are Epics?</div>
                <div className="space-y-2 text-xs">
                  <p>Epics are large features or initiatives that span multiple user stories.</p>
                  <p><strong>Use Epics for:</strong> Major features, product themes, or complex functionality that takes multiple sprints to complete.</p>
                  <p><strong>Don't use for:</strong> Bug fixes, small tasks, or single-story features.</p>
                </div>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>
            </div>
          </div>
          <p className="text-slate-700 text-lg mb-4">
            Organize large features and track progress across multiple user stories
          </p>
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

      <Alert className="mt-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Epic Guidelines:</strong> Create epics for large features that require multiple user stories (e.g., "User Authentication System", "Product Checkout Flow"). 
          Small tasks and bug fixes typically don't need epics.
        </AlertDescription>
      </Alert>

      {!project && projects.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 font-medium">
            Viewing epics from all projects. Select a specific project to create new epics.
          </p>
        </div>
      )}

      {projects.length === 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">
            No projects found. Create a project first to start managing epics.
          </p>
        </div>
      )}
    </div>
  );
}