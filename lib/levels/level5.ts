import type { LevelConfig } from "../engine/types";

/**
 * Level 5 — "Pip's Winning Streak" (2026-08-26, built from her Level 4 data).
 *
 * Level 4 fixed three of its four targets outright: Firefly Boxes cleared its
 * bail point (ceiling 5 → 7, 8/8), Story Sums proved the d10 losses were the
 * clock (8/8 to ceiling 10 on 1.5x time), and Picture Sudoku is rebuilding on
 * schedule (ceiling 3 → 4, no bail). Swap Shop was the holdout: two fast d5
 * wins, then two FULL-CLOCK timeouts at d6 — the same time-not-ability
 * signature Story Sums had. The owner: "swap shop can we drop a 0.5 level as
 * well?" → per decision #19, that cliff is fixed by re-banding the ramp
 * (see swapShop.ts + scale.ts, 2026-08-26): the new d6 introduces mixed
 * piles as wrong options only, and the 45s clock now covers every
 * single-rule band.
 *
 * Part A "Level Up" promotes the four Level 4 genres on the decision-#18
 * order (open easy, bury the sorest, close on her strongest):
 *
 *   genre          start  why
 *   fireflyBoxes   5      ceiling 7 — opens with instant wins on the genre
 *                         she just conquered
 *   swapShop       5      last fluent band; climbs into the new d6
 *                         half-step, then new d7 (= old d6, where she timed
 *                         out) at 45s base x 1.5 timeScale — the Story Sums
 *                         clock fix applied to the exact band that failed.
 *                         The ramp re-band nulls her known ceiling, so
 *                         easeIn's frontier protections cover everything
 *                         above the start.
 *   pictureSudoku  3      ceiling 4 (max 15) — one warm-up win, then keep
 *                         the slow build going
 *   arithmetic     8      ceiling 10 = its cap; ~6 wins then tops out — the
 *                         strong close. The 1.5x clock stays (proven fix).
 *
 * Part B "Victory Lap" is pure win-heavy fun: her strongest puzzle and
 * memory genres from profile (ceiling − 1), then the two speed games she
 * loves, closing on Translator — her 44-answers-a-minute superpower.
 *
 * Template knobs are Level 4's (decision #18): reveal, weighting "none"
 * (hand-pinned starts — the remedial classifier ignores numeric starts),
 * stepUp 2, fast lane OFF, easeIn ON, no teaching items. "Not fun" stays on
 * every item and stays a signal, never a failure.
 */
export const level5: LevelConfig = {
  id: 5,
  title: "Pip's Winning Streak",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    { id: "A", title: "Level Up", sticker: "🚀", blocks: [
      { genre: "fireflyBoxes", start: 5 },
      { genre: "swapShop", start: 5, timeScale: 1.5 },
      { genre: "pictureSudoku", start: 3 },
      { genre: "arithmetic", start: 8, timeScale: 1.5, display: "both" },
    ] },
    { id: "B", title: "Victory Lap", sticker: "🏆", blocks: [
      { genre: "fixPicture", start: "fromProfile" },
      { genre: "animalParade", start: "fromProfile" },
      { genre: "spotIt", start: "fromProfile" },
      { genre: "translator", start: "fromProfile" },
    ] },
  ],
};
