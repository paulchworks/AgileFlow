
import React, { useState, useEffect } from "react";
import { Project, Story, Task, Sprint } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import BacklogHeader from "../components/backlog/BacklogHeader";
import BacklogFilters from "../components/backlog/BacklogFilters";
import BacklogStoryCard from "../components/backlog/BacklogStoryCard";
import StoryModal from "../components/sprint/StoryModal";

export default function Backlog() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]); // New state for sprints
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [filters, setFilters] = useState({ priority: '', epic: '', assignee: '', search: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, storiesData, tasksData, sprintsData] = await Promise.all([
        Project.list(),
        Story.list("-created_date"),
        Task.list(),
        Sprint.list() // Fetch sprints
      ]);
      setProjects(projectsData);
      setStories(storiesData);
      setTasks(tasksData);
      setSprints(sprintsData); // Set sprints state
      
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
    } catch (error) {
      console.error("Error loading backlog data:", error);
    }
    setIsLoading(false);
  };

  const handleStorySubmit = async (storyData) => {
    try {
      console.log("Received story data for save in backlog:", storyData); // Debug log
      
      const dataToSave = {
        ...storyData,
        project_id: selectedProject?.id,
        // Status is handled inside StoryModal now based on sprint_id
      };

      console.log("Final backlog data to save:", dataToSave); // Debug log

      if (editingStory) {
        console.log("Updating backlog story with ID:", editingStory.id); // Debug log
        await Story.update(editingStory.id, dataToSave);
      } else {
        console.log("Creating new backlog story"); // Debug log
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

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    
    if (!destination) return;
    
    const newStories = Array.from(filteredStories);
    const [reorderedItem] = newStories.splice(source.index, 1);
    newStories.splice(destination.index, 0, reorderedItem);
    
    // Update story order in backend would go here
    console.log("Reordered stories:", newStories.map(s => s.title));
  };

  const filteredStories = stories.filter(story => {
    if (!selectedProject || story.project_id !== selectedProject.id) return false;
    
    // Only show stories that are in the backlog (have no sprint assigned)
    if (story.sprint_id) return false;

    const priorityMatch = !filters.priority || story.priority === filters.priority;
    const epicMatch = !filters.epic || story.epic === filters.epic;
    const assigneeMatch = !filters.assignee || story.assignee === filters.assignee;
    const searchMatch = !filters.search || 
      story.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      story.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    return priorityMatch && epicMatch && assigneeMatch && searchMatch;
  });

  const projectSprints = selectedProject 
    ? sprints.filter(s => s.project_id === selectedProject.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 text-gray-800">
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
                className={`space-y-3 transition-colors duration-200 ${
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
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
                
                {filteredStories.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-lg font-medium mb-4">No stories in the backlog</p>
                    <Button onClick={() => setShowStoryModal(true)}>
                      Create Your First Story
                    </Button>
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
            selectedProject={selectedProject}
            sprints={projectSprints} // Pass filtered sprints to StoryModal
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
