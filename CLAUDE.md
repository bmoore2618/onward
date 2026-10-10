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
- **Forgiving, not soft (founder decision, Oct 2026).** It's a challenge. Nothing resets, but the bar doesn't move: the standard is every session and all five habits, every week, and the app says so plainly (`STANDARD` in program.ts). Leeway has limits: two short versions a week count fully, a third is partial; completing a training day without the session asks first; full weeks are counted with a run; progression tells you to go up when you've stalled; a "push" line appears every third training day. Forgiveness is about what happens after a miss, never about lowering what a good week is.
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
- **Today screen:** Day number, today's workout (exercises with sets × reps and weight), daily checklist, and a large Complete Day button.
- **Daily habits (decided Oct 2026):** Workout, 8,000 steps, Followed meal plan (RP Diet Coach), 7+ hours sleep, 10 min mobility. Water was dropped as arbitrary. Keep the list at five; the app must not feel like 75 Hard. A 1–5 "how do you feel" check-in is a candidate for later (feeds adaptive coaching), not a checklist item.
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

## Program research (Oct 2026)
`reports/Comeback program design evidence.md` is the evidence-based program spec (research notes in `research_notes/`). Decision: keep the Rebuild skeleton (3 full-body pattern-slot sessions, double progression, sub-failure effort, four phases, 3+2+1+1 week); revise the rule layer per the report's 13-item change list (Rebuild-phase volume cut, finishers optional, second weekly hinge, 20–25 min short sessions, coded progression/reset rules, automatic lighter re-entry after gaps, shorter Tuesday conditioning, rest periods shown, day-completion rule, 0.5–1 lb/week goal line, equipment profiles + knee/shoulder toggles, copy audit). Read the report before changing program.ts.

## Programming decision (Oct 2026)
One challenge, many settings. The 75-day shape is the same for everyone: weekly rhythm (3 strength, 2 conditioning, 1 recovery, 1 rest), phases, and the five daily habits. What varies by user is only which movement fills each exercise slot. Equipment profiles (`profile.equipment`): home (default), gym, bodyweight, cardio; cardio mode bike/walk/row; heavy bag toggle. Onboarding is roadmap stage 3.

**Cardio-only track (built Oct 2026, `equipment: 'cardio'`, per the research report):** same calendar, habits, standard, re-entry and milestones. Mon/Fri are "Movement A/B": five bodyweight pattern slots (`MOVEMENT_A/B` in program.ts), 2–3 sets, 8–12 reps, 60 s rest, about 20 min; defaults are ladders ordered easiest → hardest so the phase rotation is a progression (wall push-up → incline → push-up; assisted squat → squat → pause → split squat, etc.), every rung stays a swap. No short version (already 20 min), no finishers, no weight fields. Tue/Sat (`cardioIntervals`): weeks 1–3 easy minutes only (15→25), week 4 Tuesday intervals start Couch-to-5K style, week 7 Saturday intervals join, weeks 10–11 are 3–4 × 3 min. Wed (`cardioEasyDay`) is an easy 20/25/30/35 min by phase. Thu recovery and Sun rest are shared with the main track. Day 2 and Day 72 are a self-test (`CARDIO_TEST_DAYS`: 2 km for walk/row, 20-min distance for bike); the result is typed on Today (`testResult` on the record/draft, `setTestResult`) and shown on Progress as "Self-test since Day 1" (`selfTests`) in place of the lifts list. Re-entry on cardio days is 15 min easy.

**Program rules now in code (`src/data/program.ts`, from the research report):**
- Core slots first, finishers optional (dropped in the short version). Per-phase sets/reps/effort/rest in `rxFor`: Rebuild days 1–7 = 2 sets, 3–4 RIR; days 8–14 = 3/2 sets; Build 3 sets, 2–3 RIR; Push 4/3 sets, 6–10 reps; Perform same with 1 RIR on last set of first three slots; final week no new loads.
- Variety: main-slot defaults rotate by phase (4 entries per slot per equipment), finishers rotate weekly, A/B/C use different variants of each pattern. User swaps always win.
- Hinge appears twice a week (B main, C lighter). Conditioning ramps duration before intensity; Tuesday 20–25 min in Rebuild. Saturday: bag first unless the lower-back toggle is on, then bike.
- Short version: first four core slots, one set fewer (min 2), no finishers; counts as a completed day. Day-completion rule in `dayCounts`.
- Re-entry (hook `optionsFor`): 3+ consecutive missed training days → next session 2 sets/slot, −10% loads, no finishers. 7+ days away → the return week runs the previous phase's prescription (after Day 14).
- Progression (`suggestion` in the hook): "all sets hit the top of the range?" per lift → next step (5 lb to 40, then 10, capped ~10%); two misses in a row → −10%.
- Limitations are comfort preferences ("work around"): lower-back, knee, shoulder. Copy never says "safe/protects/rehab"; stop rule is two sentences; one doctor line in Settings.

