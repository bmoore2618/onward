import type { SessionKind } from '@/data/program';

/**
 * One calm sentence at the top of the Today screen. Rotates by day so the
 * same line never shows two days running. Written in the app's voice: adult,
 * encouraging, never militant.
 */
const LINES: Record<SessionKind | 'any' | 'back', string[]> = {
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
  ],
};

export function dailyLine(day: number, kind: SessionKind, cameBack: boolean): string {
  if (cameBack) return LINES.back[day % LINES.back.length];
  // Alternate between the day-type pool and the general pool
  const pool = day % 2 === 0 ? LINES[kind] : LINES.any;
  return pool[Math.floor(day / 2) % pool.length];
}
