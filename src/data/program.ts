/**
 * "Rebuild" 75-day program.
 *
 * The rules here follow reports/Comeback program design evidence.md:
 *  - 7-day week: Strength A, Conditioning, Strength B, Recovery, Strength C,
 *    Conditioning, Full rest. Four phases that change volume and effort.
 *  - Each strength session is a list of movement-pattern SLOTS. Core slots
 *    come first; finishers are optional and dropped in the short version.
 *  - A slot's default movement depends on the equipment profile and rotates
 *    by phase; finishers rotate weekly. The user's swap always wins.
 *  - Limitations change defaults and add cues as comfort preferences, never
 *    as medical advice.
 */

import type { Equipment, Limitation, Profile } from '@/data/profile';

export const PROGRAM_LENGTH_DAYS = 75;

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

export type Phase = {
  name: string;
  firstDay: number;
  lastDay: number;
  focus: string;
};

export const PHASES: Phase[] = [
  { name: 'Rebuild', firstDay: 1, lastDay: 14, focus: 'Re-learn the movements. Loads deliberately under what you could do.' },
  { name: 'Build', firstDay: 15, lastDay: 35, focus: 'Add weight when the reps allow. Effort tightens by one rep.' },
  { name: 'Push', firstDay: 36, lastDay: 55, focus: 'Main lifts move to 4 sets and heavier rep ranges.' },
  { name: 'Perform', firstDay: 56, lastDay: 75, focus: 'Train with intent, technique clean. The last week repeats loads and finishes with your best since Day 1.' },
];

function phaseIndex(day: number): number {
  const i = PHASES.findIndex((p) => day >= p.firstDay && day <= p.lastDay);
  return i === -1 ? PHASES.length - 1 : i;
}

export function phaseForDay(day: number): Phase {
  return PHASES[phaseIndex(day)];
}

/** Per-phase prescription for strength days */
type Rx = {
  /** Sets on the first three core slots */
  setsMain: number;
  /** Sets on the remaining core slots */
  setsLate: number;
  /** Sets on optional finishers (0 = finishers hidden) */
  setsFinisher: number;
  repsMain: string;
  repsAccessory: string;
  /** Reps in reserve, as the user should read it */
  effort: string;
  rest: string;
  restFirstSlot?: string;
};

function rxFor(day: number): Rx {
  const p = phaseIndex(day);
  if (p === 0 && day <= 7) {
    return { setsMain: 2, setsLate: 2, setsFinisher: 0, repsMain: '8–12', repsAccessory: '10–15', effort: 'Stop with 3–4 easy reps left.', rest: '90 s' };
  }
  switch (p) {
    case 0:
      return { setsMain: 3, setsLate: 2, setsFinisher: 1, repsMain: '8–12', repsAccessory: '10–15', effort: 'Stop with 3 easy reps left.', rest: '90 s' };
    case 1:
      return { setsMain: 3, setsLate: 3, setsFinisher: 2, repsMain: '8–12', repsAccessory: '10–15', effort: 'Stop with 2–3 clean reps left.', rest: '90–120 s' };
    case 2:
      return { setsMain: 4, setsLate: 3, setsFinisher: 2, repsMain: '6–10', repsAccessory: '10–15', effort: 'Stop with 2 clean reps left.', rest: '90–120 s', restFirstSlot: '2–3 min' };
    default:
      return {
        setsMain: 4,
        setsLate: 3,
        setsFinisher: 3,
        repsMain: '6–10',
        repsAccessory: '10–15',
        effort: 'Stop with 2 clean reps left; 1 on the last set of the first three. Never to failure.',
        rest: '90–120 s',
        restFirstSlot: '2–3 min',
      };
  }
}

// ---------------------------------------------------------------------------
// Movements
// ---------------------------------------------------------------------------

export type Movement = {
  id: string;
  name: string;
  /** Whether to show a weight field */
  weighted: boolean;
  /** "each" = a pair of dumbbells, logged as the weight of one; otherwise the total load */
  load?: 'each' | 'total';
  videoUrl?: string;
  /** Short coaching cue shown under the name */
  cue?: string;
};

/** Movements done with a pair of dumbbells, where the logged weight is per dumbbell */
const PAIR_OF_DUMBBELLS = new Set([
  'db-front-squat',
  'incline-db-bench',
  'flat-db-bench',
  'floor-press',
  'seated-db-press',
  'chest-supported-row',
  'db-rdl',
  'db-step-up',
  'reverse-lunge',
  'walking-lunge',
  'split-squat',
  'bulgarian-split-squat',
  'farmer-carry',
  'db-curl',
  'hammer-curl',
  'lateral-raise',
  'front-raise',
  'db-skull-crusher',
]);

