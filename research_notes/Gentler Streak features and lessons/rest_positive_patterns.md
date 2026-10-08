# Rest-positive and non-punishing design patterns in fitness/habit apps (beyond Gentler Streak)

Scope: concrete mechanics and copy from Gentler Streak, Duolingo, Apple Fitness/Activity, Oura, Whoop, Garmin, Finch, Habitica, Streaks, Headspace, Calm, Strava, trainwell, plus academic work on streaks, lapses and social comparison. Researched 7 Oct 2026. Sources are mostly 2023–2026; older landmark work is flagged.

Note on sourcing: several company pages were fetched directly (Duolingo blog, Apple Watch User Guide, Gentler Streak site, Oura support, trainwell help, Calm/Headspace help). Where I could only reach a search snippet or a secondary summary, the finding says so.

---

## 1. Flexible streaks: freezes, pauses, "rest counts", weekly goals, and published retention effects

### Takeaway
The industry has converged on "a streak you cannot lose by accident": pause/freeze mechanics (Duolingo, Apple, Finch, Habitica, Streaks), backfill repair (Calm), schedule-aware streaks (Streaks app, trainwell), or redefining the streak so rest is part of it (Gentler Streak). Duolingo is the only company that has published a measured retention effect (+0.38% daily active learners from allowing two equipped freezes), and the academic literature (Silverman & Barasch 2023) backs the mechanism: broken streaks demotivate, flexible streak definitions motivate as much as rigid ones.

### Cited Findings

