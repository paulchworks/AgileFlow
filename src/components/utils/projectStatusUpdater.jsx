// src/components/utils/projectStatusUpdater.jsx
import Project from "@/api/entities";
import { Sprint } from "@/api/entities";


// helpers
const arr = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);
const toISOorNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export const updateProjectStatus = async (projectId) => {
  try {
    const [project, sprints] = await Promise.all([
      Project.list().then(projects => projects.find(p => p.id === projectId)),
      Sprint.filter({ project_id: projectId })
    ]);

    if (!project) return;

    let newStatus = null; // Default to no change

    // This logic should only apply if there are sprints.
    // If there are no sprints, we should not change the project's status automatically.
    if (sprints.length > 0) {
      const hasActiveSprint = sprints.some(s => s.status === 'active');
      const allSprintsCompleted = sprints.every(s => s.status === 'completed');

      if (hasActiveSprint) {
        newStatus = "active";
      } else if (allSprintsCompleted) {
        newStatus = "completed";
      } else {
        // Sprints exist, but none are active, meaning the project is in a planning phase.
        newStatus = "planning";
      }
    }

    // Only update if a new status was determined by the logic above and it's different
    // from the project's current status. This prevents overriding manual settings
    // on projects without any sprints.
    if (newStatus && newStatus !== project.status) {
      // Do not automatically move a project from "On Hold" to "Planning".
      // It should only become "Active" if a new sprint starts.
      if (project.status === 'on_hold' && newStatus === 'planning') {
        return;
      }

      await Project.update(projectId, { status: newStatus });
      console.log(`Project ${project.name} status automatically updated from ${project.status} to ${newStatus}`);
    }
  } catch (error) {
    console.error("Error updating project status:", error);
  }
};

export const updateAllProjectStatuses = async () => {
  try {
    const projects = await Project.list();
    for (const project of projects) {
      await updateProjectStatus(project.id);
    }
  } catch (error) {
    console.error("Error updating all project statuses:", error);
  }
};