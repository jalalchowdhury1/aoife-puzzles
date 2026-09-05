# Level 10 "Pip's Big Party" — design (2026-09-05)

Owner ask (Jalal, 2026-09-05): *"prepare Aoife's next puzzle session. Make sure she loves it and
doesn't have to press 'it's not fun'… Ends on a winning note."* Approved choices: win-heavy but still
honest; **no engine change** (victory-lap item declined); Which Two restarts at step 1-2.

## 1. What Level 9 taught us

Level 9 (played 2026-08-30 and 2026-09-02) produced **three "Not fun" taps, one per part** — her
worst session for fun. Raw data from `/api/sessions?level=9`:

| Block | Result | Read |
|---|---|---|
| 9A swapShop d8→10 | 4/6, ended on a **67 s timeout at d10** | genuine frontier + clock |
| 9A arithmetic from **d15** | miss in 5 s, **bail on item 2** | d15 = grade-8 algebra; a wall on item one |
| 9B information d8→10 | 7/8, median 8 s | her happiest block |
| 9B fillTheGap d8→10 | 4/6 (many 1/2), **bail at d10** (the cap) | frontier is d8-9 |
| 9C whatWouldYouDo d4→10 | 7/8, won d10, but **23–45 s per item** | topped its cap; effortful |
| 9C whichTwo from **d5** | **one item, 76 s, bail** | new uncued bank (decision #29); d5 = "key/password → both let you in safely" |

Root cause: Level 9 was a *ceiling probe* by design (start at her top, climb until she fails), so
**5 of 6 blocks ended on a loss**. The staircase's stop rule (two misses in a row) means a probe
block's last memory is always failure. That, not any single item, is the "Not fun" button.

## 2. The rule this level is built to

**Every block is structurally unable to reach the step that beat her.** With `stepUp: 2`,
`fastLane: false` and no teaching climb, a flawless N-item block answers its last item at
`start + floor((N − 1) / 2)`. Six items ⇒ `start + 2`. Pick starts so that number stays below
each recorded wall, and a normal run ends on `maxItems` (all progress dots filled, "blockDone"
praise) rather than `twoWrong`.

| Genre | Wall (recorded) | Start | Items | Highest reachable | Margin |
|---|---|---|---|---|---|
| arithmetic | bail d15 (L9A) | 10 | 6 | 12 | −3 |
| information | bail d12 (L8B) | 8 | 6 | 10 | −2 |
| whichTwo | bail d5 (L9C, new bank) | 2 | 6 | 4 | −1 |
| fillTheGap | bail d10 (L9B) | 7 | 6 | 9 | −1 |
| whatWouldYouDo | cap d10, slow (L9C) | 7 | 6 | 9 | −1 |
| swapShop | timeout d10 (L9A) | 7 | 6 | 9 | −1 |

Starts follow decision #18 (≈30 % below the bail peak, rounded down): 15→10, 12→8, 10→7.
whichTwo restarts at 2 (owner choice): the bank was re-authored under her on 2026-08-30, so d5 on
the new items is not the d5 she used to ace; d2 = `bucket / bowl / brush / lamp` with emoji.

## 3. Level shape

Three short parts (~12 items, ~6–8 min each). Each part = **one game that broke her, at a safe
step → closing on a game she is confident in** (decision #18: open easy, close on her strongest).

| Part | Sticker | Block 1 | Block 2 (closer) |
|---|---|---|---|
| A "Cake Sums" | 🎂 | arithmetic start 10, `timeScale 1.5` | information start 8 — fastest, happiest |
| B "Party Words" | 🎈 | whichTwo start 2, `teachingItems 2` | whatWouldYouDo start 7 — 7/8 in L9 |
| C "Prize Table" | 🏆 | swapShop start 7, `timeScale 1.5` | fillTheGap start 7 — partial credit, rarely a flat 0 |

Level config: `feedback: "reveal"`, `weighting: "none"` (hand-pinned starts), `stepUp: 2`,
`teachingItems: 0` (block override 2 on whichTwo only), `fun: true`, `fastLane: false`,
`easeIn: true` (safety net if she ever climbs past a ceiling), `released: true`.

Clocks: arithmetic and swapShop are the two timed door genres; both run 1.5× (her L4 data proved the
clock, not the maths, was the loser; the L9A swapShop loss was a timeout).

Why 2 teaching items on whichTwo only: the format did not change, but the item *feel* did (no
register cue, a real reason step). Two free misses let her re-learn the game without a counted loss.
No other block gets them — decision #18 says teachingItems 0.

## 4. Guards (tests)

`lib/levels/levels.test.ts` gains a Level 10 block:

1. Door genres only (existing rule for levels ≥ 7).
2. Every block has a numeric `start` and `maxItems` (no `fromProfile*` — this is not a probe).
3. **Wall test:** for each block, `start + floor((maxItems − 1) / stepUp) < WALL[genre]`, with the
   wall table above hard-coded in the test with its source session. This is the load-bearing rule;
   a future edit that re-walls her fails CI.
4. `fastLane` is false level-wide and not overridden to true on any block.

## 5. What changes and what does not

- New: `lib/levels/level10.ts`, register in `lib/levels/index.ts`, tests, AGENTS.md §6 + decisions
  table (#30), memory update.
- **No engine change.** No bank change. No scale.ts re-band. Her record, ceilings and position are
  untouched; `currentPosition` resolves to L10A automatically once Level 10 is released.
- Verification: `npm run release` gate (lint → tsc → unit + fairness → build → Playwright) plus a
  self-play of all three parts in a throwaway Chrome profile against a KV-neutralised dev server
  with her live profile injected (never the paired desktop Chrome).

## 6. Parked, on purpose

- whatWouldYouDo topped its d10 cap in L9C → decision #17 says a d11-15 ladder is *earned*. It is a
  bank-authoring job (25 items × 3 independent passes) and belongs in Level 11, not a fun level.
- The "victory lap" (one non-counting easy item after a two-miss stop so every block ends on a win)
  was declined for this level. If a future level needs it, it is a ~20-line staircase/runner change.
