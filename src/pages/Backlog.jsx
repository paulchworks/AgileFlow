
import React, { useState, useEffect, useCallback } from "react";
import { Project, Story, Task, Sprint } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import BacklogHeader from "../components/backlog/BacklogHeader";
import BacklogFilters from "../components/backlog/BacklogFilters";
import BacklogStoryCard from "../components/backlog/BacklogStoryCard";
import StoryModal from "../components/sprint/StoryModal";

export default function Backlog() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // null now means All Projects
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [filters, setFilters] = useState({ priority: '', epic: '', assignee: '', search: '' });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsData, storiesData, tasksData, sprintsData] = await Promise.all([
        Project.list(),
        Story.list("-created_date"),
        Task.list(),
        Sprint.list()
      ]);
      
      setProjects(projectsData);
      setStories(storiesData);
      setTasks(tasksData);
      setSprints(sprintsData);
      
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('project_id');
      if (projectId) {
          const project = projectsData.find(p => p.id === projectId);
          setSelectedProject(project || null); // If project not found, default to null (All Projects)
      } else {
        setSelectedProject(null); // Default to All Projects view
      }

    } catch (error) {
      console.error("Error loading backlog data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStorySubmit = async (storyData) => {
    try {
      console.log("Received story data for save in backlog:", storyData);
      
      const dataToSave = {
        ...storyData,
        // If selectedProject is null (All Projects view), project_id will be undefined.
        // The StoryModal should handle forcing project selection in this case.
        project_id: selectedProject?.id, 
        status: storyData.sprint_id ? 'todo' : 'backlog'
      };

      console.log("Final backlog data to save:", dataToSave);

      if (editingStory) {
        await Story.update(editingStory.id, dataToSave);
      } else {
        await Story.create(dataToSave);
      }
      
      setShowStoryModal(false);
      setEditingStory(null);
      loadData();
    } catch (error) {
      console.error("Error saving story:", error);
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) return;

    // For reordering within backlog - you can implement this later
    console.log("Reordering stories - feature can be implemented");
  };

  // Filter stories for the backlog (no sprint assigned)
  const filteredStories = stories.filter(story => {
    // Project filter: if a specific project is selected, filter by its ID.
    // If selectedProject is null (All Projects view), this filter is skipped.
    if (selectedProject && story.project_id !== selectedProject.id) return false;
    
    // Backlog filter (only stories not in a sprint)
    if (story.sprint_id) return false;

    const priorityMatch = !filters.priority || story.priority === filters.priority;
    const epicMatch = !filters.epic || story.epic_id === filters.epic;
    const assigneeMatch = !filters.assignee || story.assignee === filters.assignee;
    const searchMatch = !filters.search || 
      story.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      story.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return priorityMatch && epicMatch && assigneeMatch && searchMatch;
  });

  const projectSprints = selectedProject 
    ? sprints.filter(s => s.project_id === selectedProject.id)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-16 bg-slate-200 rounded mb-6"></div>
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <BacklogHeader 
          project={selectedProject}
          projects={projects}
          onProjectChange={setSelectedProject}
          onAddStory={() => setShowStoryModal(true)}
          totalStories={filteredStories.length}
          totalPoints={filteredStories.reduce((sum, s) => sum + (s.story_points || 0), 0)}
        />

        <BacklogFilters 
          stories={filteredStories}
          onFilterChange={setFilters}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="backlog">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg p-2' : ''
                }`}
              >
                <AnimatePresence>
                  {filteredStories.map((story, index) => (
                    <Draggable key={story.id} draggableId={story.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-all duration-200 ${
                            snapshot.isDragging ? 'rotate-1 shadow-2xl z-50' : ''
                          }`}
                        >
                          <BacklogStoryCard
                            story={story}
                            tasks={tasks.filter(t => t.story_id === story.id)}
                            index={index}
                            onEdit={() => {
                              setEditingStory(story);
                              setShowStoryModal(true);
                            }}
                            projects={projects} // Pass all projects for display purposes
                            showProject={!selectedProject} // Show project name if "All Projects" view is active
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
                
                {filteredStories.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h3 className="text-xl font-semibold text-slate-800 mb-4">
                        {selectedProject 
                          ? `No stories in the backlog for "${selectedProject.name}"`
                          : "No stories found in the backlog across all projects"
                        }
                      </h3>
                      {selectedProject ? (
                        <>
                          <p className="text-slate-600 mb-6">Start by creating your first user story for this project.</p>
                          <Button 
                            onClick={() => setShowStoryModal(true)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Story
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-600 mb-6">
                            To create a new story, please select a specific project from the dropdown above.
                          </p>
                          <Button 
                            onClick={() => setShowStoryModal(true)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                            disabled={!projects.length} // Disable if no projects exist at all
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Story (Select Project)
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <AnimatePresence>
        {showStoryModal && (
          <StoryModal
            story={editingStory}
            selectedProject={selectedProject} // Will be null if in "All Projects" view
            sprints={projectSprints}
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
