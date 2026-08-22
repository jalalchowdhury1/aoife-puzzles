import type { Difficulty } from "./types";
export interface StairState { d: Difficulty; consecutiveWrong: number; items: number; ceiling: number | null; done: boolean; reason?: "twoWrong" | "maxItems" | "topReached"; maxItems: number; teachingItems: number }
const clamp = (n: number): Difficulty => Math.max(1, Math.min(10, Math.round(n))) as Difficulty;
// `teachingItems` mirrors the real test's teaching items: for the first N
// items of a block, a wrong answer holds difficulty (as always) but does NOT
// count toward the two-consecutive-wrong stop rule, so an early miss can't
// end the block by itself. Correct answers behave exactly as usual even
// inside the window. Defaults to 0 (no change from prior behavior).
export function startStair(start: number | { fromProfileCeiling: number | null }, maxItems: number, teachingItems = 0): StairState {
  const d = typeof start === "number" ? clamp(start) : clamp(start.fromProfileCeiling === null ? 1 : start.fromProfileCeiling - 1);
  return { d, consecutiveWrong: 0, items: 0, ceiling: null, done: false, maxItems, teachingItems };
}
export function stepStair(s: StairState, correct: boolean): StairState {
  if (s.done) return s;
  const items = s.items + 1;
  if (correct) {
    const ceiling = s.ceiling === null ? s.d : Math.max(s.ceiling, s.d);
    if (s.d === 10) return { ...s, items, ceiling, consecutiveWrong: 0, done: true, reason: "topReached" };
    const next = { ...s, items, ceiling, consecutiveWrong: 0, d: clamp(s.d + 1) };
    return items >= s.maxItems ? { ...next, done: true, reason: "maxItems" } : next;
  }
  const inTeachingWindow = s.items < s.teachingItems;
  const consecutiveWrong = inTeachingWindow ? s.consecutiveWrong : s.consecutiveWrong + 1;
  if (consecutiveWrong >= 2) return { ...s, items, consecutiveWrong, done: true, reason: "twoWrong" };
  const next = { ...s, items, consecutiveWrong };
  return items >= s.maxItems ? { ...next, done: true, reason: "maxItems" } : next;
}
