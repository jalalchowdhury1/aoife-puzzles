import type { LevelConfig } from "../engine/types";

/**
 * Level 9 — "Pip's Record Breakers" (2026-08-29).
 *
 * Built from her completed Level 8 (Parts A+B on 2026-08-28, Part C on
 * 2026-08-29). That level did its job as a ceiling probe, and the answer it
 * gave was: two of the ladders are too short.
 *
 *   Story Sums     d10 -> d15, 13/14, NO miss above d10   -> topped the cap
 *   Which Two      d6  -> d10, 10/10 PERFECT               -> topped the cap
 *   Do You Know    d10 -> d11, then "Not fun" at d12       -> a real wall
 *   Fill the Gap   d6  -> d8, 7/8, still winning at the end
 *   What Would You Do? d4 -> d7, 7/8, still winning at the end
 *   Swap Shop      d7  -> d9, 5/6, a genuine frontier miss at d9
 *
 * So this level has three different jobs, one per genre group.
 *
 * 1. PROBE THE NEW HEADROOM (Story Sums, Which Two). Both banks were widened
 *    the same day under decision #17/#26 — arithmetic to d20, whichTwo to
 *    d15 — and both blocks start `fromProfileTop`, AT the cap she cleared,
 *    with enough items for a flawless run to reach the new top. Anything
 *    less would measure the new bank instead of her, which is the exact
 *    mistake Level 8 was built to stop repeating.
 *
 * 2. WIND DO YOU KNOW BACK DOWN (decision #18). She tapped "Not fun" at d12,
 *    and Jalal — who was sitting with her — confirmed it: "i know this cause
 *    i was there. step 12 was too hard." That is a real wall, not boredom,
 *    so the response is the remedial recipe: start well below the bail peak
 *    (12 * 0.7 ~= 8), climb slowly, and cap the block so a clean run ENDS at
 *    11, the level she has already proven twice. She should win all eight.
 *    Note the deliberate `fastLane: false` here: information carried the lane
 *    in Level 8, and a remedial block must never sprint her back to a wall.
 *
 * 3. KEEP CLIMBING WHERE SHE WAS STILL WINNING (Fill the Gap, What Would You
 *    Do?). Both ran out of items rather than ability, so both start at their
 *    measured ceiling rather than under it. Their banks still cap at d10, so
 *    topping either one earns the next widening under decision #17.
 *
 * Swap Shop is the one genre with a genuine measured frontier (a 65-second
 * think then a miss at d9), so it gets no probe — just a short confident
 * block at d8, which she has cleared twice, to open Part A warmly.
 *
 * Unchanged from Level 8 and still load-bearing: easeIn (decision #19) makes
 * every personal-record miss free, soft-landing, 1.5x-clocked and tap-paced;
 * the fast lane stays OFF level-wide and ON only for fillTheGap (decision
 * #24, Jalal's per-genre pick), with information's lane deliberately dropped
 * for the remedial reason above.
 */
export const level9: LevelConfig = {
  id: 9,
  title: "Pip's Record Breakers",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    // Opens on the genre with a known frontier (warm, familiar), closes on
    // the biggest climb she has ever made.
    { id: "A", title: "Moon Sums", sticker: "🌙", blocks: [
      { genre: "swapShop", start: "fromProfile", maxItems: 6, timeScale: 1.5 },
      // From d15, stepUp 2 needs 10 clean items to reach the new d20 top.
      { genre: "arithmetic", start: "fromProfileTop", maxItems: 14, timeScale: 1.5 },
    ] },
    // Opens on the remedial block (she wins nearly all of it), closes on the
    // genre where she is still climbing.
    { id: "B", title: "Star Words", sticker: "⭐", blocks: [
      // Hard-pinned start, NOT fromProfile: the remedial recipe wants 30%
      // below the bail peak, and 8 items at stepUp 2 lands a clean run on
      // d11 exactly — proven ground, and never d12 again this level.
      { genre: "information", start: 8, maxItems: 8, fastLane: false },
      { genre: "fillTheGap", start: "fromProfileTop", maxItems: 12, fastLane: true, fastMs: 7_000 },
    ] },
    { id: "C", title: "Big Ideas", sticker: "💡", blocks: [
      { genre: "whatWouldYouDo", start: "fromProfileTop", maxItems: 10 },
      // Her slowest genre by far (median ~28s, some items past 80s) and
      // untimed by design, so 12 items is the practical ceiling for one
      // sitting — enough for d10 -> d15 on a clean run.
      { genre: "whichTwo", start: "fromProfileTop", maxItems: 12 },
    ] },
  ],
};
