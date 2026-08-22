# Aoife Puzzles — design spec (2026-08-22)

A tablet web game of original puzzles in the formats of the 13 WISC-V subtests the
Gifted Development Center administers. Level 1 is a diagnostic that maps her relative
strengths and weaknesses; every later level is added as data and can start from her
recorded profile. All results persist server-side so future builds read them.

Repo: `jalalchowdhury1/aoife-puzzles` (public). Live target: `aoife-puzzles.vercel.app`.
Sibling pattern: `aoife-math` (Next.js + Tailwind, deterministic generators, Vitest).

---

## 0. Decisions made by the owner on 2026-08-22 (do not re-litigate)

| # | Decision | Choice |
|---|---|---|
| 1 | Coaching line | **WISC-V-format puzzles**, original content. The owner was told this sits on the "coaching" side of GDC form 10.4 and chose it. Never reproduce, paraphrase, or fetch actual Pearson items; formats only. |
| 2 | Timing | **Visible countdown** on timed genres (calm shrinking bar + seconds). This deliberately differs from aoife-math's no-timer rule. |
| 3 | Verbal subtests | **Multiple choice** (she plays alone; options weighted 2/1/0 like real scoring). |
| 4 | Storage | **Shared free Upstash Redis** (the planner's `upstash-kv-alizarin-helmet`, Upstash Free plan: 1 DB, 256 MB, 500K cmds/mo, $0) under `aoife_puzzles:*` keys + localStorage mirror. Never touch `aoifes_schedule`, `aoife_plan`, `aoife_plan_prev`. No new paid services. |
| 5 | Device | **iPad**, touch first, landscape and portrait. |
| 6 | Company | **Usually alone** → every block self-explains: spoken + written instructions, untimed sample item with explanation. |
| 7 | Audio | **Browser speech (Web Speech API)** reads digit sequences and word problems aloud; one Replay allowed per item. Visual fallback only if speech is unavailable (logged). |
| 8 | Level 1 feedback | **None** — "Next!" only. No ticks, crosses, or answers during the diagnostic. |
| 9 | Sittings | Level 1 = **3 parts (~15 min each)**, progress saved after every block. |
| 10 | Verbal difficulty | **Age 6 → age 13** ramp. |
| 11 | Mood | **Calm during, party at the end** of each part (confetti + sticker). No per-item celebration. |
| 12 | Telegram | **Yes** — one summary message per completed part to the owner's bot. |

Research inputs (verified 2026-08-22, files in `~/Documents/Research/wisc-v-puzzle-prep/`):
- GDC administers the 10 primary subtests + Information, Comprehension, Arithmetic (13). (gifteddevelopment.org/assessment, /newsletter/shout)
- EGAI = Similarities, Vocabulary, Information, Comprehension, Block Design, Matrix Reasoning, Figure Weights, Arithmetic (Pearson TR#5, read from the PDF). VECI = SI, VC, IN, CO. GAI = SI, VC, BD, MR, FW. FSIQ = SI, VC, BD, MR, FW, DS, CD. NVI = BD, VP, MR, FW, PS, CD. QRI = FW, AR. CPI = DS, PS, CD, SS.
- Gifted children typically score relatively lower on WMI and especially PSI (NAGC position statement; TR#5 rationale). The speed and memory genres are therefore where the "never met this format" gap is most costly.
- GDC's own advice: "The best preparation for testing is to practice guessing… Tests start with very easy items designed for younger children… Test questions get progressively more difficult." → the app never offers "I don't know"; sample screens say so.
- Training matrix-rule knowledge raises matrix scores (Frontiers 2021 review) — the owner accepted this.
- Timing rules below marked *(prior knowledge)* come from generic published descriptions of administration, not from a fetched source; they set the spirit of each cap, exact seconds are not load-bearing.

---

## 1. Architecture

```
aoife-puzzles/
  app/
    page.tsx                  home: big "Play" → current level/part; resume if mid-level
    play/page.tsx             the block runner (one screen, drives any genre)
    parent/page.tsx           unlinked parent dashboard (needs PARENT_KEY, stored in localStorage after first entry)
    api/sessions/route.ts     POST (save session/part), GET (list; gated)
    api/profile/route.ts      GET (computed profile; gated)
    layout.tsx, globals.css   Tailwind v4 theme, Bubblegum Sans kid font, large tap targets
  lib/
    engine/
      types.ts                Genre<Item,Response>, Block, LevelConfig, SessionRecord…
      rng.ts                  seeded PRNG (mulberry32) — every item = (genreId, seed, difficulty)
      staircase.ts            adaptive difficulty walk + discontinue rule (pure)
      timing.ts               per-genre cap policy (pure)
      profile.ts              sessions → per-genre stats → domain roll-ups (pure)
      speech.ts               TTS wrapper with availability probe + visual fallback
      storage.ts              localStorage mirror + outbox retry to /api/sessions
    genres/
      index.ts                registry: id → Genre
      blockDesign.ts  visualPuzzles.ts  matrix.ts  figureWeights.ts  arithmetic.ts
      digitSpan.ts    pictureSpan.ts    coding.ts  symbolSearch.ts
      similarities.ts vocabulary.ts     information.ts comprehension.ts
      banks/          authored verbal + arithmetic item banks (TS, difficulty-tagged)
    levels/
      index.ts                registry
      level1.ts               the diagnostic (3 parts)
  components/
    genres/<Genre>.tsx        one UI per genre (renders Item, emits Response)
    Countdown.tsx  SampleScreen.tsx  PartDone.tsx  ParentTable.tsx
  tests/                      Vitest: generators ×500 seeds, scorers, staircase, profile
  AGENTS.md  README.md  docs/superpowers/{specs,plans}/
```

**Separation rule (house style):** `lib/**` is pure and testable (no React, no I/O).
Components render an `Item` and return a `Response`. The engine scores, times,
records, and advances. Adding a genre = one `lib/genres/x.ts` + one component +
registry entry. Adding a level = one object in `lib/levels/`.

### 1.1 Genre interface

```ts
interface Genre<I, R> {
  id: GenreId;                 // 'blockDesign' …
  subtest: string;             // 'Block Design'
  domain: 'VS' | 'FR' | 'WM' | 'PS' | 'VC' | 'QR';   // QR only for arithmetic (also counted FR)
  kidTitle: string;            // 'Block Builder'
  instructions: string;        // spoken + shown before the sample
  sample(): { item: I; explanation: string };        // fixed, untimed, with explanation
  generate(seed: number, difficulty: 1|…|10): I;     // deterministic
  score(item: I, response: R | null): { points: number; max: number; correct: boolean };
  timing: { kind: 'item'; ms: (difficulty) => number }
        | { kind: 'block'; ms: number }               // speed genres
        | { kind: 'none' };
  mode: 'staircase' | 'speedBlock';
}
```

### 1.2 Block runner (app/play)
1. Load level/part; find first unfinished block.
2. Show **SampleScreen**: title, instructions (spoken via TTS + text), the sample
   item, the explanation, the line "Some puzzles are easy, some are for much older
   kids. If you're not sure, take your best guess!" and a big **Start** button.
3. Run the block:
   - `staircase` mode: difficulty d starts at `block.start` (default 1, or
     `'fromProfile'` = last ceiling − 1, min 1). Correct → d+1 (max 10). Wrong →
     same d. **Stop** after 2 consecutive wrong (zero-point) items, or after
     `block.maxItems` (default 8), or after a correct answer at d=10.
     Ceiling = highest d with points > 0.
   - `speedBlock` mode: one `timing.ms` window (120 s); items stream; count
     correct/incorrect/attempted.
   - Per item: timer starts when the item is fully shown (after TTS finishes for
     spoken items); response or time-out ends it. Time-out ⇒ `timedOut: true`,
     points 0, counts as wrong for the staircase.
   - Feedback per `level.feedback`: `'none'` → neutral "Next!" transition (600 ms);
     `'mark'` → ✓/✗; `'reveal'` → correct answer + explanation. Level 1 = `'none'`.
4. After each block: write block record to localStorage mirror and POST to
   `/api/sessions` (outbox retry if offline).
5. After the last block of a part: **PartDone** (confetti, sticker, "All done for
   today!"), POST marks part complete → server sends the Telegram summary.

Reload mid-block: the block restarts from item 1 with new seeds; the partial
attempt is discarded (recorded as `abandoned: true` in the mirror only). Completed
blocks are never redone.

### 1.3 Timing policy (`lib/engine/timing.ts`)

| Genre | Cap | Source |
|---|---|---|
| Block Builder | d≤3: 45 s, d 4–6: 75 s, d≥7: 120 s per item | spirit of 30/45/75/120 s real limits *(prior knowledge)* |
| Piece Picker | 30 s | real 20–30 s *(prior knowledge)* |
| Balance | 30 s | real 20–30 s *(prior knowledge)* |
| Story Sums | 30 s after the problem finishes being read | real 30 s *(prior knowledge)* |
| What's Missing | none (time recorded; soft nudge "take your best guess" at 60 s) | real: untimed |
| Number Echo / Picture Memory | exposure fixed (1 digit/s; pictures 3 s for ≤2 items, 5 s otherwise); no answer cap | *(prior knowledge)* |
| Secret Code / Symbol Hunt | 120 s block | real 120 s |
| Verbal genres | none | real: untimed |

Countdown UI: horizontal bar that shrinks left-to-right, green → amber in the last
10 s, digits shown beside it. No sounds, no flashing. Block caps show the bar at
the top for the whole block.

---

## 2. Genres (all content original; emoji + inline SVG only, no image assets)

Difficulty is 1–10 for every genre. Generators must produce exactly one correct
answer, distinct options, and a solvable item for every (seed, d) — enforced by tests.

### 2.1 Block Builder — Block Design (VS)
- **Item:** target `grid` n×n of faces from {white, red, NE, SE, SW, NW} (diagonal
  half-red faces). `showGridLines` boolean.
- **UI:** target on the left/top; an empty n×n board; tapping a cell cycles
  white → red → NE → SE → SW → NW; a "Done" button submits. Landscape: side by side.
- **Difficulty:** d1–2: 2×2, only red/white, grid lines. d3–4: 2×2 with diagonals.
  d5–6: 3×3, ≤3 diagonals. d7–8: 3×3, diagonals forming a rotated shape, **no grid
  lines on the target**. d9–10: 3×3 with all-diagonal patterns (checkerboard of
  diamonds), no grid lines. Targets are always made from the 6 legal faces.
- **Score:** 1 point if exact match; plus a recorded `fast` flag when ms < 50% of cap
  (mirrors bonus points without showing them). `max` = 1.

### 2.2 Piece Picker — Visual Puzzles (VS)
- **Item:** a silhouette built from 3 polyomino pieces on a 4×4 (d≤4), 5×5 (d5–7)
  or 6×6 (d≥8) grid, each piece a random connected cell set; 6 options = the 3
  true pieces + 3 distractors (a true piece mirrored, a true piece with one cell
  moved, a random piece of similar size). Pieces are displayed un-rotated at d≤5 and
  **rotated by 90°/180°** at d≥6 (rotation is the real difficulty driver). The
  target is shown as one solid filled shape (no internal borders).
- **UI:** target on top; 6 pieces in a 3×2 grid; tap to select (max 3); "Done".
- **Score:** 1 if the selected set equals the true set. `max` = 1.

### 2.3 What's Missing — Matrix Reasoning (FR)
- **Item:** a 2×2 (d≤3) or 3×3 (d≥4) matrix of SVG figures with the bottom-right
  cell missing; 5 options. Attribute space: shape (circle, square, triangle, star,
  hexagon, diamond), fill color (6), size (S/M/L), count (1–4), rotation (0/90/180/
  270), inner dot (yes/no). Rule families by d: d1–2 row-constant (same row ⇒ same
  shape); d3–4 one progressing attribute (size grows, count +1); d5–6 two
  attributes, one per axis; d7–8 three attributes + distribution-of-three (each row
  contains each value once); d9–10 two-rule + an overlay/XOR rule (cell3 = cell1 ⊕
  cell2 on a small 3-element pattern). Also a **series form** (1×5 with the last
  missing) at 30% of items for d≤6.
- **Distractors:** correct answer with one attribute altered; never a duplicate.
- **Score:** 1/0. `max` = 1.

### 2.4 Balance — Figure Weights (FR/QR)
- **Item:** shapes with hidden integer weights (1–6). d1–3: one scale, left pan has
  k identical shapes, right pan "?", options are shape-sets; the rule is direct
  (e.g. 2 ● on the left, choose 2 ●). d4–6: one scale whose **left pan** shows an
  equivalence learned on a first, balanced scale (e.g. ▲ = ● ●), then a second scale
  asks what balances ▲ ▲. d7–8: two equivalences, substitution needed. d9–10: two
  balanced scales with three shape types; the answer needs two substitutions.
  Options: 5 sets of shapes, one with the matching total weight.
- **UI:** SVG balance(s); 5 option tiles.
- **Score:** 1/0.

### 2.5 Story Sums — Arithmetic (FR/QR)
- **Item:** from the authored bank `banks/arithmetic.ts` (≥ 60 problems, d-tagged):
  d1–2 counting/add within 10 ("Aoife has 3 apples and picks 2 more…"); d3–4 add/
  subtract within 20 with one step; d5–6 two-step within 100, simple time/money;
  d7–8 multiplication/division facts inside a story, remainders; d9–10 multi-step
  with fractions of groups, rates ("a train goes 40 miles an hour; how far in 3
  hours?"). Numbers in each problem are templated with small random variation from
  the seed so the bank doesn't repeat verbatim; the answer is computed from the
  template.
- **UI:** TTS reads the problem; text is **shown** at Level 1 (`display: 'both'`),
  `'audio'` in later levels via block config; one Replay; numpad; 30 s countdown
  starts when speech ends.
- **Score:** 1/0.

### 2.6 Number Echo — Digit Span (WM)
- **Item:** a digit sequence (no repeated adjacent digits; no runs of 3 ascending/
  descending) of length L and a task ∈ {forward, backward, sequencing}. d1: L2
  forward; d2: L3 forward; d3: L4 forward; d4: L2 backward; d5: L3 backward; d6: L4
  backward / L5 forward; d7: L3 sequencing; d8: L4 sequencing / L5 backward; d9: L6
  forward / L5 sequencing; d10: L7 forward / L6 backward (where a d lists two forms, the generator picks one by seed parity). Each d yields one trial
  (the staircase provides the second chance the real test gives via two trials).
- **UI:** big ear icon, "Listen…", digits spoken at 1/s with a neutral voice; then a
  numpad appears with the task label ("Say them **backward**"); Replay once.
  Visual fallback: digits flash one per second centered, then vanish.
- **Score:** 1/0.

### 2.7 Picture Memory — Picture Span (WM)
- **Item:** k pictures (emoji from a fixed 24-icon bank) shown in a row for 3 s
  (k≤2) or 5 s, then a response grid of k + 4 (d≤5) / k + 6 pictures (d>5). d1: k1,
  d2–3: k2, d4–5: k3, d6–7: k4, d8: k5, d9: k6, d10: k7.
- **UI:** exposure screen → response grid; tapping adds to an ordered tray shown
  above; "Done".
- **Score:** 2 if correct pictures in correct order, 1 if correct pictures wrong
  order, else 0. `max` = 2. Staircase "correct" = points > 0.

### 2.8 Secret Code — Coding, under-8 form (PS)
- **Item:** key of 5 shapes (★ ● ▲ ✚ ■) each with a simple mark (|, —, ○, ∧, ×);
  a stream of shapes.
- **UI:** key fixed at top; the current shape large in the middle with the next 4
  shapes faded in a row (so she can look ahead like a paper row); the 5 marks as big
  buttons at the bottom; tap fills and advances. 120 s block.
- **Score:** block totals: attempted, correct, incorrect; `points` = correct.
  No staircase (real test is a fixed-difficulty speed task). Difficulty unused.

### 2.9 Symbol Hunt — Symbol Search, ages 6–7 form (PS)
- **Item row:** 1 target symbol + 3 search symbols drawn from a 20-glyph SVG set
  (abstract strokes, deliberately similar pairs); 50% rows contain the target.
- **UI:** row shown large; **YES** / **NO** buttons; 120 s block.
- **Score:** block totals: attempted, correct, incorrect; `points` = correct − incorrect (min 0).

### 2.10 Alike — Similarities (VC)
- **Bank:** ≥ 40 pairs, d-tagged age 6 → 13: d1–2 concrete ("apple / banana"),
  d3–4 categories ("cat / cow"), d5–6 function/abstract ("clock / calendar"),
  d7–8 abstract nouns ("promise / rule"), d9–10 hard abstractions ("poem / song",
  "doubt / fear").
- **Item:** the pair + 4 options: one 2-point (general category / essential
  shared property), one 1-point (concrete shared feature), two 0-point
  (irrelevant, or "they aren't alike"). Options shuffled by seed.
- **Score:** 2/1/0, `max` = 2; staircase correct = points ≥ 1.

### 2.11 Meaning — Vocabulary (VC)
- **Bank:** d1–2: **picture items** (emoji shown, "What is this?") with 4 word
  options; d3–10: word + 4 definitions (2-pt precise, 1-pt partial/example-only,
  two wrong but plausible — same part of speech). ≥ 40 items, age 6 → 13
  ("enormous" … "reluctant", "abundant", "hypothesis").
- **Score:** 2/1/0 (picture items 1/0).

### 2.12 Do You Know — Information (VC)
- **Bank:** ≥ 40 general-knowledge questions, d-tagged (body, calendar, animals,
  science, geography, history), age 6 → 13. 4 options, one correct. No family-
  specific or curriculum-specific facts (keep to widely taught general knowledge).
- **Score:** 1/0.

### 2.13 What Should You Do — Comprehension (VC)
- **Bank:** ≥ 30 items: social situations and "why do we…" conventions, age 6 → 13;
  4 options with 2/1/0 weighting (2 = full reason or safe+considerate action,
  1 = partial, 0 = wrong/unsafe).
- **Score:** 2/1/0.

Verbal items are read as text (she reads well); a 🔊 button reads the question
aloud on request. Banks live in `lib/genres/banks/*.ts` as typed arrays with
`{ id, d, prompt, options: [{text, points}], explanation }`. Level 1 never shows
`explanation`; later `'reveal'` levels do.

---

## 3. Level config

```ts
interface LevelConfig {
  id: number; title: string; feedback: 'none'|'mark'|'reveal';
  parts: { id: 'A'|'B'|'C'|…; title: string; sticker: string;
           blocks: { genre: GenreId; start?: number|'fromProfile'; maxItems?: number;
                     display?: 'audio'|'both' }[] }[];
}
```

### Level 1 — "Find Your Superpowers" (feedback `'none'`)

| Part | Blocks (in order) | Est. time |
|---|---|---|
| A · Shapes | Block Builder, Piece Picker, What's Missing, Balance | ~17 min |
| B · Memory & Speed | Number Echo, Picture Memory, Secret Code, Symbol Hunt, Story Sums | ~17 min |
| C · Words | Alike, Meaning, Do You Know, What Should You Do | ~14 min |

All staircase blocks start at d1, `maxItems` 8. Speed blocks are single 120 s windows.
Each part opens with a 20-second "Welcome back" screen naming the part and closes
with PartDone. A part can be replayed later only from the parent page (it creates
a new session; the first run stays the diagnostic of record).

Adding Level N later = new object in `lib/levels/`, usually `feedback: 'reveal'`,
`start: 'fromProfile'`. The home screen shows the lowest level with unfinished
parts; the parent page can unlock/select any level.

---

## 4. Data

### 4.1 Records (written by the client, stored verbatim)

```ts
interface ItemRecord { idx: number; seed: number; d: number; points: number; max: number;
  correct: boolean; ms: number; timedOut: boolean; response: unknown; fast?: boolean;
  audioFallback?: boolean; replayed?: boolean }
interface BlockRecord { genre: GenreId; mode: 'staircase'|'speedBlock'; startedAt: string;
  endedAt: string; items: ItemRecord[]; summary: { attempted: number; correct: number;
  points: number; max: number; ceiling: number|null; medianMs: number; timeouts: number;
  incorrect?: number /* speed */ } }
interface SessionRecord { id: string /* ulid */; level: number; part: string;
  startedAt: string; endedAt?: string; device: { ua: string; w: number; h: number };
  blocks: BlockRecord[]; complete: boolean; appVersion: string }
```

### 4.2 Keys (Upstash REST, same env vars as the planner: `KV_REST_API_URL`, `KV_REST_API_TOKEN`)
- `aoife_puzzles:session:<id>` → SessionRecord JSON
- `aoife_puzzles:index` → Redis list of session ids (LPUSH on first write)
- Nothing else. Reads by future sessions: `GET /api/sessions` (all) or
  `GET /api/profile` with header `x-parent-key`.

### 4.3 API
- `POST /api/sessions` body = SessionRecord (upsert by id; size cap 200 KB; rejects
  ids not matching the ulid pattern). If `complete` flips to true for the first time
  → send the Telegram summary (idempotent: sets `aoife_puzzles:notified:<id>`).
- `GET /api/sessions?level=1` → list (gated).
- `GET /api/profile` → `computeProfile(sessions)` (gated).
- Gate: header `x-parent-key` === `process.env.PARENT_KEY`; else 401. The parent page
  asks for the key once and stores it in localStorage.

### 4.4 localStorage mirror
`aoife-puzzles:sessions` (all sessions, same JSON), `aoife-puzzles:outbox` (unsent
POST bodies; retried on every page load and after every block). The home screen
shows a tiny cloud icon: ☁️ synced / ⏳ will sync.

### 4.5 Profile (`lib/engine/profile.ts`, pure)
Per genre, over the **latest complete Level-1 part** plus all later sessions:
attempted, correct, points/max, ceiling (max over sessions), medianMs, timeouts,
trend (ceiling by session date). Domain roll-ups: VS = mean(ceiling/10) of BD, VP;
FR = MR, FW, AR; WM = DS, PS; PS = normalized speed score (correct per minute
scaled to 0–1 against a fixed ceiling of 60/min Coding, 40/min Symbol Search);
VC = mean(points/max) of SI, VC, IN, CO. Relative flag per domain: z-score of the
domain value against the mean/SD of her five domain values; ≥ +0.5 "relative
strength", ≤ −0.5 "relative weakness", else "typical for her". Also reported:
the EGAI-relevant bundle (SI VC IN CO BD MR FW AR) vs the CPI bundle (DS PS CD SS).
**No norms, no IQ-like numbers, ever** — state this on the parent page.

### 4.6 Telegram summary (server-side, on part completion)
Bot/chat from `TELEGRAM_TOKEN`/`TELEGRAM_CHAT_ID` (the owner's canonical bot in
`~/PycharmProjects/.secrets/telegram.env`). HTML message:

```
🧩 Aoife Puzzles — Level 1 Part A done (17 min)
Block Builder   5/7 · ceiling 6 · 1 time-out
Piece Picker    4/6 · ceiling 4
What's Missing  6/8 · ceiling 7
Balance         3/5 · ceiling 3 · 2 time-outs
Parent page: https://aoife-puzzles.vercel.app/parent
```

Failure to send never blocks the save (logged, `notified` key not set so the next
POST retries).

---

## 5. UI rules
- Tap targets ≥ 64 px; fonts ≥ 22 px for kid text; Bubblegum Sans headings, system
  sans body. Palette: calm teal/cream during play; confetti colors only on PartDone.
- Every block: SampleScreen → items → short "Next!" transitions. Progress shown as
  "Puzzle 3 of ~8" dots (staircase length varies; show dots up to maxItems).
- No "I don't know" / skip buttons anywhere. The Done button is disabled until a
  response exists (speed blocks excepted).
- Landscape: stimulus left, response right. Portrait: stimulus top, response bottom.
- Audio gate: iOS requires a user gesture before speech — the Start button on the
  SampleScreen is that gesture; the sample item itself is spoken to prove audio
  works; if `speechSynthesis` is missing or errors, switch the block to visual
  fallback and mark `audioFallback`.
- Home screen: "Play" (continues the current part), the three part stickers earned,
  the cloud sync icon. No scores visible to her anywhere.

---

## 6. Testing
- Vitest, `npm test`. For every generator: 500 seeds × d1–10 → item valid (schema),
  exactly one correct option / solvable, options distinct, difficulty constraints
  hold (grid size, piece rotation, sequence length…). Scorers: table-driven.
  Staircase: scripted correctness sequences → expected d path, stop reason, ceiling.
  Profile: fixture sessions → expected roll-ups and flags. Banks: every item has 4
  options, exactly one top-score option, unique ids, d within 1–10, ≥ 3 items per d
  (verbal) so the staircase can always draw an unseen item at each d (fallback:
  nearest d, never repeat within a session).
- Manual: iPad Safari landscape + portrait walkthrough of all three parts; audio
  gate; offline save → online sync; parent page; Telegram arrival confirmed by owner.

## 7. Deployment & ops
- `vercel --prod --yes` from the project dir (GitHub auto-deploy only if the owner
  adds the repo to the Vercel GitHub App, as with aoife-math).
- Env on Vercel: `KV_REST_API_URL`, `KV_REST_API_TOKEN` (copied from the planner
  project or by connecting the existing Upstash resource), `PARENT_KEY` (generated,
  also saved to `~/PycharmProjects/.secrets/aoife-puzzles.env`), `TELEGRAM_TOKEN`,
  `TELEGRAM_CHAT_ID`.
- AGENTS.md records: the decisions table above, the "never touch planner keys" rule,
  the add-a-level recipe, the add-a-genre recipe, the no-Pearson-content rule, the
  timer-visible exception, and how future sessions read the profile.

## 8. Out of scope (for now)
Letter-Number Sequencing, Cancellation, Picture Concepts, Naming Speed, Symbol
Translation; norm-referenced scoring; accounts/multiple children; expressive
(spoken) verbal scoring.