## Founder / first user (drives v1 workout content)
- Former competitive CrossFit athlete returning after time off; has a past lumbar fusion (L5-S1). Goal: lose ~15–20 lb and rebuild a routine. Prefers simple strength and HIIT; doesn't need CrossFit-style programming.
- The founder's back limitation is a special case, NOT the default. The base program is written for a general user; back-friendly swaps and notes are applied only when a profile lists the limitation (`lower-back` toggle, applied in `src/data/program.ts`). Every exercise should still have an easy substitution. Don't present anything as medical or rehab guidance.
- The founder's current plan is the "Rebuild" 75-day program, transcribed in `src/data/program.ts`. The founder re-anchored it so Day 1 = Monday Sept 28, 2026 (`programStartDate` in `src/data/profile.ts`): Strength A every Monday, full rest every Sunday. The program follows the calendar; a missed day is skipped, never made up or restarted.
- **Home garage equipment:** rig with squat rack and pull-up bar; barbell and plates; landmine attachment; adjustable incline bench; dumbbell pairs 5–40 lb (5 lb steps), then 50, 60, 70, 80; single kettlebells ~10–70 lb; cable/pulley station using kettlebells as the stack (pushdowns, lat pulls, rows, curls); leg extension machine; bodyweight back extension; plyo box; 14 lb and 30 lb wall balls; Peloton bike; punching bag; yoga mat.

## App Store notes
- Apple Developer Program ($99/yr) needed for TestFlight and release. Consider publishing under an LLC.
- The name "Onward" still needs an App Store availability check; a subtitle (e.g. "Onward: Fitness Comeback") is the fallback.
- Health-related claims draw extra review scrutiny: keep copy about fitness and habits, not treatment.

