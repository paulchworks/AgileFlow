// src/api/entities.js
import { BoardsAPI } from '../lib/apiClient';

const projectToBoard = (p) => ({
  meta: {
    name: p?.name ?? '',
    description: p?.description ?? '',
    status: p?.status ?? 'planning',
    start_date: p?.start_date ?? null,
    end_date: p?.end_date ?? null,
    color: p?.color ?? '#1e40af',
    team_lead: p?.team_lead ?? null,
    created_at: new Date().toISOString(),
  },
  columns: [
    { id: 'todo',  name: 'To do',       cardIds: [] },
    { id: 'doing', name: 'In progress', cardIds: [] },
    { id: 'done',  name: 'Done',        cardIds: [] },
  ],
  cards: [],
});

const boardToProject = (board, id) => ({ id, ...(board?.meta ?? {}) });
const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

export const Project = {
  async list() {
    // stub for now; returns [] so dashboard/quick stats don’t crash
    return [];
  },
  async create(projectData) {
    const id = projectData?.id || genId();
    const board = projectToBoard(projectData || {});
    await BoardsAPI.create(id, board);
    return { id, ...boardToProject(board, id) };
  },
  async get(id) {
    const r = await BoardsAPI.get(id);
    if (!r?.data) return null;
    return boardToProject(r.data, id);
  },
  async update(id, patch) {
    const cur = await BoardsAPI.get(id);
    if (!cur?.data) throw new Error('Project not found');
    const next = { ...cur.data, meta: { ...(cur.data.meta || {}), ...(patch || {}), updated_at: new Date().toISOString() } };
    const saved = await BoardsAPI.save(id, next, cur.updatedAt);
    return { id, ...(next.meta || {}), updatedAt: saved?.updatedAt };
  },
  async delete(id) {
    await BoardsAPI.del(id);
    return { id, deleted: true };
  },
};

export default Project; // <— default export has .list/.create

// Optional shims for any other imports:
export const Board = {
  get: (id) => BoardsAPI.get(id),
  create: (id, d) => BoardsAPI.create(id, d),
  save: (id, d, v) => BoardsAPI.save(id, d, v),
  delete: (id) => BoardsAPI.del(id),
};
export const Sprint = {};
export const Story = {};
export const Epic = {};
export const Issue = {};
export const Task = {};
export const User = {};
