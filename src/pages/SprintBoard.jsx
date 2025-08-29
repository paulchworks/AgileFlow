import { formatDistanceToNow, formatDistance, format } from '@/lib/dates';

import React, { useState, useEffect } from "react";
import Project, { Sprint, Story, Task } from "@/api/entities";
const ProjectSvc = (typeof window !== 'undefined' && window.__AgileFlowProjectAPI) || Project;
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import SprintHeader from "../components/sprint/SprintHeader";
import KanbanColumn from "../components/sprint/KanbanColumn";
import StoryCard from "../components/sprint/StoryCard";
import StoryModal from "../components/sprint/StoryModal";
import SprintFilters from "../components/sprint/SprintFilters";

const STORY_STATUSES = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'in_review', title: 'In Review', color: 'bg-amber-100' },
  { id: 'done', title: 'Done', color: 'bg-emerald-100' }
];

export default function SprintBoard() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [filters, setFilters] = useState({ assignee: '', priority: '', search: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    const sprintId = urlParams.get('sprint');
    
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        const projectSprints = sprints.filter(s => s.project_id === projectId);
        
        if (sprintId) {
          // If specific sprint ID is provided, select that sprint
          const specificSprint = projectSprints.find(s => s.id === sprintId);
          if (specificSprint) {
            setSelectedSprint(specificSprint);
          }
        } else {
          // Otherwise, find the active sprint or the most recent one
          const activeSprint = projectSprints.find(s => s.status === 'active');
          if (activeSprint) {
            setSelectedSprint(activeSprint);
          } else if (projectSprints.length > 0) {
            setSelectedSprint(projectSprints[0]); // Fallback to the first available sprint
          }
        }
      }
    }
  }, [projects, sprints]);

  // Auto-select sprint when project is selected
  useEffect(() => {
    if (selectedProject && sprints.length > 0) {
      const projectSprints = sprints.filter(s => s.project_id === selectedProject.id);
      if (projectSprints.length > 0 && !selectedSprint) {
        // Try to find active sprint first, otherwise take the first one
        const activeSprint = projectSprints.find(s => s.status === 'active');
        setSelectedSprint(activeSprint || projectSprints[0]);
      }
    }
  }, [selectedProject, sprints, selectedSprint]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, sprintsData, storiesData, tasksData] = await Promise.all([
        Project.list(),
        Sprint.list(),
        Story.list(),
        Task.list()
      ]);
      setProjects(projectsData);
      setSprints(sprintsData);
      setStories(storiesData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading sprint board data:", error);
    }
    setIsLoading(false);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    const storyId = draggableId;
    const newStatus = destination.droppableId;
    
    try {
      await Story.update(storyId, { status: newStatus });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error updating story status:", error);
    }
  };

  const handleStorySubmit = async (storyData) => {
    try {
      console.log("Received story data for save:", storyData); // Debug log
      
      const dataToSave = {
        ...storyData,
        project_id: selectedProject?.id,
        // sprint_id is now part of storyData, status is handled in modal
      };

      console.log("Final data to save:", dataToSave); // Debug log

      if (editingStory) {
        console.log("Updating story with ID:", editingStory.id); // Debug log
        await Story.update(editingStory.id, dataToSave);
      } else {
        console.log("Creating new story"); // Debug log
        await Story.create(dataToSave);
      }
      
      setShowStoryModal(false);
      setEditingStory(null);
      await loadData(); // Make sure we wait for data to reload
    } catch (error) {
      console.error("Error saving story:", error);
      // Don't close modal if there's an error
    }
  };

  const filteredStories = stories.filter(story => {
    if (!selectedSprint || story.sprint_id !== selectedSprint.id) return false;
    
    const assigneeMatch = !filters.assignee || story.assignee === filters.assignee;
    const priorityMatch = !filters.priority || story.priority === filters.priority;
    const searchMatch = !filters.search || 
      story.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      story.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return assigneeMatch && priorityMatch && searchMatch;
  });

  const getStoriesByStatus = (status) => {
    return filteredStories.filter(story => story.status === status);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // Reset sprint selection to trigger auto-selection
    setSelectedSprint(null);
  };

  if (!selectedProject || !selectedSprint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Select a Sprint</h2>
          <p className="text-slate-600 mb-8">Choose a project and sprint to view the board</p>
          
          {!selectedProject ? (
            <div className="grid gap-4 max-w-md mx-auto">
              {projects.map(project => (
                <div key={Project.id} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                     onClick={() => handleProjectSelect(project)}>
                  <h3 className="font-semibold">{Project.name}</h3>
                  <p className="text-sm text-slate-600">{sprints.filter(s => s.project_id === Project.id).length} sprints</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Project: {selectedProject.name}</h3>
              <p className="text-slate-600 mb-8">No sprints available for this project</p>
              <Button onClick={() => setSelectedProject(null)} variant="outline">
                Choose Different Project
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const projectSprints = selectedProject 
    ? sprints.filter(s => s.project_id === selectedProject.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <SprintHeader 
        project={selectedProject}
        sprint={selectedSprint}
        projects={projects}
        sprints={sprints.filter(s => s.project_id === selectedProject.id)}
        onProjectChange={setSelectedProject}
        onSprintChange={setSelectedSprint}
        onAddStory={() => setShowStoryModal(true)}
      />

      <div className="p-6">
        <SprintFilters 
          stories={filteredStories}
          onFilterChange={setFilters}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {STORY_STATUSES.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                stories={getStoriesByStatus(status.id)}
                tasks={tasks}
                onEditStory={(story) => {
                  setEditingStory(story);
                  setShowStoryModal(true);
                }}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <AnimatePresence>
        {showStoryModal && (
          <StoryModal
            story={editingStory}
            selectedProject={selectedProject}
            onSubmit={handleStorySubmit}
            onClose={() => {
              setShowStoryModal(false);
              setEditingStory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
