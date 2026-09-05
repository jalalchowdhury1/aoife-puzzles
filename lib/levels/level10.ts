import type { LevelConfig } from "../engine/types";

/**
 * Level 10 — "Pip's Big Party" (2026-09-05).
 * Spec: docs/superpowers/specs/2026-09-05-level10-big-party-design.md
 *
 * Built from her completed Level 9 (Parts A+B on 2026-08-30, Part C on
 * 2026-09-02), which was a ceiling probe by design and did exactly what a
 * probe does: it climbed until she failed. Three "Not fun" taps, one per
 * part — her worst session for fun — and 5 of 6 blocks ended on a loss.
 *
 *   Story Sums       from d15 -> miss in 5s, BAIL on item 2   (grade-8 algebra on item one)
 *   Do You Know      d8 -> d10, 7/8, median 8s                (her happiest block; bailed d12 in L8)
 *   Fill the Gap     d8 -> d10, 4/6, BAIL at d10 (its cap)
 *   What Would You Do d4 -> d10, 7/8, but 23-45s per item     (topped its cap; effortful)
 *   Which Two        from d5, ONE item, 76s, BAIL             (new uncued bank — decision #29)
 *   Swap Shop        d8 -> d10, 4/6, 67s TIMEOUT at d10
 *
 * Owner ask: "Make sure she loves it and doesn't have to press 'it's not
 * fun'… Ends on a winning note." With NO engine change (a victory-lap item
 * was offered and declined), so the fun has to come from the shape of the
 * level itself.
 *
 * THE ONE RULE: every block is structurally unable to reach the step that
 * beat her. stepUp 2 + fastLane off means a flawless N-item block answers
 * its last item at start + floor((N - 1) / 2); six items = start + 2. Pick
 * starts so that stays below each recorded wall, and a normal run ends on
 * `maxItems` — every progress dot filled, "blockDone" praise — instead of
 * on two misses. levels.test.ts pins this with the wall table.
 *
 *   genre            wall   start  reach   (decision #18: ~30% below the bail peak)
 *   arithmetic        15     10     12
 *   information       12      8     10
 *   whichTwo           5      2      4     (owner: restart the re-authored bank from the bottom)
 *   fillTheGap        10      7      9
 *   whatWouldYouDo    10      7      9
 *   swapShop          10      7      9
 *
 * Each part = one game that broke her, at a safe step, then a closer she is
 * confident in (decision #18: open easy, close on her strongest).
 */
export const level10: LevelConfig = {
  id: 10,
  title: "Pip's Big Party",
  feedback: "reveal",
  weighting: "none",
  stepUp: 2,
  teachingItems: 0,
  fun: true,
  fastLane: false,
  easeIn: true,
  released: true,
  parts: [
    // Opens on the game she bailed on, at a step she has aced repeatedly
    // (8/8 at d10 in Level 4, 13/14 through d15 in Level 8), so the bail is
    // overwritten with wins straight away; closes on her fastest, happiest
    // game. Both timed door genres run the 1.5x clock (Level 4 proved the
    // clock, not the maths, was what she lost to).
    { id: "A", title: "Cake Sums", sticker: "🎂", blocks: [
      { genre: "arithmetic", start: 10, maxItems: 6, timeScale: 1.5 },
      { genre: "information", start: 8, maxItems: 6 },
    ] },
    // Which Two restarts from the bottom of the re-authored bank: d2 is
    // "bucket / bowl / brush / lamp" with emoji, not the "key / password ->
    // both let you in safely" that took her 76 seconds. Two teaching items
    // (free misses) let her re-learn the feel of the reason step without a
    // counted loss — the only block on this level that gets them.
    { id: "B", title: "Party Words", sticker: "🎈", blocks: [
      { genre: "whichTwo", start: 2, maxItems: 6, teachingItems: 2 },
      { genre: "whatWouldYouDo", start: 7, maxItems: 6 },
    ] },
    // Swap Shop's d10 loss was a 67-second timeout, so the clock is fixed
    // and the start wound back; Fill the Gap closes because its 2/1/0
    // scoring means she almost never walks away with a flat zero.
    { id: "C", title: "Prize Table", sticker: "🏆", blocks: [
      { genre: "swapShop", start: 7, maxItems: 6, timeScale: 1.5 },
      { genre: "fillTheGap", start: 7, maxItems: 6 },
    ] },
  ],
};