const M = {
  // Squat pattern
  'goblet-squat': { name: 'Goblet squat', weighted: true },
  'box-squat': { name: 'Box squat', weighted: true },
  'landmine-squat': { name: 'Landmine squat', weighted: true },
  'db-front-squat': { name: 'Dumbbell front squat', weighted: true },
  'barbell-back-squat': { name: 'Barbell back squat', weighted: true },
  'barbell-front-squat': { name: 'Barbell front squat', weighted: true },
  'leg-press': { name: 'Leg press', weighted: true },
  'hack-squat': { name: 'Hack squat', weighted: true },
  'bodyweight-squat': { name: 'Bodyweight squat', weighted: false },
  'pause-squat-bw': { name: 'Pause squat (bodyweight)', weighted: false, cue: '3-second pause at the bottom.' },
  'assisted-squat': { name: 'Assisted squat (hold a post or door frame)', weighted: false },
  // Hinge
  'db-rdl': { name: 'Dumbbell Romanian deadlift', weighted: true },
  'kb-deadlift': { name: 'Kettlebell deadlift', weighted: true },
  'trap-bar-deadlift': { name: 'Trap-bar deadlift', weighted: true },
  'barbell-rdl': { name: 'Barbell Romanian deadlift', weighted: true },
  'hip-thrust': { name: 'Hip thrust', weighted: true },
  'glute-bridge': { name: 'Glute bridge', weighted: false },
  'single-leg-glute-bridge': { name: 'Single-leg glute bridge', weighted: false },
  'slider-hamstring-curl': { name: 'Slider hamstring curl', weighted: false },
  'back-extension': { name: 'Back extension (bodyweight)', weighted: false },
  'kb-swing': { name: 'Kettlebell swing', weighted: true, cue: 'Hips, not arms. Stop well short of fatigue.' },
  'cable-pull-through': { name: 'Cable pull-through', weighted: true },
  'single-leg-rdl-bw': { name: 'Single-leg Romanian deadlift (bodyweight)', weighted: false },
  'bw-rdl': { name: 'Bodyweight Romanian deadlift', weighted: false },
  // Horizontal push
  'incline-db-bench': { name: 'Incline dumbbell bench press', weighted: true },
  'flat-db-bench': { name: 'Flat dumbbell bench press', weighted: true },
  'barbell-bench': { name: 'Barbell bench press', weighted: true },
  'floor-press': { name: 'Dumbbell floor press', weighted: true },
  'machine-chest-press': { name: 'Machine chest press', weighted: true },
  'push-up': { name: 'Push-up', weighted: false },
  'incline-push-up': { name: 'Incline push-up (hands on bench)', weighted: false },
  'wall-push-up': { name: 'Wall push-up', weighted: false },
  'decline-push-up': { name: 'Decline push-up (feet up)', weighted: false },
  'close-grip-push-up': { name: 'Close-grip push-up', weighted: false },
  // Vertical push
  'landmine-press': { name: 'Half-kneeling landmine press', weighted: true },
  'seated-db-press': { name: 'Seated dumbbell shoulder press', weighted: true },
  'half-kneeling-db-press': { name: 'Half-kneeling dumbbell press', weighted: true },
  'barbell-overhead-press': { name: 'Barbell overhead press', weighted: true },
  'machine-shoulder-press': { name: 'Machine shoulder press', weighted: true },
  'pike-push-up': { name: 'Pike push-up', weighted: false },
  'elevated-pike-push-up': { name: 'Feet-elevated pike push-up', weighted: false },
  // Horizontal pull
  'ring-rows': { name: 'Ring rows', weighted: false },
  'inverted-row': { name: 'Inverted row (bar or table)', weighted: false },
  'feet-elevated-row': { name: 'Feet-elevated inverted row', weighted: false },
  'seated-cable-row': { name: 'Seated cable row', weighted: true },
  'chest-supported-row': { name: 'Chest-supported dumbbell row', weighted: true },
  'single-arm-db-row': { name: 'Single-arm dumbbell row', weighted: true },
  'single-arm-cable-row': { name: 'Single-arm cable row', weighted: true },
  'landmine-row': { name: 'Landmine row', weighted: true },
  'machine-row': { name: 'Machine row', weighted: true },
  'barbell-row': { name: 'Barbell row', weighted: true },
  // Vertical pull
  'lat-pulldown': { name: 'Lat pulldown', weighted: true },
  'pull-up': { name: 'Pull-up', weighted: false, cue: 'Leave a couple of reps in the tank.' },
  'band-pull-up': { name: 'Band-assisted pull-up', weighted: false },
  'negative-pull-up': { name: 'Negative pull-up (jump up, lower slowly)', weighted: false },
  'scap-pull': { name: 'Scapular pull (hang and pull shoulders down)', weighted: false },
  'single-arm-lat-pull': { name: 'Single-arm cable lat pull', weighted: true },
  'assisted-pull-up': { name: 'Assisted pull-up machine', weighted: true },
  // Single-leg
  'db-step-up': { name: 'Dumbbell step-up', weighted: true },
  'box-step-up': { name: 'Box step-up (bodyweight)', weighted: false },
  'reverse-lunge': { name: 'Reverse lunge', weighted: true },
  'reverse-lunge-bw': { name: 'Reverse lunge (bodyweight)', weighted: false },
  'walking-lunge': { name: 'Walking lunge', weighted: true },
  'split-squat': { name: 'Split squat', weighted: true },
  'split-squat-bw': { name: 'Split squat (bodyweight)', weighted: false },
  'bulgarian-split-squat': { name: 'Bulgarian split squat', weighted: true },
  'bulgarian-split-squat-bw': { name: 'Bulgarian split squat (bodyweight)', weighted: false },
  'single-leg-press': { name: 'Single-leg leg press', weighted: true },
  // Carry
  'farmer-carry': { name: 'Farmer carry', weighted: true },
  'suitcase-carry': { name: 'Suitcase carry (one side)', weighted: true },
  'kb-rack-carry': { name: 'Kettlebell front-rack carry', weighted: true },
  'household-carry': { name: 'Suitcase carry (any heavy household object)', weighted: false },
  // Core
  'dead-bug': { name: 'Dead bug', weighted: false },
  'bird-dog': { name: 'Bird dog', weighted: false },
  'plank': { name: 'Plank (hold)', weighted: false },
  'side-plank': { name: 'Side plank (hold)', weighted: false },
  'pallof-press': { name: 'Pallof press (cable or band)', weighted: true },
  // Finishers
  'leg-extension': { name: 'Leg extension', weighted: true },
  'wall-sit': { name: 'Wall sit (hold)', weighted: false },
  'cable-pushdown': { name: 'Cable triceps pushdown', weighted: true },
  'overhead-db-extension': { name: 'Overhead dumbbell extension', weighted: true },
  'db-skull-crusher': { name: 'Dumbbell skull crusher', weighted: true },
  'bench-dip': { name: 'Bench dip', weighted: false },
  'cable-curl': { name: 'Cable curl', weighted: true },
  'db-curl': { name: 'Dumbbell curl', weighted: true },
  'hammer-curl': { name: 'Hammer curl', weighted: true },
  'lateral-raise': { name: 'Dumbbell lateral raise', weighted: true },
  'cable-lateral-raise': { name: 'Cable lateral raise', weighted: true },
  'front-raise': { name: 'Dumbbell front raise', weighted: true },
} satisfies Record<string, Omit<Movement, 'id'>>;

