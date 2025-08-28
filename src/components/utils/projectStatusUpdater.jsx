import Project, { Sprint } from "@/api/entities";
const ProjectSvc = (typeof window !== 'undefined' && window.__AgileFlowProjectAPI) || Project;

export const updateProjectStatus = async (projectId) => {
  try {
    const [project, sprints] = await Promise.all([
      ProjectSvc.list().then(projects => projects.find(p => p.id === projectId)),
      Sprint.filter({ project_id: projectId })
    ]);

    if (!project) return;

    let newStatus = ProjectSvc.status;

    if (sprints.length === 0) {
      // No sprints exist - keep in planning
      newStatus = "planning";
    } else {
      const activeSprints = sprints.filter(s => s.status === 'active');
      const completedSprints = sprints.filter(s => s.status === 'completed');
      
      if (activeSprints.length > 0) {
        // At least one active sprint - project is active
        newStatus = "active";
      } else if (completedSprints.length === sprints.length && sprints.length > 0) {
        // All sprints are completed - project is completed
        newStatus = "completed";
      } else {
        // Sprints exist but none are active (planning/paused state)
        newStatus = "planning";
      }
    }

    // Only update if status actually changed
    if (newStatus !== ProjectSvc.status) {
      await ProjectSvc.update(projectId, { ...project, status: newStatus });
      console.log(`Project ${ProjectSvc.name} status updated from ${ProjectSvc.status} to ${newStatus}`);
    }
  } catch (error) {
    console.error("Error updating project status:", error);
  }
};

export const updateAllProjectStatuses = async () => {
  try {
    const projects = await ProjectSvc.list();
    for (const project of projects) {
      await updateProjectStatus(ProjectSvc.id);
    }
  } catch (error) {
    console.error("Error updating all project statuses:", error);
  }
};
