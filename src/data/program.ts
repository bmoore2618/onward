/**
 * The founder's 75-day fitness reset, transcribed from the nightly
 * "Tomorrow's Workout" emails (Days 1–4). The four sessions repeat in order.
 * Later phases get added here once they're written.
 */

export type Exercise = {
  id: string;
  name: string;
  /** e.g. "3 × 10" or "3 × 8/leg" */
  prescription: string;
  /** Whether to show a weight field for this exercise */
  weighted: boolean;
};

export type Session = {
  id: string;
  title: string;
  /** Rough length, used in the "about N min" line */
  minutes: number;
  /** Strength sessions have exercises; cardio sessions have steps */
  exercises?: Exercise[];
  steps?: string[];
  effort: string;
  note: string;
};

export type Phase = {
  name: string;
  firstDay: number;
  lastDay: number;
};

export const PROGRAM_LENGTH_DAYS = 75;

export const PHASES: Phase[] = [{ name: 'Rebuild', firstDay: 1, lastDay: 14 }];

export const SESSIONS: Session[] = [
  {
    id: 'strength-a',
    title: 'Strength A',
    minutes: 45,
    exercises: [
      { id: 'goblet-squat', name: 'Goblet squat', prescription: '3 × 10', weighted: true },
      { id: 'incline-db-bench', name: 'Incline dumbbell bench press', prescription: '3 × 10', weighted: true },
      { id: 'seated-cable-row', name: 'Seated cable row', prescription: '3 × 10', weighted: true },
      { id: 'bulgarian-split-squat', name: 'Bulgarian split squat', prescription: '2 × 8/leg', weighted: true },
      { id: 'leg-extension', name: 'Leg extension', prescription: '3 × 12', weighted: true },
      { id: 'cable-pushdown', name: 'Cable triceps pushdown', prescription: '2 × 12', weighted: true },
      { id: 'dead-bug', name: 'Dead bug', prescription: '3 × 6/side', weighted: false },
    ],
    effort: 'RPE 6–7. Leave 3–4 reps in reserve.',
    note: 'Keep everything controlled and stop any movement that causes new radiating pain, numbness, tingling, or weakness. No extra finisher.',
  },
  {
    id: 'peloton-conditioning',
    title: 'Peloton Conditioning',
    minutes: 40,
    steps: [
      '5 min easy warm-up',
      '20 min steady Zone 2',
      '5 rounds: 30 sec moderately hard, 90 sec easy',
      '5 min cool-down',
    ],
    effort: 'RPE 5–6 overall; short pushes up to RPE 7.',
    note: 'Keep it controlled. The goal is to rebuild conditioning, not test it.',
  },
  {
    id: 'strength-b',
    title: 'Strength B',
    minutes: 45,
    exercises: [
      { id: 'db-step-up', name: 'Dumbbell step-up', prescription: '3 × 8/leg', weighted: true },
      { id: 'landmine-press', name: 'Half-kneeling landmine press', prescription: '3 × 10/side', weighted: true },
      { id: 'lat-pulldown', name: 'Seated lat pulldown', prescription: '3 × 10', weighted: true },
      { id: 'chest-supported-row', name: 'Chest-supported dumbbell row', prescription: '3 × 10', weighted: true },
      { id: 'hamstring-glute', name: 'Back-friendly hamstring/glute movement', prescription: '2 × 10–12', weighted: true },
      { id: 'cable-curl', name: 'Cable curl', prescription: '2 × 12', weighted: true },
      { id: 'farmer-carry', name: 'Farmer carry', prescription: '3 × 30–40 sec', weighted: true },
    ],
    effort: 'RPE 6–7, about 3 reps in reserve.',
    note: 'Keep the reps controlled and avoid adding extra high-impact or spinal-loading work.',
  },
  {
    id: 'recovery',
    title: 'Recovery / Zone 2',
    minutes: 40,
    steps: ['Peloton: 30–45 min easy', 'or walk: 30–60 min'],
    effort: 'RPE 3–5, conversational pace.',
    note: 'Keep the day restorative. Finish feeling better than you started.',
  },
];

export function sessionForDay(day: number): Session {
  return SESSIONS[(day - 1) % SESSIONS.length];
}

export function phaseForDay(day: number): Phase | undefined {
  return PHASES.find((p) => day >= p.firstDay && day <= p.lastDay);
}

export const CHECKLIST = [
  { id: 'workout', label: 'Workout' },
  { id: 'steps', label: '8,000 steps' },
  { id: 'protein', label: 'Protein target' },
  { id: 'water', label: 'Water' },
  { id: 'sleep', label: 'Sleep' },
] as const;

export type ChecklistId = (typeof CHECKLIST)[number]['id'];
