import type { LevelConfig } from "../engine/types";

/**
 * Level 13 — "Pip's Treasure Map" (2026-09-14).
 *
 * Built from her Level 12 data (2026-09-11/12, 27/30, ZERO "Not fun" taps,
 * zero timeouts). Same win-heavy rule as Levels 11 and 12: stepUp 2, no fast
 * lane, a flawless N-item block answers its last item at start +
 * floor((N-1)/2); NO block may reach its wall (strictly less). A clean run
 * ends with reason "maxItems", never "twoWrong".
 *
 * NEW (owner, 2026-09-14): "we can't be repeating the same questions. Fresh
 * ones will challenge her more. This is for her regular questions NOT the
 * rematches." Every bank genre now gets the soft cross-session avoid list
 * (GET /api/state), and the four near-empty banks gained new items at the
 * tiers this level serves. Rematches (/practice) are unchanged.
 *
 *   genre            wall   start  items  reach
 *   arithmetic        15     10      4     11    stepped back (L12: d11 2/2, then missed d12 twice)
 *   information       12      9      6     11    climb (L12 flawless 8→10)
 *   whichTwo           5      3      4      4    hold (flawless 3→4, faster now; start 4 would reach the d5 wall)
 *   whatWouldYouDo    10      8      4      9    hold (flawless 8→9 but 42 to 49s on d9)
 *   swapShop          10      8      4      9    climb (L12 flawless 7→9; 4 items keeps d9 < wall 10)
 *   fillTheGap        10      7      6      9    hold (L12 5/6, the miss was its first d7 item)
 */
export const level13: LevelConfig = {
  id: 13,
  title: "Pip's Treasure Map",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    // Map Sums 🗺️ — arithmetic steps back to 10 with 4 items (reach d11,
    // where she was 2/2). Information climbs to 9 (reach d11 < wall 12).
    { id: "A", title: "Map Sums", sticker: "🗺️", blocks: [
      { genre: "arithmetic", start: 10, maxItems: 4, timeScale: 1.5 },
      { genre: "information", start: 9, maxItems: 6 },
    ] },
    // Compass Words 🧭 — whichTwo holds at 3 with its teaching cushion;
    // whatWouldYouDo holds at 8.
    { id: "B", title: "Compass Words", sticker: "🧭", blocks: [
      { genre: "whichTwo", start: 3, maxItems: 4, teachingItems: 1 },
      { genre: "whatWouldYouDo", start: 8, maxItems: 4 },
    ] },
    // Treasure Chest 💎 — swapShop climbs to 8 (4 items, reach d9);
    // fillTheGap holds at 7.
    { id: "C", title: "Treasure Chest", sticker: "💎", blocks: [
      { genre: "swapShop", start: 8, maxItems: 4, timeScale: 1.5 },
      { genre: "fillTheGap", start: 7, maxItems: 6 },
    ] },
  ],
};
