
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Search } from "lucide-react";

export default function TeamFilters({ onFilterChange }) {
  const [type, setType] = useState('all');
  const [skill, setSkill] = useState('');

  const handleTypeChange = (value) => {
    setType(value);
    onFilterChange({ type: value, skill });
  };

  const handleSkillChange = (e) => {
    const newSkill = e.target.value;
    setSkill(newSkill);
    onFilterChange({ type, skill: newSkill });
  };

  return (
    <div className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-slate-200/80">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
          </div>
        </div>
        <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
          <div>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="internal">Internal Team</SelectItem>
                <SelectItem value="external">External Consultants</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Filter by skill..."
                value={skill}
                onChange={handleSkillChange}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
