// src/components/utils/projectStatusUpdater.jsx
import Project from "@/api/entities";

// helpers
const arr = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);
const toISOorNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/**
 * Update every project's status based on dates:
 * - if end date in the past: "completed"
 * - else if start date in the past: "in-progress"
 * - else "planning"
 */
export async function updateAllProjectStatuses() {
  try {
    let projects = await Project.list();
    projects = arr(projects).map((p) => ({
      ...p,
      start_date: toISOorNull(p.start_date ?? p.startDate),
      end_date: toISOorNull(p.end_date ?? p.endDate),
    }));

    const now = Date.now();

    for (const p of projects) {
      const start = p.start_date ? new Date(p.start_date).getTime() : null;
      const end = p.end_date ? new Date(p.end_date).getTime() : null;

      let nextStatus = "planning";
      if (end && end < now) nextStatus = "completed";
      else if (start && start <= now) nextStatus = "in-progress";

      if (nextStatus !== p.status) {
        await Project.update(p.id, { status: nextStatus });
      }
    }
  } catch (e) {
    console.error("Error updating project status:", e);
  }
}

/**
 * Back-compat wrapper for places that call `updateProjectStatus(...)`.
 * - If called with (projectId, status), update that project only.
 * - If called with no args, run the bulk updater.
 */
export async function updateProjectStatus(projectId, status) {
  if (projectId && status) {
    try {
      await Project.update(projectId, { status });
    } catch (e) {
      console.error("Error updating single project status:", e);
    }
    return;
  }
  // No args -> behave like old bulk function
  return updateAllProjectStatuses();
}

// Optional default export for convenience
export default updateAllProjectStatuses;
