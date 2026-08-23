import type { LevelConfig } from "../engine/types";

/**
 * Level 3 — "Pip's Games" (decision #16 "similar, not same", 2026-08-23).
 * Every game is a cousin of a WISC-V subtest, not a replica. Slow and gentle:
 * two right in a row per step, teaching items, answers shown, fun layer on.
 * New games have no history, so every block starts at level 1.
 */
export const level3: LevelConfig = {
  id: 3,
  title: "Pip's Games",
  feedback: "reveal",
  weighting: "remedial",
  stepUp: 2,
  teachingItems: 2,
  fun: true,
  released: true,
  parts: [
    { id: "A", title: "Shapes and Patterns", sticker: "🧩", blocks: [
      { genre: "mosaic", start: "fromProfile" },
      { genre: "fixPicture", start: "fromProfile" },
      { genre: "patternTrain", start: "fromProfile" },
      { genre: "pictureSudoku", start: "fromProfile" },
    ] },
    { id: "B", title: "Memory and Speed", sticker: "⚡", blocks: [
      { genre: "animalParade", start: "fromProfile" },
      { genre: "fireflyBoxes", start: "fromProfile" },
      { genre: "translator", start: "fromProfile" },
      { genre: "spotIt", start: "fromProfile" },
      { genre: "swapShop", start: "fromProfile" },
    ] },
    { id: "C", title: "Words and Sums", sticker: "📚", blocks: [
      { genre: "whichTwo", start: "fromProfile" },
      { genre: "fillTheGap", start: "fromProfile" },
      { genre: "information", start: "fromProfile" },
      { genre: "whatWouldYouDo", start: "fromProfile" },
      { genre: "arithmetic", start: "fromProfile", display: "both" },
    ] },
  ],
};
