import { makeRng } from "../engine/rng";
import { clampToBase } from "../engine/types";
import type { Genre, BaseDifficulty } from "../engine/types";

export type SpanTask = "forward" | "backward" | "sequencing";
export interface DigitSpanItem { digits: number[]; task: SpanTask; expected: number[] }

const PLAN: Record<BaseDifficulty, [SpanTask, number][]> = {
  1: [["forward", 2]], 2: [["forward", 3]], 3: [["forward", 4]], 4: [["backward", 2]], 5: [["backward", 3]],
  6: [["backward", 4], ["forward", 5]], 7: [["sequencing", 3]], 8: [["sequencing", 4], ["backward", 5]],
  9: [["forward", 6], ["sequencing", 5]], 10: [["forward", 7], ["backward", 6]],
};

function expectedFor(digits: number[], task: SpanTask) {
  return task === "forward" ? [...digits] : task === "backward" ? [...digits].reverse() : [...digits].sort((a, b) => a - b);
}

export const digitSpan: Genre<DigitSpanItem, number[]> = {
  id: "digitSpan", subtest: "Digit Span", domain: "WM", kidTitle: "Number Echo",
  instructions: "I will say some numbers. Listen carefully. When I finish, tap the numbers in the order I ask for.",
  sample: () => ({ item: { digits: [5, 2], task: "forward", expected: [5, 2] }, explanation: "I said 5, then 2. So you tap 5, then 2. Same order." }),
  generate(seed, d) {
    const d0 = clampToBase(d);   // this genre's own ramp is 1-10 only
    const r = makeRng(seed * 13 + d0);
    const [task, len] = PLAN[d0][seed % PLAN[d0].length];
    const digits: number[] = [];
    while (digits.length < len) {
      const n = r.int(1, 9);
      if (digits.length && n === digits[digits.length - 1]) continue;
      if (digits.length >= 2) {
        const a = digits[digits.length - 2], b = digits[digits.length - 1];
        if (Math.abs(b - a) === 1 && n - b === b - a) continue;
      }
      digits.push(n);
    }
    if (task === "sequencing" && expectedFor(digits, "sequencing").every((v, i) => v === digits[i])) return this.generate(seed + 1000, d);
    return { digits, task, expected: expectedFor(digits, task) };
  },
  score(item, response) {
    const ok = !!response && response.length === item.expected.length && response.every((v, i) => v === item.expected[i]);
    return { points: ok ? 1 : 0, max: 1, correct: ok };
  },
  timing: { kind: "none" }, mode: "staircase",
};
