/**
 * Who the plan is for. Until the Profile/Settings screen exists, this holds
 * the founder's own settings. Limitations adjust exercise choices and notes
 * (see LIMITATION_ADJUSTMENTS in program.ts); with none, everyone gets the
 * standard program.
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
};

export const PROFILE: Profile = {
  programStartDate: '2026-09-28',
  limitations: ['lumbar-fusion'],
};