export type MovementId = keyof typeof M;

/**
 * Demo videos (YouTube video ids). Source of truth is the founder's
 * "Movement Links" Google Sheet (see CLAUDE.md). Missing entries are
 * movements that haven't been filmed.
 */
const VIDEOS: Partial<Record<MovementId, string>> = {
  'goblet-squat': 'X8fHvkypjlU',
  'db-front-squat': '7Fd44Bn-qiE',
  'barbell-back-squat': 'IwBddV6aALE',
  'barbell-front-squat': 'uW1tSzvfX_4',
  'bodyweight-squat': 'HqQssAl3WvQ',
  'incline-db-bench': 'ckpA5p2Cf8k',
  'barbell-bench': 'tSqBTEAXxtE',
  'push-up': 'nqNf9st-KoU',
  'decline-push-up': '1pKGj53rvQo',
  'close-grip-push-up': 'j4C8w1j_jxQ',
  'pike-push-up': 'jKneDLDCRmQ',
  'ring-rows': '6Zyr9xVhZyE',
  'chest-supported-row': 'X-uR6aY6j1E',
  'single-arm-db-row': 'KtOAG48g3k8',
  'barbell-row': 'lDApDptDbic',
  'bulgarian-split-squat': '97dyoLM28KE',
  'bulgarian-split-squat-bw': '97dyoLM28KE',
  'reverse-lunge': '_LdzEz1Elas',
  'walking-lunge': 'N296kWB3OYA',
  'db-step-up': 'uPmXlK-4e8M',
  'box-step-up': 'uPmXlK-4e8M',
  'overhead-db-extension': '6nCKkTHPTnA',
  'bench-dip': 'ytCmjeLYrMU',
  'dead-bug': 'IDnvNIxHcKw',
  'bird-dog': 'pVI-2GOqsPo',
  'plank': '1KpsLjqlA9o',
  'side-plank': 'kHZ7OsM8nbk',
  'seated-db-press': 'sx90j_L-bZY',
  'half-kneeling-db-press': 'eOEU7Xdzwbo',
  'barbell-overhead-press': 'Zsq3CsKOAOg',
  'pull-up': 'PmDUXZBBdLU',
  'band-pull-up': 'PmDUXZBBdLU',
  'single-arm-lat-pull': 'zTU1KGl6UnY',
  'db-rdl': 'WNcY5dVv-20',
  'kb-swing': 'xVZRXdO19mM',
  'glute-bridge': 'UH5FslSOBdY',
  'single-leg-glute-bridge': 'X_G8mAcg_5c',
  'back-extension': '4BUkXZDnBw8',
  'db-curl': 'nLhAmq9j4Lo',
  'hammer-curl': '4O8zsES45yI',
  'lateral-raise': '7cFQd9XkC8Y',
  'front-raise': 'Oc6kG3tvFog',
};

export const MOVEMENTS: Record<MovementId, Movement> = Object.fromEntries(
  Object.entries(M).map(([id, m]) => {
    const video = VIDEOS[id as MovementId];
    return [
      id,
      {
        id,
        ...m,
        ...(m.weighted ? { load: PAIR_OF_DUMBBELLS.has(id) ? 'each' : 'total' } : {}),
        ...(video ? { videoUrl: `https://www.youtube.com/watch?v=${video}` } : {}),
      },
    ];
  })
) as Record<MovementId, Movement>;

export function movement(id: string): Movement {
  return MOVEMENTS[id as MovementId] ?? { id, name: id, weighted: true };
}

/** Short explainer shown on rest days */
export const REST_DAY_VIDEO_URL = 'https://www.youtube.com/watch?v=oMYyDYUrDi4';
/** Stretch/mobility demos for the mobility habit */
export const MOBILITY_VIDEO_URL = 'https://www.youtube.com/watch?v=FJDJ4mV2oK0';

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** One line of a strength session, after rotation, equipment and swaps are applied */
export type Exercise = {
  /** Stable position in the session, e.g. "a-squat". Swaps are stored per slot. */
  slot: string;
  movement: Movement;
  /** Other movements that can go in this slot */
  alternatives: Movement[];
  /** e.g. "3 × 8–12" */
  prescription: string;
  sets: number;
  reps: string;
  rest: string;
  /** Optional finisher (dropped in the short version) */
  finisher: boolean;
  /** Short reason/guidance shown under the exercise, if any */
  note?: string;
};

