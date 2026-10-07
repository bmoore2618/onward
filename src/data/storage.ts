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
  weights: Weights;
  /** Which movement was done in each slot, when it differs from the default */
  movements?: Record<string, string>;
};

export type AppState = {
  profile: Profile;
  completed: DayRecord[];
  /** Most recent weight used per movement, to pre-fill next time */
  lastWeights: Weights;
  /** Today's in-progress ticks and weights, so closing the app loses nothing */
  draft: { date: string; checklist: Checklist; weights: Weights } | null;
  /** Chosen movement per exercise slot */
  swaps: Swaps;
  /** Weigh-ins, date (YYYY-MM-DD) → pounds exactly as typed, e.g. "212.4" */
  bodyWeight: Record<string, string>;
  /** Progress photos, oldest first. Image files live in the app's documents folder. */
  photos: Photo[];
  /** Daily check-in by date: how the day felt (1–5) and a free note */
  checkins: Record<string, Checkin>;
};

export type Checkin = { feel?: number; note?: string };

export const INITIAL_STATE: AppState = {
  profile: DEFAULT_PROFILE,
  completed: [],
  lastWeights: {},
  draft: null,
  swaps: {},
  bodyWeight: {},
  photos: [],
  checkins: {},
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
  // Checklist items were renamed: "protein" became "meals"; "water" was dropped
  const migrate = (c: Record<string, boolean | undefined> | undefined): Checklist => {
    if (!c) return {};
    const { protein, water: _water, ...keep } = c;
    return { ...keep, ...(protein !== undefined && keep.meals === undefined ? { meals: protein } : {}) } as Checklist;
  };
  return {
    ...INITIAL_STATE,
    ...rest,
    completed: (rest.completed ?? []).map((r) => ({ ...r, checklist: migrate(r.checklist) })),
    // Photos saved before poses existed count as "front"
    photos: (rest.photos ?? []).map((p) => ({ ...p, pose: p.pose ?? 'front' })),
    draft: rest.draft ? { ...rest.draft, checklist: migrate(rest.draft.checklist) } : null,
    profile: {
      ...DEFAULT_PROFILE,
      ...(goalWeight ? { goalWeight } : {}),
      ...settings,
      ...saved.profile,
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
