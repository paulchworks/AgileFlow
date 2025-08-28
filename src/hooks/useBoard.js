import { useEffect, useRef, useState } from 'react';
import { BoardsAPI } from '@/lib/apiClient';

const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

export function useBoard(boardId) {
  const [board, setBoard] = useState(null);
  const [version, setVersion] = useState(null);
  const [saving, setSaving] = useState(false);
  const lastGood = useRef(null);

  useEffect(() => {
    (async () => {
      const r = await BoardsAPI.get(boardId);
      setBoard(r.data || { columns: [], cards: [] });
      setVersion(r.updatedAt || null);
      lastGood.current = r.data;
    })();
  }, [boardId]);

  const persist = async (nextBoard) => {
    setSaving(true);
    try {
      const r = await BoardsAPI.save(boardId, nextBoard, version);
      if (r.conflict) {
        const latest = await BoardsAPI.get(boardId);
        setBoard(latest.data); setVersion(latest.updatedAt);
      } else {
        setVersion(r.updatedAt || new Date().toISOString());
        lastGood.current = nextBoard;
      }
    } catch {
      setBoard(lastGood.current); // soft rollback
    } finally { setSaving(false); }
  };

  const saveDebounced = useRef(debounce(persist, 400)).current;

  const updateBoard = (recipe) => {
    setBoard(prev => {
      const next = typeof recipe === 'function' ? recipe(prev) : recipe;
      saveDebounced(next);
      return next;
    });
  };

  return { board, updateBoard, saving };
}