/** Movements per equipment profile: defaults rotate by phase, alternatives are the swap list */
type Options = { defaults: MovementId[]; alternatives: MovementId[] };

type SlotDef = {
  slot: string;
  label: string;
  reps: 'main' | 'accessory';
  finisher?: boolean;
  /** Finisher rotation is weekly, not by phase */
  byEquipment: Record<Equipment, Options>;
};

const STRENGTH_A: SlotDef[] = [
  {
    slot: 'a-squat',
    label: 'Squat',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['barbell-back-squat', 'barbell-back-squat', 'barbell-front-squat', 'barbell-back-squat'], alternatives: ['leg-press', 'hack-squat', 'goblet-squat', 'box-squat'] },
      home: { defaults: ['goblet-squat', 'goblet-squat', 'db-front-squat', 'goblet-squat'], alternatives: ['box-squat', 'landmine-squat', 'bodyweight-squat'] },
      bodyweight: { defaults: ['bodyweight-squat', 'pause-squat-bw', 'split-squat-bw', 'bulgarian-split-squat-bw'], alternatives: ['assisted-squat', 'box-step-up'] },
    },
  },
  {
    slot: 'a-press',
    label: 'Horizontal push',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['barbell-bench', 'barbell-bench', 'incline-db-bench', 'barbell-bench'], alternatives: ['flat-db-bench', 'machine-chest-press', 'push-up'] },
      home: { defaults: ['incline-db-bench', 'incline-db-bench', 'flat-db-bench', 'incline-db-bench'], alternatives: ['floor-press', 'barbell-bench', 'push-up'] },
      bodyweight: { defaults: ['incline-push-up', 'push-up', 'push-up', 'decline-push-up'], alternatives: ['wall-push-up', 'close-grip-push-up'] },
    },
  },
  {
    slot: 'a-row',
    label: 'Horizontal pull',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['chest-supported-row', 'seated-cable-row', 'chest-supported-row', 'barbell-row'], alternatives: ['machine-row', 'single-arm-db-row', 'ring-rows'] },
      home: { defaults: ['ring-rows', 'ring-rows', 'chest-supported-row', 'ring-rows'], alternatives: ['seated-cable-row', 'single-arm-db-row', 'landmine-row'] },
      bodyweight: { defaults: ['inverted-row', 'inverted-row', 'feet-elevated-row', 'feet-elevated-row'], alternatives: ['ring-rows'] },
    },
  },
  {
    slot: 'a-single-leg',
    label: 'Single-leg',
    reps: 'accessory',
    byEquipment: {
      gym: { defaults: ['split-squat', 'walking-lunge', 'bulgarian-split-squat', 'split-squat'], alternatives: ['single-leg-press', 'db-step-up', 'reverse-lunge'] },
      home: { defaults: ['bulgarian-split-squat', 'reverse-lunge', 'bulgarian-split-squat', 'walking-lunge'], alternatives: ['split-squat', 'db-step-up'] },
      bodyweight: { defaults: ['box-step-up', 'reverse-lunge-bw', 'split-squat-bw', 'bulgarian-split-squat-bw'], alternatives: [] },
    },
  },
  {
    slot: 'a-core',
    label: 'Core (anti-extension)',
    reps: 'accessory',
    byEquipment: {
      gym: { defaults: ['dead-bug', 'plank', 'dead-bug', 'plank'], alternatives: ['bird-dog', 'side-plank'] },
      home: { defaults: ['dead-bug', 'plank', 'dead-bug', 'plank'], alternatives: ['bird-dog', 'side-plank'] },
      bodyweight: { defaults: ['dead-bug', 'plank', 'dead-bug', 'plank'], alternatives: ['bird-dog', 'side-plank'] },
    },
  },
  {
    slot: 'a-quad',
    label: 'Quads (finisher)',
    reps: 'accessory',
    finisher: true,
    byEquipment: {
      gym: { defaults: ['leg-extension', 'wall-sit'], alternatives: ['box-step-up'] },
      home: { defaults: ['leg-extension', 'wall-sit'], alternatives: ['box-step-up'] },
      bodyweight: { defaults: ['wall-sit', 'box-step-up'], alternatives: [] },
    },
  },
  {
    slot: 'a-triceps',
    label: 'Triceps (finisher)',
    reps: 'accessory',
    finisher: true,
    byEquipment: {
      gym: { defaults: ['cable-pushdown', 'overhead-db-extension', 'db-skull-crusher'], alternatives: ['close-grip-push-up', 'bench-dip'] },
      home: { defaults: ['cable-pushdown', 'overhead-db-extension', 'db-skull-crusher'], alternatives: ['close-grip-push-up', 'bench-dip'] },
      bodyweight: { defaults: ['close-grip-push-up', 'bench-dip'], alternatives: [] },
    },
  },
];

