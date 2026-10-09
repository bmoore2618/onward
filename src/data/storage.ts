import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Photo } from '@/data/photos';
import { DEFAULT_PROFILE, type Profile } from '@/data/profile';
import type { ChecklistId, Swaps } from '@/data/program';

const STORAGE_KEY = 'onward/state/v1';

export type Checklist = Partial<Record<ChecklistId, boolean>>;
/** Weight typed for each movement, keyed by movement id (kept as text, e.g. "35") */
export type Weights = Record<string, string>;

export type DayRecord = {
  day: number;
  /** Local calendar date of the day, YYYY-MM-DD */
  date: string;
  sessionId: string;
  checklist: Checklist;
  /** Working weight per movement (the heaviest set), used for suggestions and bests */
  weights: Weights;
  /** Weight typed for each set, per movement; "" for sets left blank */
  setWeights?: Record<string, string[]>;
  /** Which movement was done in each slot, when it differs from the default */
  movements?: Record<string, string>;
  /** Per movement: did every set reach the top of the rep range? */
  hits?: Record<string, 'hit' | 'miss'>;
  /** The short (20–25 min) version was done */
  short?: boolean;
  /** This session was the automatic lighter re-entry after days away */
  reentry?: boolean;
  /** This session ran at the previous phase's prescription after 7+ days away */
  holdPhase?: boolean;
  /** Did something other than the planned session (a walk, a swim…) */
  movedAnyway?: { kind: MovedKind; minutes?: number };
  /** Cardio-track self-test result, as typed ("11:42", "6.4 mi") */
  testResult?: string;
};

export type MovedKind = 'walk' | 'bike' | 'swim' | 'run' | 'other';

export type AppState = {
  profile: Profile;
  completed: DayRecord[];
  /** Most recent weight used per movement, to pre-fill next time */
  lastWeights: Weights;
  /** Today's in-progress ticks and weights, so closing the app loses nothing */
  draft: {
    date: string;
    checklist: Checklist;
    weights: Weights;
    setWeights?: Record<string, string[]>;
    hits?: Record<string, 'hit' | 'miss'>;
    short?: boolean;
    testResult?: string;
  } | null;
  /** Chosen movement per exercise slot */
  swaps: Swaps;
  /** How long a swap lasts: always, or only for the phase it was made in (phase index) */
  swapScope: Record<string, { scope: 'always' | 'phase'; phase: number }>;
  /** Weigh-ins, date (YYYY-MM-DD) → pounds exactly as typed, e.g. "212.4" */
  bodyWeight: Record<string, string>;
  /** Progress photos, oldest first. Image files live in the app's documents folder. */
  photos: Photo[];
  /** Daily check-in by date: how the day felt (1–5) and a free note */
  checkins: Record<string, Checkin>;
  /** Milestone ids whose "earned" card has been shown */
  seenMilestones: string[];
  /** "Not training for a while" status: pauses reminders and marks days as intentional */
  status: { kind: StatusKind; since: string } | null;
  /** Past statuses, so the calendar can show paused days after the user is back */
  statusHistory: { kind: StatusKind; since: string; until: string }[];
  /** Order of the Progress tab's sections and which are hidden */
  progressLayout: { id: ProgressSectionId; hidden?: boolean }[];
  /** First-open setup finished */
  onboarded: boolean;
};

export type ProgressSectionId = 'stats' | 'milestones' | 'weight' | 'lifts' | 'photos' | 'habits' | 'calendar';

export const DEFAULT_PROGRESS_LAYOUT: AppState['progressLayout'] = [
  { id: 'stats' },
  { id: 'milestones' },
  { id: 'weight' },
  { id: 'lifts' },
  { id: 'photos' },
  { id: 'habits' },
  { id: 'calendar' },
];

export type StatusKind = 'away' | 'sick' | 'injured';

export type Checkin = { feel?: number; note?: string };

export const INITIAL_STATE: AppState = {
  profile: DEFAULT_PROFILE,
  completed: [],
  lastWeights: {},
  draft: null,
  swaps: {},
  swapScope: {},
  bodyWeight: {},
  photos: [],
  checkins: {},
  seenMilestones: [],
  status: null,
  statusHistory: [],
  progressLayout: DEFAULT_PROGRESS_LAYOUT,
  onboarded: false,
};

export async function loadState(): Promise<AppState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_STATE;
  // Older saves kept these outside the profile
  const saved = JSON.parse(raw) as Partial<AppState> & {
    goalWeight?: string;
    settings?: { notificationsEnabled?: boolean; eveningHour?: number; morningHour?: number };
  };
  const { goalWeight, settings, ...rest } = saved;
  // The back limitation was renamed from "lumbar-fusion" to "lower-back"
  const savedLimitations = (saved.profile?.limitations as string[] | undefined)?.map((l) => (l === 'lumbar-fusion' ? 'lower-back' : l));
  // Checklist items were renamed: "protein" became "meals"; "water" was dropped
  const migrate = (c: Record<string, boolean | undefined> | undefined): Checklist => {
    if (!c) return {};
    const { protein, water: _water, ...keep } = c;
    return { ...keep, ...(protein !== undefined && keep.meals === undefined ? { meals: protein } : {}) } as Checklist;
  };
  return {
    ...INITIAL_STATE,
    ...rest,
    // Installs from before onboarding existed already have a profile and data
    onboarded: rest.onboarded ?? ((rest.completed?.length ?? 0) > 0 || !!saved.profile),
    completed: (rest.completed ?? []).map((r) => ({ ...r, checklist: migrate(r.checklist) })),
    // Photos saved before poses existed count as "front"
    photos: (rest.photos ?? []).map((p) => ({ ...p, pose: p.pose ?? 'front' })),
    // New sections get appended to a saved layout
    progressLayout: [
      ...(rest.progressLayout ?? []).filter((s) => DEFAULT_PROGRESS_LAYOUT.some((d) => d.id === s.id)),
      ...DEFAULT_PROGRESS_LAYOUT.filter((d) => !(rest.progressLayout ?? []).some((s) => s.id === d.id)),
    ],
    draft: rest.draft ? { ...rest.draft, checklist: migrate(rest.draft.checklist) } : null,
    profile: {
      ...DEFAULT_PROFILE,
      ...(goalWeight ? { goalWeight } : {}),
      ...settings,
      ...saved.profile,
      ...(savedLimitations ? { limitations: savedLimitations as Profile['limitations'] } : {}),
    },
  };
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD key as local midnight */
export function dateFromKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

/** "Thursday, October 9" — for screen-reader labels, never "2026-10-09" */
export function spokenDate(key: string): string {
  return dateFromKey(key).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function isValidDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(dateFromKey(key).getTime()) && todayKey(dateFromKey(key)) === key;
}

export function daysBetween(fromKey: string, toKey: string): number {
  const ms = dateFromKey(toKey).getTime() - dateFromKey(fromKey).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(key: string, n: number): string {
  const d = dateFromKey(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}
