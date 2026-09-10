import type { LevelConfig } from "../engine/types";

/**
 * Level 12 — "Pip's Sky Picnic" (2026-09-10).
 * Spec: docs/superpowers/specs/2026-09-10-level12-sky-picnic-design.md
 *
 * Built from her Level 11 data (2026-09-10, 30/36, ZERO "Not fun" taps,
 * zero timeouts). The win-heavy rule from Level 11 continues: stepUp 2,
 * no fast lane, a flawless N-item block answers its last item at start +
 * floor((N-1)/2); NO block may reach its wall (strictly less). A clean run
 * ends with reason "maxItems", never "twoWrong". Story Sums steps BACK one
 * from where it was beaten so the level ends on a win.
 *
 * THE RULE: climb where flawless, hold where missed. Held blocks keep
 * their Level 10 start but draw fresh seeds. Same machinery as Level 11:
 * stepUp 2, no fast lane, easeIn, 1.5x clock on the two timed genres,
 * reveal feedback.
 *
 *   genre            wall   start  items  reach
 *   arithmetic        15     11      6     13    stepped back (was 13→16 probe, owner: "STEP BACK, end on a win")
 *   information       12      8      6     10    hold
 *   whichTwo           5      3      4      4    hold (flawless but slow; teaching item stays as cushion)
 *   whatWouldYouDo    10      8      4      9    climb (was flawless at 7→9; climb to 8, 4 items → d9 < wall 10)
 *   swapShop          10      7      6      9    hold
 *   fillTheGap        10      7      6      9    hold
 */
export const level12: LevelConfig = {
  id: 12,
  title: "Pip's Sky Picnic",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    // Cloud Sums ☁️ — arithmetic stepped back (was 13→16 probe, now
    // start 11, 6 items → d13, under d15 wall). Information holds at 8.
    { id: "A", title: "Cloud Sums", sticker: "☁️", blocks: [
      { genre: "arithmetic", start: 11, maxItems: 6, timeScale: 1.5 },
      { genre: "information", start: 8, maxItems: 6 },
    ] },
    // Kite Words 🪁 — whichTwo holds at start 3, teaching item stays.
    // whatWouldYouDo climbs from 7 to 8 (flawless in Level 11).
    { id: "B", title: "Kite Words", sticker: "🪁", blocks: [
      { genre: "whichTwo", start: 3, maxItems: 4, teachingItems: 1 },
      { genre: "whatWouldYouDo", start: 8, maxItems: 4 },
    ] },
    // Rainbow Chest 🌈 — both hold at same starts as Level 11.
    { id: "C", title: "Rainbow Chest", sticker: "🌈", blocks: [
      { genre: "swapShop", start: 7, maxItems: 6, timeScale: 1.5 },
      { genre: "fillTheGap", start: 7, maxItems: 6 },
    ] },
  ],
};
