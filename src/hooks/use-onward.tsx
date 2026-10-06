import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { syncNotifications } from '@/data/notifications';
import { PROFILE } from '@/data/profile';
import { sessionForDay, type ChecklistId, type Session } from '@/data/program';
import {
  dateFromKey,
  daysBetween,
  INITIAL_STATE,
  loadState,
  saveState,
  todayKey,
  type AppState,
  type Checklist,
  type DayRecord,
} from '@/data/storage';

/** Program day for a calendar date: Day 1 is the profile's start date */
export function programDayFor(dateKey: string): number {
  return daysBetween(PROFILE.programStartDate, dateKey) + 1;
}

function emptyDraft(date: string): NonNullable<AppState['draft']> {
  return { date, checklist: {}, weights: {} };
}

type Onward = {
  loaded: boolean;
  today: string;
  currentDay: number;
  session: Session;
  tomorrow: Session;
  checklist: Checklist;
  doneToday: boolean;
  lastRecord: DayRecord | undefined;
  daysAway: number;
  completed: DayRecord[];
  /** Weigh-ins by date, oldest first */
  bodyWeight: { date: string; lb: number }[];
  goalWeight: string;
  isWeighInDay: boolean;
  setBodyWeight: (date: string, value: string) => void;
  setGoalWeight: (value: string) => void;
  weightFor: (movementId: string) => string;
  toggleItem: (id: ChecklistId) => void;
  setWeight: (movementId: string, value: string) => void;
  setSwap: (slot: string, movementId: string | null) => void;
  completeDay: () => void;
  undoToday: () => void;
  /** Tick or untick a checklist item on an earlier day (for catching up or correcting) */
  togglePastItem: (date: string, id: ChecklistId) => void;
  /** Session for any program day, with the user's swaps applied */
  sessionFor: (day: number) => Session;
};

const OnwardContext = createContext<Onward | null>(null);

/**
 * All app state, shared by every tab. The program follows the calendar, so
 * today's session is always today's: a missed day is simply skipped, never
 * made up or restarted.
 */
export function OnwardProvider({ children }: { children: ReactNode }) {
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

  // Keep the next two weeks of reminders scheduled
  useEffect(() => {
    if (!loaded) return;
    syncNotifications(state.settings, state.swaps).catch(() => {});
  }, [loaded, today, state.settings, state.swaps]);

  const update = useCallback((change: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = change(prev);
      saveState(next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<Onward>(() => {
    const sessionFor = (day: number) => sessionForDay(day, PROFILE, state.swaps);
    const currentDay = programDayFor(today);
    const session = sessionFor(currentDay);
    const lastRecord = state.completed[state.completed.length - 1];
    const doneToday = lastRecord?.date === today && lastRecord.day === currentDay;
    const draft = state.draft?.date === today ? state.draft : emptyDraft(today);

    return {
      loaded,
      today,
      currentDay,
      session,
      tomorrow: sessionFor(currentDay + 1),
      checklist: draft.checklist,
      doneToday,
      lastRecord,
      daysAway: lastRecord && !doneToday ? daysBetween(lastRecord.date, today) : 0,
      completed: state.completed,
      sessionFor,

      bodyWeight: Object.entries(state.bodyWeight)
        .map(([date, v]) => ({ date, lb: parseFloat(v) }))
        .filter((e) => Number.isFinite(e.lb))
        .sort((a, b) => a.date.localeCompare(b.date)),
      goalWeight: state.goalWeight,
      isWeighInDay: PROFILE.weighInWeekdays.includes(dateFromKey(today).getDay()),

      setBodyWeight: (date, v) =>
        update((prev) => {
          const bodyWeight = { ...prev.bodyWeight };
          if (v.trim()) bodyWeight[date] = v.trim();
          else delete bodyWeight[date];
          return { ...prev, bodyWeight };
        }),

      setGoalWeight: (v) => update((prev) => ({ ...prev, goalWeight: v.trim() })),

      weightFor: (movementId) => draft.weights[movementId] ?? state.lastWeights[movementId] ?? '',

      toggleItem: (id) =>
        update((prev) => {
          const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
          return { ...prev, draft: { ...d, checklist: { ...d.checklist, [id]: !d.checklist[id] } } };
        }),

      setWeight: (movementId, v) =>
        update((prev) => {
          const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
          return { ...prev, draft: { ...d, weights: { ...d.weights, [movementId]: v } } };
        }),

      setSwap: (slot, movementId) =>
        update((prev) => {
          const swaps = { ...prev.swaps };
          if (movementId) swaps[slot] = movementId;
          else delete swaps[slot];
          return { ...prev, swaps };
        }),

      completeDay: () =>
        update((prev) => {
          const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
          const weights: Record<string, string> = {};
          const movements: Record<string, string> = {};
          for (const ex of session.exercises ?? []) {
            movements[ex.slot] = ex.movement.id;
            const w = (d.weights[ex.movement.id] ?? prev.lastWeights[ex.movement.id] ?? '').trim();
            if (ex.movement.weighted && w) weights[ex.movement.id] = w;
          }
          const record: DayRecord = {
            day: currentDay,
            date: today,
            sessionId: session.id,
            checklist: d.checklist,
            weights,
            movements,
          };
          return {
            ...prev,
            completed: [...prev.completed.filter((r) => r.date !== today), record],
            lastWeights: { ...prev.lastWeights, ...weights },
            draft: null,
          };
        }),

      togglePastItem: (date, id) =>
        update((prev) => {
          const day = programDayFor(date);
          const existing = prev.completed.find((r) => r.date === date);
          const record: DayRecord = existing ?? {
            day,
            date,
            sessionId: sessionFor(day).id,
            checklist: {},
            weights: {},
          };
          const updated = { ...record, checklist: { ...record.checklist, [id]: !record.checklist[id] } };
          const completed = [...prev.completed.filter((r) => r.date !== date), updated].sort((a, b) =>
            a.date.localeCompare(b.date)
          );
          return { ...prev, completed };
        }),

      undoToday: () =>
        update((prev) => {
          const last = prev.completed[prev.completed.length - 1];
          if (!last || last.date !== today) return prev;
          return {
            ...prev,
            completed: prev.completed.slice(0, -1),
            draft: { date: today, checklist: last.checklist, weights: last.weights },
          };
        }),
    };
  }, [state, loaded, today, update]);

  return <OnwardContext.Provider value={value}>{children}</OnwardContext.Provider>;
}

export function useOnward(): Onward {
  const ctx = useContext(OnwardContext);
  if (!ctx) throw new Error('useOnward must be used inside OnwardProvider');
  return ctx;
}