## Built so far (v1)
- Today tab: ‹ › arrows move between days. Today: session, weights (with "Last: N lb (Day X)" hint per movement), swaps, rest timer (strength days, 60/90/120s, vibrates), weigh-in, checklist, check-in (1–5 feel + note, stored in `checkins` by date), Complete Day. Rest days show a Week summary card (workouts, habits %, weight change, average feel). Past days: everything editable, saves as you go (edits go to that day's record; swaps on a past day apply to that day only, swaps on today apply going forward). Future days: preview only. "Watch demo" links live in `VIDEOS` in `src/data/program.ts`. Source of truth for links is the founder's "Movement Links" Google Sheet (https://docs.google.com/spreadsheets/d/1hWENznBbHLFFEsMW66lt2E67d-iVRcpxesofjzf7c-k), organised by body area; rows without a link are not filmed yet. When the founder adds links there, re-read the sheet and update `VIDEOS`.
- Progress tab sections are rearrangeable and hideable via a "Rearrange" sheet (`progressLayout` in storage; `LayoutEditor`; new sections are appended to saved layouts on load). Default order: overview, milestones, body weight, strength, photos, habits, calendar. Progress tab: days completed, workout consistency, body-weight chart with goal line, progress photos in sessions of front/side/back on one date (date from the photo's EXIF timestamp when present, editable; choose three at once from the library in front/side/back order, or camera per slot; copies live in the app's documents folder, list in storage `photos`; first-vs-latest compare pose by pose; edit/delete a session), per-habit bars, calendar, tap a day for details / "Open this day" (routes to Today with `?date=`).
- Onboarding (`src/components/onboarding.tsx`, gated in `_layout.tsx` by `onboarded` in storage): welcome + name, Day 1 date (next Monday default), equipment/cardio/bag, work-around toggles + doctor line, goal weight + weigh-in days, reminders. "Run setup again" in Settings. `DEFAULT_PROFILE` is now general (no limitations); the founder's lower-back/bag settings are in his saved profile, not the defaults.
- Settings tab: first name, goal weight, equipment (home/gym/bodyweight), cardio mode, heavy bag, work-around toggles (lower back/knees/shoulders), Day 1 date, weigh-in weekdays, notifications on/off and reminder hours, doctor line. All of this is the `profile` in storage (`src/data/profile.ts` has the defaults).
- Weights are logged per set (`setWeights` on records/draft; blank sets grey in the first typed value or last time's weight); the heaviest set is the movement's working weight (`weights`) for suggestions and bests. Pair-of-dumbbell movements (`PAIR_OF_DUMBBELLS` in program.ts) show "lb each". Rest timer: a "Rest 90 s" button on each movement (today only) turns into the countdown in place (`useRestTimer`); tap to stop. No auto-start and no floating pill (founder found both clunky). Swaps on today/future ask "Just this phase" or "Always" (`swapScope` in storage; phase swaps expire at the next phase). Progress has "Strength since Day 1" (best weight per movement vs first logged). Sunday morning notification is the week wrap with numbers as of the last app open.
- Gamification (decided Oct 2026): no separate home screen; Today opens with a progress strip (days done, week N of 11, seven week dots, one daily line from `src/data/lines.ts`). Milestones (`src/data/milestones.ts`, computed in the hook, never stored except `seenMilestones`) reward showing up, including "Came back" after a gap; nothing resets, no streaks, no leaderboards/XP. New-milestone card on Today, full grid at the top of Progress. Phase recap card for three days after each phase ends.
- Gentler Streak research: `reports/Gentler Streak features and lessons.md` (what to copy / keep / avoid, prioritized change list, monetisation). Built from it so far: status switch Away/Sick/Injured (`status`, `statusHistory` in storage; pauses reminders, days show as paused not missed, "I'm back" ends it), state-aware daily line (`LineContext` in `src/data/lines.ts`: status > came back > PR yesterday > low check-in yesterday > rotation), "Not today?" skip preview, per-notification toggles (`notifyEvening/Morning/WeekWrap`), "Moved anyway" on past unlogged training days (`movedAnyway` on the record: kind + minutes; shows as partial, not a workout). Never gate status / short version / re-entry behind a paywall. No notification may mention a missed day.
- Brand (chosen Oct 2026): the founder's own artwork, not generated vectors (he rejected Claude's arrow renderings). Icon: a rounded green tile with soft hills and a cream path rising into a rounded arrow; `assets/images/icon.png` is his square-cornered 1254 px source cropped to the tile and scaled to 1024 (iOS rounds the corners). Splash: his full-screen hills-and-sunrise scene with the tile and wordmark (`assets/images/splash.png`), used as the iOS full-screen splash (`enableFullScreenImage_legacy`, cover) and by the launch overlay; Android shows the tile (`splash-icon.png`) on `#E4F3E2`. Build script in the session scratchpad (`use-uploads.mjs`); originals in the Claude uploads folder. Do not redraw the mark; generator script lives in the session scratchpad (regenerate icon.png, splash-icon.png, android-icon-*.png, favicon.png from the SVG if the mark changes). Launch overlay in `src/components/animated-icon.tsx` matches the native splash.
- Backup (`src/data/backup.ts`): Settings → Export writes `onward-backup-YYYY-MM-DD.json` (full AppState + photos as base64) and opens the share sheet; Restore picks a file, confirms, replaces state and photo files, then `reloadState()`. No cloud sync yet; this is the "new phone" path until a backend exists.
- Local notifications: evening "Tomorrow: …" and morning "Day N: … is ready", rescheduled 14 days ahead whenever the app opens or the profile changes (`src/data/notifications.ts`).
- Accessibility pass (Oct 2026): Dynamic Type is honoured and capped at 2x (`MAX_FONT_SCALE` in `themed-text.tsx`, also passed to every TextInput); containers use `minHeight`/`minWidth`, never fixed `height`/`width`, so large text doesn't clip; rows that hold a control wrap. VoiceOver: stat cards, week dots, habit bars (progressbar role + value), milestone cells and steppers are grouped with spoken labels; calendar cells say "Friday, October 9, complete" (`spokenDate` in storage.ts); the checklist checkbox and its demo link are siblings, never nested Pressables; sheets set `accessibilityViewIsModal`; the rest timer announces "Rest over" at zero. Text-only links have a 44 pt minimum height. Invalid-date red is `theme.danger` (passes contrast in both schemes); no translucent text on green cards. Keep all of this when adding screens.
- Expo Go is for development only. A standalone build via EAS → TestFlight is stage 2 of the roadmap.
- EAS set up (Oct 2026, founder has an Apple Developer account): run the tool as `npx eas-cli@latest ...` (expo-doctor rejects it as a project dependency), project linked to Expo as @bmoore2618/onward (projectId in app.json `extra.eas`), iOS bundle id `com.bmoore2618.onward` (permanent once a build ships), `ITSAppUsesNonExemptEncryption: false` so TestFlight doesn't ask about encryption each upload. `eas.json`: production profile (store build, remote auto-incremented build number, channel "production"), preview (internal), development (dev client). TestFlight path: `npx eas-cli@latest build --platform ios --profile production --auto-submit`, run by the founder because the first run signs in to Apple interactively; EAS manages certificates and the App Store Connect app. Only local notifications are used, so decline push-notification setup if asked.
- First TestFlight build shipped Oct 2026 (App Store Connect app id 6821228054); the founder runs it on his phone and restored his Expo Go backup into it. Shipping changes: JS-only changes go out as over-the-air updates (`npx eas-cli@latest update --channel production --message "..."`, Claude can run it; the app picks it up on the next launch and applies it on the one after); anything adding a native module, permission or app.json native setting needs a new build. Agreed flow: try changes in Expo Go first, publish to TestFlight once the founder is happy. Note: linking the EAS projectId changed Expo Go's storage scope, which made Expo Go data look lost; backup/restore moved it.
- Testers (stage 2): privacy policy at `docs/privacy.md` (public via the GitHub repo URL in `PRIVACY_URL`, src/data/app-info.ts); App Store Connect TestFlight text in `docs/testflight-listing.md`. Settings → Help has "Send feedback" (mailto `FEEDBACK_EMAIL` pre-filled with version/update id and phone model) and "Privacy policy"; the footer shows `versionLabel()`. If the app ever stores data off the phone, update privacy.md before shipping it.

## Working rules for Claude
- Keep changes small and testable; tell the founder how to see each change in Expo Go.
- The founder is the product owner, not a programmer. Explain in plain language and avoid unnecessary jargon.
- Don't add backend, auth, payments or HealthKit until the roadmap reaches them.
