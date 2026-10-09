import { PHASES, PROGRAM_LENGTH_DAYS } from '@/data/program';

/**
 * Milestones are earned once and never lost. Every one rewards showing up
 * (including showing up again after a gap); none rewards never missing.
 */
export type Milestone = {
  id: string;
  title: string;
  /** How to earn it, shown while locked */
  how: string;
  /** Short glyph for the badge face */
  glyph: string;
};

export const MILESTONES: Milestone[] = [
  { id: 'first-day', title: 'Day one', glyph: '1', how: 'Complete your first day.' },
  { id: 'week-one', title: 'First week', glyph: '7', how: 'Complete seven days.' },
  { id: 'came-back', title: 'Came back', glyph: '↻', how: 'Train again after three or more days away. The one that matters most.' },
  { id: 'rebuild', title: 'Rebuild', glyph: 'I', how: `Reach the end of the Rebuild phase (Day ${PHASES[0].lastDay}).` },
  { id: 'days-25', title: '25 days', glyph: '25', how: 'Complete 25 days.' },
  { id: 'build', title: 'Build', glyph: 'II', how: `Reach the end of the Build phase (Day ${PHASES[1].lastDay}).` },
  { id: 'first-pr', title: 'Stronger', glyph: '↑', how: 'Lift more than you did the first time, on any movement.' },
  { id: 'full-week', title: 'All five', glyph: '5', how: 'Tick all five habits on five days in one week.' },
  { id: 'standard-week', title: 'The standard', glyph: '6/6', how: 'A full week: every session and 90% of habits.' },
  { id: 'standard-3', title: 'Three in a row', glyph: '×3', how: 'Three full weeks back to back.' },
  { id: 'days-50', title: '50 days', glyph: '50', how: 'Complete 50 days.' },
  { id: 'push', title: 'Push', glyph: 'III', how: `Reach the end of the Push phase (Day ${PHASES[2].lastDay}).` },
  { id: 'momentum', title: 'Momentum', glyph: '≥2', how: 'Four weeks with two or more sessions each.' },
  { id: 'first-weigh-in', title: 'On the scale', glyph: 'lb', how: 'Log your first weigh-in.' },
  { id: 'first-photos', title: 'Before', glyph: '▣', how: 'Add your first photo session.' },
  { id: 'short-day', title: 'Something beats nothing', glyph: '20', how: 'Do the short version of a session on a busy day.' },
  { id: 'finish', title: 'Onward', glyph: '75', how: `Reach Day ${PROGRAM_LENGTH_DAYS}.` },
];

export type EarnedMilestone = Milestone & { earnedOn: string | null };
