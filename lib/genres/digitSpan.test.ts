import { describe, it, expect } from "vitest";
import { digitSpan, type DigitSpanItem } from "./digitSpan";
import { DIFFICULTIES } from "../engine/types";
const LEN: Record<number, number[]> = { 1: [2], 2: [3], 3: [4], 4: [2], 5: [3], 6: [4, 5], 7: [3], 8: [4, 5], 9: [6, 5], 10: [7, 6] };
describe("digitSpan", () => {
  it("is deterministic and obeys length/task rules for 500 seeds × 10 d", () => {
    for (const d of DIFFICULTIES) for (let seed = 0; seed < 500; seed++) {
      const a = digitSpan.generate(seed, d), b = digitSpan.generate(seed, d);
      expect(a).toEqual(b);
      expect(LEN[d]).toContain(a.digits.length);
      for (let i = 1; i < a.digits.length; i++) expect(a.digits[i]).not.toBe(a.digits[i - 1]);
      for (let i = 2; i < a.digits.length; i++) {
        const run = a.digits[i] - a.digits[i - 1] === a.digits[i - 1] - a.digits[i - 2] && Math.abs(a.digits[i] - a.digits[i - 1]) === 1;
        expect(run).toBe(false);
      }
      const exp = a.task === "forward" ? a.digits : a.task === "backward" ? [...a.digits].reverse() : [...a.digits].sort((x, y) => x - y);
      expect(a.expected).toEqual(exp);
    }
  });
  it("scores exact sequence only", () => {
    const it: DigitSpanItem = { digits: [4, 1, 7], task: "backward", expected: [7, 1, 4] };
    expect(digitSpan.score(it, [7, 1, 4]).points).toBe(1);
    expect(digitSpan.score(it, [4, 1, 7]).points).toBe(0);
    expect(digitSpan.score(it, null).correct).toBe(false);
  });
});
