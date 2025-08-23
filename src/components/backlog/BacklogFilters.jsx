import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function BacklogFilters({ stories, onFilterChange }) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [epic, setEpic] = useState('');
  const [assignee, setAssignee] = useState('');

  const uniqueEpics = [...new Set(stories.map(s => s.epic).filter(Boolean))];
  const uniqueAssignees = [...new Set(stories.map(s => s.assignee).filter(Boolean))];

  const handleFilterChange = (type, value) => {
    const newFilters = { search, priority, epic, assignee };
    newFilters[type] = value;
    
    setSearch(newFilters.search);
    setPriority(newFilters.priority);
    setEpic(newFilters.epic);
    setAssignee(newFilters.assignee);
    
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-slate-200/80">
      <div className="grid md:grid-cols-5 gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Filter & Search</h3>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={priority} onValueChange={(value) => handleFilterChange('priority', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={epic} onValueChange={(value) => handleFilterChange('epic', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Epic..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Epics</SelectItem>
            {uniqueEpics.map(epicName => (
              <SelectItem key={epicName} value={epicName}>
                {epicName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Assignee..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Assignees</SelectItem>
            {uniqueAssignees.map(email => (
              <SelectItem key={email} value={email}>
                {email.split('@')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}