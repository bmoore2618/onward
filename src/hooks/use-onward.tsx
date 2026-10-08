import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { syncNotifications } from '@/data/notifications';
import { deletePhotoFile, type Photo } from '@/data/photos';
import type { Profile } from '@/data/profile';
import {
  checklistFor,
  dayCounts,
  isBigJump,
  movement,
  nextLoad,
  PHASES,
  phaseForDay,
  resetLoad,
  sessionForDay,
  type ChecklistId,
  type Session,
  type SessionOptions,
  type Swaps,
} from '@/data/program';
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
  /** Per-set weights as typed (padded to `sets`), plus the value to grey in for blank sets */
  setWeightsFor: (movementId: string, sets: number) => { values: string[]; placeholder: string };
  hitFor: (movementId: string) => 'hit' | 'miss' | undefined;
  short: boolean;
  bodyWeight: string;
  /** Whether this day counts as completed under the day-completion rule */
  counts: boolean;
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
  /** Same numbers for the previous full week, for the goal review */
  previous: { workoutsDone: number; trainingDays: number; habitsPct: number } | null;
};

export type LiftSuggestion = {
  last: { date: string; day: number; lb: string; hit?: 'hit' | 'miss' } | null;
  /** What to load this time, when we have enough history to say */
  suggested: number | null;
  text: string;
};

