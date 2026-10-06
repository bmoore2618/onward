import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { syncNotifications } from '@/data/notifications';
import type { Profile } from '@/data/profile';
import { sessionForDay, type ChecklistId, type Session } from '@/data/program';
import {
  daysBetween,
  INITIAL_STATE,
  loadState,
  saveState,
  todayKey,
  type AppState,
  type DayRecord,
} from '@/data/storage';

function emptyDraft(date: string): NonNullable<AppState['draft']> {
  return { date, checklist: {}, weights: {} };
}

/** Everything the screens need to know about one calendar date */
export type DayView = {
  date: string;
  /** Program day number (can be < 1 or > 75 outside the program) */
  day: number;
  session: Session;
  record: DayRecord | undefined;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  /** Working checklist: the record's, or today's draft */
  checklist: DayRecord['checklist'];
  weightFor: (movementId: string) => string;
  bodyWeight: string;
};

type Onward = {
  loaded: boolean;
  today: string;
  profile: Profile;
  completed: DayRecord[];
  /** Weigh-ins, oldest first, parsed */
  bodyWeight: { date: string; lb: number }[];

  programDayFor: (date: string) => number;
  sessionFor: (day: number) => Session;
  viewDay: (date: string) => DayView;
  isWeighInDay: (date: string) => boolean;

  setProfile: (patch: Partial<Profile>) => void;
  setBodyWeight: (date: string, value: string) => void;
  /** Edits apply to today's draft, or to the saved record for any other day */
  setWeight: (date: string, movementId: string, value: string) => void;
  setMovement: (date: string, slot: string, movementId: string) => void;
  toggleItem: (date: string, id: ChecklistId) => void;
  completeToday: () => void;
  reopenToday: () => void;
};

const OnwardContext = createContext<Onward | null>(null);

/**
 * All app state, shared by every tab. The program follows the calendar, so
 * today's session is always today's: a missed day is simply skipped, never
 * made up or restarted. Earlier days can be viewed and corrected.
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
    syncNotifications(state.profile, state.swaps).catch(() => {});
  }, [loaded, today, state.profile, state.swaps]);

  const update = useCallback((change: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = change(prev);
      saveState(next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<Onward>(() => {
    const { profile } = state;
    const programDayFor = (date: string) => daysBetween(profile.programStartDate, date) + 1;
    const sessionFor = (day: number) => sessionForDay(day, profile, state.swaps);
    const recordFor = (date: string) => state.completed.find((r) => r.date === date);
    const draft = state.draft?.date === today ? state.draft : emptyDraft(today);

    /** Upsert the record for a date and apply a change to it */
    const withRecord = (prev: AppState, date: string, change: (r: DayRecord) => DayRecord): AppState => {
      const day = daysBetween(prev.profile.programStartDate, date) + 1;
      const existing = prev.completed.find((r) => r.date === date);
      const base: DayRecord = existing ?? {
        day,
        date,
        sessionId: sessionForDay(day, prev.profile, prev.swaps).id,
        checklist: {},
        weights: {},
      };
      const updated = change(base);
      const completed = [...prev.completed.filter((r) => r.date !== date), updated].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      return { ...prev, completed };
    };

    const viewDay = (date: string): DayView => {
      const day = programDayFor(date);
      const record = recordFor(date);
      const session = sessionForDay(day, profile, { ...state.swaps, ...record?.movements });
      const isToday = date === today;
      return {
        date,
        day,
        session,
        record,
        isToday,
        isPast: date < today,
        isFuture: date > today,
        checklist: record ? record.checklist : isToday ? draft.checklist : {},
        weightFor: (movementId) =>
          record
            ? (record.weights[movementId] ?? '')
            : isToday
              ? (draft.weights[movementId] ?? state.lastWeights[movementId] ?? '')
              : '',
        bodyWeight: state.bodyWeight[date] ?? '',
      };
    };

    return {
      loaded,
      today,
      profile,
      completed: state.completed,
      bodyWeight: Object.entries(state.bodyWeight)
        .map(([date, v]) => ({ date, lb: parseFloat(v) }))
        .filter((e) => Number.isFinite(e.lb))
        .sort((a, b) => a.date.localeCompare(b.date)),

      programDayFor,
      sessionFor,
      viewDay,
      isWeighInDay: (date) => profile.weighInWeekdays.includes(new Date(`${date}T00:00:00`).getDay()),

      setProfile: (patch) => update((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } })),

      setBodyWeight: (date, v) =>
        update((prev) => {
          const bodyWeight = { ...prev.bodyWeight };
          const clean = v.replace(/[^0-9.]/g, '');
          if (clean) bodyWeight[date] = clean;
          else delete bodyWeight[date];
          return { ...prev, bodyWeight };
        }),

      setWeight: (date, movementId, v) =>
        update((prev) => {
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
            return { ...prev, draft: { ...d, weights: { ...d.weights, [movementId]: v } } };
          }
          const next = withRecord(prev, date, (r) => ({ ...r, weights: { ...r.weights, [movementId]: v } }));
          return v.trim() ? { ...next, lastWeights: { ...next.lastWeights, [movementId]: v.trim() } } : next;
        }),

      setMovement: (date, slot, movementId) =>
        update((prev) => {
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            return { ...prev, swaps: { ...prev.swaps, [slot]: movementId } };
          }
          return withRecord(prev, date, (r) => ({ ...r, movements: { ...r.movements, [slot]: movementId } }));
        }),

      toggleItem: (date, id) =>
        update((prev) => {
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
            return { ...prev, draft: { ...d, checklist: { ...d.checklist, [id]: !d.checklist[id] } } };
          }
          return withRecord(prev, date, (r) => ({ ...r, checklist: { ...r.checklist, [id]: !r.checklist[id] } }));
        }),

      completeToday: () =>
        update((prev) => {
          const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
          const day = daysBetween(prev.profile.programStartDate, today) + 1;
          const session = sessionForDay(day, prev.profile, prev.swaps);
          const weights: Record<string, string> = {};
          const movements: Record<string, string> = {};
          for (const ex of session.exercises ?? []) {
            movements[ex.slot] = ex.movement.id;
            const w = (d.weights[ex.movement.id] ?? prev.lastWeights[ex.movement.id] ?? '').trim();
            if (ex.movement.weighted && w) weights[ex.movement.id] = w;
          }
          const record: DayRecord = { day, date: today, sessionId: session.id, checklist: d.checklist, weights, movements };
          return {
            ...prev,
            completed: [...prev.completed.filter((r) => r.date !== today), record].sort((a, b) => a.date.localeCompare(b.date)),
            lastWeights: { ...prev.lastWeights, ...weights },
            draft: null,
          };
        }),

      reopenToday: () =>
        update((prev) => {
          const rec = prev.completed.find((r) => r.date === today);
          if (!rec) return prev;
          return {
            ...prev,
            completed: prev.completed.filter((r) => r.date !== today),
            draft: { date: today, checklist: rec.checklist, weights: rec.weights },
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
