import type { SessionKind } from '@/data/program';
import type { StatusKind } from '@/data/storage';

/**
 * One calm sentence at the top of the Today screen. Picks a pool from what
 * actually happened (a gap, a status, a rough day, a PR), otherwise rotates
 * by day so the same line never shows two days running. Written in the
 * app's voice: adult, encouraging, never militant.
 */
const LINES: Record<SessionKind | 'any' | 'back' | 'low' | 'pr', string[]> = {
  any: [
    'Missed yesterday? Continue today.',
    'You don’t restart. You adjust. You keep going.',
    'Consistency beats intensity. Every time.',
    'Nobody who finished 75 days did all 75 perfectly.',
    'Showing up tired still counts as showing up.',
    'The plan already knows life happens. That’s why it’s 75 days, not 75 perfect days.',
    'Small, repeatable, boring. That’s what works.',
    'Progress is quiet. Check the chart, not the mirror.',
    'You are rebuilding a routine, not proving a point.',
    'Today only has to be good enough.',
  ],
  strength: [
    'Two reps in the tank is the plan, not a shortcut.',
    'Add weight when the reps allow. Not before.',
    'Clean reps today are heavier reps next month.',
    'Short on time? The short version counts. Fully.',
    'Warm up like you mean it. The first set should feel easy.',
    'Pick the weight you can own, not the one you can survive.',
    'Log the sets. Future you is counting on the data.',
    'Strength comes back faster than you think. Let it.',
  ],
  conditioning: [
    'Hard but controlled. Nobody is watching the leaderboard.',
    'Finish the last interval the same as the first.',
    'Easy means you could talk. Hard means you’d rather not.',
    'Duration first, then intensity. The order matters.',
    'Conditioning builds in weeks, not sessions. Keep showing up.',
  ],
  recovery: [
    'Easy days make the hard days possible.',
    'Conversational pace. If you can’t talk, slow down.',
    'Recovery is part of the program, not a day off from it.',
    'Walk. Breathe. Finish feeling better than you started.',
  ],
  rest: [
    'Rest days are training.',
    'Nothing to do today except not quit. Easy.',
    'Monday is a clean start. Not a reset, a start.',
    'Look back at the week. Then let it go.',
  ],
  back: [
    'Welcome back. Today is the whole plan.',
    'A few days away changes nothing. Here’s today.',
    'The best time to train was yesterday. The second best time is this session.',
    'You came back. That’s the hard part, and it’s done.',
  ],
  low: [
    'Yesterday was a low one. Today can be the short version, and that still counts.',
    'Rough day yesterday. Lighter is fine today; stopping is not required either.',
    'If the tank is low, do the first four movements and call it a win.',
  ],
  pr: [
    'That was more than you lifted on Day 1. Quietly, it’s working.',
    'New best since Day 1 yesterday. Same recipe today.',
    'Stronger than when you started. Keep the reps clean and it continues.',
  ],
};

const STATUS_LINES: Record<StatusKind, string[]> = {
  away: ['Away for a bit. The plan will be here, same day, same week, when you are.', 'Nothing to do while you’re away. Come back to whatever day it is.'],
  sick: ['Rest is the plan while you’re sick. Nothing to catch up on.', 'Get well. The program picks up on whatever day you return.'],
  injured: ['Healing is training too. Come back when you’re cleared and we’ll ease in.', 'No session until you’re ready. When you return, the first one is lighter on purpose.'],
};

export type LineContext = {
  cameBack: boolean;
  status: StatusKind | null;
  /** Yesterday's check-in was 1 or 2 */
  lowYesterday: boolean;
  /** A lift beat its Day-1 weight yesterday */
  prYesterday: boolean;
};

export function dailyLine(day: number, kind: SessionKind, ctx: LineContext): string {
  if (ctx.status) return STATUS_LINES[ctx.status][day % STATUS_LINES[ctx.status].length];
  if (ctx.cameBack) return LINES.back[day % LINES.back.length];
  if (ctx.prYesterday) return LINES.pr[day % LINES.pr.length];
  if (ctx.lowYesterday && kind !== 'rest') return LINES.low[day % LINES.low.length];
  // Alternate between the day-type pool and the general pool
  const pool = day % 2 === 0 ? LINES[kind] : LINES.any;
  return pool[Math.floor(day / 2) % pool.length];
}
