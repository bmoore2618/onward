/**
 * "Rebuild" 75-day program (from Rebuild_75_Day_Workout_Program.pdf).
 *
 * A 7-day week repeats: Strength A, Peloton conditioning, Strength B,
 * Recovery, Strength C, Conditioning, Full rest. Sets and reps change by
 * phase. The base program is written for anyone; back-specific changes are
 * applied only when the user's profile lists a limitation (see LIMITATION_ADJUSTMENTS).
 *
 * Each strength exercise is a "slot" with a default movement and a list of
 * alternatives that use the same garage equipment. The user can swap a slot
 * to any alternative; weights are tracked per movement.
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

/** A single movement, e.g. "Goblet squat". Weights are tracked per movement id. */
export type Movement = {
  id: string;
  name: string;
  /** Whether to show a weight field */
  weighted: boolean;
  /** Link to a demo video, when we have one */
  videoUrl?: string;
  /** Short coaching cue shown under the name */
  cue?: string;
};

const M = {
  'goblet-squat': { name: 'Goblet squat', weighted: true },
  'box-squat': { name: 'Box squat', weighted: true },
  'landmine-squat': { name: 'Landmine squat', weighted: true },
  'db-front-squat': { name: 'Dumbbell front squat', weighted: true },
  'incline-db-bench': { name: 'Incline dumbbell bench press', weighted: true },
  'flat-db-bench': { name: 'Flat dumbbell bench press', weighted: true },
  'barbell-bench': { name: 'Barbell bench press', weighted: true },
  'push-up': { name: 'Push-up', weighted: false },
  'ring-rows': { name: 'Ring rows', weighted: false },
  'seated-cable-row': { name: 'Seated cable row', weighted: true },
  'chest-supported-row': { name: 'Chest-supported dumbbell row', weighted: true },
  'single-arm-db-row': { name: 'Single-arm dumbbell row', weighted: true },
  'single-arm-cable-row': { name: 'Single-arm cable row', weighted: true },
  'landmine-row': { name: 'Landmine row', weighted: true },
  'bulgarian-split-squat': { name: 'Bulgarian split squat', weighted: true },
  'split-squat': { name: 'Split squat', weighted: true },
  'reverse-lunge': { name: 'Reverse lunge', weighted: true },
  'walking-lunge': { name: 'Walking lunge', weighted: true },
  'db-step-up': { name: 'Dumbbell step-up', weighted: true },
  'box-step-up': { name: 'Box step-up (bodyweight)', weighted: false },
  'leg-extension': { name: 'Leg extension', weighted: true },
  'wall-sit': { name: 'Wall sit (hold)', weighted: false },
  'cable-pushdown': { name: 'Cable triceps pushdown', weighted: true },
  'overhead-db-extension': { name: 'Overhead dumbbell extension', weighted: true },
  'db-skull-crusher': { name: 'Dumbbell skull crusher', weighted: true },
  'close-grip-push-up': { name: 'Close-grip push-up', weighted: false },
  'dead-bug': { name: 'Dead bug', weighted: false },
  'bird-dog': { name: 'Bird dog', weighted: false },
  'plank': { name: 'Plank (hold)', weighted: false },
  'side-plank': { name: 'Side plank (hold)', weighted: false },
  'landmine-press': { name: 'Half-kneeling landmine press', weighted: true },
  'seated-db-press': { name: 'Seated dumbbell shoulder press', weighted: true },
  'half-kneeling-db-press': { name: 'Half-kneeling dumbbell press', weighted: true },
  'lat-pulldown': { name: 'Seated lat pulldown', weighted: true },
  'pull-up': { name: 'Strict pull-up', weighted: false, cue: 'Leave several reps in reserve.' },
  'single-arm-lat-pull': { name: 'Single-arm cable lat pull', weighted: true },
  'db-rdl': { name: 'Dumbbell Romanian deadlift', weighted: true },
  'glute-bridge': { name: 'Glute bridge', weighted: false },
  'single-leg-glute-bridge': { name: 'Single-leg glute bridge', weighted: false },
  'slider-hamstring-curl': { name: 'Slider hamstring curl', weighted: false },
  'back-extension': { name: 'Back extension (bodyweight)', weighted: false },
  'cable-curl': { name: 'Cable curl', weighted: true },
  'db-curl': { name: 'Dumbbell curl', weighted: true },
  'hammer-curl': { name: 'Hammer curl', weighted: true },
  'farmer-carry': { name: 'Farmer carry', weighted: true },
  'suitcase-carry': { name: 'Suitcase carry (one side)', weighted: true },
  'kb-rack-carry': { name: 'Kettlebell front-rack carry', weighted: true },
  'lateral-raise': { name: 'Dumbbell lateral raise', weighted: true },
  'cable-lateral-raise': { name: 'Cable lateral raise', weighted: true },
  'seated-lateral-raise': { name: 'Seated dumbbell lateral raise', weighted: true },
} satisfies Record<string, Omit<Movement, 'id'>>;