**Duolingo (primary source: company blog)**
- Streak Freeze "lets learners hit pause on your streak for a day" and is explicitly justified as flexibility: the blog cites a University of Pennsylvania/UCLA study that "slack" can be more motivating than rigid rules — [Duolingo blog: How the streak builds habit](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- Raising the cap from one to two equipped Streak Freezes "increased the relative number of active learners each day by +0.38%", which Duolingo calls notable at its scale. The in-app copy is "You have 0 of 2 equipped" with a "Refill streak freezes" button priced at 400 gems — [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- Learners who reach a 7-day streak are "3.6 times more likely to complete their course" (a correlation reported by the company, not a causal result); a new streak-extension animation with milestone-day variants raised the chance a new learner was still active 7 days later by +1.7% — [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- Duolingo's rationale: early streak days feel proportionally more rewarding (2→3 days is +50%, 200→201 is +0.5%); later, "loss aversion" is the main motivator — [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- Duolingo's retention PM says retention "is most fragile in the first seven days"; letting users choose their own streak goal duration "gave users a sense of ownership and significantly increased retention"; changing a button from "continue" to "commit to my goal" "significantly increased retention"; the team has run 600+ streak-related experiments (no effect sizes given on the page) — [Lenny's Newsletter: Behind the product, Duolingo streaks](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- A 2025 campaign let users who had previously held a 30+ day streak recover their longest streak by completing three lessons in one session (streak "revival" as a win-back tool) — [ContentGrip](https://www.contentgrip.com/duolingo-streak-revival-campaign/)
- Critique: freezes can become a crutch because they are easy to obtain (daily chests, gems) — [CMU UXA, "Performative Progress"](https://cmu-uxa.notion.site/Performative-Progress-Strava-Mules-Duolingo-Streaks-1c18eb2b3ca480f59cd2e4123ac0d7d2)

**Apple Activity rings (primary source: Apple Watch User Guide)**
- "You can pause your Activity rings for up to 90 days without breaking your award streak—and resume at any time." Options: pause for the day, until next Monday, until next month, or Custom; Resume Rings / Edit Pause are available — [Apple Watch User Guide: Adjust your Activity ring goals](https://support.apple.com/en-bw/guide/watch/apd29b30023c/watchos)
- Per-day goals: "Change for Today" sets "a temporary goal for your Activity ring for today"; "Change Daily Goal" lets you "customize your Activity ring goal by the day of the week" (via Goal Type > Schedule). "Every Monday, you're notified about the previous week's achievements, and you can adjust your goals for the next week." — [Apple Watch User Guide](https://support.apple.com/en-bw/guide/watch/apd29b30023c/watchos)
- Third-party how-tos attribute Pause Rings to watchOS 26 (2025); Apple's own guide page I fetched did not label the version (its selector shows watchOS 27/26/11), so "added in watchOS 26" is supported by secondary sources only — [AppleWorld.Today](https://appleworld.today/2026/09/how-to-pause-activity-rings-on-an-apple-watch-with-watchos-26/); [iPhone Life](https://iphonelife.com/content/pause-activity-rings)
- Historical demand: a 2019 post argued "The longer my streak continues, the more pressure there is not to break it," that rings did not survive illness/injury, and proposed earning a rest day per perfect month that accrues "like vacation days" — [Ged Maheux, Sept 2019](https://gedblog.com/?p=6713) (older landmark complaint; Apple shipped a pause six years later)

**Gentler Streak (primary source: product site)**
- Marketing copy: "Streaks that celebrate rest"; a streak "rewards consistency over perfection, so taking a break never means starting over"; "no guilt, no punishment"; "A lifelong streak starts with day one"; "Start gentle. Stay consistent."; "Built for the long game." The site does not spell out the exact rule by which rest days count toward the streak — [Gentler Streak site](https://gentlerstories.com/gentlerstreak/)
- Status feature: "Injuries happen, we get sick or we simply need a break. Change your activity status when needed," whose stated purpose is to "remove FOMO from sight and mind" — [Gentler Streak site](https://gentlerstories.com/gentlerstreak/)

**Finch**
- The Finch team describes "App Pause": you can pause without losing your streak; "When you're back, your streak will pick up right where you left off" — [Finch team on r/finch (mirror)](https://lr.in.psf.lt/r/finch/comments/1k1ik78/app_pause/mnmosca/?context=3) (page could not be fetched in full; from search snippet)
- Secondary description: "No punishments for missing days. No red X marks. Your Finch just stays home instead of going on an adventure." — [Neurospicy Nom Noms newsletter](https://neurospicynomnoms.beehiiv.com/p/digital-pet-bestie-for-self-care-610618d407f7afef) (note: a sponsored newsletter; an older AvanceCare guide says the streak "starts over" but can be paused, so the exact current rule is unverified) — [AvanceCare](https://www.avancecare.com/turning-self-care-into-a-game-to-help-you-build-healthier-habits/)

**Habitica**
- "Rest in the Inn" (now the "Pause Damage" setting after the Tavern was removed on 8 Aug 2023) stops health loss from incomplete Dailies when ill, on vacation, etc.; Dailies still refresh and can be partially completed while paused — [Habitica wiki](https://habitica.fandom.com/wiki/Rest_in_the_Inn); [Habitica blog](https://blog.habitrpg.com/tagged/finals)

**Streaks (iOS)**
- Tasks need not be daily: they can be set for specific days or N days per week/month, and streaks "can be paused and resumed at will"; the roundup contrasts this with Apple rings, which (at the time) ended on illness with no pause — [TapSmart](https://www.tapsmart.com/features/better-streaks-apps/) (secondary, older review)

**Calm and Headspace (primary: help centers)**
- Calm: a missed day can be repaired by manually adding a session to a past date in Profile > History; "Your streak count will automatically recalculate" — [Calm support: Restore a broken streak](https://support.calm.com/hc/en-us/articles/360008704893)
- Headspace: run streak increases per session within a 24-hour window; "24+ hrs" since last session risks reset to 0; non-meditation content (Sleepcasts, Movement, etc.) does not count; users can disable the streak from Profile — [Headspace help: run streak](https://help.headspace.com/hc/en-us/articles/215730567-How-does-the-run-streak-feature-work)
- Headspace's own article notes people "crying when they unintentionally miss a day and the run streak is interrupted" and argues the number matters less than the practice — [Headspace: Building a meditation practice](https://www.headspace.com/articles/building-a-meditation-practice)

**trainwell (coached strength app)**
- "Consistency Mode" is a toggle. ON: missed workout days show red, streaks visible, "for users who need extra accountability." OFF: missed and upcoming days both gray, streaks hidden, "for users who are already consistent weekly or who respond poorly to streaks." Workouts can be bumped by one day; trainers can edit a streak. Streak freezes were removed in favour of moving workouts, backups and weekly check-ins — [trainwell help: Consistency Mode & Streaks](https://help.trainwell.net/en/articles/985088)

**Strava**
- Strava's flexible mechanic is Goals (weekly/monthly/yearly across 32 sport types, subscriber-only) with goal graphs plotting actual vs target; streaks appear mainly in the Year in Sport recap. I found no official Strava "streak freeze" — [BikeRadar](https://www.bikeradar.com/news/strava-goals-update/); [Endurance.biz](https://endurance.biz/?p=63611)

**Academic evidence on streaks**
- Silverman & Barasch, "On or Off Track: How (Broken) Streaks Affect Consumer Decisions," Journal of Consumer Research, April 2023: people come to value the streak itself; breaking one is "especially demotivating" (loss of the behavior plus failure of the meta-goal); users lobby for restored streaks after outages. Design implications stated by the authors: do not highlight broken streaks in notifications; offer alternative ways to keep the streak (streak repair); define streaks flexibly — in one experiment participants who could keep a streak by doing either of two activities were more motivated than those restricted to one, with identical actual play — [University of Delaware, Lerner College](https://lerner.udel.edu/seeing-opportunity/lerner-professor-researches-how-streaks-motivate-us/)
- Silverman, Barasch & Small, "Hot streak!", OBHDP 2023: three consecutive successes make people more confident of future adherence than the same successes spread over a week — [UDel](https://lerner.udel.edu/seeing-opportunity/lerner-professor-researches-how-streaks-motivate-us/)
- Renfree et al., CHI EA 2016 (older landmark): streaks and reminders are effective at repetition but "create a dependency" on the app, making behavior change fragile when users abandon it — [Northumbria research portal](https://researchportal.northumbria.ac.uk/en/publications/dont-kick-the-habit-the-role-of-dependency-in-habit-formation-app/)

### Inferences
- The most defensible pattern for a 75-day program is Gentler Streak's reframing plus Silverman's "flexible definition": count any of several qualifying actions (full session, short session, rest day done as planned) as "staying on the path," and never surface a "broken" state. Onward's "a missed day is skipped, never restarted" already matches this; the research suggests also avoiding any notification that references the miss.
- Duolingo's effect sizes are small per feature (+0.38%, +1.7%) but compound; for a small app, the more transferable lesson is the qualitative one: give users slack on purpose and say so in the copy.
- trainwell's toggle is a cheap way to serve both "needs accountability" and "responds poorly to streaks" users; a similar switch could govern whether Onward shows consecutive-day counts at all.

### Gaps
- No published retention numbers for Apple's Pause Rings, Finch's App Pause, Calm's backfill, or Habitica's Pause Damage.
- Gentler Streak's exact streak rule (e.g., how many rest days in a row still count) is not documented on its site; I could not reach the App Store listing text.
- I could not confirm the current Finch streak rule from a primary source.

---

## 2. Readiness/recovery guidance: how HRV/RHR/sleep become "do more / do less / rest", and criticisms

### Takeaway
Oura, Whoop, Garmin and Gentler Streak all reduce overnight biometrics to a single daily band and attach short advice copy; they differ in presentation (0–100 score with four labelled bands at Oura; green/yellow/red at Whoop; two Garmin gauges; a visual "path" with a rest-to-active range at Gentler Streak). Criticism is mostly anecdotal (score swings, score-vs-feel mismatch, sleep anxiety) rather than peer-reviewed.

### Cited Findings
- Oura Readiness bands: 85–100 "Optimal", 70–84 "Good", 60–69 "Fair", 0–59 "Pay Attention". Copy: "Scores below 70 indicate that you may benefit from prioritizing rest and recovery in the indicated areas." Contributor-level "pay attention" messages come with a red progress bar; after heavy activity, Previous Day Activity "will be an indicator to use the next day as recovery time" — [Oura support](https://support.ouraring.com/hc/en-us/articles/360057791533)
- Oura marketing uses a three-band version: "85 or higher: Optimal, you're ready for action! 70-84: Good, you've recovered well enough. Under 70: Pay attention, you're not fully recovered"; "100s are designed to be rare." Rest Mode: if illness, injury or a lifestyle need prevents meeting activity goals, you can "temporarily mute your Activity Score & Contributors" — [Oura readiness page](https://ouraring.com/readiness-score) (note: the two Oura sources disagree on whether there are three or four bands)
- Whoop Recovery is "calculated based on your heart rate variability (HRV), resting heart rate (RHR), and sleep performance"; green "suggests you're well-rested and ready for intense activity"; yellow or red "may indicate fatigue, stress, or poor sleep"; advice is "pushing harder on green days" and "prioritizing rest on red days" — [Whoop community](https://www.community.whoop.com/t/what-is-the-recovery-score-and-how-is-it-calculated/107) (forum reply, not the official support article)
- Garmin: Training Readiness is a morning score combining overnight HRV, sleep, recovery time and recent load (Body Battery is one of six inputs); Body Battery is a continuous energy gauge that rises with sleep/rest and falls with exercise, stress, illness — [Should I Train](https://www.shoulditrain.com/blog/garmin-training-readiness-vs-body-battery); [Gneta](https://www.gneta.app/blog/understanding-garmin-body-battery) (third-party explainers; Garmin's own documentation was not retrieved)
- A commonly cited (unofficial) Body Battery mapping: 80–100 key session; 50–79 standard training; 25–49 easy only; 1–24 rest — [Should I Train](https://www.shoulditrain.com/blog/garmin-body-battery-for-athletes)
- Gentler Streak: "Daily Readiness", a 10-day view and a 30-day "Activity Path" that "adjusts when life gets in the way"; "Every day it suggests the workout that fits your body's current state"; on-watch live guidance "tells you when to ease off - before you push too far." Analysis is on-device: "No user accounts. No servers." — [Gentler Streak site](https://gentlerstories.com/gentlerstreak/)
- Secondary description of Gentler Streak's Activity Path: a daily bar from Rest to Active derived from HRV trend, RHR, sleep and recent load; Go Gentler suggestions can be scaled in duration and/or intensity rather than only accepted/skipped; the watch shows a countdown to "overreaching" — [Lifestack blog](https://lifestack.ai/blog/gentler-streak) (secondary)
- Criticism (anecdotal): a Whoop user reported recovery flipping from green at 1am to yellow at 6am before a race, which "rattled" them and worsened sleep anxiety; a TrainerRoad forum member asked what use a high score is "if the legs disagree"; another said scores often read lower than they felt — [JustUseApp Whoop reviews](https://justuseapp.com/en/app/933944389/whoop/reviews); [TrainerRoad forum](https://www.trainerroad.com/forum/t/anyone-using-a-whoop/4491?page=26)
- Oura users report feeling worse the next day when a sleep score is far below baseline; a reviewer credits the screenless form factor with preventing all-day fixation — [Ashley Mateo, Whoop vs Oura](https://ashleymateo.substack.com/p/whoop-vs-oura-ring-which-one-should)

### Inferences
- Beginners and returners do not need a number. Gentler Streak's wordless "where on the path are you today" plus three-ish states (rest / gentle / go) and Oura's one-sentence "may benefit from prioritizing rest" are the models that avoid score-chasing. Onward's 1–5 feel check-in could drive the same three-state output without wearables.
- Every vendor pairs the band with a specific next action (rest / easy / key session). Onward's adaptive rule ("shortened to 25 minutes") already fits; the lesson is to show the adjusted session, not a score.
- Oura's "100s are designed to be rare" and Whoop's day-to-day flips are the two things users complain about; a coarse, slow-moving indicator avoids both.

### Gaps
- No peer-reviewed study found that quantifies anxiety caused by recovery scores; searches for "orthosomnia" and wearable-induced anxiety were not run within the call budget.
- Garmin's official logic for Daily Suggested Workouts was not retrieved.
- Athlytic and Bevel were not researched (budget); both are HealthKit-based readiness apps similar to Gentler Streak.

---

## 3. Adaptive daily targets vs fixed programs ("lower the bar on bad days")

### Takeaway
Explicit "minimum viable" modes are rare as named features; the closest shipped patterns are Gentler Streak's scalable suggestions, Apple's "Change for Today" goal, trainwell's one-day workout bump, and Habitica's partial completion while paused. The concept is well established in coaching writing ("minimum viable day", "no zero days") but I found no published A/B evidence for it.

### Cited Findings
- Gentler Streak's suggestions can be scaled in duration and/or intensity up or down rather than only accepted or skipped — [Lifestack](https://lifestack.ai/blog/gentler-streak) (secondary)
- Apple: "Change for Today" sets a temporary goal for today; goals can also differ by weekday; the watch "suggests goals based on your previous performance" — [Apple Watch User Guide](https://support.apple.com/en-bw/guide/watch/apd29b30023c/watchos)
- trainwell: "Workouts can be bumped by one day" in either mode; freezes were replaced with moving workouts, backups and weekly check-ins — [trainwell help](https://help.trainwell.net/en/articles/985088)
- Habitica: while paused you can still complete some Dailies each day without penalty for the rest — [Habitica blog](https://blog.habitrpg.com/tagged/finals)
- Coaching concept: a "Minimum Viable Day" is a tiny baseline done on low-energy days instead of skipping, because people "fall into an all-or-nothing pattern" — [Life Coach Hub](https://lifecoachhub.com/minimum-viable-day-the-tiny-baseline-that-keeps-you-consistent/); "no zero days" framing with fallbacks like ten bodyweight squats — [Stoic Strength newsletter](https://stoicstrength.substack.com/p/236-there-are-no-zero-days)
- Revive And Thrive advertises adaptive workouts "designed to fit your energy, mood, and schedule" with daily check-ins — [Studio.com listing](https://studio.com/apps/reviveandthrive/revivethrive) (marketing claim)
- Garmin Coach adaptive plans "adapt daily based on your health and recovery data" — [REI product listing](https://www.rei.com/product/255915) (retail copy)

### Inferences
- Onward's "short version counts as a completed day" is ahead of most consumer apps, which treat a scaled day as a partial. Presenting it as a first-class choice on the Today screen ("Full · about 40 min" / "Short · about 20 min") mirrors Gentler Streak's scale-up/down control.
- Pair the short version with a one-line reason ("Feel was 2/5 yesterday") the way Oura ties "pay attention" to a contributor; users accept a lowered bar more readily when it is explained.

### Gaps
- No published experiment comparing fixed vs adaptive daily targets on retention in consumer fitness apps was found.

---

## 4. Visual progress that is not a streak

### Takeaway
The rest-positive apps replace the "chain" with either a path/trend (Gentler Streak's 30-day Activity Path, Oura trends, Strava goal graphs) or a growing companion (Finch's bird, Duolingo's milestone animations). Apple's Monday weekly summary and Strava's goal-vs-target graphs are the simplest beginner-readable forms.

### Cited Findings
- Gentler Streak: "Three views, one path forward" — Daily Readiness, 10-day view, 30-day Activity Path that "adjusts when life gets in the way"; the Yorhart companion is "Always there, never judging, just cheering you on" — [Gentler Streak site](https://gentlerstories.com/gentlerstreak/)
- Finch: positive habits earn "rainbow stones" spent on clothes and furniture for the bird; missing a day means the bird "just stays home instead of going on an adventure" — [Internet Matters](https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/); [Neurospicy Nom Noms](https://neurospicynomnoms.beehiiv.com/p/digital-pet-bestie-for-self-care-610618d407f7afef)
- Duolingo: milestone-day streak animations raised day-7 retention of new learners by +1.7% — [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- Apple: weekly summary notification every Monday with the option to adjust next week's goals — [Apple Watch User Guide](https://support.apple.com/en-bw/guide/watch/apd29b30023c/watchos)
- Strava Goals graphs plot actual vs target so subscribers can see if they are ahead or behind — [BikeRadar](https://www.bikeradar.com/news/strava-goals-graphs/)
- trainwell: with Consistency Mode off, missed and upcoming days are both plain gray on the calendar (no red) — [trainwell help](https://help.trainwell.net/en/articles/985088)

### Inferences
- "Gray, not red" for a missed day (trainwell OFF mode, Finch's "no red X marks") is the concrete UI rule behind the "neutral miss" that Onward's brief already asks for.
- A weekly rollup (Apple Monday summary; Onward's existing Sunday week-wrap) is the beginner-friendly unit; a 30-day path (Gentler Streak) suits a 75-day program's phase recaps.

### Gaps
- No usability research found that tests which visualization beginners read best; this remains an inference.

---

## 5. Notification tone and cadence

### Takeaway
The rest-positive apps lean on few, optional, encouraging notifications; Apple's award citation praises Gentler Streak for being powered "not by insistent reminders." The only research found on complaints shows "frustration due to frequent app notifications" as a named theme in users' social posts about major fitness apps.

### Cited Findings
- Apple's award copy for Gentler Streak: powered "not by insistent reminders but an optimistic and encouraging vibe" — [Gentler Streak site](https://gentlerstories.com/gentlerstreak/)
- Apple sends one scheduled recap: "Every Monday, you're notified about the previous week's achievements" — [Apple Watch User Guide](https://support.apple.com/en-bw/guide/watch/apd29b30023c/watchos)
- trainwell exposes "Streak Save Notifications" as an on/off setting — [trainwell help](https://help.trainwell.net/en/articles/985088)
- Headspace lets users disable the run streak entirely from Profile — [Headspace help](https://help.headspace.com/hc/en-us/articles/215730567-How-does-the-run-streak-feature-work)
- UCL/Loughborough analysis of social posts about five popular fitness apps (British Journal of Health Psychology) found users reporting "shame" when logging unhealthy food, "frustration" due to frequent notifications, and "disappointment" at missed targets; apps "often produced as much frustration as motivation" — [BOL News summary of the study](https://www.bolnews.com/?p=1164463) (secondary summary; the journal article itself was not fetched)
- Silverman & Barasch's design advice: apps should not highlight a broken streak in notifications — [UDel](https://lerner.udel.edu/seeing-opportunity/lerner-professor-researches-how-streaks-motivate-us/)
- Duolingo's product podcast lists a "Notification strategies" chapter but the page gives no copy; the widely circulated "these reminders don't seem to be working" passive-aggressive notification is not documented on the pages I fetched — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)

### Inferences
- Onward's two-per-day cadence (evening preview, morning "ready") is at the high end for a rest-positive app; both should be individually switchable, and neither should ever mention a missed day.
- Copy that previews the next session ("Tomorrow: Strength B, about 40 min") is informational rather than nagging, which fits the pattern.

### Gaps
- No study isolating supportive vs guilt-framed notification wording in fitness apps was found within budget; a 2019 University of Twente thesis tested frequency and wording but its results were not retrievable — [University of Twente](https://essay.utwente.nl/78328/)
- Duolingo's notification copy experiments: no primary source with results was reached.

---

## 6. Social/community features and comparison

### Takeaway
Gentler Streak has no social layer at all ("No user accounts. No servers."), Finch's social layer is supportive-only (friends, encouragement), and the academic literature on upward comparison is mixed: it motivates some users and causes withdrawal in others, with self-control and tie strength as moderators.

### Cited Findings
- Gentler Streak: no social, sharing or community features described; "No user accounts. No servers."; "Your personal information belongs to you, not to AI models or ad platforms." — [Gentler Streak site](https://gentlerstories.com/gentlerstreak/)
- Finch: users can set custom goals or pick suggestions including "connecting with loved ones" — [Internet Matters](https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/) (I did not find a primary description of friend "hugs" within budget)
- An arXiv 2025 paper on activity-boosting agents reports participants who fell behind "withdrew from the app, hid it, or avoided checking the leaderboard", read as self-protection against upward comparison, and trust broke down when users doubted top performers were real — [arXiv 2508.12388](https://arxiv.org/pdf/2508.12388)
- Poncin, Charry & Kullak: upward social comparison leads to negative reactions and online communities "may reduce the effectiveness of fitness apps"; stronger tie strength offsets this — [UCLouvain DIAL](https://dial.uclouvain.be/pr/boreal/en/object/boreal%3A289963)
- Frontiers in Public Health 2023 (n=1,452): upward comparison improves well-being of high self-control users but reduces it for low self-control users — [Frontiers 2023](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2023.1281323/pdf); a 2025 Frontiers survey found upward comparison positively affects social presence and continued use — [Frontiers 2025](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1632598/pdf)
- Strava's social layer (clubs, kudos) exists alongside a critique that it drives "performative progress" — [CMU UXA](https://cmu-uxa.notion.site/Performative-Progress-Strava-Mules-Duolingo-Streaks-1c18eb2b3ca480f59cd2e4123ac0d7d2)

### Inferences
- For a comeback audience (likely lower current self-efficacy), the evidence leans against leaderboards; if social is added later, limit it to strong ties and one-way encouragement (Finch model), not rankings.

### Gaps
- No longitudinal or experimental study tying leaderboard exposure to dropout was found; the evidence is cross-sectional or qualitative.

---

## 7. Published UX research / A/B results

### Takeaway
Hard numbers exist only from Duolingo (streak freeze cap +0.38% DAU; milestone animation +1.7% day-7 retention; 7-day streak ↔ 3.6x completion) and from Silverman & Barasch's lab experiments (flexible streak definitions motivate as much as rigid ones; broken streaks demotivate). Everything else is design rationale or anecdote.

### Cited Findings
- Duolingo numbers as above — [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- Silverman & Barasch, JCR 2023 and OBHDP 2023 — [UDel](https://lerner.udel.edu/seeing-opportunity/lerner-professor-researches-how-streaks-motivate-us/)
- Renfree et al., CHI EA 2016, qualitative study of Lift — [Northumbria](https://researchportal.northumbria.ac.uk/en/publications/dont-kick-the-habit-the-role-of-dependency-in-habit-formation-app/)
- A blog cites a 2021 Computers in Human Behavior study linking rigid streak mechanics to guilt, anxiety and abandonment after a break; I could not verify this against the journal, so treat as unconfirmed — [FitCraft blog](https://getfitcraft.com/blog/streak-effect)
- A 2017 live evaluation (24 weeks) of a diet app concluded push notifications engage users "in the short term" — [Macquarie University](https://researchers.mq.edu.au/en/publications/push-notifications-in-diet-apps-influencing-engagement-times-and-/)

### Inferences
- The combination "flexible definition + repair + never mention the break" is the only pattern supported by both a company experiment and peer-reviewed work; it should be the default for Onward rather than a toggle.

### Gaps
- No published results from Headspace, Calm, Finch, Gentler Streak, Whoop or Oura on retention effects of their rest/pause features.
- No CHI/JMIR paper specifically on self-compassion in fitness-app design was found within budget.

---

## Pattern summary for the Onward product team (derived from the findings above)

| Pattern | Who ships it | Concrete form |
|---|---|---|
| Streak you cannot lose by accident | Duolingo (2 freezes), Apple (Pause Rings ≤90 days), Finch (App Pause), Habitica (Pause Damage), Streaks (pause) | Explicit pause with duration picker; streak resumes where it left off |
| Repair after the fact | Calm (backfill a past date), Duolingo (streak repair/revival) | Edit history to restore; one-time win-back offer |
| Flexible definition of "kept it" | Silverman experiment; Streaks (N days/week); trainwell (bump a day) | Any of several actions counts; schedule-aware |
| Rest counted as progress | Gentler Streak ("Streaks that celebrate rest") | Rest day is a planned step on the path |
| Neutral miss | trainwell OFF mode (gray not red), Finch (no red X) | Missed day shown gray; no notification about it |
| Life status | Gentler Streak (sick/injured/break), Oura Rest Mode | One tap mutes goals and "removes FOMO" |
| Readiness as words, not numbers | Oura ("pay attention", "may benefit from prioritizing rest"), Whoop (green/yellow/red), Gentler Streak (path) | Three states, one sentence, one adjusted next action |
| Scalable session | Gentler Streak (scale duration/intensity), Apple (Change for Today) | Full vs short version chosen on the day |
| Weekly rollup instead of daily pressure | Apple Monday summary | One notification per week with numbers |
| Streak display is optional | trainwell toggle, Headspace disable | Setting to hide consecutive-day counts |
| No ranked social | Gentler Streak (none), Finch (supportive only) | Avoid leaderboards for low-self-efficacy users |
