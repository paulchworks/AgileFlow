import React, { useState, useEffect } from "react";
import Project, { Story } from "@/api/entities";
const ProjectSvc = (typeof window !== 'undefined' && window.__AgileFlowProjectAPI) || Project;
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectStats from "../components/projects/ProjectStats";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, storiesData] = await Promise.all([
        ProjectSvc.list("-created_date"),
        Story.list()
      ]);
      setProjects(projectsData);
      setStories(storiesData);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (projectData) => {
    try {
      if (editingProject) {
        await ProjectSvc.update(editingProjectSvc.id, projectData);
      } else {
        await ProjectSvc.create(projectData);
      }
      setShowForm(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Projects
            </h1>
            <p className="text-slate-700 text-lg">Manage your agile projects and track progress</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </motion.div>

        <ProjectStats projects={projects} stories={stories} isLoading={isLoading} />

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <ProjectForm
              project={editingProject}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={ProjectSvc.id}
              project={project}
              stories={stories.filter(s => s.project_id === ProjectSvc.id)}
              onEdit={handleEdit}
              isLoading={isLoading}
            />
          ))}
        </div>

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">No Projects Yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first ProjectSvc.</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
