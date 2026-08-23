import { describe, it, expect } from "vitest";
import { fireflyBoxes, GRID_SIZE, EXPOSURE_ON_MS } from "./fireflyBoxes";
import type { FireflyBoxesItem } from "./fireflyBoxes";
import { DIFFICULTIES } from "../engine/types";
import type { BaseDifficulty } from "../engine/types";

// Mirrors the spec's task/length table, kept independent of the
// implementation so the test actually pins the contract.
const PLAN: Record<BaseDifficulty, { task: "same" | "backward"; len: number }> = {
  1: { task: "same", len: 1 },
  2: { task: "same", len: 2 },
  3: { task: "same", len: 3 },
  4: { task: "same", len: 4 },
  5: { task: "same", len: 5 },
  6: { task: "same", len: 6 },
  7: { task: "backward", len: 2 },
  8: { task: "backward", len: 3 },
  9: { task: "backward", len: 4 },
  10: { task: "backward", len: 5 },
};

describe("fireflyBoxes metadata", () => {
  it("matches the WM staircase contract", () => {
    expect(fireflyBoxes.id).toBe("fireflyBoxes");
    expect(fireflyBoxes.domain).toBe("WM");
    expect(fireflyBoxes.mode).toBe("staircase");
    expect(fireflyBoxes.timing.kind).toBe("none");
    expect(fireflyBoxes.e2e).toEqual({ kind: "sequence", taps: 1 });
  });
});

describe("fireflyBoxes.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = fireflyBoxes.generate(seed, d);
        const b = fireflyBoxes.generate(seed, d);
        expect(b).toEqual(a);
      }
    }
  });

  it("satisfies the task/length/shape contract for every seed and difficulty", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const item = fireflyBoxes.generate(seed, d);
        const plan = PLAN[d as BaseDifficulty];

        expect(item.task).toBe(plan.task);
        expect(item.sequence.length).toBe(plan.len);
        expect(item.exposureOnMs).toBe(EXPOSURE_ON_MS);

        for (const cell of item.sequence) {
          expect(cell).toBeGreaterThanOrEqual(0);
          expect(cell).toBeLessThan(GRID_SIZE);
          expect(Number.isInteger(cell)).toBe(true);
        }

        // Every cell used at most once (stronger than "no immediate repeats" —
        // see fireflyBoxes.ts's comment on why full distinctness was chosen).
        expect(new Set(item.sequence).size).toBe(item.sequence.length);

        const expected = plan.task === "same" ? item.sequence : [...item.sequence].reverse();
        expect(item.expected).toEqual(expected);
      }
    }
  });
});

describe("fireflyBoxes.score", () => {
  const sameItem: FireflyBoxesItem = { sequence: [1, 4, 7], task: "same", expected: [1, 4, 7], exposureOnMs: 600 };
  const backwardItem: FireflyBoxesItem = { sequence: [1, 4, 7], task: "backward", expected: [7, 4, 1], exposureOnMs: 600 };

  it("awards 2 for the exact order (same task)", () => {
    expect(fireflyBoxes.score(sameItem, [1, 4, 7])).toEqual({ points: 2, max: 2, correct: true });
  });

  it("awards 1 for the right set in the wrong order", () => {
    expect(fireflyBoxes.score(sameItem, [4, 1, 7])).toEqual({ points: 1, max: 2, correct: true });
  });

  it("awards 0 for a wrong cell", () => {
    expect(fireflyBoxes.score(sameItem, [1, 4, 8])).toEqual({ points: 0, max: 2, correct: false });
  });

  it("awards 0 for the wrong number of taps", () => {
    expect(fireflyBoxes.score(sameItem, [1, 4])).toEqual({ points: 0, max: 2, correct: false });
  });

  it("awards 0 for a null or empty response", () => {
    expect(fireflyBoxes.score(sameItem, null)).toEqual({ points: 0, max: 2, correct: false });
    expect(fireflyBoxes.score(sameItem, [])).toEqual({ points: 0, max: 2, correct: false });
  });

  it("scores backward against the reversed expected order, not the shown order", () => {
    expect(fireflyBoxes.score(backwardItem, [7, 4, 1])).toEqual({ points: 2, max: 2, correct: true });
    expect(fireflyBoxes.score(backwardItem, [1, 4, 7])).toEqual({ points: 1, max: 2, correct: true }); // right set, wrong (forward) order
  });

  it("scores a single-box span correctly", () => {
    const one: FireflyBoxesItem = { sequence: [5], task: "same", expected: [5], exposureOnMs: 600 };
    expect(fireflyBoxes.score(one, [5])).toEqual({ points: 2, max: 2, correct: true });
    expect(fireflyBoxes.score(one, [3])).toEqual({ points: 0, max: 2, correct: false });
  });
});

describe("fireflyBoxes.sample", () => {
  it("shows 2 boxes, same-order task, tapped back in that order", () => {
    const { item, explanation } = fireflyBoxes.sample();
    expect(item.task).toBe("same");
    expect(item.sequence).toEqual(item.expected);
    expect(item.sequence.length).toBe(2);
    expect(explanation).toBe("The firefly went here, then here. Tap them in the same order.");
  });
});
