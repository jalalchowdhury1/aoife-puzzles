import type { LevelConfig } from "../engine/types";

/**
 * Level 4 — "Pip's Power-Ups" (owner decision #18, 2026-08-23).
 *
 * Built the evening she finished Level 3, from her Level 3 record. The owner:
 * "If she says 'Not fun', that means basically a bit too difficult. Start 30%
 * easier than the peak that she didn't like and slowly build up. Let her win
 * wayyyyy more than she loses, all the while improving her weaknesses."
 *
 * The four modules are exactly the four places Level 3 pushed too hard:
 *
 *   genre          what happened in Level 3            peak    30% under → start
 *   swapShop       flawless fast-lane sprint 1→7,      d8      8 × 0.7 = 5.6 → 5
 *                  25s think at d8, "Not fun"
 *   pictureSudoku  3/5, wrong at d4, "Not fun" at d4   d4      4 × 0.7 = 2.8 → 2
 *   fireflyBoxes   flawless to 5, quick "Not fun"      d6      6 × 0.7 = 4.2 → 4
 *                  at d6
 *   arithmetic     reached d10 but lost BOTH d10       d10     10 × 0.7 = 7, and
 *                  items to the 30s clock (not the             1.5× time so the
 *                  maths — hence time relief, not              top is about the
 *                  an easier ceiling)                          sums again
 *
 * Design rules for the win-heavy ramp:
 * - stepUp 2 and fastLane OFF: the ONLY way up is two right in a row. The
 *   fast lane is what rushed her from d1 to d7 in Swap Shop in one flawless
 *   sprint and dropped her at the d8 wall; here the climb is deliberate.
 *   With 8 items and stepUp 2 she banks 4-6 wins before she revisits the
 *   exact difficulty that made her tap "Not fun".
 * - feedback "reveal": a miss shows the right answer (learning, less sting).
 * - teachingItems 0: she knows all four formats now; teaching reveals would
 *   spend win-slots on items that don't feel like wins.
 * - weighting "none": starts are pinned by hand above, not derived — the
 *   remedial classifier would call these genres "typical/strong" and start
 *   them higher than the owner asked for.
 * - Order is psychology: open on Swap Shop (she was flawless below d8 —
 *   instant wins), bury the sorest spot (Picture Sudoku) in the middle,
 *   and close on Story Sums, her strongest genre, with the clock fixed —
 *   so the session ends on her biggest possible win.
 *
 * "Not fun" stays available on every item, and if she taps it the block
 * ends warmly as always — that tap is the signal this level is built from,
 * never a failure.
 */
export const level4: LevelConfig = {
  id: 4,
  title: "Pip's Power-Ups",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  released: true,
  parts: [
    { id: "A", title: "Power-Ups", sticker: "💪", blocks: [
      { genre: "swapShop", start: 5 },
      { genre: "pictureSudoku", start: 2 },
      { genre: "fireflyBoxes", start: 4 },
      { genre: "arithmetic", start: 7, timeScale: 1.5, display: "both" },
    ] },
  ],
};
