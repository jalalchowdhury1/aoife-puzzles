import type { LevelConfig } from "../engine/types";

/**
 * Level 7 — "Pip's Dream Team" (2026-08-27, the first doors-only level;
 * owner decision #21, spec docs/superpowers/specs/2026-08-27-davidson-doors-design.md).
 *
 * Levels 5 and 6 were unreleased before she reached them (nothing replayed)
 * and this level absorbs their door-genre work:
 * - Part A = Level 5A's two door blocks with the SAME win-ramp pins and the
 *   same reasoning: swapShop starts at 5 (below the new-d7 mixed-answer
 *   band that walled her) and arithmetic at 8 (she owns d10 on the 1.5x
 *   clock), both with timeScale 1.5 because her losses there were TIME, not
 *   ability (Level 4's confirmed clock theory).
 * - Part B = Level 6B's censored-ceiling probe of the verbal four, starts
 *   fromProfile so nothing goes stale.
 *
 * fastLane stays OFF level-wide: win-heavy first (decisions #15/#18). Her
 * verbal fromProfile starts already land at ceiling − 1, so the fast lane
 * would buy little probing speed and risks rebuilding the wall; easeIn keeps
 * every personal-record miss free and tap-paced (decision #19).
 */
export const level7: LevelConfig = {
  id: 7,
  title: "Pip's Dream Team",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    { id: "A", title: "Number Ninjas", sticker: "🥷", blocks: [
      { genre: "swapShop", start: 5, timeScale: 1.5 },
      { genre: "arithmetic", start: 8, timeScale: 1.5 },
    ] },
    { id: "B", title: "Word Wizards", sticker: "🪄", blocks: [
      { genre: "whichTwo", start: "fromProfile" },
      { genre: "fillTheGap", start: "fromProfile" },
      { genre: "information", start: "fromProfile" },
      { genre: "whatWouldYouDo", start: "fromProfile" },
    ] },
  ],
};
