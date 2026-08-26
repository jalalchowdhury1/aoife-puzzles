# Level 5 "Pip's Winning Streak" + Swap Shop re-band — design

**Date:** 2026-08-26 · **Approved by:** Jalal ("build level 5. swap shop can we drop a 0.5 level as well?")

## Why now

She completed Level 4 "Pip's Power-Ups" on 2026-08-26 (11:42 ET) and the app has no next
level. Level 4's results, per genre it was built to fix:

| genre | Level 4 result | reading |
|---|---|---|
| arithmetic | 8/8, ceiling 10, on the 1.5× clock | clock theory CONFIRMED — it was time, not maths |
| fireflyBoxes | 8/8, ceiling 5 → 7 | fixed, past the bail point |
| pictureSudoku | 6/8, ceiling 3 → 4, no bail | rebuilding on schedule |
| swapShop | 2 fast wins at d5 (5.3 s, 3.9 s), then **two full-clock timeouts at d6** (29.9 s, 30.0 s); block flagged `mass-timeouts`, excluded from profile | the d5→d6 boundary is a cliff |

## The Swap Shop cliff (and the owner's "0.5 level")

Old d6 introduces **two** new ideas at once, violating decision #15 (one new idea per step):

1. mixed-token piles appear for the first time (options can be "1 ⭐ + 1 🪙"), and
2. the per-item clock drops 45 s → 30 s at the same boundary.

Both timeouts ran the full 30 s window — she was working, not guessing. Decision #19
rejected fractional difficulties: a real cliff is fixed by **re-banding the ramp**
(scale.ts keeps the history). That is the "0.5 level".

### New Swap Shop ramp

| new d | content | changed? |
|---|---|---|
| 1–5 | unchanged | — |
| **6 (new)** | one rule (rate 2–3), question = 1 copy of the give token — the answer is still read straight off the card as a plain count, exactly like d3/d5 — but **mixed piles appear for the first time, as wrong options only** (≥ 1 mixed distractor guaranteed). One new idea: piles can mix, and a mixed pile has a value you can price. Zero new solving demands. | inserted |
| 7 | old d6 — the correct pile itself can now be mixed | shifted |
| 8 | old d7 — two chained rules, plain-count options | shifted |
| 9 | old d8 — chained rules + mixed options | shifted |
| 10 | old d9+d10 folded (old d10 subsumes old d9: same structure, rate range 1–3 vs 1–2) | folded |

**Timing:** 45 s for d ≤ 7 (all single-rule bands, and the exact band she timed out on),
30 s for the chained bands d8–10. Was 45 s d ≤ 5 / 30 s d ≥ 6.

**Scale history:** `SCALE_CHANGES` entry `{ genre: "swapShop", cutover: <deploy time>,
map: {1:1, 2:2, 3:3, 4:4, 5:5, 6:7, 7:8, 8:9, 9:10, 10:10} }`. Her L3 ceiling 7 remaps
to 8; today's flagged block (trend-only) remaps 5 → 5. Raw KV sessions are never rewritten.

### New-d6 option construction (closed-form, no search)

Tokens a (give, value R ∈ 2–3), b (get, value 1). Question = [a]. Options:
- correct: b × R (the plain read-off — provably the only plain-or-mixed pile at the
  target, since any mixed pile containing `a` totals ≥ R+1),
- one guaranteed mixed distractor [a, b × k] (k ∈ 1–2, total R+k ≠ R),
- two plain-count distractors b × m from {1..4} \ {R, R+k}.

All totals pairwise distinct, all piles ≤ 4 tokens, only tokens already shown on the
card (the d ≤ 5 no-foreign-token fairness rule extends to d ≤ 6).

## Level 5 "Pip's Winning Streak"

Decision #18 template (Level 4 is the precedent): `feedback: "reveal"`,
`weighting: "none"` (hand-pinned starts — `adaptPart` ignores numeric starts in remedial
mode), `stepUp: 2`, `fastLane: false`, `easeIn: true`, `teachingItems: 0`, `fun: true`,
`released: true`.

**Part A "Level Up" 🚀** — the four Level 4 genres, promoted (open easy, bury the sorest,
close on her strongest — decision #18 ordering):

| block | start | why |
|---|---|---|
| fireflyBoxes | 5 | ceiling 7; opens with instant wins on the freshly conquered genre |
| swapShop | 5, `timeScale: 1.5` | last fluent band; climbs into new d6 (gentle mixed intro, 45 s × 1.5) then new d7 = old d6 at 45 s base × 1.5 — the arithmetic fix applied to the exact band she timed out on. The scale change nulls her `knownCeiling`, so easeIn's frontier (free first miss, soft landing, tap-paced reveals) covers everything above d5. |
| pictureSudoku | 3 | ceiling 4 (max 15); one warm-up win then continue the slow build |
| arithmetic | 8, `timeScale: 1.5`, `display: "both"` | ceiling 10 = its cap; ~6 wins then tops out — the session's strong close. Clock stays 1.5× (proven fix). |

**Part B "Victory Lap" 🏆** — pure win-heavy fun, all `start: "fromProfile"` (in a
non-remedial level that resolves to ceiling − 1): fixPicture (c8 → start 7),
animalParade (c6 → start 5), then the two speed games, spotIt and translator
(fromProfile is inert for speed blocks), closing on translator — her 44/min superpower.

## Out of scope (noted, not built)

- Extending the arithmetic bank past d10: she has now EARNED it under decision #17
  (ceiling 10 with clean d10 wins on the fixed clock) — but authored-bank extension is
  its own job for a future level.
- No other genre widens past 10 (decision #17).

## Tests

- `swapShop.test.ts` + `fairness/swapShop.test.ts`: rule-count bands shift (1 rule at
  d3–7, 2 at d8–10), timing boundary moves to d7/d8, target ≤ 4 extends to d6,
  no-foreign-token extends to d6, plus new named d6 rules: "correct is always a plain
  count" and "at least one mixed distractor".
- `scale.test.ts`: swapShop remap (pre-cutover 7 → 8; post-cutover untouched).
- `levels.test.ts`: Level 5 registry checks + release gating becomes [1, 3, 4, 5];
  start-pin guards mirroring the Level 4 suite.
- Gate: `npm run release` (the only deploy path), audit page regenerated and eyeballed,
  self-play at 1180×713 before she sees it.
