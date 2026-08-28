# Davidson tracker: a new `/parent` tab (2026-08-28)

Owner ask (Jalal, verbatim): "can we have a davidson tracker. i want to see how she is doing
precisely for that." Then, after two rejected mockups: "dont like either. i want more table like
structure. more details. laid out in a way where its eli5 to understand."

## Why this is a new tab, not an edit to the Ages tab

The existing Ages tab (decision #20) already does per-genre age-band verdicts, but it's organized
by domain (Shapes/Memory/Words/etc.), not by the two specific Davidson admission pathways, and it
doesn't cover the achievement door at all. A parent reading the Ages tab has to already know which
six subtests matter for Davidson and mentally regroup them. The Davidson tab does that grouping
for him, plus reaches into the achievement door (Word Woods / aoife-math), which the Ages tab has
no reason to know about.

## Hard constraint (do not violate)

**Never a fabricated composite/IQ-equivalent number.** Standing decision from 2026-08-27: the
puzzle genres are deliberate "cousins" of the WISC-V subtests, not population-normed instruments,
and a false-precision composite score was explicitly rejected once already. Every number this tab
shows must trace to something she actually did (a ceiling, a band, her actual age) or say "not
yet" — never a synthesized percentile/IQ figure.

## Scope: both doors

Per Jalal's answer, the tab covers both Davidson pathways:

- **Cognitive door** (WISC-V) — rich live data today, via the puzzle engine.
- **Achievement door** (WIAT-4) — mostly "not started" today (she hasn't played Word Woods or
  aoife-math meaningfully yet), but the structure ships now so it fills in automatically as she
  plays.

## Cognitive door: data model

Reuses existing machinery unchanged — `computeInsights`, `BENCHMARKS`, `cumulativeBenchmark`,
`benchmarkAt`, `measureStatus`, `ageVerdict`, `ageYearsAt`, `DOB` (all in `lib/engine/benchmarks.ts`
and `lib/engine/insights.ts`). No changes to that logic; the Davidson tab is a new *view* over it.

Subtest → genre mapping comes from `lib/levels/doors.ts` (`DOOR_GENRES`), grouped into the two
composites per its own doc comment:

```
VECI      = whichTwo (Similarities) + fillTheGap (Vocabulary) + information (Information) + whatWouldYouDo (Comprehension)
VCI + QRI = whichTwo (Similarities) + fillTheGap (Vocabulary) + swapShop (Figure Weights) + arithmetic (Arithmetic)
```

`whichTwo` and `fillTheGap` feed both doors — the table shows each subtest once, tagged with which
door(s) it counts toward, rather than duplicating rows.

**Door rollup** (per door): `measured = count(subtests with skill.ceiling !== null)`, shown as
"`measured` of 4 measured — `ahead` ahead" — a count, not a score. No color/number implies
pass/fail; it's a literal tally of what's been observed.

### New: "roughly how far ahead" column

The one genuinely new computation. For a subtest with a resolved band:

```
ageNow = ageYearsAt(insights.generatedAt)          // existing
band   = cumulativeBenchmark(genre, skill.ceiling)  // existing
gapLo  = band.typicalAge.lo - ageNow
```

Display rule (new pure function, `yearsAheadLabel`, colocated in `lib/engine/benchmarks.ts` next to
the other band helpers — it takes the same inputs `AgeRow` already computes, so no new data
plumbing):

- `gapLo >= 1`: show `"~gapLo–gapHi yrs"` where `gapHi = band.typicalAge.hi - ageNow` (both floored
  to whole years); if `status` is `still-winning` or `at-top`, prefix `"≥"` since her true ceiling
  is unmeasured upward (matches the existing "≥" convention on the level number).
- `gapLo` between 0 and 1, or verdict is `age-typical`: show `"on pace for her age"` — no number.
  (Matches the softening rule already in `AgeRow`: a censored/bailed ceiling never reads as behind.)
- verdict is `below-band` **and** status is `measured` (a real, uncensored miss ended the round):
  show the band range only, no "years behind" framing — we compute forward gaps, never backward
  ones. This case doesn't exist in her data today; the rule exists so the tab doesn't need new
  logic if it ever does.
- no band exists for the genre (shouldn't happen for door genres, all six have bands): show `"—"`.

This is arithmetic on a real, already-displayed age range — not a new instrument, not a percentile.

## Achievement door: data model

Composite → WIAT-4 subtests → app mapping is static (mirrors the Notion "Davidson Pathways" page):

| Composite | WIAT-4 subtests | App |
|---|---|---|
| Reading | Word Reading + Reading Comprehension | Word Woods (aoife-reads) |
| Math | Numerical Operations + Math Problem Solving | aoife-math |
| Written Language | Spelling + Alphabet Writing Fluency | Word Woods (aoife-reads) |

**Live status where it's cheap, static where it isn't:**

- aoife-reads exposes a public `GET /api/state` (no auth — same pattern as aoife-puzzles' own
  `/api/state`) returning `{ completed: [...] }`. New server route
  `app/api/davidson-achievement/route.ts` on **aoife-puzzles** does a server-side fetch to
  `https://aoife-reads.vercel.app/api/state` (server-to-server, no CORS concern, no secret needed)
  and returns `{ readsStarted: boolean, readsSessionCount: number }`. The Davidson tab calls this
  route (parent-gated, like the rest of `/parent`'s data) instead of fetching aoife-reads directly
  from the browser. If aoife-reads is unreachable, the route returns `{ readsStarted: null }` and
  the tab shows "couldn't check" rather than a false "not started."
- aoife-math has no parent-facing data store today (`app/api/rounds/route.ts` only posts one-shot
  Telegram summaries, nothing persisted/queryable). The Math row stays static: "not tracked yet"
  with a one-line note. Building that store is out of scope for this spec — flag it as a follow-up
  if Jalal wants Math coverage tracked live later.

## UI: table, not cards (per approved mockup)

New tab `{ id: "davidson", label: "Davidson", emoji: "🎯" }` added to `TABS` in `app/parent/page.tsx`,
rendered by a new `DavidsonTab` component (new file `components/parent/DavidsonTab.tsx`, following
the existing pattern of one file per non-trivial tab like `MatrixGrid.tsx`).

Layout, top to bottom (matches the approved `detailed-table.html` mockup):

1. One-paragraph plain-English explainer: she needs ONE of two roads, not both.
2. Two door-rollup boxes (VECI, VCI+QRI) — label, the four required subtests named, the
   measured/ahead tally.
3. Road 1 table — six rows (one per unique door genre), columns: WISC-V subtest (with a plain-
   English aside and which door(s) it counts for) · her puzzle · what happened (one templated
   sentence built from the genre's `SkillDetail` — last-session date, ceiling delta since the
   previous trend point if any, and attempted/correct — a new small formatter, not reused Telegram
   code, since that formats a whole session and this needs one genre's headline only) · typical age
   for this · roughly how far ahead · status chip.
4. Road 2 table — three rows (Reading/Math/Written Language), columns: composite · WIAT-4 subtests
   needed · app · status.
5. Footer line reiterating the no-fake-number rule (same footer as the Ages tab).

Status chips reuse the existing `VERDICT_CHIP` palette and copy from `benchmarks`/`AgesTab`
(`ahead` green, `age-typical` sky, `below-band` amber, `no-anchor` gray) plus one new chip for the
achievement door's `not-started` state (gray, matching `no-anchor`'s tone — pending is not a
warning).

## Testing / release

Standard `npm run release` gate (lint → tsc → unit → build → Playwright). This is a parent-only
view (no child-facing content, no new puzzle items), so the "play it yourself with her profile
first" rule doesn't apply — but the tab must be manually checked against her real live data in
Chrome before shipping (same verification habit used for every other parent-page addition), since
a wrong subtest→door mapping or a wrong age-gap sign would misinform a real admissions decision,
which is a worse failure mode than a wrong number on a chart.

New unit coverage: `yearsAheadLabel` (the one new pure function) — cases for ahead/still-winning/
at-top/age-typical/below-band/no-band, plus the door-rollup tally function. The
`davidson-achievement` route gets a test for the reachable/unreachable aoife-reads cases.

## Out of scope (explicitly deferred)

- Live Math coverage (no data store exists in aoife-math yet).
- Any change to the existing Ages, WISC lens, or other tabs.
- Any numeric composite/IQ-style score.