type Onward = {
  loaded: boolean;
  today: string;
  profile: Profile;
  completed: DayRecord[];
  /** Weigh-ins, oldest first, parsed */
  bodyWeight: { date: string; lb: number }[];

  programDayFor: (date: string) => number;
  /** Plain session for a program day (no re-entry/short adjustments) */
  sessionFor: (day: number) => Session;
  viewDay: (date: string) => DayView;
  isWeighInDay: (date: string) => boolean;

  checkinFor: (date: string) => Checkin;
  setFeel: (date: string, feel: number | null) => void;
  setNote: (date: string, note: string) => void;
  /** Load suggestion for a movement on a date, from what was logged before it */
  suggestion: (movementId: string, beforeDate: string) => LiftSuggestion;
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
  /** Weight for one set; the movement's working weight becomes the heaviest set entered */
  setSetWeight: (date: string, movementId: string, index: number, value: string) => void;
  setHit: (date: string, movementId: string, hit: 'hit' | 'miss' | null) => void;
  /** Swap a slot. On today/future the scope says whether it outlives the current phase. */
  setMovement: (date: string, slot: string, movementId: string, scope?: 'always' | 'phase') => void;
  /** Best logged weight per movement since Day 1, with the first weight for comparison */
  bestLifts: () => { movementId: string; name: string; first: number; best: number; bestDay: number }[];
  toggleItem: (date: string, id: ChecklistId) => void;
  toggleShort: (date: string) => void;
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

  // Keep the next two weeks of reminders scheduled (re-run whenever the data they describe changes)
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => syncNotifications(state.profile, value.sessionFor, value.weekSummary).catch(() => {}), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, today, state.profile, state.swaps, state.swapScope, state.completed, state.bodyWeight]);

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
    /** Swaps that still apply on a given day: "phase" swaps expire when the phase changes */
    const effectiveSwaps = (day: number): Swaps => {
      const p = phaseForDay(day);
      const pIndex = PHASES.indexOf(p);
      const out: Swaps = {};
      for (const [slot, id] of Object.entries(state.swaps)) {
        const meta = state.swapScope[slot];
        if (!meta || meta.scope === 'always' || meta.phase === pIndex) out[slot] = id;
      }
      return out;
    };
    const sessionFor = (day: number) => sessionForDay(day, profile, effectiveSwaps(day));
    const recordFor = (date: string) => state.completed.find((r) => r.date === date);
    const draft = state.draft?.date === today ? state.draft : emptyDraft(today);
    const isTrainingDay = (day: number) => {
      const k = (day - 1) % 7;
      return k === 0 || k === 1 || k === 2 || k === 4 || k === 5;
    };
    const weekStartOf = (date: string) => {
      const day = programDayFor(date);
      return addDays(date, -((day - 1 + 7000) % 7));
    };

    /** Last date before `date` with a logged workout */
    const lastWorkoutBefore = (date: string): string | null => {
      for (let i = state.completed.length - 1; i >= 0; i--) {
        const r = state.completed[i];
        if (r.date < date && r.checklist.workout) return r.date;
      }
      return null;
    };

    /**
     * Re-entry and hold rules. After 3+ consecutive missed training days the
     * next session is lighter; after 7+ days away the whole return week runs at
     * the previous phase's prescription. Neither applies before the first logged
     * workout (that's just Day 1).
     */
    const optionsFor = (date: string, record: DayRecord | undefined): SessionOptions => {
      const day = programDayFor(date);
      const short = record ? !!record.short : date === today ? !!draft.short : false;
      // Future days are a preview of the plan; re-entry depends on what actually happens
      if (date > today || day <= 1 || !state.completed.some((r) => r.checklist.workout)) return { short };
      if (record?.checklist.workout && !record.reentry) return { short, reentry: false, holdPhase: !!record.holdPhase };

      // Consecutive missed training days immediately before this date
      let missed = 0;
      for (let d = addDays(date, -1), n = programDayFor(d); n >= 1 && n < day; d = addDays(d, -1), n--) {
        const r = recordFor(d);
        if (r?.checklist.workout) break;
        if (isTrainingDay(n)) missed++;
        if (missed >= 6) break;
      }
      const reentry = missed >= 3 && isTrainingDay(day);

      // Hold the previous phase for the whole week when the week began after 7+ days away
      const weekStart = weekStartOf(date);
      const firstInWeek = state.completed.find((r) => r.date >= weekStart && r.date <= date && r.checklist.workout);
      const anchor = firstInWeek ? firstInWeek.date : date;
      const prev = lastWorkoutBefore(firstInWeek ? firstInWeek.date : date);
      const holdPhase = prev !== null && daysBetween(prev, anchor) >= 7 && programDayFor(date) > 14;

      return { short, reentry, holdPhase };
    };

    const sessionForDate = (date: string, record: DayRecord | undefined) => {
      const day = programDayFor(date);
      const opts = record ? { ...optionsFor(date, record), reentry: !!record.reentry, holdPhase: !!record.holdPhase } : optionsFor(date, undefined);
      return { session: sessionForDay(day, profile, { ...effectiveSwaps(day), ...record?.movements }, opts), opts };
    };

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
      const completed = [...prev.completed.filter((r) => r.date !== date), updated].sort((a, b) => a.date.localeCompare(b.date));
      return { ...prev, completed };
    };

    const viewDay = (date: string): DayView => {
      const day = programDayFor(date);
      const record = recordFor(date);
      const { session, opts } = sessionForDate(date, record);
      const isToday = date === today;
      const checklist = record ? record.checklist : isToday ? draft.checklist : {};
      return {
        date,
        day,
        session,
        record,
        isToday,
        isPast: date < today,
        isFuture: date > today,
        checklist,
        weightFor: (movementId) =>
          record
            ? (record.weights[movementId] ?? '')
            : isToday
              ? (draft.weights[movementId] ?? state.lastWeights[movementId] ?? '')
              : '',
        setWeightsFor: (movementId, sets) => {
          const raw = record ? record.setWeights?.[movementId] : isToday ? draft.setWeights?.[movementId] : undefined;
          const values = Array.from({ length: sets }, (_, i) => raw?.[i] ?? '');
          const firstTyped = values.find((v) => v.trim()) ?? '';
          const placeholder = firstTyped || (record ? (record.weights[movementId] ?? '') : isToday ? (state.lastWeights[movementId] ?? '') : '');
          return { values, placeholder };
        },
        hitFor: (movementId) => (record ? record.hits?.[movementId] : isToday ? draft.hits?.[movementId] : undefined),
        short: !!opts.short,
        bodyWeight: state.bodyWeight[date] ?? '',
        counts: dayCounts(session, checklist),
      };
    };

    const history = (movementId: string, beforeDate: string) => {
      const out: { date: string; day: number; lb: string; hit?: 'hit' | 'miss' }[] = [];
      for (let i = state.completed.length - 1; i >= 0 && out.length < 2; i--) {
        const r = state.completed[i];
        if (r.date >= beforeDate) continue;
        const lb = r.weights[movementId];
        if (lb) out.push({ date: r.date, day: r.day, lb, hit: r.hits?.[movementId] });
      }
      return out;
    };

    const summarizeWeek = (weekStart: string, last: string) => {
      const startDay = programDayFor(weekStart);
      let workoutsDone = 0, trainingDays = 0, habitsDone = 0, habitsTotal = 0;
      const feels: number[] = [];
      const weights: number[] = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        if (d > last) break;
        const session = sessionFor(startDay + i);
        const record = recordFor(d);
        habitsTotal += checklistFor(session).length;
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
      return { workoutsDone, trainingDays, habitsDone, habitsTotal, feels, weights };
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

      suggestion: (movementId, beforeDate) => {
        const [last, before] = history(movementId, beforeDate);
        if (!last) return { last: null, suggested: null, text: 'First time. Pick a weight that leaves 3–4 reps in the tank.' };
        const lb = parseFloat(last.lb);
        const base = `Last: ${last.lb} lb (Day ${last.day})`;
        if (!Number.isFinite(lb)) return { last, suggested: null, text: base };
        if (last.hit === 'hit') {
          const n = nextLoad(lb);
          return isBigJump(lb, n)
            ? { last, suggested: lb, text: `${base}, all reps hit → ${n} is a big step, so stay at ${last.lb} and work up to 15 reps first` }
            : { last, suggested: n, text: `${base}, all reps hit → try ${n}` };
        }
        if (last.hit === 'miss' && before?.hit === 'miss') {
          const n = resetLoad(lb);
          return { last, suggested: n, text: `${base}, short two sessions → back off to ${n} and rebuild` };
        }
        if (last.hit === 'miss') return { last, suggested: lb, text: `${base}, a bit short → same weight today` };
        return { last, suggested: null, text: base };
      },

      weekSummary: (date) => {
        const start = weekStartOf(date);
        const end = addDays(start, 6);
        const last = date < today ? date : today; // only count days that have happened
        const cur = summarizeWeek(start, last);
        const prevStart = addDays(start, -7);
        const prevWeek = programDayFor(prevStart) >= 1 ? summarizeWeek(prevStart, addDays(start, -1)) : null;
        return {
          week: Math.floor((programDayFor(start) - 1) / 7) + 1,
          start,
          end,
          workoutsDone: cur.workoutsDone,
          trainingDays: cur.trainingDays,
          habitsDone: cur.habitsDone,
          habitsTotal: cur.habitsTotal,
          weightChange: cur.weights.length >= 2 ? Math.round((cur.weights[cur.weights.length - 1] - cur.weights[0]) * 10) / 10 : null,
          avgFeel: cur.feels.length ? Math.round((cur.feels.reduce((a, b) => a + b, 0) / cur.feels.length) * 10) / 10 : null,
          previous: prevWeek
            ? {
                workoutsDone: prevWeek.workoutsDone,
                trainingDays: prevWeek.trainingDays,
                habitsPct: prevWeek.habitsTotal ? Math.round((prevWeek.habitsDone / prevWeek.habitsTotal) * 100) : 0,
              }
            : null,
        };
      },

      photos: state.photos,

      savePhotos: (photos) =>
        update((prev) => {
          const ids = new Set(photos.map((p) => p.id));
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
          photos: prev.photos.map((p) => (p.date === fromDate ? { ...p, date: toDate } : p)).sort((a, b) => a.date.localeCompare(b.date)),
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

      setSetWeight: (date, movementId, index, v) =>
        update((prev) => {
          const clean = v.replace(/[^0-9.]/g, '');
          const apply = (sw: Record<string, string[]> | undefined) => {
            const arr = [...(sw?.[movementId] ?? [])];
            while (arr.length <= index) arr.push('');
            arr[index] = clean;
            return { ...sw, [movementId]: arr };
          };
          // Working weight = heaviest set typed so far
          const working = (arr: string[]) => {
            const nums = arr.map(parseFloat).filter(Number.isFinite);
            return nums.length ? String(Math.max(...nums)) : '';
          };
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
            const setWeights = apply(d.setWeights);
            return { ...prev, draft: { ...d, setWeights, weights: { ...d.weights, [movementId]: working(setWeights[movementId]) } } };
          }
          const next = withRecord(prev, date, (r) => {
            const setWeights = apply(r.setWeights);
            return { ...r, setWeights, weights: { ...r.weights, [movementId]: working(setWeights[movementId]) } };
          });
          const w = next.completed.find((r) => r.date === date)?.weights[movementId];
          return w ? { ...next, lastWeights: { ...next.lastWeights, [movementId]: w } } : next;
        }),

      setHit: (date, movementId, hit) =>
        update((prev) => {
          const apply = (hits: Record<string, 'hit' | 'miss'> | undefined) => {
            const next = { ...hits };
            if (hit) next[movementId] = hit;
            else delete next[movementId];
            return next;
          };
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
            return { ...prev, draft: { ...d, hits: apply(d.hits) } };
          }
          return withRecord(prev, date, (r) => ({ ...r, hits: apply(r.hits) }));
        }),

      setMovement: (date, slot, movementId, scope = 'always') =>
        update((prev) => {
          if (date >= today && !prev.completed.some((r) => r.date === date)) {
            const phase = PHASES.indexOf(phaseForDay(daysBetween(prev.profile.programStartDate, date) + 1));
            return {
              ...prev,
              swaps: { ...prev.swaps, [slot]: movementId },
              swapScope: { ...prev.swapScope, [slot]: { scope, phase } },
            };
          }
          return withRecord(prev, date, (r) => ({ ...r, movements: { ...r.movements, [slot]: movementId } }));
        }),

      bestLifts: () => {
        const firstSeen = new Map<string, number>();
        const best = new Map<string, { lb: number; day: number }>();
        for (const r of state.completed) {
          for (const [id, raw] of Object.entries(r.weights)) {
            const lb = parseFloat(raw);
            if (!Number.isFinite(lb)) continue;
            if (!firstSeen.has(id)) firstSeen.set(id, lb);
            const b = best.get(id);
            if (!b || lb > b.lb) best.set(id, { lb, day: r.day });
          }
        }
        return [...best.entries()]
          .map(([id, b]) => ({ movementId: id, name: movement(id).name, first: firstSeen.get(id) ?? b.lb, best: b.lb, bestDay: b.day }))
          .sort((a, b) => b.best - b.first - (a.best - a.first) || a.name.localeCompare(b.name));
      },

      toggleItem: (date, id) =>
        update((prev) => {
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
            return { ...prev, draft: { ...d, checklist: { ...d.checklist, [id]: !d.checklist[id] } } };
          }
          return withRecord(prev, date, (r) => ({ ...r, checklist: { ...r.checklist, [id]: !r.checklist[id] } }));
        }),

      toggleShort: (date) =>
        update((prev) => {
          if (date === today && !prev.completed.some((r) => r.date === date)) {
            const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
            return { ...prev, draft: { ...d, short: !d.short } };
          }
          return withRecord(prev, date, (r) => ({ ...r, short: !r.short }));
        }),

      completeToday: () =>
        update((prev) => {
          const d = prev.draft?.date === today ? prev.draft : emptyDraft(today);
          const day = daysBetween(prev.profile.programStartDate, today) + 1;
          const opts = optionsFor(today, undefined);
          const session = sessionForDay(day, prev.profile, effectiveSwaps(day), opts);
          const weights: Record<string, string> = {};
          const movements: Record<string, string> = {};
          for (const ex of session.exercises ?? []) {
            movements[ex.slot] = ex.movement.id;
            const w = (d.weights[ex.movement.id] ?? prev.lastWeights[ex.movement.id] ?? '').trim();
            if (ex.movement.weighted && w) weights[ex.movement.id] = w;
          }
          const record: DayRecord = {
            day,
            date: today,
            sessionId: session.id,
            checklist: d.checklist,
            weights,
            setWeights: d.setWeights,
            movements,
            hits: d.hits,
            short: d.short,
            reentry: opts.reentry || undefined,
            holdPhase: opts.holdPhase || undefined,
          };
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
            draft: { date: today, checklist: rec.checklist, weights: rec.weights, setWeights: rec.setWeights, hits: rec.hits, short: rec.short },
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
