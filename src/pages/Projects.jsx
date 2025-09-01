import { formatDistanceToNow, formatDistance, format } from '@/lib/dates';
import React, { useState, useEffect } from "react";
import Project, { Story } from "@/api/entities";
const ProjectSvc = (typeof window !== 'undefined' && window.__AgileFlowProjectAPI) || Project;
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectStats from "../components/projects/ProjectStats";
import DeleteProjectDialog from "../components/projects/DeleteProjectDialog";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, storiesData] = await Promise.all([
        Project.list("-created_date"),
        Story.list()
      ]);
      setProjects(projectsData);
      setStories(storiesData);
      console.log("Loaded projects:", projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (projectData) => {
    try {
      if (editingProject) {
        await Project.update(editingProject.id, projectData);
        await ActivityLogger.logProjectUpdated(editingProject, projectData);
        toast.success("Project updated successfully!");
        return { ...editingProject, ...projectData }; // Return the updated project data
      } else {
        const newProjectResult = await Project.create(projectData);
        const newProject = { ...projectData, id: newProjectResult.id }; // Combine form data with new ID
        await ActivityLogger.logProjectCreated(newProject);
        toast.success("Project created successfully!");
        return newProject; // Return the full new project data
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error(`Failed to save project: ${error.message || 'Unknown error'}`);
      throw error; // Re-throw so form shows error
    } finally {
      setShowForm(false);
      setEditingProject(null);
      await loadData();
    }
  };

  const handleEdit = (project) => {
    console.log("Editing project:", project);
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCancel = () => {
    console.log("Canceling project edit");
    setShowForm(false);
    setEditingProject(null);
  };

    const handleDelete = (project) => {
    console.log("Initiating delete for project:", project);
    setDeletingProject(project);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    
    try {
      console.log("Deleting project:", deletingProject);
      await Project.delete(deletingProject.id);
      toast.success(`Project "${deletingProject.name}" deleted successfully`);
      
      setDeletingProject(null);
      await loadData(); // Reload data after deletion
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setDeletingProject(null);
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
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
            }}
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
              key={project.id}
              project={project}
              stories={stories.filter(s => s.project_id === project.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          ))}
        </div>

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">No Projects Yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first Project</p>
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

      <DeleteProjectDialog
        project={deletingProject}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isOpen={!!deletingProject}
      />
    </div>
  );
}
