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

const RawProject = {
  async list() {                 // safe stub until you add GET /projects
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

// Proxy: guarantees .list and .create are callable even if something weird imports an old shape
const Project = new Proxy(RawProject, {
  get(target, prop, receiver) {
    if (prop === 'list' && typeof target.list !== 'function') {
      return async () => []; // never crash dashboards
    }
    if (prop === 'create' && typeof target.create !== 'function') {
      return async () => { throw new Error('Project.create not available'); };
    }
    return Reflect.get(target, prop, receiver);
  }
});

export { Project };          // named export (some files use named)
export default Project;      // default export (others use default)

// Optional shims:
export const Board = {
  get: (id) => BoardsAPI.get(id),
  create: (id, d) => BoardsAPI.create(id, d),
  save: (id, d, v) => BoardsAPI.save(id, d, v),
  delete: (id) => BoardsAPI.del(id),
};
export const Sprint = {};
export const Story  = {};
export const Epic   = {};
export const Issue  = {};
export const Task   = {};
export const User   = {};

// Debug hook so we can verify in DevTools
if (typeof window !== 'undefined') window.__AgileFlowProjectAPI = Project;
