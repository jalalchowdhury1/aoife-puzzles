# Level 8 Build Report — 2026-08-28

**Status: DEPLOYED to production.** Release gate fully green (lint, tsc, 967 unit/fairness
tests, build, 5/5 Playwright play-through), run twice. Her position on prod now resolves to
Level 8 Part A.

Built by the live concierge session (the 05:00 scheduled cloud run stalled on a sandbox
permission prompt at 05:03; a second cloud run started at 07:31 was stood down after a
near-collision on the working tree — its one useful edit, removing a duplicate field it had
itself introduced, was kept).

## What shipped

**Level 8 "Pip's Sky Climb"** (`lib/levels/level8.ts`) — the ceiling-probe level, decision #24.

| Part | Blocks |
|---|---|
| A "Sky High Sums" 🎈 | swapShop confirm (fromProfile→7, 6 items, 1.5× clock) → arithmetic PROBE (fromProfileTop→10, 14 items, 1.5× clock) |
| B "Word Rockets" 🚀 | fillTheGap (fromProfile→6, 8 items, **fast lane, 7s bar**) → information PROBE (fromProfileTop→10, 14 items, **fast lane, 5s bar**) |
| C "Puzzle Peaks" 🏔️ | whatWouldYouDo (fromProfile→4, 8 items) → whichTwo PROBE (fromProfileTop→6, 14 items) |

Level-wide: reveal, stepUp 2, easeIn ON, fastLane OFF (blocks opt in), fun on, no teaching items.

## Engine changes (all minimal)

- `BlockConfig.fastLane` — per-block override, block wins over level (`cfg.fastLane ?? levelCfg.fastLane` in the runner). Jalal verbatim: "Fast lane for information and fill the gap. The other 2 let it be on the normal way."
- `BlockConfig.fastMs` — tightens the untimed "fast" bar per block (default stays 10s so no existing level changes). Chosen bars sit clearly below her medians: information 5s (median 8.6s), fillTheGap 7s (median 12.5s).
- `start: "fromProfileTop"` in adapt.ts — resolves to her live ceiling itself (fromProfile stays ceiling−1). Never-measured falls back to 1.

## Content

- **Arithmetic d11–15** (ar-61..ar-80, 4/difficulty): fractions-of-totals and doubling chains → simple percents → unit rates and averages → working backwards → ratio shares and combined rates. All original, all templates render non-negative integer answers (100-seed sweep in tests).
- **Information d11–15** (in-41..in-60, 4/difficulty): middle-school science/measurement → atoms, cells, earth science, ancient history → light, body systems, classification. All original, widely-taught single-answer facts.
- Both genres now `maxDifficulty: 15`; `benchmarks.ts` gained matching age bands so the parent Ages tab covers the new band (a coverage test enforces this).

## Self-play verification (KV-less dev server, her ceilings injected, no Telegram)

- **Fast lane fires only on genuinely fast answers**: in information, a 71s correct answer was `fast=false` and did NOT climb; 1.2s answers were `fast=true` and climbed every item — d10→11→12→13→14→15, ceiling 15, topReached. The new d11–15 items all rendered and were solvable.
- **Slow-but-correct keeps the normal path**: in fillTheGap, 9–13s correct answers never tripped the 7s bar; every climb took exactly 2-in-a-row (d6,d6→d7,d7→d8,d8→d9,d9).
- **The override holds**: in whatWouldYouDo (no lane), a 1.2s fast+correct at d5 did NOT climb solo — next item stayed d5.
- **easeIn works on the widened band**: arithmetic probe started AT d10, climbed to d11, the first d11 miss was FREE (reveal + "Got it!", `teaching+frontier` flags, difficulty held), the next d11 miss was counted and soft-landed to d10.
- Test localStorage cleared and the tab closed afterwards; nothing touched KV or Telegram.

## Test count

967 unit/fairness tests (was 914), 5/5 e2e. New tests: Level 8 config suite (probe starts, lane
placement + bars vs her medians, swapShop confirm shape), fromProfileTop resolution,
fastLane/fastMs pass-through, widened-bank coverage (≥4 items per new difficulty), benchmark
band contiguity to each genre's own maxD.

## Deviations from the overnight instructions

- The whichTwo probe climbs via its long stepUp-2 block rather than stepUp 1 — "the other 2 let
  it be on the normal way" was taken to mean no special progression anywhere the lane is off.
  A flawless run still reaches its d10 top with items to spare.
- The fairness suite caught a real grammar bug in three new arithmetic templates ("loses 1
  points") — variable ranges fixed to start at 2.

## For Jalal to know

- She will land on **Level 8 Part A** next time she plays. Parts are ~15 min as usual.
- whichTwo's bank still tops out at d10 (not widened — she hasn't topped it yet; decision #17).
  If the Part C probe tops it, that's the next earned widening.
- The one-shot 05:00 routine is spent (`run_once_fired`); no further scheduled builds pending.
