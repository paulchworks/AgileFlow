import { logActivity } from "@/functions/logActivity"; // no extension is fine

export const ActivityLogger = {
  async log(action, entityType, entityId, entityName, description, options = {}) {
    try {
      await logActivity({
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        description,
        project_id: options.projectId,
        old_value: options.oldValue,
        new_value: options.newValue,
        metadata: options.metadata
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Don't throw - activity logging shouldn't break the main flow
    }
  },

  async logStoryCreated(story) {
    await this.log(
      'created',
      'story',
      story.id,
      story.title,
      `Created story "${story.title}"`,
      { projectId: story.project_id }
    );
  },

  async logStoryUpdated(story, oldStory) {
    const changes = [];
    if (oldStory.status !== story.status) {
      changes.push(`status from ${oldStory.status} to ${story.status}`);
    }
    if (oldStory.assignee !== story.assignee) {
      const oldAssignee = oldStory.assignee || 'unassigned';
      const newAssignee = story.assignee || 'unassigned';
      changes.push(`assignee from ${oldAssignee} to ${newAssignee}`);
    }
    if (oldStory.sprint_id !== story.sprint_id) {
      changes.push(story.sprint_id ? 'moved to sprint' : 'moved to backlog');
    }

    if (changes.length > 0) {
      await this.log(
        'updated',
        'story',
        story.id,
        story.title,
        `Updated story "${story.title}": ${changes.join(', ')}`,
        { projectId: story.project_id }
      );
    }
  },

  async logProjectCreated(project) {
    await this.log(
      'created',
      'project',
      project.id,
      project.name,
      `Created project "${project.name}"`,
      { projectId: project.id }
    );
  },

  async logProjectUpdated(oldProject, newProjectData) {
    const changes = [];
    const significantFields = ['name', 'status', 'team_lead', 'end_date'];

    significantFields.forEach(field => {
      if (oldProject[field] !== newProjectData[field]) {
        changes.push(`changed ${field.replace('_', ' ')} from "${oldProject[field] || 'none'}" to "${newProjectData[field] || 'none'}"`);
      }
    });

    if (changes.length > 0) {
      await this.log(
        'updated',
        'project',
        oldProject.id,
        newProjectData.name || oldProject.name,
        `Updated project "${newProjectData.name || oldProject.name}": ${changes.join(', ')}`,
        { projectId: oldProject.id }
      );
    }
  },

  async logEpicCreated(epic) {
    await this.log(
      'created',
      'epic',
      epic.id,
      epic.name,
      `Created epic "${epic.name}"`,
      { projectId: epic.project_id }
    );
  },

  async logEpicUpdated(oldEpic, newEpicData) {
    const changes = [];
    const significantFields = ['name', 'status', 'description'];

    significantFields.forEach(field => {
      if (oldEpic[field] !== newEpicData[field]) {
        changes.push(`changed ${field} from "${oldEpic[field] || 'none'}" to "${newEpicData[field] || 'none'}"`);
      }
    });

    if (changes.length > 0) {
      await this.log(
        'updated',
        'epic',
        oldEpic.id,
        newEpicData.name || oldEpic.name,
        `Updated epic "${newEpicData.name || oldEpic.name}": ${changes.join(', ')}`,
        { projectId: oldEpic.project_id }
      );
    }
  },

  async logSprintCreated(sprint) {
    await this.log(
      'created',
      'sprint',
      sprint.id,
      sprint.name,
      `Created sprint "${sprint.name}"`,
      { projectId: sprint.project_id }
    );
  },

  async logSprintUpdated(oldSprint, newSprintData) {
    const changes = [];
    const significantFields = ['name', 'status', 'goal', 'start_date', 'end_date'];

    significantFields.forEach(field => {
      if (oldSprint[field] !== newSprintData[field]) {
        changes.push(`changed ${field.replace('_', ' ')} from "${oldSprint[field] || 'none'}" to "${newSprintData[field] || 'none'}"`);
      }
    });

    if (changes.length > 0) {
      await this.log(
        'updated',
        'sprint',
        oldSprint.id,
        newSprintData.name || oldSprint.name,
        `Updated sprint "${newSprintData.name || oldSprint.name}": ${changes.join(', ')}`,
        { projectId: oldSprint.project_id }
      );
    }
  },

  async logIssueCreated(issue) {
    await this.log(
      'created',
      'issue',
      issue.id,
      issue.title,
      `Reported ${issue.issue_type} "${issue.title}"`,
      { projectId: issue.project_id }
    );
  },

  async logIssueUpdated(oldIssue, newIssueData) {
    const changes = [];
    const significantFields = ['title', 'status', 'priority', 'assignee'];

    significantFields.forEach(field => {
      if (oldIssue[field] !== newIssueData[field]) {
        changes.push(`changed ${field} from "${oldIssue[field] || 'none'}" to "${newIssueData[field] || 'none'}"`);
      }
    });

    if (changes.length > 0) {
      await this.log(
        'updated',
        'issue',
        oldIssue.id,
        newIssueData.title || oldIssue.title,
        `Updated issue "${newIssueData.title || oldIssue.title}": ${changes.join(', ')}`,
        { projectId: oldIssue.project_id }
      );
    }
  }
};