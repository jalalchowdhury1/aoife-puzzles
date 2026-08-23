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
| 1 | Coaching line | **WISC-V-format puzzles, original content.** The owner was told this sits on the "coaching" side of GDC form 10.4 and chose it. **Never reproduce, paraphrase, or fetch actual Pearson/WISC-V items — formats only.** |
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
| 14 | **Validity is sacred (2026-08-23)** | A puzzle that is broken, ambiguous, or unfair produces a FALSE weakness and defeats the purpose of the whole app. Every genre at every difficulty must be solvable, single-answer, visually unambiguous, and age-fair (see §5 fairness rules). Nothing deploys except through `npm run release` (lint + tsc + unit + fairness + e2e play-through + build); a failing check blocks the deploy. Suspicious results are flagged server-side (`flags` on blocks) and excluded from her profile. |
| 13 | Remedial rule (2026-08-22, after launch) | **Every level after the diagnostic adapts to her profile: a weak area starts EASIER and gets MORE practice; a strong area starts near her ceiling and gets fewer reps.** Implemented in `lib/engine/adapt.ts`; levels opt in with `weighting: "remedial"`. Never ship a post-diagnostic level that ignores the profile. |
| 14 | Measurement quality (2026-08-23, after her Level 1 data showed it was needed) | **A broken or misunderstood puzzle must not become a false weakness in her profile.** `lib/engine/quality.ts` flags blocks like a first attempt at a new format that ended after two straight misses, or a run that mostly timed out; those flags exclude the block from her ceilings/values, are shown to the owner via Telegram, and are listed on the parent page. See §5 "Measurement quality" for the detail. |

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
  index.ts     GENRES registry + GENRE_LIST (spec order)
components/genres/*View.tsx   one UI per genre (4 verbal genres share ChoiceView); components/genres/index.tsx = VIEWS map
components/{BigButton,Countdown,SampleScreen,PartDone,Figure,ParentTable}.tsx
lib/levels/    level1.ts, level2.ts + index.ts (LEVELS) — levels are DATA
```

Genre ↔ subtest map: blockDesign=Block Design (VS) · visualPuzzles=Visual Puzzles (VS) ·
matrix=Matrix Reasoning (FR) · figureWeights=Figure Weights (FR) · arithmetic=Arithmetic (FR/QRI) ·
digitSpan=Digit Span (WM) · pictureSpan=Picture Span (WM) · coding=Coding A (PS) · symbolSearch=Symbol
Search A (PS) · similarities / vocabulary / information / comprehension (VC).
EGAI bundle = SI VC IN CO BD MR FW AR (Pearson TR#5, verified). CPI bundle = DS PS CD SS.

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
- **Difficulty scales have history.** When a genre's ramp is rebuilt, add an entry to `SCALE_CHANGES` in `lib/engine/scale.ts` (genre, cutover ISO time, old→new map). `computeProfile` remaps pre-cutover ceilings so her record stays comparable; raw sessions in KV are never rewritten. 2026-08-23: Piece Picker (old d1 = new d5) and Balance (old d4 = new d6).
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

**"Add a genre"** → `lib/genres/<id>.ts` (pure: generate/score/sample/timing/mode) + `.test.ts` (500 seeds
× 10 d) + `components/genres/<Id>View.tsx` + register in `lib/genres/index.ts` AND `components/genres/index.tsx`
(VIEWS) + add `GenreId` to `types.ts` + put it in a level. Domain roll-ups in `profile.ts` need the new id too.

**"Replay a part"** → parent page → Replay links (`/play?level=1&part=A&replay=1`). The first run stays
the diagnostic of record; replays are separate sessions.

**"Remove test data"** → `scripts/kv-del.mjs <sessionId>` (reads KV creds from `vercel env pull`).

## 8. File map

See §2. Tests live beside their modules (`*.test.ts`). `docs/superpowers/` holds the spec and plan that
produced v0.1.0; research notes live outside the repo in `~/Documents/Research/wisc-v-puzzle-prep/`.
