# How fitness apps and open programs generate, structure and adapt beginner/returner programs

Research notes compiled 2026-10-06. Scope: program-generation approaches of leading apps, the concrete rules of popular open beginner programs, movement-pattern "slot" templates, equipment profiles and bodyweight progression, and cardio-first progressions for deconditioned adults. Source dates are noted where known; several review sources are older (2024) or are competitors/aggregators and should be read with that in mind.

## Key Question 1 — How leading apps generate or choose programs, handle equipment, progress load, and handle missed days (and what users praise/complain about)

### Takeaway
Apps split cleanly into three generation models: (a) per-session algorithmic generators (Fitbod, Peloton Strength+ "custom workout", Juggernaut AI, RP Hypertrophy) that pick exercises from equipment-filtered libraries and set load from logged history or feedback; (b) template libraries with fixed multi-week programs and auto-filled progression (Boostcamp, Hevy, Strong, Stronger by the Day, Nike Training Club, Centr, Sweat, Ladder); and (c) human-coach platforms (Future, Caliber Premium). Only the human-coach apps have a documented, graceful "missed day" response; most template apps simply let you resume the next scheduled session, and per-session generators (Fitbod) have no documented missed-day rule at all.

### Cited Findings

**Fitbod (per-session generator, muscle-recovery model)**
- Fitbod's algorithm has two engines: an "Exercise Selector" (what you do) and a "Capability Recommender" (how much weight, sets and reps); it draws on 400M+ logged workouts — [Fitbod blog: How the Fitbod algorithm works](https://fitbod.me/blog/fitbod-algorithm)
- Each muscle group is assigned a recovery percentage (0–100%) based on recent history; the app "prioritizes exercises that target well-recovered muscles — the ones that haven't been heavily trained in the last 48–72 hours." Recovery can be manually overridden in the Body tab — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- Exercises are rated by in-house trainers for goal (strength / hypertrophy / general fitness) and experience level (novice / intermediate / advanced) so novices are not given e.g. heavy barbell snatches — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- The algorithm learns from swaps: "If you consistently swap out Romanian deadlifts for leg curls, the algorithm learns that — and starts deprioritizing RDLs" — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- Training-split enforcement prevents incompatible combinations (no chest work on leg day for PPL users); a "Recovery-Focused" mode bypasses split rules to maximise muscle freshness — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- Equipment: only exercises matching the user's selected equipment appear; onboarding asks goal, fitness level, available equipment and recent muscle use — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm); [Fitbod help: How Fitbod Creates Your Workout](https://help.fitbod.me/hc/en-us/articles/360004429814-How-Fitbod-Creates-Your-Workout) (page returned 403 to direct fetch; summary from search snippet)
- Load rules: 1RM estimated from logs via "established prediction equations (such as the Epley formula)"; new exercises are seeded from "aggregate data across millions of similar users"; rep ranges by goal: strength 1–6 reps at ~85–100% 1RM with 3–5 min rest, hypertrophy 6–12 reps targeting 10–20 working sets per muscle per week; "Max Effort Day" flags one or two exercises every few workouts to capture true max performance; logged Reps-in-Reserve feeds the next load; the system cycles heavier and lighter days — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- No explicit rules for skipped sessions or deloads are documented — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- Equipment limitations noted by a reviewer: no true bodyweight-only biceps exercises, so a no-weights/no-bar profile may fail to generate biceps work; you can set available dumbbell weights but not barbell/trap bar/EZ bar/band loads, "problematic in home gyms" — [TechRadar Fitbod review](https://www.techradar.com/health-fitness/fitbod-app-review)
- Complaints: experienced users describe recommendations as "randomized rather than strategically tailored"; roughly 10% of reviewers complain of repeated identical workouts; a competitor claims both Fitbod and Mad Muscles "treat progressive overload as an afterthought" leading to plateaus in 3–6 months (competitor source — Dr. Muscle — treat as biased) — [Dr. Muscle Fitbod review (2024)](https://dr-muscle.com/fitbod-app-review-alternative/); [Dr. Muscle Mad Muscles vs Fitbod](https://dr-muscle.com/mad-muscles-vs-fitbod/)
- Praise: Fitbod's interface is "widely considered the cleanest in the category" and is the UX benchmark in 2026 reviews — [Indie Hackers 2026 Fitbod review](https://www.indiehackers.com/post/fitbod-app-review-2026-honest-take-after-real-testing-45d5f07a1b)

**Juggernaut AI (powerlifting/powerbuilding generator with autoregulation)**
- Initial inputs: "Gender, Age, Height, Weight, Experience, Strength levels, Sticking points, Lifestyle factors"; the system adjusts Minimum Effective Volume (MEV) and Maximum Recoverable Volume (MRV) and claims 10 quadrillion program variations — [JTS help: How JuggernautAI is individualized](https://help.jtsstrength.com/en/articles/3-how-juggernautai-is-individualized-to-you)
- Autoregulation at four levels: pre-session readiness questionnaire (sleep, mood, energy, soreness) adjusts that day's volume/weight; during the session, entered top-set and back-down RPEs adjust remaining sets; end-of-week check-in adapts next week; block-level (hypertrophy/strength/peaking) and post-competition adjustments — [JTS help](https://help.jtsstrength.com/en/articles/3-how-juggernautai-is-individualized-to-you)
- If soreness is reported it "will lower the reps and weight"; if you can't hit the target reps/RPE it "will cut that exercise short" — [Garage Gym Reviews JuggernautAI review](https://www.garagegymreviews.com/juggernautai-review)
- The help article does not address equipment preferences or missed-session protocols — [JTS help](https://help.jtsstrength.com/en/articles/3-how-juggernautai-is-individualized-to-you)
- Complaints: a 5-day PowerBuilding user questioned "8 sets of 8 at 7+ RPE for squats immediately followed by 6 sets of 6 on deadlifts plus three accessories every week"; marking workouts "too easy" produced "random quad/lat supersets"; aggregate app-review sentiment ~67% positive / 33% negative — [JustUseApp JuggernautAI reviews](https://justuseapp.com/en/app/1515756471/juggernautai/reviews); [Powerlifting Technique review](https://powerliftingtechnique.com/juggernaut-ai-review/)

**RP Hypertrophy (mesocycle builder with feedback-driven volume)**
- Core mechanic is auto-regulation: you log pump, soreness and workload feedback after sessions and the app adjusts next week's volume and load targets — [Boostcamp "best hypertrophy apps"](https://www.boostcamp.app/best/hypertrophy)
- Ships 45+ premade plans / Meso Builder and 250+ technique videos (counts vary between sources; one says 100+ premade plans) — [Boostcamp vs RP Hypertrophy](https://www.boostcamp.app/vs/rp-hypertrophy)
- Third-party description of the RP method used by the app: a mesocycle is 4–6 weeks of accumulation plus one mandatory deload week; each week adds one working set per muscle to the same exercises; soreness, pump, performance and joint feedback adjust volume; deload is ~50% volume with reduced intensity — [Arvo guide to RP training](https://arvo.guru/resources/methods/rp-training) (secondary source; RP's own app page could not be fetched)
- Praise: users say it "takes all of the guessing work out of what progressions you should make" and holds you "accountable to hit objective numbers" — [AppFollow RP Hypertrophy reviews](https://apps.appfollow.io/ios/rp-hypertrophy/1555614554?country=us)

**Caliber (free library + group coaching + 1:1 coaching)**
- Tiers: free self-guided with a 500+ exercise library; Pro ($19/mo) group coaching with four preset programs — beginner, intermediate/advanced, weight loss, and bodyweight-only; Premium ($200+/mo) 1:1 coach-built programs — [Garage Gym Reviews Caliber review, updated May 9 2025](https://www.garagegymreviews.com/caliber-app-review)
- Onboarding asks workout location (gym, home gym, both) and available equipment; bodyweight options for no equipment — [GGR Caliber review](https://www.garagegymreviews.com/caliber-app-review)
- Philosophy "mastery over variety": same exercises repeated for several weeks; coaches set weekly goals such as "increase the weight by 10 pounds for at least one set"; progress measured by a "Strength Score" and "Strength Balance" (reviewer scored 70%) — [GGR Caliber review](https://www.garagegymreviews.com/caliber-app-review)
- Programs are periodized and change every few weeks based on performance; no information on missed-workout handling — [GGR Caliber review](https://www.garagegymreviews.com/caliber-app-review)
- App Store rating 4.8 from ~5,900 reviews (AppFollow snapshot) — [AppFollow Caliber](https://apps.appfollow.io/ios/caliber-strength-training/1482405410?country=us)

**Future (human coach, weekly plans)**
- A coach designs weekly programs based on fitness level, goals and equipment; weekly plans typically appear by Sunday evening; rest days are built in; monthly check-ins — [Garage Gym Reviews Future review, updated May 16 2024](https://www.garagegymreviews.com/future-app-review)
- Equipment can be added at any time and the trainer incorporates it; users can pre-declare trips and the equipment available — [Healthline Future review](https://www.healthline.com/nutrition/future-fitness-review); [GearPatrol Future review](https://www.gearpatrol.com/?p=1397)
- Missed days: a reviewer noted that after missing two workouts "the trainer adjusted the third workout to allow for it instead of shaming them"; coaches "understand that life happens" — [Healthline](https://www.healthline.com/nutrition/future-fitness-review); [GGR Future review](https://www.garagegymreviews.com/future-app-review)
- Cost $199/month; con: no real-time form feedback — [GGR Future review](https://www.garagegymreviews.com/future-app-review)

**Peloton Strength+ (instructor programs + custom-workout generator)**
- Two modes: instructor-led programs (endurance, hypertrophy, maximal strength, or strength & conditioning) and a custom generator with length (10/15/20/30/45/60 min), target (upper, lower, core, push, pull, full body), focus (strength, muscle, endurance) and difficulty (beginner/intermediate/advanced) — [Tom's Guide Peloton Strength+ (launch coverage)](https://www.tomsguide.com/wellness/fitness/peloton-unveils-strength-app-and-we-got-an-in-depth-look-at-how-it-works-in-the-gym-exclusive); [Pelobuddy](https://www.pelobuddy.com/strength-plus-available-cost)
- Users pick the equipment they have (cables, squat rack, bench, free weights) and workouts are tailored to it — [Peloton blog](https://www.onepeloton.com/en-CA/blog/peloton-strength-plus-app)

**Boostcamp (program library with auto-progression)**
- 130+ coach-written programs "with built-in progressions, periodization, and deload weeks" plus 10,000+ community programs — [Boostcamp home-gym programs](https://www.boostcamp.app/best/home-gym)
- Shows last week's sets/reps/weight; auto-progression fills in weights; plate calculator — [Garage Gym Reviews Boostcamp review (Sept 11 2026)](https://www.garagegymreviews.com/boostcamp-review)
- Exercise swaps: when you swap, the app asks whether to apply the change to just that day or to all future workouts, and suggests equipment-matched alternatives — [GGR Boostcamp review](https://www.garagegymreviews.com/boostcamp-review)
- Complaints: "App can be confusing to navigate"; limited cardio/mobility; no personalized coaching — [GGR Boostcamp review](https://www.garagegymreviews.com/boostcamp-review)

**Hevy / Strong (trackers with template libraries)**
- Hevy has 26 pre-built programs filterable by Level, Goal and Equipment, plus seven routine categories: At home, Travel, Dumbbells only, Band, Cardio & HIIT, Gym, Bodyweight — [Hevy help: programs](https://help.hevyapp.com/hc/en-us/articles/36011518408983)
- Routines encode exercises, sets, weight, reps or rep ranges, target RPE, notes, set types and rest periods; library of 400+ exercises across barbell, plate, dumbbell, kettlebell, machine, band, suspension and equipment-free — [Hevy help: exercise library](https://help.hevyapp.com/hc/en-us/articles/35688251991575-Hevy-Exercise-Library-400-Exercises-and-Custom-Exercises); [Hevy routines feature page](https://www.hevyapp.com/features/gym-workout-routines/)

**Stronger by the Day (Meg Gallagher)**
- App for women; 3-, 4- or 5-day options, "EXPRESS" quick workouts, a bodyweight program option, "simple substitutions for any scenario"; "Smart Progress Tracking tools adjust your next workout"; claims 25,000+ active members — [App Store listing](https://apps.apple.com/us/app/-/id1591765440) (marketing copy; no concrete progression rule published)

**Ladder (team-based coach programs)**
- Users join a team working through the same 4–12 week coach-written program; "progressive overload built over weeks, with deload periods"; ~$29–39/month — [Cora Health Ladder comparison](https://www.corahealth.app/compare/ladder) (third-party comparison page)

**Nike Training Club (free video library + short programs)**
- Programs last 2–6 weeks (most 4–6) in stages; the beginner "Kickstart fitness with the basics" series is 13 episodes, 3×/week for 4 weeks, no equipment — [Reviewed NTC review](https://reviewed.com/health/content/nike-training-club-review-workout-app); [Android Authority NTC](https://androidauthority.com/nike-training-club-3332761)
- Bodyweight-only workouts are "a small fragment" of the whole library but filterable by equipment; GGR score 4.2 (2026) — [Garage Gym Reviews NTC review](https://www.garagegymreviews.com/nike-training-club-review)

**Centr (Chris Hemsworth)**
- Programs run from 1-week challenges to multi-month, typically 6–12 weeks (e.g., Centr Unleashed, 6-week bodyweight); equipment and level shown before joining — [Centr help: choose a program](https://help.centr.com/en-US/how-do-i-choose-my-workout-program-3233562); [Centr help: workouts and programs](https://help.centr.com/en-US/articles/workouts-and-programs-345223)
- Missed days: "Missing a workout is completely normal"; users can catch up or skip ahead; "the weeks are a guide, not a rigid requirement" — [Centr help](https://help.centr.com/en-US/how-do-i-start-a-program-3233635)

**Sweat (Kayla Itsines)**
- Programs are fixed-length (e.g., Sweat Challenge = 6 weeks; "Strength with Kayla" 6 weeks released July 2025); High Intensity with Kayla is 28-minute sessions 2–3×/week with 92 weeks available; equipment listed per workout with no-equipment options — [Sweat blog: Strength with Kayla](https://sweat.com/blogs/Community/behind-the-scenes-strength-with-kayla-itsines); [Treadmill Review Guru Sweat review](https://www.treadmillreviewguru.com/sweat-app-review)

**StrongLifts app (rule-based LP automation; useful as an implementation reference)**
- Default rules: add weight when all 25 reps complete; repeat on a miss; after three consecutive failed sessions deload 10% (e.g., 200 → 180 lb, then +5 lb/workout back up); the app also deloads "if you're stuck or just had a break" — [StrongLifts app page](https://stronglifts.com/app/); [StrongLifts support: increments](https://support.stronglifts.com/article/22-increments)

### Inferences
- The only apps with a documented, non-punitive missed-day behaviour are human-coached (Future) or calendar-flexible libraries (Centr "weeks are a guide"). A rules-based app can mimic the coach behaviour cheaply: on return after N missed sessions, reduce that session's volume/load (StrongLifts already auto-deloads after a break).
- Per-session generators (Fitbod) earn praise for UX and equipment filtering but draw complaints of randomness and weak long-term progression. Template-plus-rules (Boostcamp, StrongLifts, open programs) earns praise for predictable progression but complaints about navigation and lack of personalisation. A hybrid — fixed slot template, deterministic progression rules, equipment-driven exercise fill — targets both sets of complaints.
- Boostcamp's "apply swap to today only vs. all future workouts" prompt matches Onward's existing past-day vs. today swap semantics and is a validated UX pattern.
- Equipment handling is universally "filter the library by owned equipment"; the differentiator is whether the app knows your available loads (Fitbod only for dumbbells), which matters for home gyms with fixed dumbbell sets.

### Gaps
- Fitbod's official help article was not retrievable (403); specifics of its skipped-workout behaviour are undocumented in accessible sources.
- RP's own app page redirected to a blank page; mesocycle mechanics are cited from a third-party explainer, not RP documentation.
- Stronger by the Day and Ladder: no public documentation of progression or missed-day rules beyond marketing copy.
- Strong app (as distinct from Hevy): no primary source on its template library was found; only the Hevy-vs-Strong comparison surfaced.
- No app review source quantified how deconditioned returners specifically fare on any of these apps.

## Key Question 2 — Structure and progression rules of popular open beginner programs, and their weaknesses for deconditioned returners

### Takeaway
All popular open beginner programs share the same skeleton: 3 full-body days per week (PPL being the 6-day exception), 3–6 compound lifts per session, small fixed per-session increments (2.5–5 lb upper, 5–10 lb lower), an AMRAP or rep-target signal that modulates the increment, and a 10% deload after 2–3 consecutive failures. Their main weakness for returners is that they assume a barbell, start too aggressively for someone deconditioned, and are open-ended rather than fixed-length.

### Cited Findings

**r/Fitness Basic Beginner Routine**
- A/B alternation on Mon/Wed/Fri. A: 3×5+ barbell row, 3×5+ bench, 3×5+ squat. B: 3×5+ chin-ups, 3×5+ overhead press, 3×5+ deadlift. "+" = final set AMRAP with good form — [thefitness.wiki Basic Beginner Routine](https://thefitness.wiki/routines/r-fitness-basic-beginner-routine/)
- Progression: +2.5 lb upper / +5 lb lower per session; if AMRAP exceeds 10 reps, add 5 lb / 10 lb instead — [thefitness.wiki](https://thefitness.wiki/routines/r-fitness-basic-beginner-routine/)
- Deload: "If you fail to complete at least 15 total reps for a lift, deload by subtracting 10% from the weight the next time you do that lift" — [thefitness.wiki](https://thefitness.wiki/routines/r-fitness-basic-beginner-routine/)
- Starting weight: empty bar, add 10–20 lb per set until form degrades or bar speed slows. Run for at most three months, then move to GZCLP or 5/3/1 for Beginners — [thefitness.wiki](https://thefitness.wiki/routines/r-fitness-basic-beginner-routine/)

**Phrak's Greyskull LP**
- 3 days/week, A/B alternating (Week 1 A/B/A, Week 2 B/A/B). A: OHP, chin-up, squat. B: bench, bent-over row, deadlift. Most lifts 2×5 + 1×5+ (AMRAP); deadlift 1×5+ only. AMRAP stops at RPE 8–9 — [Liftosaur Phrak's GSLP](https://www.liftosaur.com/programs/phrakgreyskull)
- +2.5 lb upper / +5 lb lower per successful session; if AMRAP ≥10 reps, double the increment; on failing prescribed reps, "reduce weight by 10%" and rebuild, treating the rebuild as a hypertrophy phase. Run 2–4 months — [Liftosaur Phrak's GSLP](https://www.liftosaur.com/programs/phrakgreyskull); [FitnessVolt Greyskull LP](https://fitnessvolt.com/greyskull-lp/)
- One source adds: if you fail to reach 5 on the AMRAP, repeat the weight; fail again, then deload 10% — [FitnessVolt](https://fitnessvolt.com/greyskull-lp/)

**Starting Strength / StrongLifts 5×5**
- Starting Strength: two alternating full-body workouts 3×/week; squat 3×5 every session; bench/OHP alternate 3×5; deadlift 1×5; add weight every workout (bench/press ~1.25–2.5 kg per session); after 2–3 consecutive failed sessions on a lift, reduce that lift ~10% and run back up; individual lifts reset, not the whole program; 2–3 resets per lift before graduating — [SetGraph Starting Strength guide](https://setgraph.app/articles/starting-strength-program-complete-beginner-guide); [Starting Strength: The Reset, Why and How](https://startingstrength.com/article/the-reset-why-and-how)
- StrongLifts 5×5 app defaults: add weight when all 25 reps complete; repeat on a miss; deload 10% after three consecutive failures; can hold the same weight up to five sessions; auto-deload after a break — [StrongLifts app page](https://stronglifts.com/app/); [StrongLifts support](https://support.stronglifts.com/article/22-increments)

**GZCLP**
- Four rotating workouts, at least one rest day between (originally M/W/F so the rotation drifts): Day 1 Squat T1 / Bench T2 / Lat pulldown T3; Day 2 OHP T1 / Deadlift T2 / DB row T3; Day 3 Bench T1 / Squat T2 / Lat pulldown T3; Day 4 Deadlift T1 / OHP T2 / DB row T3 — [thefitness.wiki GZCLP](https://thefitness.wiki/routines/gzclp/)
- Stages: T1 5×3+ → 6×2+ → 10×1+; T2 3×10 → 3×8 → 3×6; T3 3×15+ (add weight when the AMRAP reaches 25+). Rest 3–5 / 2–3 / 1–1.5 min. "+" = AMRAP with 1–2 reps in reserve — [thefitness.wiki GZCLP](https://thefitness.wiki/routines/gzclp/)
- Increments per workout: +5 lb bench/OHP, +10 lb squat/deadlift. On failing a stage, move to the next stage at the same weight rather than resetting. After failing Stage 3: T1 test a new 5RM and restart at 85% of it; T2 restart at the last Stage-1 weight +15–20 lb — [thefitness.wiki GZCLP](https://thefitness.wiki/routines/gzclp/)
- The r/gzcl wiki lists T3 as 3×12+ with weight added at 18+ reps (differs from thefitness.wiki's 3×15+ / 25 reps) — [r/gzcl wiki GZCLP](https://reddit.sudovanilla.org/r/gzcl/wiki/GZCLP); conflicting with [thefitness.wiki GZCLP](https://thefitness.wiki/routines/gzclp/)
- Deload options: drop to 90% of the failed weight when rotating stages, or schedule 3–4 weeks on / 1 week deload-and-test — [r/gzcl wiki](https://reddit.sudovanilla.org/r/gzcl/wiki/GZCLP); [Boostcamp GZCL methodology](https://www.boostcamp.app/methodology/gzcl)

**5/3/1 for Beginners**
- 3 days/week on a 3-week cycle. Day 1 squat + bench; Day 2 deadlift + OHP; Day 3 bench + squat. Loads off a Training Max (TM) ≈ 85–90% of 1RM — [thefitness.wiki 5/3/1 for Beginners](https://thefitness.wiki/routines/5-3-1-for-beginners/); [Jim Wendler: 5/3/1 for Beginners](https://www.jimwendler.com/blogs/jimwendler-com/5-3-1-for-beginners)
- Week 1: 65/75/85%+ ; Week 2: 70/80/90%+ ; Week 3: 75/85/95%+ (last set AMRAP, "crisp, quality reps"), followed by First Set Last 5×5 at the week's first-set percentage — [thefitness.wiki 5/3/1 for Beginners](https://thefitness.wiki/routines/5-3-1-for-beginners/)
- Assistance each session: 50–100 reps each of Push (dips, push-ups, DB bench), Pull (chins, rows, face pulls) and Single-leg/Core (lunges, split squats, KB swings, leg raises) — [thefitness.wiki 5/3/1 for Beginners](https://thefitness.wiki/routines/5-3-1-for-beginners/)
- After every 3-week cycle add +5 lb to bench/OHP TM and +10 lb to squat/deadlift TM, "never more" regardless of AMRAP. Reset TM by three increments (15/30 lb) if reps are consistently missed over a full cycle. Every 10 weeks (three cycles) run a TM test week — [thefitness.wiki 5/3/1 for Beginners](https://thefitness.wiki/routines/5-3-1-for-beginners/)

**Reddit PPL (Metallicadpa, 2015)**
- 6 days/week (PPLRPPL or PPLPPLR). Pull: deadlift 1×5+ or barbell row 4×5,1×5+ (alternating), 3×8–12 pulldowns/pull-ups, 3×8–12 cable row, 5×15–20 face pulls, 4×8–12 hammer curls, 4×8–12 DB curls. Push: bench or OHP 4×5,1×5+ (alternating), 3×8–12 of the other press, 3×8–12 incline DB press, pushdowns and overhead extensions supersetted with 3×15–20 lateral raises. Legs: squat 2×5,1×5+, 3×8–12 RDL, leg press, leg curl, 5×8–12 calf raises — [thefitness.wiki PPL archive](https://thefitness.wiki/reddit-archive/a-linear-progression-based-ppl-program-for-beginners/)
- Progression: +2.5 kg/5 lb per session on bench, row, OHP and squat; +5 kg/10 lb on deadlift. AMRAP must reach ≥5 reps; don't AMRAP bench and OHP on the same day. Accessories: "When you can hit 3 sets of 12 with good form, add weight" — [thefitness.wiki PPL archive](https://thefitness.wiki/reddit-archive/a-linear-progression-based-ppl-program-for-beginners/); [Liftosaur PPL](https://www.liftosaur.com/programs/metallicadpappl)
- Deload: after failing the same lift/weight 3 consecutive sessions, reduce 10% and work back up — [thefitness.wiki PPL archive](https://thefitness.wiki/reddit-archive/a-linear-progression-based-ppl-program-for-beginners/)

**Stronger by Science (Nuckols) programs**
- The SBS bundle contains six 21-week programs; "SBS Linear Progression is a program designed for relatively new lifters (or lifters returning to training after a layoff) who can realistically increase their strength on a week-to-week basis"; customizable for lifts and days per week — [Lift Vault SBS bundle](https://liftvault.com/programs/strength/stronger-by-science-sbs-program-bundle-by-greg-nuckols/)
- Autoregulation rules: "Reps to Failure" version — 4 normal sets then a final set to failure; beat the rep target → training max rises; miss → it drops. "RIR" version — do sets until an RIR target; more than 6 sets → TM up; fewer than 4 → TM down — [Lift Vault SBS bundle](https://liftvault.com/programs/strength/stronger-by-science-sbs-program-bundle-by-greg-nuckols/)
- A free "Nuckols General Beginner Program" on Boostcamp: 4 weeks, 3 days/week, full gym; week 1 e.g. squat 6×6 @75%, bench 4×5 @80%, accessories 2–4×10–15 — [Boostcamp: Nuckols SBS General Beginner](https://www.boostcamp.app/users/ptBjyH-nuckols-stronger-by-science-general-beginner-prog)
- The specific "Beginner to Intermediate" write-up named in the brief was not found at strongerbyscience.com (the search-indexed page ?p=50394 returned 404) — gap.

**Jeff Nippard Fundamentals (paid)**
- Three 8-week blocks: Full Body 3×/week, Upper/Lower 4×/week, Body-part 5×/week; run sequentially for "over 5 months"; "simple, linear progression"; minimal equipment (rack, bar, bench, dumbbells) with "extensive alternatives" for bench, deadlift, squat for injuries or equipment — [Jeff Nippard Fundamentals product page](https://jeffnippard.com/products/fundamentals-hypertrophy-program)
- Compounds 3–4 sets × 6–10 reps; accessories 3 × 10–15 — [Boostcamp Nippard Full Body Block 1](https://www.boostcamp.app/users/jeff-nippard-full-body-block-1)

**Barbell Medicine guidance for returners (relevant to "weakness for deconditioned returners")**
- "Returning to the Gym" (updated June 22 2024): start sets at RPE 5–6, progress within session to RPE 7–8, "never exceed RPE 8 during the first three weeks"; Week 1 strength moves 3×4 (RPE 5→7), hypertrophy moves 3×6–10, conditioning 20 min steady-state twice weekly; Week 2 add one set at RPE 8 and 25 min conditioning; Week 3 add 1–2 sets at RPE 8 and 30 min conditioning; if sore after session one, still train but "substantially moderate efforts" — [Barbell Medicine: Returning to the Gym](https://www.barbellmedicine.com/blog/returning-to-the-gym/)
- BM's Beginner Template is positioned for "novices, lifters returning from an injury, or those returning from an extended layoff (more than four weeks)"; for moderate layoffs "one low stress week is sufficient before resuming normal programming" — [Barbell Medicine forum: Returning after an extended break](https://forum.barbellmedicine.com/t/returning-to-training-after-an-extended-break/3694); [BM forum: Programming after a layoff](https://forum.barbellmedicine.com/t/programming-after-a-layoff/8601)

### Inferences
- The consensus increment ladder (2.5 lb upper / 5 lb lower per session; double it when an AMRAP exceeds ~10; 10% deload after 2–3 consecutive misses) is stable across six independent programs and is safe to adopt as a default rule for barbell/dumbbell slots. Dumbbell increments must be rounded to the owned set (5 lb steps up to 40, then 10 lb).
- Weaknesses for returners, by program: Basic Beginner / Greyskull / SS / SL assume a barbell and start linear progression immediately; PPL requires 6 days; GZCLP's three-stage machinery is complex to explain; 5/3/1 needs a known 1RM. None is fixed at 75 days — most are open-ended "until you stall" which conflicts with a calendar-driven program.
- Barbell Medicine's 3-week RPE-capped ramp and 5/3/1's "training max" buffer are the two most adaptable ideas for a comeback: cap effort at RPE 8 for weeks 1–3 and start loads deliberately under capacity.
- 5/3/1's assistance categories (Push / Pull / Single-leg-or-Core, 50–100 reps each) are themselves a movement-pattern slot system and map directly onto an equipment-agnostic template.

### Gaps
- Stronger by Science's "Beginner to Intermediate" article could not be located; only the paid bundle's rules and the free 4-week Boostcamp program were found.
- RP's beginner templates (as distinct from the app) were not located in accessible form.
- No source quantified failure/dropout rates of these programs for deconditioned adults specifically.

## Key Question 3 — Is defining sessions as movement-pattern slots with equipment-specific defaults a sound generation method, and what substitution tables exist?

### Takeaway
Coaching sources from rugby conditioning, elitefts, CrossFit and personal-training education all converge on the same pattern taxonomy (squat, hinge, lunge/single-leg, horizontal and vertical push, horizontal and vertical pull, carry, core/rotation) and the same substitution principle: swap within pattern, and preferably within sub-pattern. This is practitioner consensus rather than controlled evidence, but it is the explicit basis of the r/bodyweightfitness Recommended Routine, 5/3/1 assistance categories, and the CrossFit substitution guides.

### Cited Findings
- World Rugby's coaching curriculum: fundamental patterns are Squat, Hinge, Lunge, Push, Pull, Carry and Jump/land, and "these movement patterns provide the coach with a readymade resistance training template"; not every session needs all patterns — [World Rugby Passport: Movement patterns](https://passport.world.rugby/conditioning-for-rugby/advanced-conditioning-for-rugby-pre-level-2/resistance-training/the-gym-based-training-programme/movement-patterns/)
- elitefts: "Use the six foundational movement patterns as the base of your program design, and vary assistance exercises within those patterns every two to three weeks" — [elitefts: 6 foundational movement pattern variations](https://elitefts.com/education/6-foundational-movement-pattern-variations)
- CrossFit substitution guide (March 2020, written for home training during gym closures): "A push should be substituted with a push, a pull with a pull, a hinge with a hinge, a squat with a squat and a carry with a carry... a horizontal pull should be substituted with another horizontal pull" — [Morning Chalk Up: CrossFitter's guide to movement substitutions](https://morningchalkup.com/2020/03/04/crossfit-movement-substitution-guide/)
- Trainer-education guidance on swaps: first ask "What movement pattern does the original exercise train? (squat, hinge, push, pull, carry, lunge)" and what primary muscles it emphasises — [FreeAcademy: Exercise progressions and substitutions](https://freeacademy.ai/es/lessons/fc-exercise-progressions)
- Example substitution table by pattern (Bar Path Fitness, eight patterns): Horizontal push — push-ups, bench press, chest press; Vertical push — overhead press, handstand push-up, Arnold press, push press; Horizontal pull — seated row, inverted row, T-bar row, bent-over row, single-arm row; Vertical pull — pull-ups, lat pulldown, DB pullover; Hinge — KB deadlift, barbell deadlift, good morning, single-leg deadlift; Squat — goblet squat, front squat, Zercher, split squat, box squat; Carry — farmer's walk, suitcase carry, front-rack carry; Rotation — woodchop, landmine rotation, med-ball throw; Hang — bar hang, scap pull-ups; Lunge — stationary, lateral, diagonal — [Bar Path Fitness: Eight foundational movement patterns](https://barpathfitness.com/blog/eight-foundational-movement-patterns-to-include-in-your-training/)
- r/bodyweightfitness Recommended Routine is literally a slot template: six slots (pull-up, squat, dip, hinge, row, push-up progressions) each with an ordered easy-to-hard variation list, plus a core triplet of anti-extension (plank → ab wheel → dragon flag), anti-rotation (Pallof press → Copenhagen plank → renegade row) and extension (superman → reverse hyper → back extension) — [Liftosaur Recommended Routine](https://www.liftosaur.com/programs/recommended-routine)
- 5/3/1 for Beginners defines assistance purely by category (Push, Pull, Single-leg/Core, 50–100 reps each) with example exercises, leaving the specific exercise to the lifter's equipment — [thefitness.wiki 5/3/1 for Beginners](https://thefitness.wiki/routines/5-3-1-for-beginners/)
- Fitbod's generator uses a different primary axis (muscle recovery % plus split rules) rather than movement patterns — [Fitbod blog](https://fitbod.me/blog/fitbod-algorithm)
- Boostcamp's swap tool suggests "an equipment-matched substitute" so a full-gym program maps onto a dumbbells-and-bench setup — [Boostcamp home-gym programs](https://www.boostcamp.app/best/home-gym)

### Inferences
- Slot-based generation is the dominant practitioner method and is the explicit design of at least two widely used open programs (BWF RR, 5/3/1 assistance). Muscle-recovery scoring (Fitbod) is an alternative better suited to ad-hoc daily generation than to a fixed 75-day calendar.
- A practical substitution table for Onward needs three tiers per slot — barbell/rack, dumbbell/kettlebell, bodyweight — plus sub-pattern tags (horizontal vs vertical) so swaps stay within sub-pattern. The Bar Path list plus the BWF progression ladders give near-complete coverage for all three equipment profiles.
- Because rotation/anti-rotation and carries are consistently included by coaches but rarely by app generators, including them as optional "finisher" slots is a low-cost differentiator.

### Gaps
- No controlled study comparing pattern-slot programming against muscle-group or AI-generated programming was found; the support is practitioner consensus.
- No published, machine-readable substitution table (CSV/JSON) from a major app was found; app substitution logic is proprietary.

## Key Question 4 — How apps define equipment profiles, and how bodyweight-only programs progress without added load

### Takeaway
Apps define equipment as a checklist (Fitbod, Peloton Strength+, Caliber) or as a handful of named presets (Hevy: At home / Travel / Dumbbells only / Band / Gym / Bodyweight; Caliber Pro: bodyweight-only program). Bodyweight progression is handled by a fixed "double progression": add reps within a range (3×5 → 3×8), then step up an ordered variation ladder (leverage/ROM/unilateral), with tempo, pauses, density and sets as secondary levers.

### Cited Findings
- Hevy's routine categories: "At home, Travel, Dumbbells only, Band, Cardio & HIIT, Gym, and Bodyweight"; programs filter by Level, Goal and Equipment — [Hevy help: programs](https://help.hevyapp.com/hc/en-us/articles/36011518408983)
- Caliber onboarding: location (gym, home gym, both) plus equipment list; Pro tier includes a bodyweight-only program — [GGR Caliber review](https://www.garagegymreviews.com/caliber-app-review)
- Fitbod: per-gym equipment profiles; dumbbell loads can be specified but not barbell/trap-bar/EZ-bar/band loads; no bodyweight-only biceps exercises exist so a no-equipment profile may skip biceps — [TechRadar Fitbod review](https://www.techradar.com/health-fitness/fitbod-app-review)
- Peloton Strength+: user selects equipment (cables, squat rack, bench, free weights) and workouts are generated around it — [Peloton blog](https://www.onepeloton.com/en-CA/blog/peloton-strength-plus-app)
- Nike Training Club and Centr list required equipment per workout/program rather than per user profile; NTC's beginner series needs no equipment — [GGR NTC review](https://www.garagegymreviews.com/nike-training-club-review); [Centr help](https://help.centr.com/en-US/how-do-i-choose-my-workout-program-3233562)
- Boostcamp maintains program variants "purpose-built for minimal equipment, with variants for dumbbell-only or home-gym setups" — [Boostcamp home-gym programs](https://www.boostcamp.app/best/home-gym)
- BWF Recommended Routine progression rule: "Start each new movement at 3 sets of 5 reps. Add one rep per set each session until reaching 3 sets of 8, then advance to the next harder variation and restart at 3×5"; 3 days/week; rest 90 s between paired exercises, 60 s in the core triplet — [Liftosaur Recommended Routine](https://www.liftosaur.com/programs/recommended-routine)
- BWF RR variation ladders: Pull-up: scapular pull → arch hang → negative pull-up → pull-up. Squat: assisted squat → bodyweight squat → split squat → Bulgarian split squat → shrimp squat → pistol. Dip: support hold → negative dip → dip. Hinge: bodyweight RDL → single-leg deadlift → Nordic curl. Row: vertical row → inverted row → wide row. Push-up: wall → incline → push-up → diamond → pseudo-planche — [Liftosaur Recommended Routine](https://www.liftosaur.com/programs/recommended-routine)
- BWF RR minimum equipment: a horizontal bar for rows (mandatory), pull-up bar, parallel bars or substitute, a band for Pallof press, a bench/box — [Liftosaur Recommended Routine](https://www.liftosaur.com/programs/recommended-routine)
- Bodyweight overload levers beyond reps: "leverage (harder body angles, longer moment arms, unilateral variations), range of motion (deeper positions, longer rep paths, deficit variations), and stability demands"; also density and weekly hard-set volume; "Once sets climb into very high reps, switch to smarter progressions like leverage changes, unilateral work, pauses, and tempo" — [BullBar Fit: Constraint-led bodyweight training](https://bullbarfit.com/blogs/updates/constraint-led-bodyweight-training-how-to-build-routines-that-actually-progress); [Fitbod blog: making bodyweight workouts harder](https://fitbod.me/blog/how-can-i-make-bodyweight-workouts-more-challenging/)
- Volume-progression guardrail from Functional Movement Systems: progress reps and sets but "keep to a 10–20% increase" — [FMS: Making progress with bodyweight training](https://functionalmovement.com/articles/944/making_progress_with_bodyweight_training)
- Peer-reviewed support that rep progression works: a 2022 study (PubMed 36199287) compared load progression vs repetition progression and is titled "Progressive overload without progressing load?" — both approaches produced muscular adaptations — [PubMed 36199287](https://pubmed.ncbi.nlm.nih.gov/36199287/) (abstract only; effect sizes not extracted)

### Inferences
- Three profiles are sufficient and match industry practice: "bodyweight/travel" (floor + optional door-frame bar/band), "home gym (dumbbells/kettlebells, bench, optional pull-up bar)", "full gym (barbell, rack, cables, machines)". Onward should additionally record owned dumbbell/kettlebell loads because Fitbod's lack of barbell-load awareness is a cited pain point.
- For the bodyweight profile, the BWF RR's "reps 5→8 then next variation" rule is the cleanest machine-implementable progression; tempo/pause can be a tie-breaker when a user is stuck on a variation.
- Every slot's substitution table should carry a bodyweight ladder (ordered) rather than a single bodyweight exercise, so progression remains possible without load.

### Gaps
- Exact lists of equipment checkboxes in Fitbod/Peloton Strength+ were not retrievable (help centre blocked); only categories were confirmed.
- No source gave a rule for progressing kettlebell-only users with large jumps between bells (e.g., 35 → 44 lb); double-progression on reps is the implied approach but was not stated for kettlebells specifically.

## Key Question 5 — How cardio-first programs (Couch to 5K, Zwift, Peloton, Apple Fitness+) structure a 9–12 week progression for deconditioned adults

### Takeaway
The dominant model is a fixed 9–12 week calendar with 2–3 sessions per week, starting at 20 minutes of short effort/recovery intervals and increasing effort duration while shrinking recovery, with explicit permission to repeat a week. Returner-specific plans (Zwift "Back to Fitness") cut frequency to two sessions per week and ramp both volume and intensity across 12 weeks.

### Cited Findings
- Couch to 5K: nine weeks, three runs per week on non-consecutive days; Week 1 alternates 60 s running / 90 s walking for 20 min; Week 2 90 s run / 2 min walk; Week 3 two rounds of 90 s/90 s then 3 min/3 min; Week 4 3 min run, 90 s walk, 5 min run, 2.5 min walk, 3 min run, 90 s walk, 5 min run; Week 5 builds to 20 min continuous; Weeks 6–9 5-min brisk walk then 25, 25, 28, 30 min running — [RunBikeCalc Couch to 5K guide (2025)](https://runbikecalc.com/blog/couch-to-5k-complete-guide-2025); [PITA Couch to 5K PDF (2020)](https://www.pita.org.uk/images/Couch_to_5k_29_July_2020.pdf)
- Couch to 5K's explicit repeat rule: "You can, however, repeat any one of the weeks until you feel physically ready to move on to the next week" — [FindYourEdge Couch to 5K beginner guide](https://www.findyouredge.app/news/couch-to-5k-beginner-guide)
- Zwift "Back to Fitness": 12-week plan co-written by Dani Rowe and Kristin Armstrong for riders returning after injury, pregnancy or time off; two rides per week; "starts out with a set of shorter, lighter-effort workouts and builds throughout the 12 weeks" in both volume and intensity; a "Flexible Training Plan" — [Zwift: Back to Fitness Training Plan](https://www.zwift.com/news/23688-back-to-fitness-training-plan)
- Zwift "Build Me Up": a 12-week progressive plan for riders wanting structure — [Bike Tips: best Zwift training plans](https://biketips.com/best-zwift-training-plans/); Zwift's training plans page — [Zwift training on Zwift](https://www.zwift.com/training-on-zwift)
- Apple Fitness+ "Time to Run": 30-minute audio-guided steady runs; the coach "doesn't quantify distance or pace," so novices can go at a comfortable rhythm; a "Run Your First 5K" collection exists — [Tom's Guide: Time to Run](https://tomsguide.com/news/i-finally-tried-time-to-run-on-apple-fitness-plus-and-it-surprised-me); [Apple Fitness+ collection page](https://fitness.apple.com/ca/studio-collection/workouts-for-every-runner/1882522387)
- Barbell Medicine's return-to-training ramp pairs lifting with conditioning: 20 min steady-state twice weekly in week 1, 25 min in week 2, 30 min in week 3 — [Barbell Medicine: Returning to the Gym](https://www.barbellmedicine.com/blog/returning-to-the-gym/)
- Sweat's "High Intensity with Kayla" runs fixed 28-minute sessions 2–3×/week — [Treadmill Review Guru Sweat review](https://www.treadmillreviewguru.com/sweat-app-review)

### Inferences
- A 75-day (≈11-week) cardio-only track fits neatly between Couch to 5K (9 weeks) and Zwift Back to Fitness (12 weeks). A modality-agnostic version can be expressed as "effort minutes vs. easy minutes" per session (bike, walk/jog, bag work), growing effort blocks from 1 min to 20–30 min continuous.
- The "repeat a week" affordance from Couch to 5K is the cardio analogue of Onward's "missed day? continue" philosophy and conflicts less with a calendar than it seems: the calendar advances but the prescribed stimulus can hold.
- Two sessions per week is the documented floor for returners (Zwift, BM's twice-weekly conditioning); three is the beginner standard (C25K, NTC).

### Gaps
- Peloton's beginner cycling program structure ("You Can Ride" or similar) was not found in search results.
- Apple Fitness+ does not publish a week-by-week progression; its "Run Your First 5K" collection content could not be inspected.
- No sources on how Zwift or Peloton handle a missed structured session (e.g., shifting vs. skipping) were found.
