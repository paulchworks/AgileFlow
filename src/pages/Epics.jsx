import React, { useState, useEffect } from "react";
import { Project, Epic, Story } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";

import EpicHeader from "../components/epics/EpicHeader";
import EpicCard from "../components/epics/EpicCard";
import EpicForm from "../components/epics/EpicForm";

export default function Epics() {
  const [projects, setProjects] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEpic, setEditingEpic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
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
        await Epic.create({ ...epicData, project_id: selectedProject.id });
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

  const filteredEpics = selectedProject
    ? epics.filter((epic) => epic.project_id === selectedProject.id)
    : [];

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
            />
          ))}
        </div>

        {!isLoading && filteredEpics.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-800">No Epics Found</h3>
            <p className="text-slate-600 mt-2">Create your first epic to start organizing your work.</p>
          </div>
        )}
      </div>
    </div>
  );
}