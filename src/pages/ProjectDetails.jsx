import React, { useState, useEffect } from "react";
import { Project, Sprint, Story, Issue, User } from "@/api/entities";
import { Link, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import ProjectDetailHeader from "../components/projectdetails/ProjectDetailHeader";
import ProjectMetrics from "../components/projectdetails/ProjectMetrics";
import BurndownChart from "../components/projectdetails/BurndownChart";
import SprintList from "../components/projectdetails/SprintList";
import TeamContributions from "../components/projectdetails/TeamContributions";
import ProjectActivityFeed from "../components/projectdetails/ProjectActivityFeed";
import SprintForm from "../components/projectdetails/SprintForm";

export default function ProjectDetails() {
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  
  const { id } = useParams();

  useEffect(() => {
    // Get project ID from URL params or query string
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = id || urlParams.get('id');
    
    if (projectId) {
      loadData(projectId);
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const loadData = async (projectId) => {
    setIsLoading(true);
    try {
      const [projectData, sprintsData, storiesData, issuesData, usersData] = await Promise.all([
        Project.list(),
        Sprint.filter({ project_id: projectId }),
        Story.filter({ project_id: projectId }),
        Issue.filter({ project_id: projectId }),
        User.list()
      ]);
      
      const foundProject = projectData.find(p => p.id === projectId);
      setProject(foundProject);
      setSprints(sprintsData);
      setStories(storiesData);
      setIssues(issuesData);
      setUsers(usersData.length > 0 ? usersData : [{ email: 'demo@user.com', full_name: 'Demo User' }]);
    } catch (error) {
      console.error("Error loading project details:", error);
    }
    setIsLoading(false);
  };

  const handleSprintSubmit = async (sprintData) => {
    try {
      const dataToSave = { ...sprintData, project_id: project.id };
      if (editingSprint) {
        await Sprint.update(editingSprint.id, dataToSave);
      } else {
        await Sprint.create(dataToSave);
      }
      setShowSprintForm(false);
      setEditingSprint(null);
      // Reload data
      loadData(project.id);
    } catch (error) {
      console.error("Error saving sprint:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Project Not Found</h2>
          <p className="text-slate-600 mb-8">The project you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl("Projects")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectSprints = sprints.filter(s => s.project_id === project.id);
  const projectStories = stories.filter(s => s.project_id === project.id);
  const projectIssues = issues.filter(i => i.project_id === project.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <ProjectDetailHeader 
        project={project}
        onCreateSprint={() => {
          setEditingSprint(null);
          setShowSprintForm(true);
        }}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <ProjectMetrics 
          project={project}
          sprints={projectSprints}
          stories={projectStories}
          issues={projectIssues}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BurndownChart 
              sprints={projectSprints}
              stories={projectStories}
            />
            
            <SprintList 
              sprints={projectSprints}
              stories={projectStories}
              onEditSprint={(sprint) => {
                setEditingSprint(sprint);
                setShowSprintForm(true);
              }}
            />
          </div>

          <div className="space-y-8">
            <TeamContributions 
              stories={projectStories}
              users={users}
            />
            
            <ProjectActivityFeed 
              stories={projectStories}
              issues={projectIssues}
            />
          </div>
        </div>
      </div>

      {showSprintForm && (
        <SprintForm
          sprint={editingSprint}
          onSubmit={handleSprintSubmit}
          onClose={() => {
            setShowSprintForm(false);
            setEditingSprint(null);
          }}
        />
      )}
    </div>
  );
}