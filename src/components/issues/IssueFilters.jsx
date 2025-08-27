import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const issueTypes = ["bug", "task", "improvement"];
const statuses = ["backlog", "todo", "in_progress", "in_review", "done", "wont_fix"];
const priorities = ["low", "medium", "high", "urgent"];

export default function IssueFilters({ filters, onFilterChange, projects }) {
  const handleFilter = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
      <div className="relative col-span-2 lg:col-span-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <Input
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => handleFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={filters.project_id || 'all'} onValueChange={(v) => handleFilter('project_id', v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
        <SelectTrigger>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map(status => (
            <SelectItem key={status} value={status} className="capitalize">
              {status.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filters.priority || 'all'} onValueChange={(v) => handleFilter('priority', v)}>
        <SelectTrigger>
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {priorities.map(priority => (
            <SelectItem key={priority} value={priority} className="capitalize">
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={filters.issue_type || 'all'} onValueChange={(v) => handleFilter('issue_type', v)}>
        <SelectTrigger>
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {issueTypes.map(type => (
            <SelectItem key={type} value={type} className="capitalize">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}