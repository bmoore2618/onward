import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ChecklistId } from '@/data/program';

const STORAGE_KEY = 'onward/state/v1';

export type Checklist = Partial<Record<ChecklistId, boolean>>;
/** Weight typed for each exercise, keyed by exercise id (kept as text, e.g. "35") */
export type Weights = Record<string, string>;

export type DayRecord = {
  day: number;
  /** Local calendar date the day was completed, YYYY-MM-DD */
  date: string;
  sessionId: string;
  checklist: Checklist;
  weights: Weights;
};

export type AppState = {
  completed: DayRecord[];
  /** Most recent weight used per exercise, to pre-fill next time */
  lastWeights: Weights;
  /** Today's in-progress ticks and weights, so closing the app loses nothing */
  draft: { date: string; checklist: Checklist; weights: Weights } | null;
};

export const INITIAL_STATE: AppState = {
  completed: [],
  lastWeights: {},
  draft: null,
};

export async function loadState(): Promise<AppState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_STATE;
  return { ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<AppState>) };
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