const STRENGTH_B: SlotDef[] = [
  {
    slot: 'b-single-leg',
    label: 'Single-leg / lunge',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['db-step-up', 'walking-lunge', 'bulgarian-split-squat', 'reverse-lunge'], alternatives: ['split-squat', 'single-leg-press'] },
      home: { defaults: ['db-step-up', 'db-step-up', 'reverse-lunge', 'walking-lunge'], alternatives: ['bulgarian-split-squat', 'split-squat', 'box-step-up'] },
      bodyweight: { defaults: ['reverse-lunge-bw', 'split-squat-bw', 'bulgarian-split-squat-bw', 'bulgarian-split-squat-bw'], alternatives: ['box-step-up'] },
    },
  },
  {
    slot: 'b-press',
    label: 'Vertical push',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['barbell-overhead-press', 'seated-db-press', 'barbell-overhead-press', 'seated-db-press'], alternatives: ['machine-shoulder-press', 'landmine-press', 'half-kneeling-db-press'] },
      home: { defaults: ['landmine-press', 'landmine-press', 'seated-db-press', 'landmine-press'], alternatives: ['half-kneeling-db-press', 'push-up'] },
      bodyweight: { defaults: ['pike-push-up', 'pike-push-up', 'elevated-pike-push-up', 'elevated-pike-push-up'], alternatives: ['push-up'] },
    },
  },
  {
    slot: 'b-vertical-pull',
    label: 'Vertical pull',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['lat-pulldown', 'lat-pulldown', 'assisted-pull-up', 'pull-up'], alternatives: ['single-arm-lat-pull', 'band-pull-up'] },
      home: { defaults: ['lat-pulldown', 'lat-pulldown', 'band-pull-up', 'pull-up'], alternatives: ['single-arm-lat-pull', 'ring-rows', 'negative-pull-up'] },
      bodyweight: { defaults: ['scap-pull', 'negative-pull-up', 'negative-pull-up', 'pull-up'], alternatives: ['inverted-row'] },
    },
  },
  {
    slot: 'b-hinge',
    label: 'Hinge (main)',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['trap-bar-deadlift', 'barbell-rdl', 'trap-bar-deadlift', 'barbell-rdl'], alternatives: ['hip-thrust', 'db-rdl', 'cable-pull-through'] },
      home: { defaults: ['db-rdl', 'db-rdl', 'kb-deadlift', 'db-rdl'], alternatives: ['hip-thrust', 'glute-bridge', 'single-leg-glute-bridge', 'slider-hamstring-curl', 'back-extension'] },
      bodyweight: { defaults: ['bw-rdl', 'single-leg-rdl-bw', 'single-leg-rdl-bw', 'single-leg-glute-bridge'], alternatives: ['glute-bridge', 'slider-hamstring-curl'] },
    },
  },
  {
    slot: 'b-carry',
    label: 'Carry',
    reps: 'accessory',
    byEquipment: {
      gym: { defaults: ['farmer-carry', 'suitcase-carry', 'farmer-carry', 'kb-rack-carry'], alternatives: [] },
      home: { defaults: ['farmer-carry', 'suitcase-carry', 'farmer-carry', 'kb-rack-carry'], alternatives: [] },
      bodyweight: { defaults: ['household-carry', 'plank', 'household-carry', 'side-plank'], alternatives: [] },
    },
  },
  {
    slot: 'b-biceps',
    label: 'Biceps (finisher)',
    reps: 'accessory',
    finisher: true,
    byEquipment: {
      gym: { defaults: ['cable-curl', 'db-curl', 'hammer-curl'], alternatives: [] },
      home: { defaults: ['cable-curl', 'db-curl', 'hammer-curl'], alternatives: [] },
      bodyweight: { defaults: ['inverted-row'], alternatives: [] },
    },
  },
];

const STRENGTH_C: SlotDef[] = [
  {
    slot: 'c-squat',
    label: 'Squat (variant)',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['leg-press', 'hack-squat', 'barbell-back-squat', 'goblet-squat'], alternatives: ['box-squat', 'barbell-front-squat'] },
      home: { defaults: ['box-squat', 'goblet-squat', 'landmine-squat', 'db-front-squat'], alternatives: ['bodyweight-squat'] },
      bodyweight: { defaults: ['pause-squat-bw', 'bodyweight-squat', 'bulgarian-split-squat-bw', 'pause-squat-bw'], alternatives: ['assisted-squat'] },
    },
  },
  {
    slot: 'c-press',
    label: 'Horizontal push (variant)',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['incline-db-bench', 'machine-chest-press', 'flat-db-bench', 'incline-db-bench'], alternatives: ['barbell-bench', 'push-up'] },
      home: { defaults: ['flat-db-bench', 'flat-db-bench', 'incline-db-bench', 'floor-press'], alternatives: ['barbell-bench', 'push-up'] },
      bodyweight: { defaults: ['push-up', 'close-grip-push-up', 'decline-push-up', 'decline-push-up'], alternatives: ['incline-push-up'] },
    },
  },
  {
    slot: 'c-row',
    label: 'Horizontal pull (variant)',
    reps: 'main',
    byEquipment: {
      gym: { defaults: ['single-arm-db-row', 'machine-row', 'seated-cable-row', 'single-arm-db-row'], alternatives: ['chest-supported-row', 'ring-rows'] },
      home: { defaults: ['single-arm-cable-row', 'single-arm-db-row', 'landmine-row', 'single-arm-cable-row'], alternatives: ['chest-supported-row', 'ring-rows', 'seated-cable-row'] },
      bodyweight: { defaults: ['feet-elevated-row', 'inverted-row', 'feet-elevated-row', 'ring-rows'], alternatives: [] },
    },
  },
  {
    slot: 'c-hinge',
    label: 'Hinge (lighter, glute-focused)',
    reps: 'accessory',
    byEquipment: {
      gym: { defaults: ['hip-thrust', 'back-extension', 'hip-thrust', 'cable-pull-through'], alternatives: ['glute-bridge', 'kb-swing'] },
      home: { defaults: ['glute-bridge', 'kb-swing', 'hip-thrust', 'back-extension'], alternatives: ['single-leg-glute-bridge', 'slider-hamstring-curl'] },
      bodyweight: { defaults: ['glute-bridge', 'single-leg-glute-bridge', 'slider-hamstring-curl', 'single-leg-glute-bridge'], alternatives: [] },
    },
  },
  {
    slot: 'c-core',
    label: 'Core (anti-rotation / side)',
    reps: 'accessory',
    byEquipment: {
      gym: { defaults: ['pallof-press', 'side-plank', 'bird-dog', 'pallof-press'], alternatives: ['dead-bug', 'plank'] },
      home: { defaults: ['bird-dog', 'side-plank', 'pallof-press', 'bird-dog'], alternatives: ['dead-bug', 'plank'] },
      bodyweight: { defaults: ['bird-dog', 'side-plank', 'bird-dog', 'side-plank'], alternatives: ['dead-bug', 'plank'] },
    },
  },
  {
    slot: 'c-shoulders',
    label: 'Shoulders (finisher)',
    reps: 'accessory',
    finisher: true,
    byEquipment: {
      gym: { defaults: ['lateral-raise', 'cable-lateral-raise', 'front-raise'], alternatives: [] },
      home: { defaults: ['lateral-raise', 'cable-lateral-raise', 'front-raise'], alternatives: [] },
      bodyweight: { defaults: ['pike-push-up'], alternatives: [] },
    },
  },
];

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

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
  rest?: string;
  notes: string[];
  /** True when this is the short (20–25 min) version */
  short?: boolean;
  /** True when this is an automatic lighter session after days away */
  reentry?: boolean;
};

