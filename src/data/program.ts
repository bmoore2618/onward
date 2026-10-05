/**
 * "Rebuild" 75-day program (from Rebuild_75_Day_Workout_Program.pdf).
 *
 * A 7-day week repeats: Strength A, Peloton conditioning, Strength B,
 * Recovery, Strength C, Conditioning, Full rest. Sets and reps change by
 * phase. The base program is written for anyone; back-specific changes are
 * applied only when the user's profile lists a limitation (see LIMITATION_ADJUSTMENTS).
 */

import type { Limitation, Profile } from '@/data/profile';

export const PROGRAM_LENGTH_DAYS = 75;

export type Phase = {
  name: string;
  firstDay: number;
  lastDay: number;
  /** Strength-day effort target */
  effort: string;
  /** Strength-day focus for the phase */
  focus: string;
};

export const PHASES: Phase[] = [
  { name: 'Rebuild', firstDay: 1, lastDay: 14, effort: 'RPE 6–7. Leave 3–4 reps in reserve.', focus: 'Re-establish consistency and movement quality.' },
  { name: 'Build', firstDay: 15, lastDay: 35, effort: 'RPE 7–8.', focus: 'Add load gradually. Some lifts get an extra set.' },
  { name: 'Push', firstDay: 36, lastDay: 55, effort: 'RPE 7–8.', focus: 'Main lifts move to 4 working sets. Avoid grinding reps.' },
  { name: 'Perform', firstDay: 56, lastDay: 75, effort: 'Around RPE 8.', focus: 'Train with intent. Final sets may be challenging, but keep technique clean.' },
];

export type Exercise = {
  id: string;
  name: string;
  /** e.g. "3 × 10" or "3 × 8/leg" */
  prescription: string;
  /** Whether to show a weight field for this exercise */
  weighted: boolean;
  /** An acceptable swap, shown under the exercise */
  alternate?: string;
};

/** A labelled line on a non-lifting day, e.g. "Intervals: 10 rounds…" */
export type Block = { label: string; detail: string };

export type SessionKind = 'strength' | 'conditioning' | 'recovery' | 'rest';

export type Session = {
  id: string;
  kind: SessionKind;
  title: string;
  /** Shown next to the title, e.g. "about 45 min" */
  length: string;
  exercises?: Exercise[];
  blocks?: Block[];
  effort?: string;
  notes: string[];
};

/** Index into per-phase prescription arrays: [Rebuild, Build, Push, Perform] */
type ByPhase = [string, string, string, string];

type ExerciseDef = Omit<Exercise, 'prescription'> & { sets: ByPhase };

const STRENGTH_A: ExerciseDef[] = [
  { id: 'goblet-squat', name: 'Goblet squat', weighted: true, sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'incline-db-bench', name: 'Incline dumbbell bench press', weighted: true, sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'ring-rows', name: 'Ring rows', weighted: false, alternate: 'Seated cable row', sets: ['3 × 10', '3 × 10–12', '4 × 8–12', '4 × 8–12'] },
  { id: 'bulgarian-split-squat', name: 'Bulgarian split squat', weighted: true, sets: ['2 × 8/leg', '3 × 8/leg', '3 × 8–10/leg', '3 × 8–10/leg'] },
  { id: 'leg-extension', name: 'Leg extension', weighted: true, sets: ['3 × 12', '3 × 12–15', '3 × 12–15', '3 × 12–15'] },
  { id: 'cable-pushdown', name: 'Cable triceps pushdown', weighted: true, sets: ['2 × 12', '3 × 10–15', '3 × 10–15', '3 × 10–15'] },
  { id: 'dead-bug', name: 'Dead bug', weighted: false, sets: ['3 × 6/side', '3 × 8/side', '3 × 8–10/side', '3 × 8–10/side'] },
];

const STRENGTH_B: ExerciseDef[] = [
  { id: 'db-step-up', name: 'Dumbbell step-up', weighted: true, sets: ['3 × 8/leg', '3 × 8–10/leg', '4 × 8/leg', '4 × 8–10/leg'] },
  { id: 'landmine-press', name: 'Half-kneeling landmine press', weighted: true, sets: ['3 × 10/side', '3 × 8–12/side', '4 × 6–10/side', '4 × 6–10/side'] },
  { id: 'lat-pulldown', name: 'Seated lat pulldown', weighted: true, alternate: 'Strict pull-ups, leaving several reps in reserve', sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'chest-supported-row', name: 'Chest-supported dumbbell row', weighted: true, sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'hamstring-glute', name: 'Dumbbell Romanian deadlift', weighted: true, alternate: 'Glute bridge or slider hamstring curl', sets: ['2 × 10–12', '3 × 8–12', '3 × 8–10', '3 × 8–10'] },
  { id: 'cable-curl', name: 'Cable curl', weighted: true, sets: ['2 × 12', '3 × 10–15', '3 × 10–15', '3 × 10–15'] },
  { id: 'farmer-carry', name: 'Farmer carry', weighted: true, sets: ['3 × 30–40 sec', '3 × 40–45 sec', '4 × 40–45 sec', '4 × 45–60 sec'] },
];

