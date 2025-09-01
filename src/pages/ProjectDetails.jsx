import { formatDistanceToNow, formatDistance, format } from '@/lib/dates';

import React, { useState, useEffect } from "react";
import Project, { Sprint, Story, Issue, User } from "@/api/entities";
const ProjectSvc = (typeof window !== 'undefined' && window.__AgileFlowProjectAPI) || Project;
import { Link, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityLogger } from "../components/utils/activityLogger";

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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get("id");

      if (!projectId) {
        setProject(null);
        setIsLoading(false);
        return;
      }

      const [projectData, sprintsData, storiesData, issuesData, usersData] = await Promise.all([
        Project.list().then(p => p.find(proj => proj.id === projectId)),
        Sprint.filter({ project_id: projectId }),
        Story.filter({ project_id: projectId }),
        Issue.filter({ project_id: projectId }),
        User.list(),
      ]);
      
      setProject(projectData);
      setSprints(sprintsData.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)));
      setStories(storiesData);
      setIssues(issuesData);
      setUsers(usersData);

    } catch (error) {
      console.error("Failed to load project details:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSprint = () => {
    console.log("Add sprint button clicked");
    setEditingSprint(null);
    setShowSprintForm(true);
  };

  const handleEditSprint = (sprint) => {
    console.log("Edit sprint button clicked for:", sprint);
    setEditingSprint(sprint);
    setShowSprintForm(true);
  };

  const handleSprintSubmit = async (sprintData) => {
    try {
      console.log("Sprint form submitted:", sprintData);
      
      if (editingSprint) {
        const updatedSprint = await Sprint.update(editingSprint.id, sprintData);
        console.log("Sprint updated:", editingSprint.id);
        await ActivityLogger.logSprintUpdated(editingSprint, sprintData);
      } else {
        const newSprint = await Sprint.create({ ...sprintData, project_id: project.id });
        console.log("Sprint created:", newSprint);
        await ActivityLogger.logSprintCreated({ ...sprintData, id: newSprint.id });
      }
      
      setShowSprintForm(false);
      setEditingSprint(null);
      await loadData(); // Reload data to show new/updated sprint
    } catch (error) {
      console.error("Error saving sprint:", error);
    }
  };

  const handleSprintCancel = () => {
    console.log("Sprint form cancelled");
    setShowSprintForm(false);
    setEditingSprint(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <ProjectDetailHeader project={project} onCreateSprint={handleAddSprint} />
        <ProjectMetrics sprints={sprints} stories={stories} issues={issues} />
        
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <BurndownChart sprints={sprints} stories={stories} />
          </div>
          <div>
            <TeamContributions stories={stories} users={users} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SprintList 
              sprints={sprints} 
              project={project}
              onAddSprint={handleAddSprint}
              onEditSprint={handleEditSprint}
            />
          </div>
          <div>
            <ProjectActivityFeed stories={stories} issues={issues} />
          </div>
        </div>

        <AnimatePresence>
          {showSprintForm && (
            <SprintForm
              sprint={editingSprint}
              project={project}
              onSubmit={handleSprintSubmit}
              onCancel={() => {
                setShowSprintForm(false);
                setEditingSprint(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