/** User's chosen movement per slot (slot id → movement id) */
export type Swaps = Record<string, string>;

export type SessionOptions = {
  /** Short version: first four core slots, one set fewer, no finishers */
  short?: boolean;
  /** Lighter re-entry after 3+ missed training days */
  reentry?: boolean;
  /** Use the previous phase's prescription (after 7+ days away) */
  holdPhase?: boolean;
};

function weekOf(day: number): number {
  return Math.floor((day - 1) / 7);
}

function strength(id: string, title: string, defs: SlotDef[], day: number, profile: Profile, swaps: Swaps, opts: SessionOptions): Session {
  // Holding the previous phase means its normal prescription, not the week-1 re-entry dose
  const rxDay = opts.holdPhase ? Math.max(8, PHASES[Math.max(0, phaseIndex(day) - 1)].firstDay) : day;
  const rx = rxFor(rxDay);
  const p = phaseIndex(day);
  const week = weekOf(day);

  let coreIndex = 0;
  const exercises: Exercise[] = [];
  for (const def of defs) {
    const options = def.byEquipment[profile.equipment];
    const all = [...new Set([...options.defaults, ...options.alternatives])];
    const rotated = def.finisher ? options.defaults[week % options.defaults.length] : options.defaults[p % options.defaults.length];
    const chosen = swaps[def.slot] && all.includes(swaps[def.slot] as MovementId) ? swaps[def.slot] : rotated;

    let sets: number;
    if (def.finisher) sets = rx.setsFinisher;
    else sets = coreIndex < 3 ? rx.setsMain : rx.setsLate;
    if (opts.reentry) sets = def.finisher ? 0 : 2;
    if (opts.short) sets = def.finisher ? 0 : Math.max(2, sets - 1);
    const isFirst = !def.finisher && coreIndex === 0;
    if (!def.finisher) coreIndex++;

    if (sets === 0) continue;
    if (opts.short && coreIndex > 4) continue;

    const reps = def.reps === 'main' ? rx.repsMain : rx.repsAccessory;
    const unit = ['b-carry'].includes(def.slot) ? (p === 0 ? '30–40 sec' : p === 3 ? '45–60 sec' : '40–45 sec') : reps;
    const perSide = ['a-single-leg', 'b-single-leg', 'a-core', 'c-core'].includes(def.slot) && !['plank', 'wall-sit', 'pallof-press'].includes(chosen) ? '/side' : '';

    exercises.push({
      slot: def.slot,
      movement: movement(chosen),
      alternatives: all.filter((m) => m !== chosen).map(movement),
      prescription: `${sets} × ${unit}${perSide}`,
      sets,
      reps: unit,
      rest: isFirst && rx.restFirstSlot ? rx.restFirstSlot : rx.rest,
      finisher: !!def.finisher,
    });
  }

  const notes = [PHASES[p].focus, 'When every set hits the top of the rep range with clean form, add the smallest step next time.'];
  if (opts.reentry) notes.unshift('Lighter re-entry: two sets per movement, about 10% less weight than last time. That’s the plan, not a penalty.');
  if (opts.holdPhase) notes.unshift('Easing back in: this week runs at the previous phase’s sets and effort.');
  if (day >= 70) notes.push('Final week: repeat your loads, no new increases. Finish strong and clean.');

  return {
    id,
    kind: 'strength',
    title,
    length: opts.short || opts.reentry ? 'about 20–25 min' : p >= 2 ? 'about 45 min' : 'about 35–40 min',
    exercises,
    effort: rx.effort,
    rest: rx.rest,
    notes,
    short: opts.short,
    reentry: opts.reentry,
  };
}

