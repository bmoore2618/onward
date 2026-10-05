/**
 * Who the plan is for. Until the Profile/Settings screen exists, this holds
 * the founder's own settings. Limitations adjust exercise choices and notes
 * (see LIMITATION_ADJUSTMENTS in program.ts); with none, everyone gets the
 * standard program.
 */

export type Limitation = 'lumbar-fusion';

export type Profile = {
  limitations: Limitation[];
};

export const PROFILE: Profile = {
  limitations: ['lumbar-fusion'],
};
