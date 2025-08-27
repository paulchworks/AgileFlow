
import React, { useState, useEffect } from "react";
import { Project, Epic, Story } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";

import EpicHeader from "../components/epics/EpicHeader";
import EpicCard from "../components/epics/EpicCard";
import EpicForm from "../components/epics/EpicForm";
import StoryModal from "../components/sprint/StoryModal"; // Changed import path

export default function Epics() {
  const [projects, setProjects] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // null means "All Epics"
  const [showForm, setShowForm] = useState(false);
  const [editingEpic, setEditingEpic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedEpicForStory, setSelectedEpicForStory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, epicsData, storiesData] = await Promise.all([
        Project.list(),
        Epic.list(),
        Story.list(),
      ]);
      setProjects(projectsData);
      setEpics(epicsData);
      setStories(storiesData);
      
      // Don't auto-select a project - default to "All Epics" view
    } catch (error) {
      console.error("Error loading epics data:", error);
    }
    setIsLoading(false);
  };

  const handleFormSubmit = async (epicData) => {
    try {
      if (editingEpic) {
        await Epic.update(editingEpic.id, epicData);
      } else {
        // When creating a new epic, ensure we have a project_id
        await Epic.create({ ...epicData, project_id: selectedProject?.id });
      }
      setShowForm(false);
      setEditingEpic(null);
      loadData();
    } catch (error) {
      console.error("Error saving epic:", error);
    }
  };
  
  const handleEdit = (epic) => {
    setEditingEpic(epic);
    setShowForm(true);
  };

  const handleAddStoryToEpic = (epic) => {
    setSelectedEpicForStory(epic);
    setShowStoryModal(true);
  };

  const handleStorySubmit = async (storyData) => {
    try {
      // Story created from epic should go to backlog with epic association
      const dataToSave = {
        ...storyData,
        project_id: selectedEpicForStory.project_id,
        epic_id: selectedEpicForStory.id,
        status: 'backlog' // Stories created from epics start in backlog
      };

      await Story.create(dataToSave);
      setShowStoryModal(false);
      setSelectedEpicForStory(null);
      loadData();
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  // Filter epics based on selected project
  const filteredEpics = selectedProject
    ? epics.filter((epic) => epic.project_id === selectedProject.id)
    : epics; // Show all epics if no specific project is selected

  // Get project name for epic display when showing all epics
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <EpicHeader
          project={selectedProject}
          projects={projects}
          onProjectChange={setSelectedProject}
          onAddEpic={() => { setEditingEpic(null); setShowForm(true); }}
        />

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-8"
            >
              <EpicForm
                epic={editingEpic}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                selectedProject={selectedProject}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEpics.map(epic => (
            <EpicCard
              key={epic.id}
              epic={epic}
              stories={stories.filter(s => s.epic_id === epic.id)}
              onEdit={handleEdit}
              onAddStory={handleAddStoryToEpic}
              projectName={!selectedProject ? getProjectName(epic.project_id) : null}
              showProject={!selectedProject}
            />
          ))}
        </div>

        {!isLoading && filteredEpics.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-800">
              {selectedProject 
                ? `No epics found for "${selectedProject.name}"`
                : "No epics found across all projects"
              }
            </h3>
            {selectedProject ? (
              <>
                <p className="text-slate-600 mt-2">Create your first epic to start organizing your work.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium shadow-lg"
                >
                  Create Your First Epic
                </motion.button>
              </>
            ) : (
              <p className="text-slate-600 mt-2">Select a project to create your first epic.</p>
            )}
          </div>
        )}

        {/* Add StoryModal for creating stories from epics */}
        <AnimatePresence>
          {showStoryModal && (
            <StoryModal
              story={null}
              selectedProject={projects.find(p => p.id === selectedEpicForStory?.project_id)}
              preSelectedEpic={selectedEpicForStory}
              onSubmit={handleStorySubmit}
              onClose={() => {
                setShowStoryModal(false);
                setSelectedEpicForStory(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