export type MovementId = keyof typeof M;

/** Demo videos from the founder's "Movement Demos" YouTube playlist (video ids) */
const VIDEOS: Partial<Record<MovementId, string>> = {
  'goblet-squat': 'X8fHvkypjlU',
  'db-front-squat': '7Fd44Bn-qiE',
  'incline-db-bench': 'ckpA5p2Cf8k',
  'barbell-bench': 'tSqBTEAXxtE',
  'push-up': 'nqNf9st-KoU',
  'ring-rows': '6Zyr9xVhZyE',
  'chest-supported-row': 'X-uR6aY6j1E',
  'single-arm-db-row': 'KtOAG48g3k8',
  'bulgarian-split-squat': '97dyoLM28KE',
  'reverse-lunge': '_LdzEz1Elas',
  'walking-lunge': 'N296kWB3OYA',
  'db-step-up': 'uPmXlK-4e8M',
  'box-step-up': 'uPmXlK-4e8M',
  'overhead-db-extension': '6nCKkTHPTnA',
  'close-grip-push-up': 'j4C8w1j_jxQ',
  'bird-dog': 'pVI-2GOqsPo',
  'plank': 'z1hsA1NdiJ4',
  'seated-db-press': 'sx90j_L-bZY',
  'pull-up': 'NwcaL6Ze7Ag',
  'single-arm-lat-pull': 'zTU1KGl6UnY',
  'db-rdl': 'WNcY5dVv-20',
  'glute-bridge': 'l_XGpxc1Bm4',
  'single-leg-glute-bridge': 'X_G8mAcg_5c',
  'db-curl': 'nLhAmq9j4Lo',
  'hammer-curl': '4O8zsES45yI',
  'lateral-raise': '7cFQd9XkC8Y',
  'seated-lateral-raise': '7cFQd9XkC8Y',
};

export const MOVEMENTS: Record<MovementId, Movement> = Object.fromEntries(
  Object.entries(M).map(([id, m]) => {
    const video = VIDEOS[id as MovementId];
    return [id, { id, ...m, ...(video ? { videoUrl: `https://www.youtube.com/watch?v=${video}` } : {}) }];
  })
) as Record<MovementId, Movement>;

export function movement(id: string): Movement {
  return MOVEMENTS[id as MovementId] ?? { id, name: id, weighted: true };
}

