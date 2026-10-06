import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ChecklistId, Swaps } from '@/data/program';

const STORAGE_KEY = 'onward/state/v1';

export type Checklist = Partial<Record<ChecklistId, boolean>>;
/** Weight typed for each movement, keyed by movement id (kept as text, e.g. "35") */
export type Weights = Record<string, string>;

export type DayRecord = {
  day: number;
  /** Local calendar date the day was completed, YYYY-MM-DD */
  date: string;
  sessionId: string;
  checklist: Checklist;
  weights: Weights;
  /** Which movement was done in each slot, when it differs from the default */
  movements?: Record<string, string>;
};

export type Settings = {
  notificationsEnabled: boolean;
  /** Local hour (0–23) of the "tomorrow's workout" reminder */
  eveningHour: number;
  /** Local hour (0–23) of the "today's session is ready" reminder */
  morningHour: number;
};

export type AppState = {
  completed: DayRecord[];
  /** Most recent weight used per movement, to pre-fill next time */
  lastWeights: Weights;
  /** Today's in-progress ticks and weights, so closing the app loses nothing */
  draft: { date: string; checklist: Checklist; weights: Weights } | null;
  /** Chosen movement per exercise slot */
  swaps: Swaps;
  settings: Settings;
};

export const INITIAL_STATE: AppState = {
  completed: [],
  lastWeights: {},
  draft: null,
  swaps: {},
  settings: { notificationsEnabled: true, eveningHour: 20, morningHour: 7 },
};

export async function loadState(): Promise<AppState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_STATE;
  const saved = JSON.parse(raw) as Partial<AppState>;
  return { ...INITIAL_STATE, ...saved, settings: { ...INITIAL_STATE.settings, ...saved.settings } };
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

export function daysBetween(fromKey: string, toKey: string): number {
  const ms = dateFromKey(toKey).getTime() - dateFromKey(fromKey).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(key: string, n: number): string {
  const d = dateFromKey(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}
