import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function SprintFilters({ stories, onFilterChange }) {
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('');

  const uniqueAssignees = [...new Set(stories.map(s => s.assignee).filter(Boolean))];

  const handleFilterChange = (type, value) => {
    const newFilters = { search, assignee, priority };
    newFilters[type] = value;
    
    setSearch(newFilters.search);
    setAssignee(newFilters.assignee);
    setPriority(newFilters.priority);
    
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-slate-200/80">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-1 flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Filter Stories</h3>
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

        <Select value={assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by assignee..." />
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

        <Select value={priority} onValueChange={(value) => handleFilterChange('priority', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}