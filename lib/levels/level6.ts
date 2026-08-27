import type { LevelConfig } from "../engine/types";

/**
 * Level 6 — "Pip's Explorer Day" (2026-08-26, built with the Age Lens;
 * spec docs/superpowers/specs/2026-08-26-age-lens-design.md).
 *
 * A MEASUREMENT level, not a remedial one. Six genres ended their last
 * round still winning when the items ran out (near-perfect blocks from
 * Level 3's everything-starts-at-1 design), so their recorded ceilings are
 * floors, not walls — and the parent Ages tab can only say "at least".
 * This level lets each of them climb until the staircase finds something
 * real. Level 5 already measures the rest (fixPicture, animalParade,
 * fireflyBoxes, pictureSudoku, swapShop, arithmetic, and the two speed
 * games), so they are deliberately absent.
 *
 * Template choices:
 * - weighting "none" + start "fromProfile": non-remedial fromProfile
 *   resolves to ceiling − 1 against whatever data exists when she reaches
 *   this level (after Level 5), so nothing here goes stale.
 * - fastLane ON (the default): this level's job is FINDING ceilings, and
 *   the fast lane is the efficient prober — while easeIn keeps every
 *   personal-record miss free and tap-paced (decision #19), which is what
 *   made the fast lane safe to turn back on.
 * - stepUp 2, reveal feedback, no teaching items (all formats known),
 *   fun on. "Not fun" stays on every item and stays a signal.
 */
export const level6: LevelConfig = {
  id: 6,
  title: "Pip's Explorer Day",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  easeIn: true,
  // Unreleased 2026-08-27 (owner decision #21, doors only): she had played
  // NEITHER part of this level, so nothing is replayed; Level 7 absorbs its
  // door-genre work. Kept for history like Level 2.
  released: false,
  parts: [
    { id: "A", title: "Puzzle Explorer", sticker: "🧭", blocks: [
      { genre: "mosaic", start: "fromProfile" },
      { genre: "patternTrain", start: "fromProfile" },
    ] },
    { id: "B", title: "Word Explorer", sticker: "📖", blocks: [
      { genre: "whichTwo", start: "fromProfile" },
      { genre: "fillTheGap", start: "fromProfile" },
      { genre: "information", start: "fromProfile" },
      { genre: "whatWouldYouDo", start: "fromProfile" },
    ] },
  ],
};
