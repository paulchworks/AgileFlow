
import React, { useState, useEffect } from "react";
import { Project, Sprint, Story, Issue, User } from "@/api/entities";
import { useParams, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
    // In a routed app, the ID comes from useParams.
    // We check if it exists before trying to load data.
    if (id) {
      loadData(id);
    } else {
      // Fallback for cases where ID might be in query params
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('id');
      if (projectId) {
        loadData(projectId);
      }
    }
  }, [id]);

  const loadData = async (projectId) => {
    setIsLoading(true);
    try {
      const [
        projectData,
        sprintsData,
        storiesData,
        issuesData,
        usersData,
      ] = await Promise.all([
        Project.get(projectId),
        Sprint.filter({ project_id: projectId }, "-created_date"), // Filter sprints and sort by created_date
        Story.filter({ project_id: projectId }),
        Issue.filter({ project_id: projectId }),
        User.list(),
      ]);

      setProject(projectData);
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
      if (editingSprint) {
        await Sprint.update(editingSprint.id, sprintData);
      } else {
        await Sprint.create({ ...sprintData, project_id: project.id });
      }
      setShowSprintForm(false);
      setEditingSprint(null);
      await loadData(project.id);
    } catch (error) {
      console.error("Error saving sprint:", error);
    }
  };

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setShowSprintForm(true);
  };
  
  const handleStartSprint = async (sprint) => {
    try {
      // Ensure no other sprint is active for this project
      const activeSprints = sprints.filter(s => s.status === 'active');
      for (const activeSprint of activeSprints) {
        // Only update if it's a different sprint to avoid unnecessary updates
        if (activeSprint.id !== sprint.id) {
          await Sprint.update(activeSprint.id, { status: 'completed' });
        }
      }
      
      await Sprint.update(sprint.id, { status: 'active' });
      await loadData(project.id);
    } catch (error) {
      console.error("Error starting sprint:", error);
    }
  };


  if (isLoading) {
    return <div className="p-6">Loading project details...</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found.</div>;
  }

  const activeSprint = sprints.find(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={createPageUrl("Projects")} className="inline-block mb-6">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Projects
            </Button>
          </Link>

          <ProjectDetailHeader 
            project={project}
            onAddSprint={() => { setEditingSprint(null); setShowSprintForm(true); }}
          />
        </motion.div>
        
        <AnimatePresence>
          {showSprintForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="mt-8"
            >
              <SprintForm
                sprint={editingSprint}
                onSubmit={handleSprintSubmit}
                onCancel={() => { setShowSprintForm(false); setEditingSprint(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <ProjectMetrics stories={stories} issues={issues} sprints={sprints} isLoading={isLoading} />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <BurndownChart sprint={activeSprint} stories={stories.filter(s => s.sprint_id === activeSprint?.id)} />
          </div>
          <div className="lg:col-span-1">
            <SprintList 
              sprints={sprints} 
              onEdit={handleEditSprint}
              onStart={handleStartSprint}
            />
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TeamContributions stories={stories} users={users} />
          </div>
          <div className="lg:col-span-1">
            <ProjectActivityFeed stories={stories} issues={issues} />
          </div>
        </div>
      </div>
    </div>
  );
}
