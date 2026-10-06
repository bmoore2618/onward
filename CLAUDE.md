# Onward — Project Brief for Claude Code

Read this at the start of every session. It holds the product decisions made so far.

## What Onward is
A fitness app (iOS first, App Store) for people getting back into shape after time away: former athletes, busy parents, people who fell off and want a sane way back. It is deliberately NOT a 75 Hard clone and must never feel like one.

**Core philosophy:** Consistency over perfection. You don't restart. You adjust. You keep moving forward.
- Missed yesterday? Continue today.
- You don't lose your progress because life happened.

**Tagline direction:** "Missed a day? Onward."

## Voice and design
- Calm, encouraging, adult. Never militant, shaming or "no excuses."
- No streak-loss punishment. A missed day is shown neutrally and the plan simply continues.
- Clean, uncluttered UI with big tap targets. Should feel approachable to someone who hasn't trained in years.

## Tech stack
- Expo (React Native) + TypeScript
- Developer is on Windows. iOS builds go through Expo's cloud build service (EAS); no Mac.
- Testing: Expo Go on iPhone for now. Move to a development build when native features (Apple Health) are added.
- Data: local on-device storage for v1. Backend (Supabase or Firebase) with Apple/Google/email sign-in comes later, before public launch.
- Subscriptions later via RevenueCat.
- Code lives in a GitHub repo. Work happens from PC (Claude Code CLI) and phone (Claude Code on the web). Commit and push after each meaningful change so both stay in sync.

## Roadmap (build in this order — don't jump ahead)
1. **Make it useful for the founder** (current stage)
2. Make it useful for ~10 testers (TestFlight)
3. Make it scalable for thousands (backend, onboarding generator, subscriptions)

### v1 — current scope
- **Today screen:** Day number, today's workout (exercises with sets × reps and weight), daily checklist (workout, 8,000 steps, protein, water, sleep), and a large Complete Day button.
- Local storage of completed days and exercise weights used.
- Evening reminder notification (e.g. 8 PM: "Tomorrow: Strength B, about 40 min") and a morning "today's session is ready" notification. This replaces the founder's current 8 PM Gmail workout email.

### Next screens
- **Progress:** weight graph (start / current / goal), days completed, workout consistency, average steps, progress photos.
- **History:** calendar (green = completed, gray = rest, partial = incomplete); tap a date for workout, weights, checklist, notes.
- **Profile/Settings:** goal, fitness level, equipment, days per week, workout length, injuries/limitations, notification time, units.

### Later
- **Onboarding program generator (the real product):** questions on time inactive, days per week, location/equipment, session length, primary goal, and limitations. Generates a personal program instead of the founder's own plan.
- **Apple Health:** steps, workouts, sleep, weight, resting HR, HRV, auto-checking checklist items.
- **Adaptive coaching:** adjust volume based on recovery, soreness and missed days (e.g. "You haven't trained in five days. Today's session is shortened to 25 minutes to get you moving again."). Frame this as training adjustments only — never diagnosis or medical advice.
- **Freemium:** Free (habits, basic plan, weight tracking) vs. Onward Pro (adaptive workouts, custom programs, Apple Health, analytics, coaching). Pricing undecided.

## Programming decision (Oct 2026)
One challenge, many settings. The 75-day shape is the same for everyone: weekly rhythm (3 strength, 2 conditioning, 1 recovery, 1 rest), phases, and the five daily habits. What varies by user is only which movement fills each exercise slot. Planned equipment profiles: home gym (dumbbells/kettlebells, current default), full gym, bodyweight/travel, and a cardio-only track (its own version of the strength days). Build this as per-slot defaults and filtered swap lists, not a from-scratch program generator. Onboarding for it is roadmap stage 3.

## Founder / first user (drives v1 workout content)
- Former competitive CrossFit athlete returning after time off; has a past lumbar fusion (L5-S1). Goal: lose ~15–20 lb and rebuild a routine. Prefers simple strength and HIIT; doesn't need CrossFit-style programming.
- The founder's back limitation is a special case, NOT the default. The base program is written for a general user; back-friendly swaps and notes are applied only when a profile lists the limitation (`lumbar-fusion` in `src/data/profile.ts`, applied in `src/data/program.ts`). Every exercise should still have an easy substitution. Don't present anything as medical or rehab guidance.
- The founder's current plan is the "Rebuild" 75-day program, transcribed in `src/data/program.ts`. The founder re-anchored it so Day 1 = Monday Sept 28, 2026 (`programStartDate` in `src/data/profile.ts`): Strength A every Monday, full rest every Sunday. The program follows the calendar; a missed day is skipped, never made up or restarted.
- **Home garage equipment:** rig with squat rack and pull-up bar; barbell and plates; landmine attachment; adjustable incline bench; dumbbell pairs 5–40 lb (5 lb steps), then 50, 60, 70, 80; single kettlebells ~10–70 lb; cable/pulley station using kettlebells as the stack (pushdowns, lat pulls, rows, curls); leg extension machine; bodyweight back extension; plyo box; 14 lb and 30 lb wall balls; Peloton bike; punching bag; yoga mat.

## App Store notes
- Apple Developer Program ($99/yr) needed for TestFlight and release. Consider publishing under an LLC.
- The name "Onward" still needs an App Store availability check; a subtitle (e.g. "Onward: Fitness Comeback") is the fallback.
- Health-related claims draw extra review scrutiny: keep copy about fitness and habits, not treatment.

## Built so far (v1)
- Today tab: ‹ › arrows move between days. Today: session, weights, swaps, weigh-in, checklist, Complete Day. Past days: everything editable, saves as you go (edits go to that day's record; swaps on a past day apply to that day only, swaps on today apply going forward). Future days: preview only. "Watch demo" links live in `VIDEOS` in `src/data/program.ts`. Source of truth for links is the founder's "Movement Links" Google Sheet (https://docs.google.com/spreadsheets/d/1hWENznBbHLFFEsMW66lt2E67d-iVRcpxesofjzf7c-k), organised by body area; rows without a link are not filmed yet. When the founder adds links there, re-read the sheet and update `VIDEOS`.
- Progress tab: days completed, workout consistency, body-weight chart with goal line, progress photos (camera or library; copies live in the app's documents folder, list in storage `photos`; first-vs-latest pair, grid, full-screen view, delete), per-habit bars, calendar, tap a day for details / "Open this day" (routes to Today with `?date=`).
- Settings tab: goal weight, Day 1 date, weigh-in weekdays, back-friendly toggle, notifications on/off and reminder hours. All of this is the `profile` in storage (`src/data/profile.ts` has the defaults).
- Local notifications: evening "Tomorrow: …" and morning "Day N: … is ready", rescheduled 14 days ahead whenever the app opens or the profile changes (`src/data/notifications.ts`).
- Expo Go is for development only. A standalone build via EAS → TestFlight is stage 2 of the roadmap.

## Working rules for Claude
- Keep changes small and testable; tell the founder how to see each change in Expo Go.
- The founder is the product owner, not a programmer. Explain in plain language and avoid unnecessary jargon.
- Don't add backend, auth, payments or HealthKit until the roadmap reaches them.
