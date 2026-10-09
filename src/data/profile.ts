/**
 * Who the plan is for and how the app behaves. Set during onboarding, saved
 * on the device, edited on the Settings tab. DEFAULT_PROFILE is the general
 * starting point (no limitations, home gym). Limitations adjust exercise
 * choices and notes as comfort preferences (see ADJUSTMENTS in program.ts).
 */

/** The next Monday on or after a date, as YYYY-MM-DD (Day 1 should be a Monday) */
export function nextMonday(from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const add = (8 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + add);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type Limitation = 'lower-back' | 'knee' | 'shoulder';

/** Where the user trains. Changes only which movement fills each slot. */
export type Equipment = 'home' | 'gym' | 'bodyweight';

export type CardioMode = 'bike' | 'walk' | 'row';

export type Profile = {
  /** First name, optional; used in greetings */
  name: string;
  /**
   * Local date of program Day 1, YYYY-MM-DD. The program follows the
   * calendar from here, so this should be a Monday to put Strength A on
   * Mondays and rest on Sundays.
   */
  programStartDate: string;
  equipment: Equipment;
  cardioMode: CardioMode;
  hasHeavyBag: boolean;
  limitations: Limitation[];
  /** Weekdays with a weigh-in prompt on the Today screen (0 = Sunday … 6 = Saturday) */
  weighInWeekdays: number[];
  /** Target body weight in pounds, as typed */
  goalWeight: string;
  notificationsEnabled: boolean;
  /** Each reminder can be switched off on its own */
  notifyEvening: boolean;
  notifyMorning: boolean;
  notifyWeekWrap: boolean;
  /** Local hour (0–23) of the "tomorrow's workout" reminder */
  eveningHour: number;
  /** Local hour (0–23) of the "today's session is ready" reminder */
  morningHour: number;
};

export const DEFAULT_PROFILE: Profile = {
  name: '',
  programStartDate: '2026-09-28',
  equipment: 'home',
  cardioMode: 'bike',
  hasHeavyBag: false,
  limitations: [],
  weighInWeekdays: [1, 4],
  goalWeight: '',
  notificationsEnabled: true,
  notifyEvening: true,
  notifyMorning: true,
  notifyWeekWrap: true,
  eveningHour: 20,
  morningHour: 7,
};
