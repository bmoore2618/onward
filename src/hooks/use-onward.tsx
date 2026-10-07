import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { syncNotifications } from '@/data/notifications';
import { deletePhotoFile, type Photo } from '@/data/photos';
import type { Profile } from '@/data/profile';
import { sessionForDay, type ChecklistId, type Session } from '@/data/program';
import {
  addDays,
  daysBetween,
  INITIAL_STATE,
  loadState,
  saveState,
  todayKey,
  type AppState,
  type Checkin,
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

export type WeekSummary = {
  /** 1-based week of the program */
  week: number;
  start: string;
  end: string;
  workoutsDone: number;
  trainingDays: number;
  /** Checklist items ticked / applicable, across the week so far */
  habitsDone: number;
  habitsTotal: number;
  /** Change in body weight between the first and last weigh-in of the week, if two exist */
  weightChange: number | null;
  /** Average check-in (1–5), if any */
  avgFeel: number | null;
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

  checkinFor: (date: string) => Checkin;
  setFeel: (date: string, feel: number | null) => void;
  setNote: (date: string, note: string) => void;
  /** Most recent logged weight for a movement before a date */
  lastLift: (movementId: string, beforeDate: string) => { date: string; day: number; lb: string } | null;
  /** Summary of the Monday–Sunday week containing a date */
  weekSummary: (date: string) => WeekSummary;

  photos: Photo[];
  /** Add or replace photos (matched by id) */
  savePhotos: (photos: Photo[]) => void;
  removePhoto: (id: string) => void;
  /** Move every photo on one date to another date */
  moveSession: (fromDate: string, toDate: string) => void;

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

      checkinFor: (date) => state.checkins[date] ?? {},

      setFeel: (date, feel) =>
        update((prev) => ({
          ...prev,
          checkins: { ...prev.checkins, [date]: { ...prev.checkins[date], feel: feel ?? undefined } },
        })),

      setNote: (date, note) =>
        update((prev) => ({ ...prev, checkins: { ...prev.checkins, [date]: { ...prev.checkins[date], note } } })),

      lastLift: (movementId, beforeDate) => {
        for (let i = state.completed.length - 1; i >= 0; i--) {
          const r = state.completed[i];
          if (r.date >= beforeDate) continue;
          const lb = r.weights[movementId];
          if (lb) return { date: r.date, day: r.day, lb };
        }
        return null;
      },

      weekSummary: (date) => {
        const day = programDayFor(date);
        const weekStartDay = day - ((day - 1 + 7000) % 7);
        const start = addDays(profile.programStartDate, weekStartDay - 1);
        const end = addDays(start, 6);
        const last = date < today ? date : today; // only count days that have happened
        let workoutsDone = 0, trainingDays = 0, habitsDone = 0, habitsTotal = 0;
        const feels: number[] = [];
        const weights: number[] = [];
        for (let i = 0; i < 7; i++) {
          const d = addDays(start, i);
          if (d > last) break;
          const session = sessionFor(weekStartDay + i);
          const record = recordFor(d);
          const items = session.kind === 'rest' ? 4 : 5;
          habitsTotal += items;
          habitsDone += Object.values(record?.checklist ?? {}).filter(Boolean).length;
          if (session.kind !== 'rest') {
            trainingDays++;
            if (record?.checklist.workout) workoutsDone++;
          }
          const f = state.checkins[d]?.feel;
          if (f) feels.push(f);
          const w = parseFloat(state.bodyWeight[d] ?? '');
          if (Number.isFinite(w)) weights.push(w);
        }
        return {
          week: Math.floor((weekStartDay - 1) / 7) + 1,
          start,
          end,
          workoutsDone,
          trainingDays,
          habitsDone,
          habitsTotal,
          weightChange: weights.length >= 2 ? Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10 : null,
          avgFeel: feels.length ? Math.round((feels.reduce((a, b) => a + b, 0) / feels.length) * 10) / 10 : null,
        };
      },

      photos: state.photos,

      savePhotos: (photos) =>
        update((prev) => {
          const ids = new Set(photos.map((p) => p.id));
          // A replaced photo's old file is no longer needed
          for (const old of prev.photos) {
            const next = photos.find((p) => p.id === old.id);
            if (next && next.file !== old.file) deletePhotoFile(old);
          }
          const merged = [...prev.photos.filter((p) => !ids.has(p.id)), ...photos].sort((a, b) => a.date.localeCompare(b.date));
          return { ...prev, photos: merged };
        }),

      removePhoto: (id) =>
        update((prev) => {
          const photo = prev.photos.find((p) => p.id === id);
          if (photo) deletePhotoFile(photo);
          return { ...prev, photos: prev.photos.filter((p) => p.id !== id) };
        }),

      moveSession: (fromDate, toDate) =>
        update((prev) => ({
          ...prev,
          photos: prev.photos
            .map((p) => (p.date === fromDate ? { ...p, date: toDate } : p))
            .sort((a, b) => a.date.localeCompare(b.date)),
        })),

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