/** Tuesday: easy base plus short intervals */
function conditioning1(day: number, profile: Profile, opts: SessionOptions): Session {
  const p = opts.holdPhase ? Math.max(0, phaseIndex(day) - 1) : phaseIndex(day);
  const mode = profile.cardioMode === 'walk' ? 'Walk or jog' : profile.cardioMode === 'row' ? 'Rower' : 'Peloton';
  const plans = [
    { length: 'about 20–25 min', easy: '8–10 min easy', intervals: '4–5 rounds: 30 sec brisk / 90 sec easy', effort: 'Brisk means you could still speak in short sentences.' },
    { length: 'about 25–30 min', easy: '8 min easy', intervals: '6–8 rounds: 45 sec hard / 75 sec easy', effort: 'Hard efforts at about a 7 out of 10.' },
    { length: 'about 30 min', easy: '5 min easy', intervals: '8–10 rounds: 60 sec hard / 60 sec easy', effort: 'Hard efforts at about a 7–8 out of 10.' },
    { length: 'about 30–35 min', easy: '5 min easy', intervals: '10–12 rounds: 60 sec hard / 60 sec easy (or 3–4 × 3 min hard, 3 min easy)', effort: 'Hard but controlled, about an 8 out of 10.' },
  ];
  const plan = plans[p];
  return {
    id: 'peloton-conditioning',
    kind: 'conditioning',
    title: `${mode} Conditioning`,
    length: opts.reentry ? 'about 20 min' : plan.length,
    blocks: [
      { label: 'Warm-up', detail: '5 min easy' },
      { label: 'Easy base', detail: plan.easy },
      { label: 'Intervals', detail: opts.reentry ? '4 rounds: 30 sec brisk / 90 sec easy' : plan.intervals },
      { label: 'Cool-down', detail: '5 min easy' },
    ],
    effort: plan.effort,
    notes: ['Duration first, intensity second. The goal is to build conditioning, not test it.'],
    reentry: opts.reentry,
  };
}

/** Saturday: rounds on the bag or bike */
function conditioning2(day: number, profile: Profile, opts: SessionOptions): Session {
  const p = opts.holdPhase ? Math.max(0, phaseIndex(day) - 1) : phaseIndex(day);
  const bagFirst = profile.hasHeavyBag && !profile.limitations.includes('lower-back');
  const bag = ['4–6 rounds: 2 min work / 1 min rest', '6–8 rounds: 2 min work / 1 min rest', '8–10 rounds: 2 min work / 1 min rest', '10 rounds: 2 min work / 1 min rest'][p];
  const bike = ['6 rounds: 30 sec hard / 90 sec easy', '8 rounds: 45 sec hard / 75 sec easy', '10 rounds: 1 min hard / 1 min easy', '12 rounds: 1 min hard / 1 min easy'][p];
  const circuit = [
    '3 rounds: 10 squats, 10 push-ups or DB bench, 10 step-ups/leg, 10 rows, 1 min easy bike; rest 1–2 min',
    '4 rounds of the same; rest 90 sec',
    '4 rounds of the same; rest 60–90 sec',
    '5 rounds of the same; rest 60–90 sec',
  ][p];
  const length = ['about 25 min', 'about 30 min', 'about 35 min', 'about 35 min'][p];
  const blocks: Block[] = [
    ...(bagFirst ? [{ label: 'Punching bag', detail: bag }, { label: 'Or bike', detail: bike }] : [{ label: 'Bike', detail: bike }, ...(profile.hasHeavyBag ? [{ label: 'Or punching bag', detail: bag }] : [])]),
    { label: 'Optional circuit', detail: circuit },
  ];
  return {
    id: 'conditioning',
    kind: 'conditioning',
    title: 'Conditioning',
    length: opts.reentry ? 'about 20 min' : length,
    blocks: opts.reentry ? [{ label: 'Easy rounds', detail: '4 rounds: 2 min easy work / 1 min rest' }] : blocks,
    effort: ['About a 6 out of 10.', 'About a 7 out of 10.', 'About a 7–8 out of 10.', 'About an 8 out of 10, never sloppy.'][p],
    notes: ['Hard but controlled. No need to add extra work to make it feel harder.'],
    reentry: opts.reentry,
  };
}