const STRENGTH_C: ExerciseDef[] = [
  { id: 'goblet-or-box-squat', name: 'Goblet squat or box squat', weighted: true, sets: ['3 × 8–10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'flat-db-bench', name: 'Flat dumbbell bench press', weighted: true, sets: ['3 × 8–12', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'single-arm-cable-row', name: 'Single-arm cable row', weighted: true, sets: ['3 × 10/side', '3 × 10–12/side', '4 × 8–10/side', '4 × 8–10/side'] },
  { id: 'reverse-lunge', name: 'Reverse lunge', weighted: true, sets: ['2–3 × 8/leg', '3 × 8/leg', '3 × 8–10/leg', '3 × 8–10/leg'] },
  { id: 'landmine-row', name: 'Landmine row', weighted: true, alternate: 'Chest-supported dumbbell row', sets: ['3 × 8–12', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { id: 'lateral-raise', name: 'Dumbbell lateral raise', weighted: true, sets: ['3 × 12–15', '3 × 12–15', '3 × 12–15', '3 × 12–15'] },
  { id: 'bird-dog', name: 'Bird dog', weighted: false, sets: ['3 × 6–8/side', '3 × 8/side', '3 × 8–10/side', '3 × 8–10/side'] },
];

const PELOTON_INTERVALS: ByPhase = [
  '5 rounds: 30 sec moderately hard / 90 sec easy',
  '10 rounds: 45 sec hard / 75 sec easy',
  '10 rounds: 60 sec hard / 60 sec easy',
  '12 rounds: 60 sec hard / 60 sec easy',
];
const PELOTON_LENGTH: ByPhase = ['about 40 min', 'about 30 min', 'about 30 min', 'about 35 min'];

const BAG_ROUNDS: ByPhase = ['6 rounds', '8 rounds', '8–10 rounds', '10 rounds'];
const BAG_LENGTH: ByPhase = ['about 25 min', 'about 30 min', 'about 35 min', 'about 35 min'];
const BIKE_ALTERNATE: ByPhase = [
  '8 rounds: 30 sec hard / 90 sec easy',
  '10 rounds: 1 min hard / 1 min easy',
  '10 rounds: 1 min hard / 1 min easy',
  '12 rounds: 1 min hard / 1 min easy',
];
const CIRCUIT: ByPhase = [
  '3 rounds: 10 goblet squats, 10 alternating DB bench, 10 step-ups/leg, 10 ring rows, 1 min easy Peloton; rest 1–2 min',
  '4 rounds: 10 goblet squats, 10 alternating DB bench, 10 step-ups/leg, 10 ring rows, 1 min easy Peloton; rest 90 sec',
  '4 rounds: 10 goblet squats, 10 DB bench, 10 step-ups/leg, 10 ring rows, 1 min Peloton; rest 60–90 sec',
  '5 rounds: 10 goblet squats, 10 DB bench, 10 step-ups/leg, 10 ring rows, 1 min Peloton; rest 60–90 sec',
];

const PROGRESSION_TIP =
  'When you hit the top of a rep range with clean form at the target effort, add weight next time.';
const GENERAL_SAFETY = 'Stop or swap any movement that causes pain.';

function phaseIndex(day: number): number {
  const i = PHASES.findIndex((p) => day >= p.firstDay && day <= p.lastDay);
  return i === -1 ? PHASES.length - 1 : i;
}

export function phaseForDay(day: number): Phase {
  return PHASES[phaseIndex(day)];
}

function strength(id: string, title: string, defs: ExerciseDef[], p: number): Session {
  return {
    id,
    kind: 'strength',
    title,
    length: 'about 45 min',
    exercises: defs.map(({ sets, ...ex }) => ({ ...ex, prescription: sets[p] })),
    effort: PHASES[p].effort,
    notes: [PHASES[p].focus, PROGRESSION_TIP, GENERAL_SAFETY],
  };
}

/** The base session for a program day, before any profile adjustments */
function baseSession(day: number): Session {
  const p = phaseIndex(day);
  switch ((day - 1) % 7) {
    case 0:
      return strength('strength-a', 'Strength A', STRENGTH_A, p);
    case 1:
      return {
        id: 'peloton-conditioning',
        kind: 'conditioning',
        title: 'Peloton Conditioning',
        length: PELOTON_LENGTH[p],
        blocks: [
          { label: 'Warm-up', detail: '5 min easy' },
          ...(p === 0 ? [{ label: 'Aerobic', detail: '20 min steady Zone 2' }] : []),
          { label: 'Intervals', detail: PELOTON_INTERVALS[p] },
          { label: 'Cool-down', detail: '5 min easy' },
        ],
        effort: p === 0 ? 'RPE 5–6 overall; short pushes up to RPE 7.' : `Hard efforts: ${PHASES[p].effort}`,
        notes: ['The goal is to build conditioning, not test it.'],
      };
    case 2:
      return strength('strength-b', 'Strength B', STRENGTH_B, p);
    case 3:
      return {
        id: 'recovery',
        kind: 'recovery',
        title: 'Recovery / Zone 2',
        length: '30–60 min',
        blocks: [
          { label: 'Option 1', detail: 'Peloton, 30–45 min easy Zone 2' },
          { label: 'Option 2', detail: 'Walk, 30–60 min' },
        ],
        effort: 'RPE 3–5, conversational pace.',
        notes: ['Finish feeling better than you started.'],
      };
    case 4:
      return strength('strength-c', 'Strength C', STRENGTH_C, p);
    case 5:
      return {
        id: 'conditioning',
        kind: 'conditioning',
        title: 'Conditioning',
        length: BAG_LENGTH[p],
        blocks: [
          { label: 'Punching bag', detail: `${BAG_ROUNDS[p]}: 2 min work / 1 min rest` },
          { label: 'Or Peloton', detail: BIKE_ALTERNATE[p] },
          { label: 'Optional circuit', detail: CIRCUIT[p] },
        ],
        effort: PHASES[p].effort.replace(/ Leave.*$/, ''),
        notes: ['Hard but controlled. No need to add extra work to make it feel harder.'],
      };
    default:
      return {
        id: 'rest',
        kind: 'rest',
        title: 'Full Rest',
        length: 'rest day',
        blocks: [
          { label: 'Training', detail: 'None today' },
          { label: 'Movement', detail: 'Normal daily movement; easy walking is fine' },
        ],
        notes: ['No make-up workout needed.'],
      };
  }
}

/**
 * Changes for a past lumbar (L5-S1) fusion. These are training preferences
 * from the founder's own program, not medical guidance.
 */
function applyLumbarFusion(session: Session, day: number): Session {
  const p = phaseIndex(day);
  const exercises = session.exercises?.map((ex) => {
    switch (ex.id) {
      case 'goblet-squat':
        return p === 3 ? { ...ex, name: 'Goblet squat or pain-free box squat' } : ex;
      case 'hamstring-glute':
        return {
          ...ex,
          name: 'Glute bridge',
          alternate: 'Single-leg glute bridge or slider hamstring curl. Light DB Romanian deadlift only if completely well tolerated.',
        };
      case 'landmine-row':
        return { ...ex, alternate: 'Chest-supported dumbbell row if the unsupported position bothers your back' };
      default:
        return ex;
    }
  });

  const notes =
    session.kind === 'strength' || session.id === 'conditioning'
      ? [
          ...session.notes.filter((n) => n !== GENERAL_SAFETY),
          ...(p === 3 && session.kind === 'strength' ? ['Keep spinal loading conservative.'] : []),
          'Stop or substitute any movement that causes new radiating pain, numbness, tingling, weakness, or a significant increase in back symptoms. Surgeon/PT restrictions come first.',
          ...(session.id === 'conditioning' ? ['Skip box jumps, high-rep wall balls, deadlifts and burpees. They aren’t needed.'] : []),
        ]
      : session.notes;

  return { ...session, exercises, notes };
}

const LIMITATION_ADJUSTMENTS: Record<Limitation, (s: Session, day: number) => Session> = {
  'lumbar-fusion': applyLumbarFusion,
};

export function sessionForDay(day: number, profile: Profile): Session {
  return profile.limitations.reduce(
    (session, limitation) => LIMITATION_ADJUSTMENTS[limitation](session, day),
    baseSession(day)
  );
}

export const CHECKLIST = [
  { id: 'workout', label: 'Workout' },
  { id: 'steps', label: '8,000 steps' },
  { id: 'protein', label: 'Protein target' },
  { id: 'water', label: 'Water' },
  { id: 'sleep', label: 'Sleep' },
] as const;

export type ChecklistId = (typeof CHECKLIST)[number]['id'];

/** Checklist items that apply to a session (no "Workout" on a rest day) */
export function checklistFor(session: Session) {
  return session.kind === 'rest' ? CHECKLIST.filter((item) => item.id !== 'workout') : CHECKLIST;
}
