import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Users, Target } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  planning: "bg-slate-100 text-slate-800 border-slate-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200", 
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  on_hold: "bg-amber-100 text-amber-800 border-amber-200"
};

export default function ProjectDetailHeader({ project, onCreateSprint }) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Projects")}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">{project.name}</h1>
            <Badge className={`${statusColors[project.status]} border font-medium`}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          
          {project.description && (
            <p className="text-slate-700 text-lg mb-2">{project.description}</p>
          )}
          
          <div className="flex items-center gap-6 text-slate-700">
            {project.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Started {format(new Date(project.start_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {project.team_lead && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Lead: {project.team_lead}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onCreateSprint}
        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Sprint
      </Button>
    </div>
  );
}