/** The base session for a program day, before limitation adjustments */
function baseSession(day: number, profile: Profile, swaps: Swaps, opts: SessionOptions): Session {
  switch ((day - 1) % 7) {
    case 0:
      return strength('strength-a', 'Strength A', STRENGTH_A, day, profile, swaps, opts);
    case 1:
      return conditioning1(day, profile, opts);
    case 2:
      return strength('strength-b', 'Strength B', STRENGTH_B, day, profile, swaps, opts);
    case 3:
      return {
        id: 'recovery',
        kind: 'recovery',
        title: 'Recovery / Zone 2',
        length: '30–60 min',
        blocks: [
          { label: 'Option 1', detail: 'Bike, 30–45 min easy' },
          { label: 'Option 2', detail: 'Walk, 30–60 min' },
        ],
        effort: 'Conversational pace, about a 3–5 out of 10.',
        notes: ['Finish feeling better than you started. Counts toward your steps.'],
      };
    case 4:
      return strength('strength-c', 'Strength C', STRENGTH_C, day, profile, swaps, opts);
    case 5:
      return conditioning2(day, profile, opts);
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

// ---------------------------------------------------------------------------
// Limitations: change defaults and add cues, as comfort preferences
// ---------------------------------------------------------------------------

const STOP_RULE =
  'Stop and swap any movement that causes sharp or spreading pain, numbness, tingling or weakness in an arm or leg.';

type Adjust = (session: Session, swaps: Swaps) => Session;

function prefer(session: Session, slot: string, movementId: MovementId, swaps: Swaps, note?: string): Session {
  const exercises = session.exercises?.map((ex) => {
    if (ex.slot !== slot || swaps[slot]) return ex;
    const all = [ex.movement, ...ex.alternatives];
    const target = all.find((m) => m.id === movementId);
    if (!target) return ex;
    return { ...ex, movement: target, alternatives: all.filter((m) => m.id !== movementId), note: note ?? ex.note };
  });
  return { ...session, exercises };
}

const lowerBack: Adjust = (session, swaps) => {
  let s = session;
  if (s.kind === 'strength') {
    s = prefer(s, 'a-squat', s.exercises?.some((e) => e.slot === 'a-squat' && [e.movement, ...e.alternatives].some((m) => m.id === 'goblet-squat')) ? 'goblet-squat' : 'bodyweight-squat', swaps, 'Front-loaded squats tend to feel better with a back history.');
    s = prefer(s, 'c-squat', 'box-squat', swaps, 'Sit back to the box; stand up strong.');
    s = prefer(s, 'b-hinge', 'glute-bridge', swaps, 'Many people with a back history find bridges feel better. A light Romanian deadlift is still here as a swap if it feels completely fine.');
    s = prefer(s, 'a-row', 'chest-supported-row', swaps);
    s = prefer(s, 'c-row', 'chest-supported-row', swaps);
    s = { ...s, notes: [...s.notes, STOP_RULE] };
  }
  if (s.id === 'conditioning') {
    s = { ...s, notes: [...s.notes, 'Skip jumps, high-rep wall balls and anything that rounds you under load. They aren’t needed.'] };
  }
  return s;
};

const knee: Adjust = (session, swaps) => {
  let s = session;
  if (s.kind === 'strength') {
    s = prefer(s, 'a-squat', 'box-squat', swaps, 'Choose a box height that feels good; lighten first, then shorten the range, then swap.');
    s = prefer(s, 'c-squat', 'box-squat', swaps);
    s = prefer(s, 'a-single-leg', 'db-step-up', swaps, 'A lower step is fine.');
    s = prefer(s, 'b-single-leg', 'db-step-up', swaps);
    s = { ...s, notes: [...s.notes, STOP_RULE] };
  }
  return s;
};

const shoulder: Adjust = (session, swaps) => {
  let s = session;
  if (s.kind === 'strength') {
    s = prefer(s, 'a-press', 'floor-press', swaps, 'A neutral grip and a shorter range tend to feel better.');
    s = prefer(s, 'c-press', 'incline-db-bench', swaps);
    s = prefer(s, 'b-press', 'landmine-press', swaps, 'The angled path often lets you press overhead comfortably.');
    s = prefer(s, 'b-carry', 'kb-rack-carry', swaps);
    s = { ...s, notes: [...s.notes, STOP_RULE] };
  }
  return s;
};

const ADJUSTMENTS: Record<Limitation, Adjust> = { 'lower-back': lowerBack, knee, shoulder };

export function sessionForDay(day: number, profile: Profile, swaps: Swaps = {}, opts: SessionOptions = {}): Session {
  return profile.limitations.reduce((s, l) => ADJUSTMENTS[l](s, swaps), baseSession(day, profile, swaps, opts));
}

// ---------------------------------------------------------------------------
// Progression helpers
// ---------------------------------------------------------------------------

/**
 * Next load after a successful session: the smallest step the user owns.
 * Dumbbell pairs go in 5 lb steps to 40, then 50/60/70/80.
 */
export function nextLoad(lb: number): number {
  return lb + (lb < 45 ? 5 : 10);
}

/** A step bigger than about 10% is earned by working up to 15 reps first */
export function isBigJump(from: number, to: number): boolean {
  return to - from > from * 0.1 + 0.01;
}

/** Load after two sessions below the rep range: about 10% lighter, rounded to 5 lb */
export function resetLoad(lb: number): number {
  return Math.max(5, Math.round((lb * 0.9) / 5) * 5);
}

// ---------------------------------------------------------------------------
// Daily habits
// ---------------------------------------------------------------------------

export const CHECKLIST = [
  { id: 'workout', label: 'Workout' },
  { id: 'steps', label: '8,000 steps' },
  { id: 'meals', label: 'Followed meal plan' },
  { id: 'sleep', label: '7+ hours sleep' },
  { id: 'mobility', label: '10 min mobility' },
] as const;

export type ChecklistId = (typeof CHECKLIST)[number]['id'];

/** Checklist items that apply to a session (no "Workout" on a rest day) */
export function checklistFor(session: Session) {
  return session.kind === 'rest' ? CHECKLIST.filter((item) => item.id !== 'workout') : CHECKLIST;
}

/**
 * The standard. Forgiving means nothing resets; it does not mean the bar
 * moves. Every week: all training sessions, all habits, every day.
 */
export const STANDARD = {
  /** Short versions that still count as full days in one week; beyond this they count as partial */
  shortPerWeek: 2,
  /** Sessions per week below which the program stops working; said out loud in the skip preview */
  floorSessions: 3,
  /** Habit completion a week needs (with every session) to count as a full week */
  fullWeekHabits: 0.9,
};

/**
 * A day counts as completed if the planned session (or its short version)
 * was done, or on a rest day if three or more habits were ticked.
 */
export function dayCounts(session: Session, checklist: Partial<Record<ChecklistId, boolean>>): boolean {
  const ticks = Object.values(checklist).filter(Boolean).length;
  return session.kind === 'rest' ? ticks >= 3 : !!checklist.workout;
}