/** One line of a strength session, after the user's swap (if any) is applied */
export type Exercise = {
  /** Stable position in the session, e.g. "strength-a-squat". Swaps are stored per slot. */
  slot: string;
  movement: Movement;
  /** Other movements that can go in this slot */
  alternatives: Movement[];
  /** e.g. "3 × 10" or "3 × 8/leg" */
  prescription: string;
  /** Short reason/guidance shown under the exercise, if any */
  note?: string;
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

type SlotDef = {
  slot: string;
  movement: MovementId;
  alternatives: MovementId[];
  sets: ByPhase;
  note?: string;
};

const STRENGTH_A: SlotDef[] = [
  { slot: 'a-squat', movement: 'goblet-squat', alternatives: ['box-squat', 'landmine-squat', 'db-front-squat'], sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'a-press', movement: 'incline-db-bench', alternatives: ['flat-db-bench', 'barbell-bench', 'push-up'], sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'a-row', movement: 'ring-rows', alternatives: ['seated-cable-row', 'chest-supported-row', 'single-arm-db-row'], sets: ['3 × 10', '3 × 10–12', '4 × 8–12', '4 × 8–12'] },
  { slot: 'a-single-leg', movement: 'bulgarian-split-squat', alternatives: ['reverse-lunge', 'split-squat', 'db-step-up'], sets: ['2 × 8/leg', '3 × 8/leg', '3 × 8–10/leg', '3 × 8–10/leg'] },
  { slot: 'a-quad', movement: 'leg-extension', alternatives: ['wall-sit', 'box-step-up'], sets: ['3 × 12', '3 × 12–15', '3 × 12–15', '3 × 12–15'] },
  { slot: 'a-triceps', movement: 'cable-pushdown', alternatives: ['overhead-db-extension', 'db-skull-crusher', 'close-grip-push-up'], sets: ['2 × 12', '3 × 10–15', '3 × 10–15', '3 × 10–15'] },
  { slot: 'a-core', movement: 'dead-bug', alternatives: ['bird-dog', 'plank', 'side-plank'], sets: ['3 × 6/side', '3 × 8/side', '3 × 8–10/side', '3 × 8–10/side'] },
];

const STRENGTH_B: SlotDef[] = [
  { slot: 'b-step-up', movement: 'db-step-up', alternatives: ['reverse-lunge', 'bulgarian-split-squat', 'box-step-up'], sets: ['3 × 8/leg', '3 × 8–10/leg', '4 × 8/leg', '4 × 8–10/leg'] },
  { slot: 'b-press', movement: 'landmine-press', alternatives: ['seated-db-press', 'half-kneeling-db-press', 'push-up'], sets: ['3 × 10/side', '3 × 8–12/side', '4 × 6–10/side', '4 × 6–10/side'] },
  { slot: 'b-vertical-pull', movement: 'lat-pulldown', alternatives: ['pull-up', 'single-arm-lat-pull', 'ring-rows'], sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'b-row', movement: 'chest-supported-row', alternatives: ['single-arm-db-row', 'seated-cable-row', 'ring-rows'], sets: ['3 × 10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'b-hinge', movement: 'db-rdl', alternatives: ['glute-bridge', 'single-leg-glute-bridge', 'slider-hamstring-curl', 'back-extension'], sets: ['2 × 10–12', '3 × 8–12', '3 × 8–10', '3 × 8–10'] },
  { slot: 'b-biceps', movement: 'cable-curl', alternatives: ['db-curl', 'hammer-curl'], sets: ['2 × 12', '3 × 10–15', '3 × 10–15', '3 × 10–15'] },
  { slot: 'b-carry', movement: 'farmer-carry', alternatives: ['suitcase-carry', 'kb-rack-carry'], sets: ['3 × 30–40 sec', '3 × 40–45 sec', '4 × 40–45 sec', '4 × 45–60 sec'] },
];

const STRENGTH_C: SlotDef[] = [
  { slot: 'c-squat', movement: 'goblet-squat', alternatives: ['box-squat', 'landmine-squat', 'db-front-squat'], sets: ['3 × 8–10', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'c-press', movement: 'flat-db-bench', alternatives: ['incline-db-bench', 'barbell-bench', 'push-up'], sets: ['3 × 8–12', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'c-row-1', movement: 'single-arm-cable-row', alternatives: ['single-arm-db-row', 'chest-supported-row', 'ring-rows'], sets: ['3 × 10/side', '3 × 10–12/side', '4 × 8–10/side', '4 × 8–10/side'] },
  { slot: 'c-lunge', movement: 'reverse-lunge', alternatives: ['db-step-up', 'bulgarian-split-squat', 'walking-lunge'], sets: ['2–3 × 8/leg', '3 × 8/leg', '3 × 8–10/leg', '3 × 8–10/leg'] },
  { slot: 'c-row-2', movement: 'landmine-row', alternatives: ['chest-supported-row', 'single-arm-db-row', 'seated-cable-row'], sets: ['3 × 8–12', '3 × 8–12', '4 × 6–10', '4 × 6–10'] },
  { slot: 'c-shoulders', movement: 'lateral-raise', alternatives: ['cable-lateral-raise', 'seated-lateral-raise'], sets: ['3 × 12–15', '3 × 12–15', '3 × 12–15', '3 × 12–15'] },
  { slot: 'c-core', movement: 'bird-dog', alternatives: ['dead-bug', 'plank', 'side-plank'], sets: ['3 × 6–8/side', '3 × 8/side', '3 × 8–10/side', '3 × 8–10/side'] },
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

/** User's chosen movement per slot (slot id → movement id) */
export type Swaps = Record<string, string>;

function strength(id: string, title: string, defs: SlotDef[], p: number, swaps: Swaps): Session {
  return {
    id,
    kind: 'strength',
    title,
    length: 'about 45 min',
    exercises: defs.map((def) => {
      const options = [def.movement, ...def.alternatives];
      const chosen = swaps[def.slot] && options.includes(swaps[def.slot] as MovementId) ? swaps[def.slot] : def.movement;
      return {
        slot: def.slot,
        movement: movement(chosen),
        alternatives: options.filter((m) => m !== chosen).map(movement),
        prescription: def.sets[p],
        note: def.note,
      };
    }),
    effort: PHASES[p].effort,
    notes: [PHASES[p].focus, PROGRESSION_TIP, GENERAL_SAFETY],
  };
}

/** The base session for a program day, before any profile adjustments */
function baseSession(day: number, swaps: Swaps): Session {
  const p = phaseIndex(day);
  switch ((day - 1) % 7) {
    case 0:
      return strength('strength-a', 'Strength A', STRENGTH_A, p, swaps);
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
      return strength('strength-b', 'Strength B', STRENGTH_B, p, swaps);
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
      return strength('strength-c', 'Strength C', STRENGTH_C, p, swaps);
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
function applyLumbarFusion(session: Session, day: number, swaps: Swaps): Session {
  const p = phaseIndex(day);
  const exercises = session.exercises?.map((ex) => {
    switch (ex.slot) {
      case 'a-squat':
      case 'c-squat':
        return p === 3 ? { ...ex, note: 'Or a pain-free box squat.' } : ex;
      case 'b-hinge': {
        // Default to a glute bridge unless the user has chosen otherwise
        if (swaps[ex.slot]) return { ...ex, note: ex.movement.id === 'db-rdl' ? 'Only if completely well tolerated.' : undefined };
        const all = [ex.movement, ...ex.alternatives];
        return {
          ...ex,
          movement: movement('glute-bridge'),
          alternatives: all.filter((m) => m.id !== 'glute-bridge'),
          note: 'Light DB Romanian deadlift only if completely well tolerated.',
        };
      }
      case 'c-row-2':
        return ex.movement.id === 'landmine-row'
          ? { ...ex, note: 'Use a chest-supported row if the unsupported position bothers your back.' }
          : ex;
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

const LIMITATION_ADJUSTMENTS: Record<Limitation, (s: Session, day: number, swaps: Swaps) => Session> = {
  'lumbar-fusion': applyLumbarFusion,
};

export function sessionForDay(day: number, profile: Profile, swaps: Swaps = {}): Session {
  return profile.limitations.reduce(
    (session, limitation) => LIMITATION_ADJUSTMENTS[limitation](session, day, swaps),
    baseSession(day, swaps)
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
