// src/api/entities.js
// Route all data calls to your AWS API (API Gateway + Lambda + DynamoDB)
import { BoardsAPI } from '@/lib/apiClient';

// Shape mapper: take your Project form and produce a board JSON we store in DynamoDB.
const projectToBoard = (p) => ({
  meta: {
    name: p.name,
    description: p.description ?? '',
    status: p.status ?? 'planning',
    start_date: p.start_date ?? null,
    end_date: p.end_date ?? null,
    color: p.color ?? '#1e40af',
    team_lead: p.team_lead ?? null,
    created_at: new Date().toISOString()
  },
  // initial Kanban data — adjust to your app’s expectations
  columns: [
    { id: 'todo', name: 'To do', cardIds: [] },
    { id: 'doing', name: 'In progress', cardIds: [] },
    { id: 'done', name: 'Done', cardIds: [] }
  ],
  cards: []
});

// Reverse: extract "project" fields from a stored board
const boardToProject = (board, id) => ({
  id,
  ...(board?.meta ?? {})
});

export const Project = {
  // Create a new project → create a new board record in DynamoDB
  create: async (projectData) => {
    const id = projectData?.id || (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    const board = projectToBoard(projectData || {});
    await BoardsAPI.create(id, board);
    return { id, ...projectData }; // return minimal project info to the UI
  },

  // Read a project by id
  get: async (id) => {
    const r = await BoardsAPI.get(id); // { id, data, updatedAt }
    if (!r?.data) return null;
    return boardToProject(r.data, id);
  },

  // Update project metadata (non-destructive merge into board.meta)
  update: async (id, patch) => {
    const current = await BoardsAPI.get(id);
    if (!current?.data) throw new Error('Project not found');

    const next = {
      ...current.data,
      meta: { ...(current.data.meta || {}), ...(patch || {}), updated_at: new Date().toISOString() }
    };

    const saved = await BoardsAPI.save(id, next, current.updatedAt);
    return { id, ...(next.meta || {}), updatedAt: saved?.updatedAt };
  },

  // Delete project/board
  delete: async (id) => {
    await BoardsAPI.del(id);
    return { id, deleted: true };
  },

  // Optional: list (stub – implement when you add a GSI or a scan)
  list: async () => {
    // With current table design (PK/SK only), we don't have a list endpoint.
    // You can keep this as a placeholder or back it with a separate index later.
    return [];
  }
};

// Keep named exports to avoid breaking stray imports (if any). They are no-ops for now.
export const Sprint  = {};
export const Story   = {};
export const Epic    = {};
export const Issue   = {};
export const Task    = {};
export const User    = {};
export const Board   = {
  get:    (id)          => BoardsAPI.get(id),
  create: (id, data)    => BoardsAPI.create(id, data),
  save:   (id,d,v)      => BoardsAPI.save(id, d, v),
  delete: (id)          => BoardsAPI.del(id)
};
