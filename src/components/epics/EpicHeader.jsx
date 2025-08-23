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
            value={project?.id || ""}
            onValueChange={(value) => {
              const selected = projects.find(p => p.id === value);
              onProjectChange(selected);
            }}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={onAddEpic}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Epic
        </Button>
      </div>
    </div>
  );
}