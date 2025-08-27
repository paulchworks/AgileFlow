import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Users, Target } from "lucide-react";
import { format } from "date-fns";

export default function ProjectDetailHeader({ project, onCreateSprint }) {
  const statusColors = {
    planning: "bg-slate-100 text-slate-800 border-slate-200",
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    on_hold: "bg-amber-100 text-amber-800 border-amber-200"
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-start gap-4">
            <Link to={createPageUrl("Projects")}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                <Badge className={`${statusColors[project.status]} border text-sm font-medium`}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {project.description && (
                <p className="text-slate-700 text-lg mb-3">{project.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                {project.team_lead && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Lead: {project.team_lead}</span>
                  </div>
                )}
                {project.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Started: {format(new Date(project.start_date), "MMM d, yyyy")}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>Due: {format(new Date(project.end_date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onCreateSprint}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Sprint
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}