import type { Difficulty } from "./types";
export interface StairState { d: Difficulty; consecutiveWrong: number; consecutiveCorrect: number; items: number; ceiling: number | null; done: boolean; reason?: "twoWrong" | "maxItems" | "topReached"; maxItems: number; teachingItems: number; stepUp: number; missed: boolean; maxD: number }
const clampTo = (n: number, maxD: number): Difficulty => Math.max(1, Math.min(maxD, Math.round(n))) as Difficulty;
// `teachingItems` mirrors the real test's teaching items: for the first N
// items of a block, a wrong answer holds difficulty (as always) but does NOT
// count toward the two-consecutive-wrong stop rule, so an early miss can't
// end the block by itself. Correct answers behave exactly as usual even
// inside the window. Defaults to 0 (no change from prior behavior).
// `stepUp` = how many correct answers IN A ROW at the current difficulty are needed
// before moving up one step (owner, 2026-08-23: "progress needs to be very slow and
// one step at a time" after six single-answer steps took her from 5 to 7 digits).
// 1 = the diagnostic's climb-on-every-correct; practice levels use 2.
// `maxD` = the top difficulty THIS GENRE has authored content for (default 10;
// see Genre.maxDifficulty in types.ts). Extended past 10 only for a genre that
// has demonstrably hit the old top with real data (owner, 2026-08-23: "go beyond
// level 10 for those she has already reached" — the fluid-reasoning family,
// Pattern Train / Picture Sudoku, is the first, after she solved a genuine
// level-10 item). Never widen a genre's maxD speculatively — earn it first.
export function startStair(start: number | { fromProfileCeiling: number | null }, maxItems: number, teachingItems = 0, stepUp = 1, maxD = 10): StairState {
  const d = typeof start === "number" ? clampTo(start, maxD) : clampTo(start.fromProfileCeiling === null ? 1 : start.fromProfileCeiling - 1, maxD);
  return { d, consecutiveWrong: 0, consecutiveCorrect: 0, items: 0, ceiling: null, done: false, maxItems, teachingItems, stepUp: Math.max(1, stepUp), missed: false, maxD };
}
// `fast` = the answer came well inside the time cap (ItemRecord.fast). While the block
// is flawless (no miss yet) a fast correct answer climbs immediately even when
// stepUp > 1 — the "fast lane" that keeps testing her ceiling while she cruises
// (owner, 2026-08-23). The first miss closes the lane for the rest of the block.
export function stepStair(s: StairState, correct: boolean, fast = false): StairState {
  if (s.done) return s;
  const items = s.items + 1;
  if (correct) {
    const ceiling = s.ceiling === null ? s.d : Math.max(s.ceiling, s.d);
    const consecutiveCorrect = s.consecutiveCorrect + 1;
    const fastLane = s.stepUp > 1 && !s.missed && fast;
    const climb = fastLane || consecutiveCorrect >= s.stepUp;
    if (climb && s.d === s.maxD) return { ...s, items, ceiling, consecutiveWrong: 0, consecutiveCorrect, done: true, reason: "topReached" };
    const next = { ...s, items, ceiling, consecutiveWrong: 0, consecutiveCorrect: climb ? 0 : consecutiveCorrect, d: climb ? clampTo(s.d + 1, s.maxD) : s.d };
    return items >= s.maxItems ? { ...next, done: true, reason: "maxItems" } : next;
  }
  const inTeachingWindow = s.items < s.teachingItems;
  const consecutiveWrong = inTeachingWindow ? s.consecutiveWrong : s.consecutiveWrong + 1;
  if (consecutiveWrong >= 2) return { ...s, items, consecutiveWrong, consecutiveCorrect: 0, missed: true, done: true, reason: "twoWrong" };
  const next = { ...s, items, consecutiveWrong, consecutiveCorrect: 0, missed: true };
  return items >= s.maxItems ? { ...next, done: true, reason: "maxItems" } : next;
}
