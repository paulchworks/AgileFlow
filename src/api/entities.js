// src/api/entities.js
import { BoardsAPI } from '../lib/apiClient';

// ---------- helpers ----------
const toISOorNull = (v) => {
  if (!v) return null; // "", null, undefined -> null
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const fillProjectDefaults = (it = {}) => {
  const start_date = toISOorNull(it.start_date ?? it.startDate);
  const end_date   = toISOorNull(it.end_date   ?? it.endDate);
  const created_at = toISOorNull(it.created_at ?? it.createdAt);
  const updated_at = toISOorNull(it.updated_at ?? it.updatedAt);

  const shaped = {
    id: it.id ?? it.ID ?? it.pk ?? '',
    name: it.name ?? '',
    description: it.description ?? '',
    status: it.status ?? 'planning',
    color: it.color ?? '#1e40af',
    team_lead: it.team_lead ?? it.teamLead ?? null,

    // snake_case (what we store)
    start_date,
    end_date,
    created_at,
    updated_at,

    // camelCase mirrors (what some UI code expects)
    startDate: start_date,
    endDate:   end_date,
    createdAt: created_at,
    updatedAt: updated_at,
  };

  return shaped;
};

const apiBase = () =>
  ((typeof window !== 'undefined' && window.__APP_API_BASE) || '').replace(/\/+$/, '');

// ---------- board <-> project shaping ----------
const projectToBoard = (p) => ({
  meta: {
    name: p?.name ?? '',
    description: p?.description ?? '',
    status: p?.status ?? 'planning',
    start_date: toISOorNull(p?.start_date ?? p?.startDate),
    end_date:   toISOorNull(p?.end_date   ?? p?.endDate),
    color: p?.color ?? '#1e40af',
    team_lead: p?.team_lead ?? p?.teamLead ?? null,
    created_at: new Date().toISOString(),
  },
  columns: [
    { id: 'todo',  name: 'To do',       cardIds: [] },
    { id: 'doing', name: 'In progress', cardIds: [] },
    { id: 'done',  name: 'Done',        cardIds: [] },
  ],
  cards: [],
});

const boardToProject = (board, id) => {
  const meta = board?.meta ?? {};
  return fillProjectDefaults({ id, ...meta });
};

const genId = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

// ---------- canonical Project service ----------
const RawProject = {
  async list() {
    const base = apiBase();
    const res = await fetch(`${base}/projects`, { method: 'GET' });
    if (!res.ok) throw new Error(`list failed: ${res.status}`);
    const json = await res.json();

    // Coerce: accept array, object-with-items, or anything else
    let items = Array.isArray(json) ? json
              : Array.isArray(json?.items) ? json.items
              : [];

    // Normalize each item
    items = items.map(fillProjectDefaults);

    return items;
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

    const merged = {
      ...(cur.data || {}),
      meta: {
        ...(cur.data?.meta || {}),
        ...(patch || {}),
      },
    };

    // sanitize dates and keep both casings in storage’s meta
    merged.meta.start_date = toISOorNull(merged.meta.start_date ?? merged.meta.startDate);
    merged.meta.end_date   = toISOorNull(merged.meta.end_date   ?? merged.meta.endDate);
    merged.meta.updated_at = new Date().toISOString();

    const saved = await BoardsAPI.save(id, merged, cur.updatedAt);
    return { id, ...boardToProject(merged, id), updatedAt: saved?.updatedAt };
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
// Delegate listing to Project.list() so shape & dates are identical.
const stub = (name) => new Proxy({
  async list()   { return Project.list(); },
  async get()    { return null; },
  async create() { throw new Error(`${name}.create not implemented`); },
  async update() { throw new Error(`${name}.update not implemented`); },
  async delete() { throw new Error(`${name}.delete not implemented`); },
}, {
  get(target, prop, receiver) {
    if (prop === 'list' && typeof target.list !== 'function') return async () => [];
    return Reflect.get(target, prop, receiver);
  }
});

export const Sprint = stub('Sprint');
export const Story  = stub('Story');
export const Epic   = stub('Epic');
export const Issue  = stub('Issue');
export const Task   = stub('Task');
export const User   = stub('User');

export { Project };
export default Project;

// Optional: quick runtime probe for DevTools
if (typeof window !== 'undefined') {
  window.__AgileFlowEntities = { Project, Sprint, Story, Epic, Issue, Task, User };
}
