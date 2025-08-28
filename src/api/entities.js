// src/api/entities.js
import { BoardsAPI } from '../lib/apiClient';

// ---------- date helpers ----------
const toISOorNull = (v) => {
  if (!v) return null; // treats "", null, undefined as null
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const sanitizeProjectLike = (it = {}) => ({
  ...it,
  start_date: toISOorNull(it.start_date),
  end_date:   toISOorNull(it.end_date),
  created_at: toISOorNull(it.created_at),
  updated_at: toISOorNull(it.updated_at),
});

const apiBase = () =>
  ((typeof window !== 'undefined' && window.__APP_API_BASE) || '').replace(/\/+$/, '');

// ---------- board <-> project shaping ----------
const projectToBoard = (p) => ({
  meta: {
    name: p?.name ?? '',
    description: p?.description ?? '',
    status: p?.status ?? 'planning',
    start_date: toISOorNull(p?.start_date),
    end_date:   toISOorNull(p?.end_date),
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

const boardToProject = (board, id) =>
  sanitizeProjectLike({ id, ...(board?.meta ?? {}) });

const genId = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

// ---------- canonical Project service ----------
const RawProject = {
  // NOW calls the API and normalizes dates
  async list() {
    const base = apiBase();
    const res = await fetch(`${base}/projects`, { method: 'GET' });
    if (!res.ok) throw new Error(`list failed: ${res.status}`);
    const json = await res.json();
    const items = json?.items || [];
    return items.map(sanitizeProjectLike);
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
    // normalize dates coming back from a single board, too
    return boardToProject(r.data, id);
  },

  async update(id, patch) {
    const cur = await BoardsAPI.get(id);
    if (!cur?.data) throw new Error('Project not found');
    const next = {
      ...cur.data,
      meta: {
        ...(cur.data.meta || {}),
        ...(patch || {}),
        // keep dates sanitized if patch touches them
        start_date: toISOorNull((patch || {}).start_date ?? (cur.data.meta || {}).start_date),
        end_date:   toISOorNull((patch || {}).end_date   ?? (cur.data.meta || {}).end_date),
        updated_at: new Date().toISOString(),
      },
    };
    const saved = await BoardsAPI.save(id, next, cur.updatedAt);
    return { id, ...(boardToProject(next, id)), updatedAt: saved?.updatedAt };
  },

  async delete(id) {
    await BoardsAPI.del(id);
    return { id, deleted: true };
  },
};

// Guard: always expose callable list/create even if something weird happens
const Project = new Proxy(RawProject, {
  get(target, prop, receiver) {
    if (prop === 'list'   && typeof target.list   !== 'function') return async () => [];
    if (prop === 'create' && typeof target.create !== 'function') return async () => { throw new Error('Project.create not available'); };
    return Reflect.get(target, prop, receiver);
  }
});

// ---------- safe stubs for ALL other entities ----------
// Delegate listing to the same normalized /projects payload so UI stays stable.
const stub = (name) => new Proxy({
  async list() {
    // reuse Project.list() so date normalization is identical
    return Project.list();
  },
  async get()    { return null; },
  async create() { throw new Error(`${name}.create not implemented`); },
  async update() { throw new Error(`${name}.update not implemented`); },
  async delete() { throw new Error(`${name}.delete not implemented`); },
}, {
  get(target, prop, receiver) {
    if (prop === 'list' && typeof target.list !== 'function') {
      return async () => [];
    }
    return Reflect.get(target, prop, receiver);
  }
});

// Export stubs for non-Project entities so calls like Sprint.list() won't blow up.
export const Sprint = stub('Sprint');
export const Story  = stub('Story');
export const Epic   = stub('Epic');
export const Issue  = stub('Issue');
export const Task   = stub('Task');
export const User   = stub('User');

// Export the real Project service
export { Project };
export default Project;

// Optional: quick runtime probe for DevTools
if (typeof window !== 'undefined') {
  window.__AgileFlowEntities = { Project, Sprint, Story, Epic, Issue, Task, User };
}
