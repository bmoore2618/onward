import { useCallback, useEffect, useState } from 'react';
import { AppState as RNAppState } from 'react-native';

import { PROFILE } from '@/data/profile';
import { sessionForDay, type ChecklistId } from '@/data/program';
import {
  INITIAL_STATE,
  loadState,
  saveState,
  todayKey,
  type AppState,
  type DayRecord,
} from '@/data/storage';

function daysBetween(fromKey: string, toKey: string): number {
  const ms = new Date(`${toKey}T00:00:00`).getTime() - new Date(`${fromKey}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * All of the Today screen's state. The program day only advances when a day
 * is completed, so a missed calendar day never skips or resets anything.
 */
export function useOnward() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(todayKey());

  useEffect(() => {
    loadState()
      .then(setState)
      .finally(() => setLoaded(true));
  }, []);

  // Pick up a new date when the app comes back to the foreground the next morning
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (status) => {
      if (status === 'active') setToday(todayKey());
    });
    return () => sub.remove();
  }, []);

  const update = useCallback((change: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = change(prev);
      saveState(next).catch(() => {});
      return next;
    });
  }, []);

  const lastRecord: DayRecord | undefined = state.completed[state.completed.length - 1];
  const doneToday = lastRecord?.date === today;
  const currentDay = state.startDay + state.completed.length;
  const session = sessionForDay(currentDay, PROFILE);
  const draft =
    state.draft?.date === today ? state.draft : { date: today, checklist: {}, weights: {} };
  const daysAway = lastRecord && !doneToday ? daysBetween(lastRecord.date, today) : 0;

  const weightFor = (exerciseId: string) =>
    draft.weights[exerciseId] ?? state.lastWeights[exerciseId] ?? '';

  const toggleItem = (id: ChecklistId) =>
    update((prev) => {
      const d = prev.draft?.date === today ? prev.draft : { date: today, checklist: {}, weights: {} };
      return { ...prev, draft: { ...d, checklist: { ...d.checklist, [id]: !d.checklist[id] } } };
    });

  const setWeight = (exerciseId: string, value: string) =>
    update((prev) => {
      const d = prev.draft?.date === today ? prev.draft : { date: today, checklist: {}, weights: {} };
      return { ...prev, draft: { ...d, weights: { ...d.weights, [exerciseId]: value } } };
    });

  const completeDay = () =>
    update((prev) => {
      const d = prev.draft?.date === today ? prev.draft : { date: today, checklist: {}, weights: {} };
      const day = prev.startDay + prev.completed.length;
      const weights: Record<string, string> = {};
      for (const ex of sessionForDay(day, PROFILE).exercises ?? []) {
        const w = (d.weights[ex.id] ?? prev.lastWeights[ex.id] ?? '').trim();
        if (ex.weighted && w) weights[ex.id] = w;
      }
      const record: DayRecord = {
        day,
        date: today,
        sessionId: sessionForDay(day, PROFILE).id,
        checklist: d.checklist,
        weights,
      };
      return {
        ...prev,
        completed: [...prev.completed, record],
        lastWeights: { ...prev.lastWeights, ...weights },
        draft: null,
      };
    });

  /** Reopen today's day, e.g. after tapping Complete by mistake */
  const undoToday = () =>
    update((prev) => {
      const last = prev.completed[prev.completed.length - 1];
      if (!last || last.date !== today) return prev;
      return {
        ...prev,
        completed: prev.completed.slice(0, -1),
        draft: { date: today, checklist: last.checklist, weights: last.weights },
      };
    });

  return {
    loaded,
    currentDay,
    session,
    checklist: draft.checklist,
    doneToday,
    lastRecord,
    daysAway,
    weightFor,
    toggleItem,
    setWeight,
    completeDay,
    undoToday,
  };
}
