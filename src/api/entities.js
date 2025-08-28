// src/api/entities.js
import { BoardsAPI } from '../lib/apiClient';

// ---------- generic date helpers ----------
const toISOorNull = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// Normalize ANY keys that smell like dates.
// e.g. start, start_date, startDate, due, deadline, created_at, updatedAt, etc.
const normalizeDatesInObject = (obj = {}) => {
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    if (/(^|_)(date|time)$|(_at$)|(^start$)|(^end$)|(^due$)|(^deadline$)|(^created$)|(^updated$)/i.test(k)) {
      out[k] = toISOorNull(out[k]);
    }
  }
  return out;
};

// Fill required fields + create snake<->camel mirrors for common date keys.
const shapeProject = (it = {}) => {
  const src = normalizeDatesInObject(it);

  // compute canonical fields
  const start_date = toISOorNull(src.start_date ?? src.startDate ?? src.start);
  const end_date   = toISOorNull(src.end_date   ?? src.endDate   ?? src.end);
  const created_at = toISOorNull(src.created_at ?? src.createdAt ?? src.created);
  const updated_at = toISOorNull(src.updated_at ?? src.updatedAt ?? src.updated);

  return {
    // keep any extra fields (already normalized where relevant)
    ...src,

    // required/base fields
    id: src.id ?? '',
    name: src.name ?? '',
    description: src.description ?? '',
    status: src.status ?? 'planning',
    color: src.color ?? '#1e40af',
    team_lead: src.team_lead ?? src.teamLead ?? null,

    // snake_case
    start_date, end_date, created_at, updated_at,
    // camelCase mirrors
    startDate: start_date, endDate: end_date, createdAt: created_at, updatedAt: updated_at,
  };
};

const apiBase = () =>
  ((typeof window !== 'undefined' && window.__APP_API_BASE) || '').replace(/\/+$/, '');

// ---------- board <-> project shaping ----------
const projectToBoard = (p) => ({
  meta: shapeProject({
    name: p?.name,
    description: p?.description,
    status: p?.status,
    start_date: p?.start_date ?? p?.startDate,
    end_date:   p?.end_date   ?? p?.endDate,
    color: p?.color,
    team_lead: p?.team_lead ?? p?.teamLead,
    created_at: new Date().toISOString(),
  }),
  columns: [
    { id: 'todo',  name: 'To do',       cardIds: [] },
    { id: 'doing', name: 'In progress', cardIds: [] },
    { id: 'done',  name: 'Done',        cardIds: [] },
  ],
  cards: [],
});

const boardToProject = (board, id) => shapeProject({ id, ...(board?.meta ?? {}) });

const genId = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

// ---------- canonical Project service ----------
const RawProject = {
  async list() {
    const res = await fetch(`${apiBase()}/projects`, { method: 'GET' });
    if (!res.ok) throw new Error(`list failed: ${res.status}`);
    const json = await res.json();

    // accept array or {items:[]}
    const raw = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
    return raw.map(shapeProject);
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
    // also normalize dates coming back from a single board
    return boardToProject(normalizeDatesInObject(r.data), id);
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

    // normalize ANY date-ish keys and set updated_at
    merged.meta = {
      ...normalizeDatesInObject(merged.meta),
      updated_at: new Date().toISOString(),
    };

    const saved = await BoardsAPI.save(id, merged, cur.updatedAt);
    return { id, ...boardToProject(merged, id), updatedAt: saved?.updatedAt };
  },

  async delete(id) {
    await BoardsAPI.del(id);
    return { id, deleted: true };
  },
};

// Guard: keep list/create callable even if something odd happens
const Project = new Proxy(RawProject, {
  get(target, prop, receiver) {
    if (prop === 'list'   && typeof target.list   !== 'function') return async () => [];
    if (prop === 'create' && typeof target.create !== 'function') return async () => { throw new Error('Project.create not available'); };
    return Reflect.get(target, prop, receiver);
  }
});

// ---------- stubs for other entities (delegate to Project.list) ----------
const stub = (name) => ({
  async list()   { return Project.list(); },
  async get()    { return null; },
  async create() { throw new Error(`${name}.create not implemented`); },
  async update() { throw new Error(`${name}.update not implemented`); },
  async delete() { throw new Error(`${name}.delete not implemented`); },
});

export const Sprint = stub('Sprint');
export const Story  = stub('Story');
export const Epic   = stub('Epic');
export const Issue  = stub('Issue');
export const Task   = stub('Task');
export const User   = stub('User');

export { Project };
export default Project;

// Debug probe
if (typeof window !== 'undefined') {
  window.__AgileFlowEntities = { Project, Sprint, Story, Epic, Issue, Task, User };
}
