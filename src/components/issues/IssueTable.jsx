import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Bug, ClipboardList, ArrowUp, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toValidDate, formatDateTime } from '@/utils/date';

// pick the best timestamp a row has
const pickIssueTs = (issue) =>
  issue?.updated_date ??
  issue?.updatedAt ??
  issue?.updated_at ??
  issue?.last_activity_at ??
  issue?.createdAt ??
  issue?.created_at ??
  issue?.dueDate ??
  issue?.due_date ??
  null;

const timeAgo = (input) => {
  const d = toValidDate(input);
  if (!d) return '—';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
};

// Robust initial extractor
const _toStringVal = (x) => {
  if (x == null) return '';
  if (typeof x === 'string' || typeof x === 'number') return String(x);
  if (Array.isArray(x)) return _toStringVal(x[0]);
  if (typeof x === 'object') {
    const cand = x.name ?? x.displayName ?? x.fullName ?? x.username ?? x.email ?? x.assignee ?? '';
    return typeof cand === 'string' ? cand : '';
  }
  return String(x);
};

export const getInitial = (val, fallback = 'U') => {
  const raw = _toStringVal(val).trim();
  if (!raw) return fallback;

  // Strip email domain if it's an email
  const base = raw.includes('@') ? raw.split('@')[0] : raw;

  // First token (first word) then first Unicode char (works for emoji)
  const firstToken = base.split(/\s+/)[0];
  const firstChar = Array.from(firstToken)[0] ?? '';
  return firstChar ? firstChar.toUpperCase() : fallback;
};


const asArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

const priorityColors = {
  high: "text-red-600",
  urgent: "text-red-800", 
  medium: "text-amber-600",
  low: "text-slate-700"
};

const typeIcons = {
  bug: Bug,
  task: ClipboardList,
  improvement: ArrowUp
};

const statusColors = {
  backlog: "bg-gray-100 text-gray-800",
  todo: "bg-slate-100 text-slate-800",
  in_progress: "bg-blue-100 text-blue-800",
  in_review: "bg-purple-100 text-purple-800",
  done: "bg-emerald-100 text-emerald-800",
  wont_fix: "bg-pink-100 text-pink-800"
};

export default function IssueTable({ issues, onEdit, isLoading, users, projects = [] }) {
  const getUser = (email) => {
    return users.find(u => u.email === email);
  };

  const getProject = (projectId) => {
    return projects.find(p => p.id === projectId);
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white shadow-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.length > 0 ? issues.map(issue => {
            const assignee = getUser(issue.assignee);
            const project = getProject(issue.project_id);
            const TypeIcon = typeIcons[issue.issue_type] || AlertTriangle;
            
            return (
              <TableRow 
                key={issue.id} 
                onClick={() => onEdit(issue)} 
                className="cursor-pointer hover:bg-slate-50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <TypeIcon className={`w-4 h-4 flex-shrink-0 ${
                      issue.issue_type === 'bug' ? 'text-red-500' : 'text-slate-600'
                    }`} />
                    <span className="text-slate-900">{issue.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-slate-800 font-medium">
                    {project ? project.name : 'Unknown Project'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[issue.status]}>
                    {issue.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell className={`capitalize font-medium ${priorityColors[issue.priority]}`}>
                  {issue.priority}
                </TableCell>
                <TableCell>
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitial(assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-slate-800">{assignee.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-slate-700">
                  {(() => {
                    const ts = pickIssueTs(issue);
                    return toValidDate(ts) ? timeAgo(ts) : formatDateTime(ts);
                    })()}
                </TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-slate-700">
                No issues found for the selected criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}