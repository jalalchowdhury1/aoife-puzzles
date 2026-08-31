# AGENTS.md — Aoife Puzzles

> **Read this first. Single source of truth for anyone (human or AI) touching this repo.**
> README.md is Jalal's plain-English doc — leave it alone unless asked. If something here
> is wrong, fix *this* file.

## 1. What this is

A tablet (iPad) web game for Aoife (born 2021-01-11) of **original puzzles in the formats of
the 13 WISC-V subtests** the Gifted Development Center administers (10 primary + Information,
Comprehension, Arithmetic). She sits the WISC-V at GDC in early 2027. **Level 1** is a
diagnostic ("Find Your Superpowers", three ~15-minute parts) that maps her relative
strengths and weaknesses; later levels are added as data and can start from her recorded
profile. Every item, answer, time and time-out is stored server-side. Every staircase block
also opens with up to two **teaching items** (real data: a 5-year-old failed the first two
items of two genres without ever seeing the format work) — a miss there reveals the answer
for 4s and does NOT by itself end the block, unlike a normal miss; the knob is
`teachingItems` on `LevelConfig`/`BlockConfig` (block overrides level), resolved into
`ResolvedBlock.teachingItems` by `lib/engine/adapt.ts` and enforced by `lib/engine/staircase.ts`
(`startStair`'s third arg). Level 1 and Level 2 both set `teachingItems: 2`.

Live: **https://aoife-puzzles.vercel.app** · repo `jalalchowdhury1/aoife-puzzles` (public) ·
spec `docs/superpowers/specs/2026-08-22-aoife-puzzles-design.md` · plan `docs/superpowers/plans/`.

### Owner decisions (2026-08-22) — do not re-litigate

| # | Decision | Choice |
|---|---|---|
| 1 | Coaching line | ~~WISC-V-format puzzles~~ **SUPERSEDED by #16 (2026-08-23): similar, not same.** Still: never reproduce, paraphrase, or fetch actual Pearson/WISC-V items. |
| 2 | Timing | **Visible countdown** (calm bar + seconds) on timed genres. Deliberately differs from aoife-math's no-timer rule. |
| 3 | Verbal subtests | Multiple choice, options weighted 2/1/0 like real scoring. |
| 4 | Storage | Shared **free** Upstash Redis (the planner's DB) under `aoife_puzzles:*` keys + localStorage mirror. No paid services. |
| 5 | Device | iPad, touch first, landscape and portrait. |
| 6 | Company | Usually alone → every block self-explains (spoken instructions + untimed sample item). |
| 7 | Audio | Browser speech reads digit sequences and word problems; one Replay per item; visual fallback only if speech unavailable (logged `audioFallback`). |
| 8 | Level 1 feedback | **None** — "Next!" only. No ticks/crosses/answers, **EXCEPT teaching items**: the first two items of each block reveal the answer if missed, like the real test's teaching items. |
| 9 | Sittings | Level 1 = 3 parts (A Shapes, B Memory and Speed, C Words); progress saves after every block. |
| 10 | Verbal difficulty | Age 6 → 13 ramp over d1–10. |
| 11 | Mood | Calm during; confetti + sticker at the end of a part only. |
| 12 | Telegram | One summary message per completed part to the owner's @ZingerJC_bot DM. |
| 17 | **Extend past level 10, earned not speculative (2026-08-24)** | Jalal: "go beyond level 10 for those that she has already reached." `Difficulty` widened to 1-15 (`MAX_DIFFICULTY`); a genre opts in via `Genre.maxDifficulty` (default 10, `genreMaxD()` reads it) — staircase/adapt/profile/audit all read the genre's OWN max, never a hardcoded 10. Widen a genre's ramp ONLY after her real data shows she hit its old top (matrix/patternTrain d10, 2026-08-22 — the only genre that ever has); every other genre's `generate()` clamps d to `BaseDifficulty` (1-10) via `clampToBase()`, unchanged behavior. patternTrain and pictureSudoku were extended to 15 on 2026-08-24: patternTrain d11-15 = peak-and-mirror counts, mirror-in-interleave, first triple combo, true 3-way interleave, 10-car/5-option capstone (the mirror stream is always fully shown, never the extrapolated one); pictureSudoku d11-15 = a real sudoku BOX constraint (4x4/2x2 boxes at d11-12, 6x6/2x3 at d13-15; d12/14/15 place blanks so the box is provably load-bearing, 500/500 seeds). Do not widen any other genre speculatively. |
| 18 | **"Not fun" = a bit too difficult; answer with a win-heavy remedial level (2026-08-23)** | Jalal, after her first full Level 3 run: a "Not fun" tap means the difficulty frontier, not boredom. The response recipe (Level 4 "Pip's Power-Ups" is the template): make the bailed/couldn't-do genres the modules; start each at 30% BELOW the peak she bailed at (rounded down); stepUp 2 with `LevelConfig.fastLane: false` (the fast lane is what rushes her to the wall); feedback "reveal", teachingItems 0, weighting "none" with hand-pinned starts; if the losses were TIMEOUTS on a strong genre, fix the clock (`BlockConfig.timeScale`) not the ceiling; order blocks to open easy and close on her strongest. "She needs to win wayyyy more than she loses." |
| 19 | **Ease her in at the frontier — "7.5 and then 8" (2026-08-23)** | Jalal: "she has an issue at level 8 but level 7 is easy. Can we do something that can ease her in. Like do 7.5 and then 8" + "When Pip shows her, Pip takes sweet time" + "on levels she is struggling increase her time so we know if it's time or not being able to do it at all". Mechanism = `LevelConfig.easeIn: true` (staircase.ts, decision-#19 block): at difficulties ABOVE her measured ceiling (`ResolvedBlock.knownCeiling`; start-level fallback when never measured) — (a) the FIRST miss per difficulty is free: answer revealed, no penalty, difficulty holds, retry (`StairState.lastMissFree`, record gets `teaching+frontier`); (b) a counted miss soft-lands one level down for a rebuild win (two counted misses in a row still end the block); (c) the per-item clock runs 1.5x (composes with `BlockConfig.timeScale`) so a frontier miss separates time-vs-ability in the data; (d) every answer-reveal waits for HER tap ("Got it!" pill, no auto-advance timer). Fractional difficulties were rejected: fix a real  cliff by re-banding the genre ramp instead (scale.ts). |
| 16 | **SIMILAR, NOT SAME (2026-08-23) — supersedes #1** | Jalal: "I don't want her completely trained on something we shouldn't be training her on. Let's go with similar and not same." Every genre is a COUSIN of its WISC-V subtest: same mental muscle, different game format (Mosaic Maker, Fix the Picture, Pattern Train + Picture Sudoku, Swap Shop, Animal Parade, Firefly Boxes, Translator, Spot It, Which Two Belong, Fill the Gap, What Would You Do; Story Sums and general knowledge stay). The replica genres are RETIRED from play (code kept for her history). Never reintroduce a test-format replica. |
| 15 | **Slow, one step at a time (2026-08-23)** | After six single-answer steps took her from 5 to 7 digits ("I can't remember them!") and two rebuilt ramps: practice levels use `stepUp: 2` (two correct in a row before the next difficulty), start WELL below her best (weak → 1, typical → ceiling − 3, strong → ceiling − 2), rebuilt ramps start at 1, and every ramp's bottom must be doable by a 4-year-old with one new idea per step. She must be succeeding most of the time or she disengages and the data stops. The diagnostic (Level 1) keeps `stepUp` 1. |
| 14 | **Validity is sacred (2026-08-23)** | A puzzle that is broken, ambiguous, or unfair produces a FALSE weakness and defeats the purpose of the whole app. Every genre at every difficulty must be solvable, single-answer, visually unambiguous, and age-fair (see §5 fairness rules). Nothing deploys except through `npm run release` (lint + tsc + unit + fairness + e2e play-through + build); a failing check blocks the deploy. Suspicious results are flagged server-side (`flags` on blocks) and excluded from her profile. |
| 13 | Remedial rule (2026-08-22, after launch) | **Every level after the diagnostic adapts to her profile: a weak area starts EASIER and gets MORE practice; a strong area starts near her ceiling and gets fewer reps.** Implemented in `lib/engine/adapt.ts`; levels opt in with `weighting: "remedial"`. Never ship a post-diagnostic level that ignores the profile. |
| 20 | **Age-benchmark lens on the parent page (2026-08-26)** | Jalal: "build out our dashboard and the levels accordingly. that way we can accurately gauge how she is in comparison to others as well." The parent page's **Ages tab** shows approximate, research-anchored typical-age BANDS for the skill each difficulty demands (`lib/engine/benchmarks.ts`, digest `docs/research/2026-08-26-age-benchmarks-research.md`). Hard limits: parent page only, never child-visible; age RANGES with a stated basis — never percentiles, IQ numbers, or a single "mental age"; speed genres get NO band (per-minute norms are proprietary — a fake norm is a false comparison); a censored ("still winning when items ran out") or bailed ceiling can never produce a "below" verdict. This narrows the old blanket "no norms" line: profile SCORES remain self-relative only. |
| 14 | Measurement quality (2026-08-23, after her Level 1 data showed it was needed) | **A broken or misunderstood puzzle must not become a false weakness in her profile.** `lib/engine/quality.ts` flags blocks like a first attempt at a new format that ended after two straight misses, or a run that mostly timed out; those flags exclude the block from her ceilings/values, are shown to the owner via Telegram, and are listed on the parent page. See §5 "Measurement quality" for the detail. |
| 21 | **DOORS ONLY (2026-08-27)** | Jalal (2026-08-26 evening, Davidson strategy: VECI alone at 145+, or VCI+QRI both): "Only doors. But since we are taking something away. Add in a fun factor. Tell her how good she is even more. Pip is funny." Every released level from **Level 7** on uses ONLY the six door genres in `lib/levels/doors.ts` (whichTwo, fillTheGap, information, whatWouldYouDo, arithmetic, swapShop) — guarded by levels.test.ts. Enforced at the LEVEL layer, not by retiring genres: levels 5/6 were unreleased before she played them (nothing replayed; Level 7 "Pip's Dream Team" absorbs their door work), while the 8 non-door genres stay active for history, QA/e2e/audit, and the Practice tab. Praise banks got a silly-Pip expansion in the same change. Spec: `docs/superpowers/specs/2026-08-27-davidson-doors-design.md`. |
| 22 | **Talk with Pip — spoken production, grown-up judged (2026-08-27)** | Jalal: "we should have a conversation piece as well.. where she is asked the question and she answers with voice" + "keep it as a separate tab then. I will do that with her at a different time." `/talk` is a SEPARATE with-a-grown-up tab, never in her solo flow: Pip asks an open-ended question aloud (TTS; original items, `lib/talk/items.ts`, four areas mirroring the verbal doors), she answers OUT LOUD, the grown-up taps 2/1/0 against a model-answer strip (2 = the abstract category, 1 = a surface feature — how the real verbal subtests score). **HARD RULE: no speech-recognition auto-scoring, ever** (a misheard answer = a fabricated weakness, decision #14). Items under 2 resurface next sitting. Records live under `aoife_puzzles:talk:*` via /api/talk and NEVER enter computeProfile — production and recognition are separate measurement classes (parent page: Talk tab). This deliberately relaxes #16's format line for THIS grown-up-supervised tab only; all solo/scored play stays cousins-only. |
| 24 | **Ceiling probes + a per-genre fast lane (2026-08-28)** | Her clean Level 7 session exposed that 8-item stepUp-2 no-lane blocks cap a flawless run at ~start+4 — whichTwo scored 16/16 yet recorded ceiling 6 ("we need to do a better job of testing her ceilings"). Level 8 "Pip's Sky Climb" = the probe template: `start: "fromProfileTop"` (AT her live ceiling, adapt.ts) + maxItems 14 for the censored/capped genres (whichTwo, information, arithmetic); swapShop a 6-item confirm; easeIn stays the safety net. Fast lane, Jalal verbatim: "If she does it super fast and correct = fast lane. If she does it correct but not fast, in fact slow, then keep the same progress path." + "Fast lane for information and fill the gap. The other 2 let it be on the normal way." → `BlockConfig.fastLane` (block wins over level) ON only for those two, with `BlockConfig.fastMs` tightening the untimed "fast" bar BELOW her median (information 5s vs her 8.6s; fillTheGap 7s vs 12.5s — the flat 10s default counts a merely typical answer as fast). arithmetic + information banks widened to d11-15 per #17 (both caps topped 2026-08-27); benchmarks.ts gained the d11-15 bands. |
| 25 | **See every question, not just the score (2026-08-29)** | Jalal, on the parent page's Last session tab: "in this i actually want to see all the questions. in details if and when i want. also what choices there were, what she answered. the whole thing." Tap any row to expand the whole item. Nothing is stored to make this work — `lib/engine/itemView.ts` REGENERATES the question from the recorded `(seed, d, response, bankId, points)`, so it inherits decision #14 wholesale and returns **null rather than a guess** under four guards: (1) the genre's ramp was re-banded after that session (`scale.ts` remapped the difficulty, so a replay is a different puzzle); (2) the regenerated `bankId` differs from the recorded one (bank drift); (3) the option at her recorded index does not score the points she was awarded (shuffle drift); (4) a response that is present but the wrong SHAPE — distinct from a null response, which is a genuine timeout/bail and still renders the question with "she gave no answer". Replaying an item also needs `priorBankIds` (the bankIds earlier in the same block), because a block never repeats a bank entry and that exclusion steers both the pick and the shuffle — supplying it took her real-data resolution from 99/121 to 119/121 items (the two blanks are pictureSudoku, a picture with no honest text rendering). A wrong question shown to a parent is worse than a blank row. |
| 29 | **Answer cues audit: the verbal banks were giving the answer away (2026-08-30)** | Jalal, seeing a Which Two item: "banana ladder empathy and compassion... I mean come on. The level difference alone lets her choose the big words. Check, then recheck 3 times and red team... Keep the scores and levels she already achieved." Four independent audits confirmed it was systemic, in different clothes per bank: **whichTwo** from d5 up was always two abstract words + two household objects (register = answer), and the reason step was length-cued (the 2 point reason was the strictly longest in 65/75 items; 44 zero-point reasons were bare colors); **fillTheGap** 44/50 flagged (a recycled babyish filler pool never the key, "pick the rarer word" = 2 points on ~48/50, intensifier collocations, ten keys reused across paired tiers); **whatWouldYouDo** 42/50 (best answer = longest option in 74%, cartoon-villain zeros, moral adverbs only in the key, "involve an adult" heuristic); **information** 33/60 (different-category distractors, difficulty misplacement, cross-item leaks) plus an ENGINE bug: `sample()` never shuffled, so the practice item always showed the key in slot 1 for every verbal game. Her 10/10 "perfect" whichTwo run to d10 and the verbal age bands were therefore upper bounds, not measurements. **Fixes:** all four banks re-authored (whichTwo distractors + reasons for all 75; fillTheGap 50/50 with the evidence IN the sentence and 50 distinct keys; whatWouldYouDo 50/50, homeschool settings, safe advice, flat option lengths; information 47/60 changed and 26 re-banded into a monotone d1-15 ramp), each through author → independent red team → fixes → second independent pass → third BLOCK-only pass. **Machine guards** in `lib/genres/fairness/cues.test.ts` (register/length/echo/moral-word/self-condemning/shared-opening/adult-heuristic/reason-length/color-reason/key-reuse/article/intensifier detectors, each named after the bug it caught) plus a required `reviewNote` on every choice item and `distractorNote` on every whichTwo item. Samples now shuffle with a fixed seed. **Her record is untouched** (decision #14 in the keeping direction): scores, ceilings, position (L9C) all stand; the Davidson tab says plainly that pre-2026-08-30 verbal steps are upper bounds. **History replays honestly**: `lib/genres/banks/legacy/2026-08-30/*` are frozen copies of the four banks and `bankAsOf(genre, bank, asOf)` (legacy/index.ts) makes every generator draw from the bank that was live on the session's date (`GenerateOpts.asOf`, passed by itemView/insights/bankLookup), so the parent page shows the words she actually saw and never today's. Cutover constant `REVISION_2026_08_30`. **Level 9 Part C re-pointed before she played it**: whichTwo start 5 and whatWouldYouDo start 4, stepUp 1, long enough to pass the old ceilings, instead of probing AT a cued d10 (a wall on item one). Practice rematches regenerate on today's banks by design. |
| 28 | **Age-band re-audit: the labels were inflated, and the fix found a mis-pitched ramp (2026-08-29)** | Jalal: "the age things we have on the parents page… does seem like it's a bit inflated. Check with Perplexity Deep Research." He was right, twice over. (1) The verbal bands were CIRCULAR — banks authored to an age-6→13 ramp (decision #10), then "confirmed" to match ages 6→13 — and mapped MULTIPLE-CHOICE items onto norms for spoken PRODUCTION, which is harder. Fix: every verbal "15+" claim removed, all verbal ramps cap at 13-14 (a 3-option item stops discriminating by age up there — 33% chance floor), every verbal genre carries a visible RECOGNITION caveat ("she picks; the real subtests make her say — any age here is a floor"), rendered in the Davidson tab. Verbal bands stay LOW confidence and the basis string says so. (2) Arithmetic corrected against CCSS, independently derived then confirmed by the deep-research pass (12 steps, 72 sources) and verified at source: working-backwards is 4.OA.A.3 = grade 4 = ages 9-11, NOT the 13-15 we claimed. (3) The correction exposed that the morning's d16-20 arithmetic band was mis-pitched at grades 4-7 — BELOW the d14-15 it sat on — so a d15→d20 climb would have recorded a FAKE ceiling (decision #14 cuts in the overstating direction too). Owner chose full re-author: d16 = unknown on both sides (8.EE.C.7), d17 = compound fraction change incl. the cancel trap, d18 = two-unknown systems (8.EE.C.8), d19 = inverse proportion (7.RP.A.2), d20 = capstone; ladder monotonic again, all samples hand-verified. Digest: `docs/research/2026-08-29-age-band-reaudit.md`. Perplexity gotcha for next time: blank lines in the prompt box SUBMIT — send long prompts as one continuous line, or only the first paragraph goes through. |
| 27 | **The archive: ALL questions, not just the last sitting (2026-08-29)** | Jalal, after seeing #25 land on a 4-item practice round and look empty: "i want a place where i can see ALL the questions she answered. with all the details. right / wrong / time taken / median time for these questions etc and more." New **All questions** tab (`components/parent/AllQuestionsTab.tsx`, pure core `lib/engine/questionLog.ts`): every question she has ever answered in one list, newest first, filterable by game and by result, each row expandable into the full item via the shared `QuestionDetail`. Her live archive is **791 questions across 25 games, 18 sittings, 6 days**. The "and more" is the pace column — her time against her own median FOR THAT GAME AT THAT DIFFICULTY, because one global median averages 1.3s Translator taps with 27.6s Which Two reasoning and describes neither (the UI says so explicitly whenever more than one game is in view). **Baseline hygiene is the load-bearing part**: practice rematches, teaching/frontier free tries, bails and quality-flagged blocks are all SHOWN — they happened — but `countsTowardBaseline()` keeps every one of them out of the medians and out of accuracy, so a rematch answered in 1s cannot drag the 20s baseline it is displayed against. `Insights.timeline` gained a `practice` flag for this. Two bugs caught in review before ship: accuracy printed all-correct over the counted denominator (overstating her), and the pace label read "0.4× faster" when 0.4× of her usual time is 2.5× FASTER. **Defaults to the six door genres** (Jalal: "give me an option to pick only the games that we are doing for davidson"): 590 of her 791 questions are retired games — mostly the four speed genres — so opening on everything buried the six that matter and dragged the headline median toward 2-second tapping (2.5s across 25 games vs 11.5s across the six). "Everything" is one tap away and the retired games sit behind a disclosure. Door chips render in canonical DOOR_GENRES order (VECI/VCI four, then QRI two) to match the Davidson tab, not by volume. |
| 26 | **The ladders got taller: scale to 20 (2026-08-29)** | Level 8 was the ceiling probe and it worked: Story Sums went d10 -> **d15** (13/14, no miss above d10) and Which Two Belong went d6 -> **d10 at 10/10 perfect**. Both topped their caps, so d15/d10 were measuring the BANK, not her. Per #17 (earned, never speculative): `Difficulty`/`MAX_DIFFICULTY` widened 15 -> **20** (nothing else in the engine hard-coded the old top); `arithmetic.maxDifficulty` 15 -> 20 with bank templates ar-81..ar-100 (d16 fraction chains and fixed-step sequences, d17 combined rates and averages, d18 two unknowns from a total plus a relationship, d19 working backwards, d20 multi-stage capstone); `whichTwo.maxDifficulty` 10 -> 15 with bank items wt-51..wt-75 climbing the same axis (d11-12 hidden shared process, d13 social systems, d14 change over time, d15 ideas about ideas). `benchmarks.ts` gained bands for every new rung. fillTheGap and whatWouldYouDo are STILL capped at d10 and were still winning at d8/d7 — widen them only if Level 9 tops them. |
| 23 | **Practice tab — replay what she got wrong (2026-08-27)** | Jalal: "for all of these things, make sure we can go back and practice the ones we got wrong." `/practice` replays her actual counted misses/timeouts (regenerated from (genre, seed, d)), framed as "rematches", UNTIMED, reveal on miss. Excluded from the queue: bails, teaching/frontier items, speed-block genres, retired replicas (`lib/engine/practice.ts`). An item clears once answered correctly anywhere later. Practice sessions post as `SessionRecord{level: 0, part: "P", practice: true}` and **computeProfile drops them at the door** — practice can never inflate ceilings or the Ages tab. Home shows "⭐ Rematches (n)" only when the queue is non-empty (`GET /api/practice`, public, refs only). NOTE: a queued (genre, seed, d) regenerates on the CURRENT ramp — after a scale.ts re-band the item differs from the one she originally saw (e.g. her old-d6 swapShop timeouts now regenerate as new-d6 read-off items, the gentler inserted band). Deliberate: rematches stay win-heavy and always valid on today's ramp. |

## 2. Architecture

```
app/
  page.tsx               home: Play → current part; stickers; ☁️/⏳ sync icon (+ "offline" if /api/state didn't answer). No scores.
  play/page.tsx          THE RUNNER: sample screen → staircase/speed block → "Next!" → persist → PartDone
  parent/page.tsx        unlinked dashboard; asks for PARENT_KEY once (localStorage); profile + sessions + replay links
  api/sessions/route.ts  POST upsert SessionRecord (→ Telegram on first `complete`), GET list (gated)
  api/profile/route.ts   GET computeProfile(sessions) (gated)
  api/state/route.ts     GET position + resolved plan for the child's OWN device (public, no gate — see below)
lib/engine/
  types.ts     Genre<I,R> contract, GenreViewProps, Item/Block/Session records, Level/Part/Block configs, summarize()
  rng.ts       mulberry32 — every item = (genreId, seed, difficulty), fully deterministic
  staircase.ts startStair/stepStair: +1 on correct, hold on wrong, stop after 2 consecutive wrong / maxItems / top
  timing.ts    itemMs table helper, SPEED_BLOCK_MS = 120 s
  profile.ts   sessions → per-genre stats → domain roll-ups (VS FR WM PS VC) + EGAI/CPI bundles; z-flags ±0.5 within HER OWN domains
  adapt.ts     classifyGenres (weak/typical/strong per genre) + adaptPart (resolves a part's blocks against
               her profile — remedial levels only; see §7)
  speech.ts    Web Speech wrapper (speak, speakSequence, warmUpSpeech) — the only browser code under lib/
  storage.ts   localStorage mirror + outbox → /api/sessions (20 tries then keep local), currentPosition, profileStart,
               fetchServerState (GET /api/state, 5s timeout, null on any failure) + mergeSessions (unions local
               sessions with server-known completions the mirror never saw, as synthetic minimal complete records)
  sessionsStore.ts  server-only loadAllSessions() (index LRANGE + per-id GET) — shared by api/sessions, api/profile, api/state
  kv.ts        Upstash REST; EVERY key goes through PREFIX "aoife_puzzles:"
  telegram.ts  sendTelegram (never throws) + formatPartSummary
  gate.ts      x-parent-key === PARENT_KEY
lib/genres/    one pure module per genre (generate/score/sample/timing/mode) + banks/ (authored verbal + arithmetic items)
               + banks/legacy/<date>/ (frozen pre-re-author copies; `bankAsOf` serves them for history replays, decision #29)
               + fairness/cues.test.ts (answer-cue detectors: every verbal bank change must keep these green)
  index.ts     GENRES registry + GENRE_LIST (spec order)
components/genres/*View.tsx   one UI per genre (4 verbal genres share ChoiceView); components/genres/index.tsx = VIEWS map
components/{BigButton,Countdown,SampleScreen,PartDone,Figure,ParentTable}.tsx
lib/levels/    level1.ts, level2.ts + index.ts (LEVELS) — levels are DATA
```

Genre ↔ skill map (decision #16, 2026-08-23 — cousins, not replicas):
mosaic=Mosaic Maker (build from a model, VS) · fixPicture=Fix the Picture (mental assembly, VS) ·
patternTrain=Pattern Train + pictureSudoku=Picture Sudoku (rule induction, FR) · swapShop=Swap Shop (quantitative
substitution, FR) · arithmetic=Story Sums (FR) · animalParade=Animal Parade (auditory sequence memory, WM) ·
fireflyBoxes=Firefly Boxes (visuospatial sequence memory, WM) · translator=Translator (lookup speed, PS) ·
spotIt=Spot It (scan speed, PS) · whichTwo=Which Two Belong? (categories, VC) · fillTheGap=Fill the Gap (word
knowledge, VC) · information=Do You Know (VC) · whatWouldYouDo=What Would You Do? (social reasoning, VC).
RETIRED (code kept for her Level 1/2 history, `retired: true`, never in a level): blockDesign, visualPuzzles,
matrix, figureWeights, digitSpan, pictureSpan, coding, symbolSearch, similarities, vocabulary, comprehension.
Levels: 1 = diagnostic (retired genres, fun off) · 2 = RETIRED practice (unreleased) · 3 = "Pip's Games"
(all 14 active genres, three parts, stepUp 2, teaching items, reveal, fun on) · 4 = "Pip's Power-Ups"
(decision-#18 remedial, one part) · 5 = "Pip's Winning Streak" (UNRELEASED 2026-08-27 by #21 — she never
played it) · 6 = "Pip's Explorer Day" (UNRELEASED 2026-08-27 by #21 — she never played it) · 7 = "Pip's
Dream Team" (2026-08-27: first DOORS-ONLY level — Part A = L5A's two door blocks with the same pins,
Part B = L6B's verbal-four probe; see `lib/levels/level7.ts` header) · 8 = "Pip's Sky Climb"
(2026-08-28: the ceiling-probe level, decision #24 — fromProfileTop starts, per-block fast lane for
information/fillTheGap only, arithmetic+information banks widened to d11-15) · 99 = hidden QA level.
Separate tabs (not levels): `/talk` = Talk with Pip (decision #22, grown-up judged production) ·
`/practice` = Rematches (decision #23, replay of her missed items, never counted in the profile).

Data flow: runner builds `SessionRecord` (one per part attempt) → after every block: `saveSessionLocal` +
`enqueue` + `flushOutbox` → `POST /api/sessions` → Upstash `aoife_puzzles:session:<ulid>` +
`aoife_puzzles:index` (LPUSH) → on first `complete: true`, Telegram summary (idempotent via
`aoife_puzzles:notified:<id>`, cleared with DEL if the send fails so the next POST retries).

**The server is the source of truth for position and adaptation; local storage is a mirror/offline
fallback** (2026-08-22, after learning iPad Safari deletes script-writable storage — including
localStorage — after 7 days with no visit, and a different device starts with nothing). Home
(`app/page.tsx`) and the runner (`app/play/page.tsx`) both call `fetchServerState()` on load/part-start
and `mergeSessions(loadSessions(), state.completed)` the result into the local session list before
computing `currentPosition` or `computeProfile` — so a wiped iPad or a fresh device still lands on the
correct next part instead of being sent back to Level 1 Part A and re-taking the diagnostic. `GET
/api/state?level=N&part=X` is **public — no `PARENT_KEY` gate** (it's what the child's own device calls)
but returns no items/points/ceilings/profile, only `completed` (level/part/id/startedAt of finished
sessions), `position` (`currentPosition` against every KV session), and `blocks` (that part's
`ResolvedBlock[]` from `adaptPart`, i.e. the *already-adapted* start/maxItems/teachingItems/timeScale/
strength/repeat plan — her profile went into producing it, but the profile numbers themselves never
leave the server). If the server doesn't answer within 5s, or KV is down, `fetchServerState` returns
`null` and both pages fall back to local-only data exactly as before this existed. The runner still
resolves a remedial level's plan locally via `adaptPart(part, level, computeProfile(sessions))` whenever
the server didn't answer; it only prefers `state.blocks` when the fetch succeeded.

## 3. Run / test / deploy

- `npm install --cache ./.npm-cache` (the global npm cache on this Mac is corrupted; `.npm-cache/` is gitignored).
- `npm run dev` · `npm test` (Vitest, `lib/**/*.test.ts`, generators swept 500 seeds × 10 difficulties) ·
  `npm run lint` · `npm run typecheck` · `npm run build` · `npm run e2e` (Playwright, `e2e/**`).
- **Deploy: ALWAYS run `npm run release`; never call `vercel --prod` directly.** `scripts/release.sh` is the
  release gate for owner decision #14: nothing deploys unless every puzzle demonstrably works. It runs, in
  order, lint → `tsc --noEmit` → unit tests → build → the Playwright play-through, printing a ✅/❌ per step,
  and only if every step is green does it run `vercel --prod --yes` and `vercel ls`. Any red step aborts
  before anything deploys. **GitHub auto-deploy is NOT connected** (the Vercel GitHub App lacks access to
  the repo; same gotcha as aoife-math) — pushing to main does nothing on Vercel; `npm run release` is the
  only way a change reaches production.
- The Playwright play-through (`e2e/playthrough.spec.ts`, config `playwright.config.ts`) drives an automated
  browser through every genre in one pass via the hidden QA level (`lib/levels/levelQa.ts`, id 99,
  `released: false` — reachable only at `/play?level=99&part=Q&replay=1`, every genre once, `maxItems: 2`,
  and `blockMs: 4000` on the two speed blocks via `BlockConfig.blockMs`). It stubs `speechSynthesis` (so
  `speak()` resolves instantly instead of hanging in a headless browser) and stubs `fetch` for
  `/api/state`/`/api/sessions` (so the run resolves everything locally and never touches KV). Run it alone
  with `npm run e2e`; first run needs `npx playwright install chromium`.
- Definition of done for any change: `npm run release` green (lint + tsc + tests + build + e2e all pass),
  deployed, and a real walkthrough on the iPad (speech needs a real Safari; simulators lie about audio).

## 4. Secrets & env (Vercel project `aoife-puzzles`, team jalalchowdhury-8053)

| Var | Where it came from |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | copied from the `aoifes-schedule` Vercel project (same Upstash DB `upstash-kv-alizarin-helmet`, Free plan: 1 DB, 256 MB, 500K cmds/mo, $0) |
| `PARENT_KEY` | generated 2026-08-22; local copy `~/PycharmProjects/.secrets/aoife-puzzles.env` (mode 600) |
| `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID` | `~/PycharmProjects/.secrets/telegram.env` (@ZingerJC_bot → Jalal's DM) |

No secrets in the repo. Never print them to a transcript.

## 5. Gotchas / hard rules

**A verbal item can be right and still be worthless (decision #29).** An option
set that lets her score without the skill (the two "big words", the longest
answer, the only kind-sounding one, the one with a grown up in it, the one
that is not silly) writes a FALSE STRENGTH into her profile, which is just as
misleading as a false weakness. Before touching a bank: read
`lib/genres/fairness/cues.test.ts`, keep it green, write the `reviewNote` /
`distractorNote` honestly (name the pairings/options a bright child might try
and say why the key wins), and never ship a bank change without an independent
read of every changed item. When re-authoring a bank she has ALREADY played,
freeze the old file under `banks/legacy/<date>/` and register it in
`banks/legacy/index.ts` with the deploy time as the cutover, so her history
keeps replaying the words she actually saw. Never rewrite raw sessions.

**Arithmetic templates must be answerable on EVERY draw, not just lucky ones.**
`ArithmeticBankItem.ok` is only a *preference*: `bankGenre.ts` draws vars 50
times and, before 2026-08-29, then returned the FIRST draw regardless. Since
most `ok`s are divisibility guards and `answer` divides, that fallback could
render a "correct" answer of 4.666… — an item she cannot possibly type, which
lands in her profile as a false weakness (decision #14). An audit found **19 of
100 templates** able to do this, 15 of them in the d11-15 bands she had already
played; each was guarded only by probability (~1e-6 to 1e-15 per item, never
zero). `fallbackVars()` now searches deterministically and NEVER returns a draw
that violates `ok`; two rules in `banks/banks.test.ts` keep it true. When adding
a template: prefer an answer built only from `+ - *` and `Math.floor`, and if
you must divide, keep the `ok` hit rate high. The 50 random attempts and their
rng consumption are frozen — changing them would regenerate every item she has
already played and break her history, the Practice tab, and question replay.


- **NEVER read or write the planner's keys** `aoifes_schedule`, `aoife_plan`, `aoife_plan_prev`. Every KV
  access goes through `PREFIX` in `lib/engine/kv.ts`. The DB is shared; the namespace is the only wall.
- **No Pearson content, ever.** Formats are generic cognitive-task designs; item content is ours.
- **No "I don't know" / skip buttons anywhere** (GDC's own advice: practice guessing). Done stays disabled
  until there is a response; speed blocks respond on first tap.
- **Nothing the child sees shows scores, right/wrong, or time except the countdown bar.**
- **Views fire `onReady()` in a mount effect → the runner remounts the view per item (`key`).** Do not
  "optimize" that away; the timer start and speed-block streaming depend on it.
- Matrix Reasoning, Digit Span, Picture Span and the verbal genres are **untimed** (time recorded).
  Block Design 45/75/120 s by difficulty, Visual Puzzles 45 s (d≤3) / 30 s (d≥4), Figure Weights 45 s
  at d≤5 / 30 s at d≥6 (see the ramp notes below), Arithmetic 30 s after speech ends, Coding / Symbol
  Search 120 s block windows.
- **Balance ramp (2026-08-23)**: `lib/genres/figureWeights.ts` was rebuilt from absolute basics after
  real 5-year-old testing showed the old d1-3 was trivial matching and d4 jumped straight to
  substitution/algebra ("2 diamonds = 1 hexagon; 2 hexagons = ?" with mixed-shape options — "insanely
  hard even for me"), and she timed out twice at old d7. New bands, one new idea per step: **d1** one
  scale, 1 shape, "is this the same?" (3 options: 1/2/3 copies of it). **d2** one scale, 2-3 of one
  shape (4 options: the full 1-4 count range of that shape). **d3** one scale, a MIX of two shapes;
  options are the identical multiset plus 3 different multisets of those same two shapes. **d4** an
  equivalence is SHOWN on scale 1 (e.g. 1 square = 2 circles) and the question scale literally repeats
  scale 1's left pan, so the answer is read straight off scale 1's right pan — no arithmetic. **d5**
  the same shown equivalence, but the question DOUBLES the pictured count (lengths capped at 2 on
  scale 1 so the doubled counts never exceed the 4-shape budget). **d6** one equivalence, question 1-3
  copies, mixed-shape distractor options (old d4). **d7** the same idea with larger counts (question
  pan up to 4) and, about half the time, a mixed-shape question pan (old d5-6). **d8** two chained
  equivalences over 3 shapes, single-shape question (old d7). **d9-10** two chained equivalences with
  a mixed-shape question pan (old d8-10). Every band keeps: exactly one option totals the target, every
  option total is distinct from every other, ≤4 shapes per pan/option, hidden weights are distinct
  integers 1-6, and every shown ("given") scale truly balances. **At d≤5 every option is built ONLY
  from shapes that actually appear on the scales** — no foreign shape to rule out by "I haven't seen
  that yet" instead of by weight. Option count is 3 at d1 and 4 from d2 on (never 5 anymore — see
  `figureWeights.test.ts` and the Figure Weights section of `fairness.test.ts` for the per-band
  scale-count/option-count checks).
- **Reload mid-block** restarts that block with fresh seeds; completed blocks are never redone; a part
  that is complete redirects to `/` unless `?replay=1` — checked against the **merged** (server + local)
  session list, so a part the server knows is done redirects even if this device's localStorage never
  recorded it.
- **`/api/state` is public but returns no results** — no `PARENT_KEY`, but only `completed`/`position`/
  `blocks` (a resolved plan), never items, points, ceilings, or the profile. `/api/sessions` GET and
  `/api/profile` GET stay parent-gated; all three now load sessions through the one shared
  `loadAllSessions()` in `lib/engine/sessionsStore.ts`.
- **iOS speech needs a user gesture**: the Start button on the sample screen is it (`warmUpSpeech`). If
  `speechSynthesis` is missing, views fall back to visual presentation and mark `audioFallback`.
- React Compiler lint rules (`react-hooks/set-state-in-effect`, `react-hooks/refs`) reject "reset state in
  an effect" — views use the "adjust state during render" pattern. Follow it in new views.
- The staircase's "correct" for 2/1/0 genres = points ≥ 1; ceiling = highest difficulty with points > 0.
- Profile flags are **relative to her own five domains** (population-SD z, ±0.5). No norms, no IQ-like
  numbers, ever. Say so wherever the profile is shown.
- **Measurement quality** (decision #14): `lib/engine/quality.ts` (`flagBlock`/`flagSession`, pure) flags a
  block as `format-not-understood` (a staircase's first two non-teaching items both wrong at d ≤ 2, OR the
  whole block ended at ≤ 2 attempted with 0 correct — e.g. two missed teaching items), `mass-timeouts`
  (≥ 50% of attempted items timed out, attempted ≥ 3), `rapid-wrong` (≥ 2 wrong, non-timed-out answers under
  2 s — informational only), `speed-accuracy` (< 70% accuracy on a speed block, attempted ≥ 10 —
  informational only), or `abandoned` (attempted === 0). `app/api/sessions/route.ts` stamps `block.flags`
  server-side on every POST (overwriting anything the client sent); `app/api/profile/route.ts` and
  `app/api/state/route.ts` both call `ensureFlags` to backfill flags on-the-fly for sessions saved before
  this shipped (no KV migration). `lib/engine/profile.ts` EXCLUDES `format-not-understood`/`mass-timeouts`
  blocks entirely from that genre's `attempted`/`correct`/`points`/`max`/`ceiling`/`timeouts`/`medianMs`/
  `perMinute` (they still appear in that genre's `trend`, marked `flagged: true`) — the point is a broken or
  misunderstood puzzle must never read as a real weakness (decision #14). `rapid-wrong`/`speed-accuracy`
  never exclude anything. Every flag (all five codes) also lands in `Profile.flags` for the parent page's
  "Flags" section (date/part/puzzle/reason) and in the completed part's Telegram summary as one
  `⚠️ check: <kidTitle> — <detail>` line per flagged block, plus a closing "Flagged blocks are not counted
  in her profile." line when any block was flagged. `components/ParentTable.tsx` also marks a per-genre row
  "⚠️ some results excluded" when that genre has any excluded block.
- Symbol Search item score is 1/0; the block-level "correct − incorrect" is derivable from `BlockSummary`.
- **Difficulty scales have history.** When a genre's ramp is rebuilt, add an entry to `SCALE_CHANGES` in `lib/engine/scale.ts` (genre, cutover ISO time, old→new map). `computeProfile` remaps pre-cutover ceilings so her record stays comparable; raw sessions in KV are never rewritten. 2026-08-23: Piece Picker (old d1 = new d5) and Balance (old d4 = new d6). 2026-08-26: Swap Shop (old d6 = new d7; old d9+d10 fold at 10 — see the ramp note below).
- **Swap Shop ramp (2026-08-26, the owner's "0.5 level")**: her Level 4 block showed old d5→d6 was a
  cliff that broke decision #15 — two fast d5 wins (5.3 s / 3.9 s), then two FULL-clock timeouts, because
  old d6 introduced mixed-token piles AND a 45 s→30 s clock drop at once. Per decision #19 (fractional
  difficulties rejected; re-band the ramp instead), a new d6 was inserted: one rule, question = 1 copy,
  the answer still a plain read-off count exactly like d3/d5, but mixed piles now appear as WRONG options
  only (≥ 1 mixed distractor guaranteed; the correct pile provably can't be mixed since any pile holding
  the give-token overshoots the target). Old d6–d8 shifted to d7–d9; old d9+d10 folded into d10 (d10's
  1–3 rate range subsumes d9's 1–2). Timing boundary moved with it: 45 s for every single-rule band
  (d ≤ 7 — including the band she timed out on), 30 s for the chained bands d8–10. Fairness rules for the
  new band live in `lib/genres/fairness/swapShop.test.ts` ("d6's correct pile is always a plain count",
  "d6 always shows at least one mixed pile").
- `.claude/` (agent worktrees) and `.npm-cache/` are gitignored and ESLint-ignored; keep them that way.
- **Piece Picker ramp (2026-08-23)**: rebuilt from level 0 after a 5-year-old passed the 1/2/3-cell items
  then hit notched squares/L-pieces with 6 options and timed out four times running ("insanely hard even
  for me") — the old d1 was not basic enough and d3→d4 was a cliff. `VisualPuzzlesItem` now carries
  `pieceCount: 2 | 3` and `optionCount: 3 | 4 | 6` (the view shows "Tap N pieces" and Done enables at
  exactly `pieceCount`), resolved per difficulty by `bandOptionsFor` in `lib/genres/visualPuzzles.ts`: d1
  a domino + single cell (3 cells, 2 pieces, 3 options — 1 obviously-wrong distractor); d2 a 4-cell target
  from 2 pieces (1+3 or two differently-oriented dominoes, 4 options); d3 a 5-6 cell target from 2 distinct
  pieces (2+3/2+4/3+3, 4 options, no more monominoes); d4 back to 3 pieces (1+2+3=6 cells) but only 4
  options (1 obviously-wrong distractor) as a gentler re-introduction before 6 options return. d5-10 replay
  the OLD ramp's bands verbatim, shifted up: d5/d6 = old d1/d2 (4×4, 5-6 cells, 6 options, obvious
  distractors), d7 = old d3 (4×4, 6-8 cells), d8 = old d4+d5 folded into one difficulty (a 4×4/6-8-cell or
  5×5/9-12-cell sub-band chosen once per item — real mirror/near-miss distractors begin here, no rotation
  yet), d9 = old d6+d7 (5×5, 9-12 cells, rotation begins), d10 = old d8-10 (6×6, 12-16 cells, rotation).
  Distractors are "obviously wrong by cell count" through d7 and never a mirror below d8 (mirror/near-miss
  distractors are d≥8 only); no two options share a shape (exact match below d9, rotation-equivalent from
  d9). Time caps: 45 s at d≤3 (the new absolute-basics bands need more room), 30 s at d≥4 (unchanged from
  before). The sample item is now d4-style (3 true pieces, 1 distractor, 4 options total).

## 6. State / TODO

- 2026-08-29: **Her Level 8 results, Level 9 "Pip's Record Breakers", scale to 20, and the full-question parent view** (decisions #25/#26). Level 8 completed Parts A+B (2026-08-28) and C (2026-08-29), zero quality flags on any block. Results: **arithmetic d10 -> 15, 13/14, topped the cap**; **whichTwo d6 -> 10, 10/10 PERFECT, topped the cap**; information d10 -> 11 then a "Not fun" bail at d12 (Jalal, who was sitting with her: "i know this cause i was there. step 12 was too hard" — a REAL wall, so #18 remedial applies, not a boredom read); fillTheGap d6 -> 8 still winning; whatWouldYouDo d4 -> 7 still winning; swapShop d7 -> 9 with a genuine 65-second frontier miss at d9. Shipped in response: `Difficulty`/`MAX_DIFFICULTY` 15 -> 20; arithmetic to d20 (ar-81..100) and whichTwo to d15 (wt-51..75) with matching benchmark bands; **Level 9** = probes at `fromProfileTop` for the four still-winning/topped genres (arithmetic 14 items from d15, whichTwo 12 from d10, fillTheGap 12 from d8, whatWouldYouDo 10 from d7), a hard-pinned **remedial** information block (start d8, 8 items, `fastLane: false`, so a clean run ENDS on her proven d11 and never reaches d12 again), and swapShop unchanged as a 6-item warm open. Parent Last-session tab now expands any row into the whole question via the new `lib/engine/itemView.ts`. **Also fixed a latent validity bug the audit surfaced** (see §5): 19 of 100 arithmetic templates could render an unanswerable fractional answer on the rare fallback draw — 15 of them in bands she had already played. Verified against her live data: position resolves to L9A, all six blocks resolve to the intended starts, 119/121 recorded items replay exactly.
- 2026-08-28: **Level 8 "Pip's Sky Climb" shipped** (decision #24, ceiling probes). Engine: `BlockConfig.fastLane`/`fastMs` per-block overrides (runner reads `cfg.fastLane ?? levelCfg.fastLane`; untimed fast bar `cfg.fastMs ?? 10_000`), `start: "fromProfileTop"` (= AT the live ceiling) in adapt.ts. Banks: arithmetic ar-61..80 and information in-41..60 author real d11-15 ramps (both `maxDifficulty: 15`); benchmarks gained the matching bands. Self-played all three parts against a KV-less dev server with her ceilings injected: fast lane fired at 1.2s and NOT at 9-13s in information (d10→15 climb, ceiling 15), whatWouldYouDo's 1.2s corrects did NOT solo-climb (override works), arithmetic probe started at d10, spent its one free frontier miss at d11 (teaching+frontier flagged), held d11, then soft-landed d11→d10 on the counted miss. Release gate green (967 unit, 5/5 e2e) ×2; prod /api/state resolves her to L8A with swapShop 7/arith 10/fillTheGap 6+lane/info 10+lane. Note: the 05:00 scheduled cloud build stalled on a sandbox permission prompt; the work was completed by the live concierge session instead (one duplicate-field near-collision caught and resolved via cross-session stand-down).
- 2026-08-27 (~4 AM overnight build): **Doors-only era + Talk + Practice shipped** (decisions #21/#22/#23,
  spec `docs/superpowers/specs/2026-08-27-davidson-doors-design.md`). Levels 5/6 unreleased (unplayed),
  Level 7 "Pip's Dream Team" released (position resolves to L7A); `/talk` (grown-up-judged spoken
  production, own KV namespace + parent Talk tab) and `/practice` (rematch queue of her real misses,
  profile-excluded) live; praise banks amped. e2e caught a real bubbled-click double-advance bug on the
  between screens before ship (single-trigger rule now commented in both pages). Earned-but-unbuilt
  arithmetic d11-15 still open.
- 2026-08-26 (later): **Age Lens + Level 6 shipped** (spec `docs/superpowers/specs/2026-08-26-age-lens-design.md`,
  decision #20). `lib/engine/benchmarks.ts` = research-anchored typical-age bands per genre/difficulty
  (+ `measureStatus`: still-winning / at-top / bailed / measured — a censored ceiling renders as "≥ N");
  parent `/parent` gained the 📏 Ages tab; Level 6 "Pip's Explorer Day" probes the six still-winning
  genres (mosaic, patternTrain + the four verbal) with fromProfile starts, fast lane ON, easeIn ON.
  Research digest: `docs/research/2026-08-26-age-benchmarks-research.md` (7 Perplexity threads).
- 2026-08-26: Level 5 "Pip's Winning Streak" + Swap Shop re-band shipped (spec
  `docs/superpowers/specs/2026-08-26-level5-swapshop-reband-design.md`). Her Level 4 results: fireflyBoxes
  ceiling 5→7 (8/8), arithmetic 8/8 to ceiling 10 on the 1.5× clock (clock theory CONFIRMED), pictureSudoku
  ceiling 3→4 (no bail), swapShop flagged `mass-timeouts` (the old-d6 cliff → re-band). First session with
  zero "Not fun" taps. **Earned but not built: the arithmetic bank past d10** (she hit its cap with clean
  d10 wins — decision #17 allows the extension when someone picks it up).
- 2026-08-22: v0.1.0 shipped — Level 1 (3 parts) live; parent page; Telegram summaries.
- 2026-08-22: Level 2 "Practice Round 1" exists, unlocked after Level 1 (`currentPosition` only surfaces it
  once every Level 1 part is complete). `feedback: "reveal"` + `weighting: "remedial"` — see §7.
- 2026-08-22: iPad-viewport (1180x713) QA batch — SampleScreen is now a landscape/`lg:` two-column layout
  (info + Start on the left, sample view right, both vertically centred) so Start is never below the fold;
  a remedial repeat block (`ResolvedBlock.repeat`) shows a short "One more round!" screen instead of the full
  sample; PartDone awaits `flushOutbox()` before showing (and polls `syncState()` for 10s after) so the
  ⏳/☁️ line is never stale; home shows an "Earned: …" row of stickers from completed parts of earlier
  released levels; Piece Picker cells are 36px; Balance option tiles no longer clip a 4-shape option and the
  reveal-mode question scale draws level; Block Builder's reveal ring is `ring-4 ring-rose-400 ring-offset-2`
  (readable on red cells); What's Missing's landscape option column is 64px tiles / 8px gap.
- `vercel env add` via stdin marks vars *sensitive*: `vercel env pull` on this project returns BLANK values (production still works). To run `scripts/kv-del.mjs`, pull the env from the `aoifes-schedule` project instead.
- Ideas parked, not promised: Cancellation / Letter-Number Sequencing / Picture Concepts genres;
  per-session "guess rate" proxy; audio-only Arithmetic (`display: "audio"`) in later levels.

## 7. Playbooks

**"Add a level"** → new `lib/levels/levelN.ts` exporting a `LevelConfig` (usually `feedback: "reveal"`,
`weighting: "remedial"`, blocks with `start: "fromProfile"` so `adaptPart` resolves each genre's actual
start/reps from her profile (see the remedial-adaptation playbook below), and `display: "audio"` for
Arithmetic if she is ready); register in `lib/levels/index.ts`; `levels.test.ts` guards genre ids.
**Before designing the level, read her profile** (next playbook).

**"How remedial adaptation works"** (decision #13) → any level with `weighting: "remedial"` (Level 2
onward) is resolved by `lib/engine/adapt.ts`, not played straight off `LevelConfig`. `classifyGenres`
flags every genre `weak` / `typical` / `strong` relative to *her own* data: a genre is `weak` if its
domain flag (from `profile.ts`) is `"weakness"` OR its value sits more than 0.1 below the median of all
her genre values; `strong` if the domain flag is `"strength"` AND its value is at/above that median;
otherwise `typical`; no data at all → `typical`. `adaptPart` then resolves each block for a non-remedial
level literally (`start`/`maxItems` as written, `"fromProfile"` → `ceiling − 1`) but for a remedial level:
weak starts at `ceiling − 2` (more room to rebuild) with up to 10 reps *and* one extra repeat block of the
same genre appended at the end of the part; typical starts at `ceiling − 1` with up to 8 reps; strong
starts at (or near) the ceiling with as few as 6 reps. Speed genres (`coding`, `symbolSearch`) are exempt
from the ceiling math — they always start 1/8 since the runner ignores those fields in a speed block —
but still get the repeat block when weak. The runner (`app/play/page.tsx`) calls `adaptPart` once per
part-start (and again on `?replay=1`), so mid-part performance in the SAME sitting never re-adjusts the
rest of that part. **The knobs are all in `adaptPart`/`classifyGenres`** — the median-minus-0.1 weak
threshold, the −2/−1/0 ceiling offsets, and the 10/8/6 rep counts. Change them there, not in a level file.
The parent page's per-genre table shows the live `classifyGenres` result (a "Level 2 plan" tag) so the
owner can see what a remedial level will actually do before she plays it.

**"How is she doing / design the next level"** → read the live profile:
```bash
curl -s -H "x-parent-key: $(grep PARENT_KEY ~/PycharmProjects/.secrets/aoife-puzzles.env | cut -d= -f2-)" https://aoife-puzzles.vercel.app/api/profile | jq .
curl -s -H "x-parent-key: …" "https://aoife-puzzles.vercel.app/api/sessions?level=1" | jq .   # raw sessions
```

**"Add a genre"** → `lib/genres/<id>.ts` (pure: generate/score/sample/timing/mode + `audit(item)` HTML) +
`.test.ts` + `lib/genres/fairness/<id>.test.ts` (500 seeds × 10 d, named rules) + `components/genres/<Id>View.tsx`
(answers carry `data-testid="answer-option"`, submit is a "Done" button) + append the id to `GenreId` in `types.ts`
+ register in `lib/genres/index.ts` (with its `e2e` plan) AND `components/genres/index.tsx` (VIEWS) + add it to
`DOMAIN_GENRES`/bundles in `profile.ts` + put it in a level. The QA level, audit page and Playwright play-through
pick it up from `GENRE_LIST` automatically. It must be a COUSIN of a WISC-V task, never a replica (decision #16).

**"Replay a part"** → parent page → Replay links (`/play?level=1&part=A&replay=1`). The first run stays
the diagnostic of record; replays are separate sessions.

**"Remove test data"** → `scripts/kv-del.mjs <sessionId>` (reads KV creds from `vercel env pull`).

## 8. File map

See §2. Tests live beside their modules (`*.test.ts`). `docs/superpowers/` holds the spec and plan that
produced v0.1.0; research notes live outside the repo in `~/Documents/Research/wisc-v-puzzle-prep/`.
