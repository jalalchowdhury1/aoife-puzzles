import type { LevelConfig } from "../engine/types";

/**
 * Level 8 — "Pip's Sky Climb" (2026-08-28, the ceiling-probe level;
 * owner decision #24).
 *
 * Her Level 7 session (2026-08-27) was clean — no bails, no mass-timeouts —
 * but it exposed a MEASUREMENT problem: 8-item blocks with stepUp 2 and the
 * fast lane off cap a flawless run at roughly start + 4 difficulties, so the
 * block runs out of items before she runs out of ability. Which Two Belong
 * scored a PERFECT 16/16 across two sittings yet recorded a ceiling of only
 * 6; Do You Know touched its d10 cap on a single data point. We were
 * measuring the item budget, not her ceiling.
 *
 * Three coordinated fixes, all visible in the config below:
 *
 * 1. CEILING-PROBE BLOCKS (start: "fromProfileTop", maxItems 14): the three
 *    censored/capped genres — whichTwo, information, arithmetic — start AT
 *    her live measured ceiling (not ceiling − 1) with enough items that a
 *    flawless run reaches the genre's top instead of the item cap. easeIn
 *    (decision #19) keeps every personal-record miss free, soft-landing,
 *    1.5x-clocked and tap-paced, so probing stays gentle.
 *
 * 2. FAST LANE ON FOR EXACTLY TWO GENRES (decision #24). Jalal's rule:
 *    "If she does it super fast and correct = fast lane. If she does it
 *    correct but not fast, in fact slow, then keep the same progress path."
 *    And his per-genre pick, verbatim: "Fast lane for information and fill
 *    the gap. The other 2 let it be on the normal way." So fastLane is OFF
 *    level-wide and ON only for those two blocks — with a TIGHTER "fast"
 *    bar (fastMs) than the engine's 10s untimed default, which sat above
 *    her own typical pace (information median ~8.6s, fillTheGap ~12.5s per
 *    the 2026-08-27 profile): information 5s, fillTheGap 7s. A typical-pace
 *    answer climbs the normal stepUp-2 way; only a genuinely quick one
 *    climbs immediately.
 *
 * 3. WIDENED BANKS (decision #17, earned): arithmetic and information now
 *    author d11-15 (she topped both d10 caps), so their probes have real
 *    headroom to climb into.
 *
 * swapShop is already well characterised (ceiling 8, proven twice) and gets
 * a short confirmation block only; fillTheGap and whatWouldYouDo keep the
 * standard practice treatment. Parts open easy and close on her strongest
 * (the Level 7 pattern).
 */
export const level8: LevelConfig = {
  id: 8,
  title: "Pip's Sky Climb",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    { id: "A", title: "Sky High Sums", sticker: "🎈", blocks: [
      { genre: "swapShop", start: "fromProfile", maxItems: 6, timeScale: 1.5 },
      { genre: "arithmetic", start: "fromProfileTop", maxItems: 14, timeScale: 1.5 },
    ] },
    { id: "B", title: "Word Rockets", sticker: "🚀", blocks: [
      { genre: "fillTheGap", start: "fromProfile", maxItems: 8, fastLane: true, fastMs: 7_000 },
      { genre: "information", start: "fromProfileTop", maxItems: 14, fastLane: true, fastMs: 5_000 },
    ] },
    { id: "C", title: "Puzzle Peaks", sticker: "🏔️", blocks: [
      { genre: "whatWouldYouDo", start: "fromProfile", maxItems: 8 },
      { genre: "whichTwo", start: "fromProfileTop", maxItems: 14 },
    ] },
  ],
};
