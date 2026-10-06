/**
 * Who the plan is for and how the app behaves. Saved on the device and
 * edited on the Settings tab; DEFAULT_PROFILE holds the founder's settings
 * until a real onboarding exists. Limitations adjust exercise choices and
 * notes (see LIMITATION_ADJUSTMENTS in program.ts); with none, everyone gets
 * the standard program.
 */

export type Limitation = 'lumbar-fusion';

export type Profile = {
  /**
   * Local date of program Day 1, YYYY-MM-DD. The program follows the
   * calendar from here, so this should be a Monday to put Strength A on
   * Mondays and rest on Sundays.
   */
  programStartDate: string;
  limitations: Limitation[];
  /** Weekdays with a weigh-in prompt on the Today screen (0 = Sunday … 6 = Saturday) */
  weighInWeekdays: number[];
  /** Target body weight in pounds, as typed */
  goalWeight: string;
  notificationsEnabled: boolean;
  /** Local hour (0–23) of the "tomorrow's workout" reminder */
  eveningHour: number;
  /** Local hour (0–23) of the "today's session is ready" reminder */
  morningHour: number;
};

export const DEFAULT_PROFILE: Profile = {
  programStartDate: '2026-09-28',
  limitations: ['lumbar-fusion'],
  weighInWeekdays: [1, 4],
  goalWeight: '',
  notificationsEnabled: true,
  eveningHour: 20,
  morningHour: 7,
};
