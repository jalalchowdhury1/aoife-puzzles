# Age Lens (parent dashboard) + Level 6 "Pip's Explorer Day" — design

**Date:** 2026-08-26 · **Approved by:** Jalal ("do heavy research through perplexity and then
build out our dashboard and the levels accordingly. that way we can accurately gauge how she
is in comparison to others as well.")

## Owner decision #20 — age benchmarks on the parent page (supersedes the blanket "no norms")

The parent dashboard MAY now show **approximate, research-anchored typical-age bands** for the
skill each difficulty level demands — because the owner asked to gauge her against age peers.
Hard limits that stay:
- **Parent page only.** Nothing the child sees ever shows scores or comparisons (decision: unchanged).
- **Age bands, never scores.** No IQ numbers, no percentiles, no "mental age" single number.
  Bands are ranges with a stated basis; speed genres show NO band (norms are proprietary).
- Every band derives from the research digest `docs/research/2026-08-26-age-benchmarks-research.md`
  (7 Perplexity threads, 2026-08-26) — cited in-code via each band's `basis` string.
- The view must carry the standing caveats: this game is not a standardized test; the WISC-V at
  GDC is the real ruler.

## Components

**1. `lib/engine/benchmarks.ts`** (pure data + lookups)
- `BENCHMARKS`: per-genre band tables `{dMin, dMax, skill, typicalAge: {lo, hi|null} | null, basis}`
  covering d1..maxD for the 14 active genres **plus retired digitSpan** (her strongest WM
  evidence, exact PLAN known). Speed genres (translator, spotIt, coding, symbolSearch): no bands,
  `caveat` explains why.
- `cumulativeBenchmark(genre, ceiling)` → the band with the highest typical-age floor among all
  bands at/below her ceiling (handles ramps where a later band is a gentler new rule, e.g.
  fireflyBoxes d7 backward-2 after d6 forward-6).
- `measureStatus(insights, genre)` → `"still-winning" | "at-top" | "bailed" | "measured"` from
  her LATEST non-excluded block: bailed item → bailed; ceiling === maxD → at-top;
  correct ≥ attempted−1 → still-winning (censored: display "≥ ceiling"); else measured.
- `ageYearsAt(iso)` from DOB 2021-01-11.

**2. Parent page "Ages" tab** (7th tab, 📏): grouped by domain; per genre — her level
("≥ N" when still-winning, "top" when at-top), the concrete skill at that level, the typical-age
band, and a chip: **ahead** (band floor above her age) / **age-typical** / **below band** (band
ceiling under her age — only meaningful when status is "measured"/"bailed"). Speed genres show
"no published norm — see Skills trend". Footer: caveats + measurement-status legend. The page's
NO_NORMS line is reworded: relative-to-herself for scores, PLUS approximate external age bands
on this tab only — still never percentiles/IQ.

**3. Level 6 "Pip's Explorer Day"** — the measurement level for the six genres whose ceilings
are censored (near-perfect blocks that ran out of items) and that Level 5 does not touch
(animalParade is already probed by Level 5 Part B):
- Part A "Puzzle Explorer" 🧭: mosaic, patternTrain
- Part B "Word Explorer" 📖: whichTwo, fillTheGap, information, whatWouldYouDo
- Template: `weighting: "none"`, all `start: "fromProfile"` (non-remedial literal = ceiling−1,
  auto-updates from whatever data exists when she reaches it), `stepUp: 2`, **fastLane ON**
  (this level's job is finding ceilings; the fast lane is the efficient prober) but `easeIn: true`
  so every personal-record miss stays free/gentle (decision #19), `feedback: "reveal"`,
  `teachingItems: 0`, fun on, released.
- fixPicture, fireflyBoxes, pictureSudoku, swapShop, arithmetic are excluded: Level 5 measures them.

## Out of scope
- Arithmetic bank d11–15 (earned under #17; separate authored-content job).
- Any norm display for speed genres (no defensible public source).

## Tests
- benchmarks: bands contiguous 1..maxD per banded genre; cumulative lookup monotone-safe;
  every active staircase genre + digitSpan covered; every band has non-empty skill+basis;
  speed genres have no bands but a caveat; measureStatus each of the four statuses on fixtures.
- levels: Level 6 registry/template guards; release gating [1,3,4,5,6].
- Gate: `npm run release`; Ages tab verified in Chrome against her live data before deploy.
