import type { LevelConfig } from "../engine/types";

/**
 * Level 11 — "Pip's Next Step" (2026-09-09).
 * Spec: docs/superpowers/specs/2026-09-09-level11-next-step-design.md
 *
 * Built from her completed Level 10 (all three parts on 2026-09-09, about
 * four minutes each): 33/36, ZERO "Not fun" taps, every block ran to its
 * last dot. The win-heavy shape worked, so it stays. What changed is her
 * data:
 *
 *   Story Sums        d10 -> 12, 6/6, the d12 items in 4s and 0.5s   FLAWLESS, fast
 *   Do You Know       d8  -> 10, 5/6, one miss at d10, 35-40s items  frontier d10
 *   Which Two         d2  -> 4,  6/6, no teaching item used          FLAWLESS
 *   What Would You Do d7  -> 8,  5/6, one miss at d8, 20-39s each    frontier d8
 *   Swap Shop         d7  -> 9,  5/6, one miss at d9                 frontier d9
 *   Fill the Gap      d7  -> 9,  5/6, one miss at d8                 frontier d8-9
 *
 * THE RULE: climb where she was flawless, hold where she missed. Held
 * blocks keep their Level 10 start but draw fresh seeds, so nothing is a
 * replay. Same machinery as Level 10: stepUp 2, no fast lane, easeIn, 1.5x
 * clock on the two timed genres, reveal feedback — a flawless N-item block
 * answers its last item at start + floor((N - 1) / 2).
 *
 * OWNER OVERRIDE (Jalal, 2026-09-09): "the math one you can test her
 * limits. start higher. cause she's really good at math." So Story Sums is
 * the one deliberate PROBE on this level: start d13, eight items, reaching
 * d16 — one past the d15 that beat her in Level 9. Her ceiling is d15, so
 * easeIn treats d16 as frontier: one free miss and a 1.5x clock on top of
 * the block's own 1.5x. The two-miss stop still ends the block gently.
 *
 *   genre            wall   start  items  reach
 *   arithmetic        15     13      8     16    PROBE (owner call)
 *   information       12      8      6     10    hold
 *   whichTwo           5      3      4      4    climb (below the d5 wall)
 *   fillTheGap        10      7      6      9    hold
 *   whatWouldYouDo    10      7      6      9    hold
 *   swapShop          10      7      6      9    hold
 *
 * Part order keeps the Level 10 shape she liked: open on the bigger ask,
 * close on the confident one.
 */
export const level11: LevelConfig = {
  id: 11,
  title: "Pip's Next Step",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    // The probe. She answered d12 in half a second on Level 10; d13-14 are
    // unit rates and averages she has already beaten (13/14 through d15 in
    // Level 8), d15-16 are the "think of a number" and fraction chains.
    { id: "A", title: "Rocket Sums", sticker: "🚀", blocks: [
      { genre: "arithmetic", start: 13, maxItems: 8, timeScale: 1.5 },
      { genre: "information", start: 8, maxItems: 6 },
    ] },
    // Which Two climbs one step (she used neither teaching item on Level
    // 10) but only four items, so the last one is d4 — still under the d5
    // that took her 76 seconds. One teaching item stays as a cushion.
    { id: "B", title: "Word Garden", sticker: "🌻", blocks: [
      { genre: "whichTwo", start: 3, maxItems: 4, teachingItems: 1 },
      { genre: "whatWouldYouDo", start: 7, maxItems: 6 },
    ] },
    // Both missed once at d8-9 on Level 10: same starts, fresh problems.
    { id: "C", title: "Treasure Chest", sticker: "💎", blocks: [
      { genre: "swapShop", start: 7, maxItems: 6, timeScale: 1.5 },
      { genre: "fillTheGap", start: 7, maxItems: 6 },
    ] },
  ],
};
