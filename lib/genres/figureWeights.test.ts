import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../engine/types";
import { figureWeights, totalWeight, type FigureWeightsItem } from "./figureWeights";

function multisetKey(shapes: string[]): string {
  return [...shapes].sort().join(",");
}

/** Option count per band: 3 at d1 ("what is the same?" with just one distractor
 * pair), 4 from d2 up (see figureWeights.ts's per-tier comments / AGENTS.md
 * §5 "Balance ramp"). */
function expectedOptionCount(d: number): number {
  return d === 1 ? 3 : 4;
}

/** Scale count per band: d1-3 one scale (direct/mixed "what is the same"),
 * d4-7 exactly two scales (one shown equivalence + the question), d8-10
 * exactly three scales (two chained equivalences + the question). */
function expectedScaleCount(d: number): number {
  if (d <= 3) return 1;
  if (d <= 7) return 2;
  return 3;
}

describe("totalWeight", () => {
  it("sums weights for a multiset of shapes", () => {
    expect(totalWeight(["circle", "circle"], { circle: 3 })).toBe(6);
    expect(totalWeight(["circle", "square"], { circle: 3, square: 2 })).toBe(5);
  });

  it("returns 0 for an empty multiset", () => {
    expect(totalWeight([], { circle: 3 })).toBe(0);
  });

  it("treats a shape with no defined weight as 0", () => {
    expect(totalWeight(["circle"], {})).toBe(0);
  });
});

describe("figureWeights.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      const a = figureWeights.generate(12345, d);
      const b = figureWeights.generate(12345, d);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("produces a solvable item for every seed and difficulty (500 seeds x 10 difficulties)", () => {
    // Explicit timeout (matches visualPuzzles.test.ts's own heavy sweep):
    // this retry-heavy generator's 5000-item sweep runs comfortably under
    // 2s in isolation but can cross the 5000ms default under full-suite
    // parallel load (e.g. alongside fairness.test.ts's own genre-wide sweep).
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const item: FigureWeightsItem = figureWeights.generate(seed, d);

        // scale count matches this difficulty's band exactly
        expect(item.scales.length, `d${d}`).toBe(expectedScaleCount(d));

        // the last scale is the question scale: right pan is null
        const qScale = item.scales[item.scales.length - 1];
        expect(qScale.right).toBeNull();

        // every non-question ("balanced") scale has equal totals under item.weights
        for (const scale of item.scales.slice(0, -1)) {
          expect(scale.right).not.toBeNull();
          const leftTotal = totalWeight(scale.left, item.weights);
          const rightTotal = totalWeight(scale.right!, item.weights);
          expect(leftTotal).toBe(rightTotal);
        }

        // shape-type budget
        const shapesUsed = new Set(Object.keys(item.weights));
        expect(shapesUsed.size).toBeLessThanOrEqual(4);

        // pan / option size budget
        for (const scale of item.scales) {
          expect(scale.left.length).toBeLessThanOrEqual(4);
          expect(scale.left.length).toBeGreaterThanOrEqual(1);
          if (scale.right) expect(scale.right.length).toBeLessThanOrEqual(4);
        }
        for (const opt of item.options) {
          expect(opt.length).toBeLessThanOrEqual(4);
          expect(opt.length).toBeGreaterThanOrEqual(1);
        }

        // weights: distinct integers 1-6 per shape used
        const values = Object.values(item.weights) as number[];
        expect(new Set(values).size).toBe(values.length);
        for (const v of values) {
          expect(v).toBeGreaterThanOrEqual(1);
          expect(v).toBeLessThanOrEqual(6);
        }

        // option count matches this difficulty's band, all distinct as multisets
        const expectedCount = expectedOptionCount(d);
        expect(item.options.length, `d${d}`).toBe(expectedCount);
        const keys = item.options.map(multisetKey);
        expect(new Set(keys).size).toBe(expectedCount);

        // the answer option totals T; every other option does not
        const T = totalWeight(qScale.left, item.weights);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(expectedCount);
        item.options.forEach((opt, i) => {
          const total = totalWeight(opt, item.weights);
          if (i === item.answer) {
            expect(total).toBe(T);
          } else {
            expect(total).not.toBe(T);
          }
        });

        // at d >= 4 the correct option must differ in shape composition from the question's left pan
        if (d >= 4) {
          const correctSet = new Set(item.options[item.answer]);
          const qSet = new Set(qScale.left);
          const sameSet =
            correctSet.size === qSet.size && [...correctSet].every(s => qSet.has(s));
          expect(sameSet).toBe(false);
        }

        // at d <= 5 every option is built only from shapes that actually
        // appear somewhere on the scales — no foreign shape to fish with
        if (d <= 5) {
          const shapesOnScales = new Set(item.scales.flatMap(s => [...s.left, ...(s.right ?? [])]));
          for (const opt of item.options) {
            for (const s of opt) expect(shapesOnScales.has(s), `d${d}`).toBe(true);
          }
        }
      }
    }
  }, 30000);
});

describe("figureWeights.sample", () => {
  it("is one scale with 1 circle on the left, and the answer is 1 circle", () => {
    const { item, explanation } = figureWeights.sample();
    expect(item.scales.length).toBe(1);
    expect(item.scales[0].left).toEqual(["circle"]);
    expect(item.scales[0].right).toBeNull();
    expect(item.options[item.answer]).toEqual(["circle"]);
    expect(explanation).toBe(
      "One circle on one side needs one circle on the other side to balance. The same thing weighs the same."
    );
  });
});

describe("figureWeights.score", () => {
  it("awards 1 point for the correct option index", () => {
    const item = figureWeights.generate(1, 5);
    const result = figureWeights.score(item, item.answer);
    expect(result).toEqual({ points: 1, max: 1, correct: true });
  });

  it("awards 0 points for a wrong option index", () => {
    const item = figureWeights.generate(1, 5);
    const wrong = (item.answer + 1) % item.options.length;
    const result = figureWeights.score(item, wrong);
    expect(result).toEqual({ points: 0, max: 1, correct: false });
  });

  it("awards 0 points for a null response (timeout)", () => {
    const item = figureWeights.generate(1, 5);
    const result = figureWeights.score(item, null);
    expect(result).toEqual({ points: 0, max: 1, correct: false });
  });
});

describe("figureWeights genre metadata", () => {
  it("has the expected id, domain, mode, and timing", () => {
    expect(figureWeights.id).toBe("figureWeights");
    expect(figureWeights.domain).toBe("FR");
    expect(figureWeights.mode).toBe("staircase");
    expect(figureWeights.timing).toEqual({ kind: "item", ms: expect.any(Function) });
    // itemMs: 45s at d<=5, 30s at d>=6 (owner spec: 2026-08-23 Balance ramp)
    expect(figureWeights.timing.kind === "item" && figureWeights.timing.ms(5)).toBe(45000);
    expect(figureWeights.timing.kind === "item" && figureWeights.timing.ms(6)).toBe(30000);
  });
});
