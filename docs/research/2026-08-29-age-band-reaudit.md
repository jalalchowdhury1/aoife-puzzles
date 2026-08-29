# Age-band re-audit — 2026-08-29 (decision #28)

Jalal: "the age things we have on the parents page… does seem like it's a bit
inflated. If you could check with Perplexity Deep Research and find out exactly
what the ages should be."

## The flaw in the original bands

The 2026-08-26 digest set the verbal bands and then noted, in its own words,
"(Matches the banks' authored age-6→13 ramp, decision #10.)" That is **circular**:
the banks were AUTHORED to span ages 6→13, and the research then confirmed they
span ages 6→13. The age at difficulty d largely restated our own authoring intent.

Two compounding errors:
1. **Recognition vs production.** Our items are 3–4 option multiple choice. The
   WISC-V verbal subtests are open-ended spoken answers scored 2/1/0. The
   developmental norms the bands leaned on describe production. Recognition is
   materially easier, so every verbal band was overstated.
2. **The 2026-08-29 widenings** (whichTwo d11–15, arithmetic d16–20) assigned
   ages 13–15+ by extrapolating that same invented ramp — the least grounded
   numbers in the whole table.

## Method

Perplexity Deep Research (Nabila's Pro account, human-paced per
[[reference-perplexity-pro-channel]]), 12 steps / 72 sources, prompted
adversarially and told to prefer UNCONFIRMED over a guess. Two earlier attempts
failed and are worth recording: blank lines in the prompt box submit the form,
so only the first paragraph was ever sent — the first run answered about App
Store age ratings and COPPA. Send long prompts as ONE continuous line.

Claude then verified the high-confidence rows independently (external-research
protocol Stage 2: claim must be on the page) before anything was changed.

## Findings applied

### Arithmetic — high confidence, CCSS-verified, independently corroborated
Claude derived the same grades from CCSS before reading the Perplexity answer.

| skill | old label | corrected | standard | verified |
|---|---|---|---|---|
| Chained fractions of a total | 12–14 | **11–13** | 7.RP.A.3 | yes |
| Combined rates / weighted averages | 13–15 | **12–14** | 7.RP.A | yes |
| Two unknowns from total + relationship | 13–15 | **11–12** | 6.EE.B.7 | yes |
| Working backwards through a chain | 13–15 | **9–11** | 4.OA.A.3 | yes, text quoted |
| Multi-stage chaining | 14+ | **12–14** | 7.RP.A.3 + 6.EE.7 | yes |

4.OA.A.3 verbatim: "Solve multistep word problems… Represent these problems
using equations with a letter standing for the unknown quantity." Grade 4 = ages
9–10. Our label said 13–15.

### Verbal — LOW confidence, so the fix is honesty, not new invented numbers
Perplexity's own UNCONFIRMED section states no published test norms items of
this kind by single-year age. Applied conservatively:
- Every "15+" verbal claim REMOVED; the top of every verbal ramp caps at 13–14.
  Beyond roughly 13–14 a 3-option item stops discriminating by age anyway
  (33% chance floor).
- whichTwo d13/d14/d15 → all 13–14 (deliberately flat: the honest statement is
  "this format stops separating ages up here").
- information d11–12 → 12–14, d13–14 → 12–14, d15 → 13–14 (NGSS puts atoms /
  cells / waves at grades 6–8 = ages 11–14).
- whatWouldYouDo d9–10 → 11–13.
- Every verbal genre now carries a visible `caveat` saying she PICKS an answer
  while the real subtests ask her to SAY one, so the age is a floor.
- `VERBAL` basis string rewritten to name CogAT/OLSAT multiple-choice batteries
  (format-matched) and to declare LOW confidence.

### REJECTED from the Perplexity answer
It claimed our Type C low band (ages 5–7) was unsupported "for atoms/cells/light".
Wrong: our d1–2 information items are seasons and animals; the middle-school
science sits at d11+. It had misread the ramp. Not applied.

## Consequence found while checking — NOT yet fixed

Correcting the arithmetic ages broke monotonicity, which exposed a real
structural problem in the d16–20 band added earlier the same day:

    Story Sums: d16 (11–13) is BELOW d14 (12–14)
                d18 (11–12) is BELOW d17 (12–14)
                d19 (9–11)  is BELOW d18 (11–12)

d14–15 was already grade-7 content (ages 12–14). Most of what d16–20 added is
grade 4–7, i.e. **below** the rung it was stacked on top of. "Working backwards"
at d19 is grade 4, and duplicates content already named at d14–15.

So d16–20 does not currently extend the ladder; it re-treads it. A climb from
d15 to d20 would look like progress and record a ceiling of 20 without her doing
anything harder than d15. That is an invalid measurement (decision #14), in the
overstating direction. Genuinely harder content would be grade 8+: variables on
both sides, systems of equations, compound percent, inverse proportion.

Owner decision needed. Awaiting Jalal.
