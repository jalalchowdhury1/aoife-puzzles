// Fairness/validity guard for Pattern Train (owner decision #14: "validity is
// sacred"). Each rule below is one named `it(...)` stating the concrete bug
// it prevents. This file intentionally overlaps ../patternTrain.test.ts —
// that file pins the per-band CONTRACT (exact car counts, exact sequences);
// this file is the cross-cutting fairness sweep (500 seeds x 10 difficulties)
// that would catch a regression even if a specific band's shape changed.
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { patternTrain, figuresEqual } from "../patternTrain";
import type { Figure } from "../shapes";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: ReturnType<typeof patternTrain.generate> }
const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: patternTrain.generate(seed, d) });
}

function diffAttrs(a: Figure, b: Figure): (keyof Figure)[] {
  const attrs: (keyof Figure)[] = ["shape", "color", "size", "count", "rot", "dot"];
  return attrs.filter(attr => a[attr] !== b[attr]);
}

describe("Pattern Train — fairness rules", () => {
  it("generate(seed, d) is pure and deterministic — a reload mid-block, a replay, or re-fetching /api/state must never show a different train than the one that was actually scored", () => {
    const RESAMPLE = [1, 7, 42, 99, 250, 499];
    for (const d of DIFFICULTIES) {
      for (const seed of RESAMPLE) {
        expect(patternTrain.generate(seed, d), `d${d} seed${seed}`).toEqual(patternTrain.generate(seed, d));
      }
    }
  });

  it("every item has 5-7 total carriages (cars shown + the one missing) — the deliverable's global train-length budget", () => {
    for (const { item, seed, d } of ITEMS) {
      const total = item.cars.length + 1;
      expect(total, `seed${seed} d${d}`).toBeGreaterThanOrEqual(5);
      expect(total, `seed${seed} d${d}`).toBeLessThanOrEqual(7);
    }
  });

  it("exactly one option earns full credit per item — two full-credit answers would silently double her real odds of a 'correct' mark on the staircase", () => {
    for (const { item, seed, d } of ITEMS) {
      const fullCredit = item.options.filter((_, i) => patternTrain.score(item, i).correct).length;
      expect(fullCredit, `seed${seed} d${d}`).toBe(1);
    }
  });

  it("no two options are the same figure — a duplicate option makes two taps look identical while only one is credited", () => {
    for (const { item, seed, d } of ITEMS) {
      for (let i = 0; i < item.options.length; i++) {
        for (let j = i + 1; j < item.options.length; j++) {
          expect(figuresEqual(item.options[i], item.options[j]), `seed${seed} d${d} opt${i}/${j}`).toBe(false);
        }
      }
    }
  });

  it("no distractor is identical to a visible car — a distractor that already appeared on the track would look 'safe' for the wrong reason", () => {
    for (const { item, seed, d } of ITEMS) {
      const answerFigure = item.options[item.answer];
      item.options.forEach((opt, i) => {
        if (i === item.answer) return;
        for (const car of item.cars) expect(figuresEqual(car, opt), `seed${seed} d${d} opt${i}`).toBe(false);
        expect(figuresEqual(opt, answerFigure), `seed${seed} d${d} opt${i}`).toBe(false);
      });
    }
  });

  it("every distractor differs from the answer in exactly one attribute — two changed attributes at once is unsolvable for a child still isolating one variable", () => {
    for (const { item, seed, d } of ITEMS) {
      const answerFigure = item.options[item.answer];
      item.options.forEach((opt, i) => {
        if (i === item.answer) return;
        expect(diffAttrs(answerFigure, opt).length, `seed${seed} d${d} opt${i}`).toBe(1);
      });
    }
  });

  it("d1-4: distractors are only ever salient (shape or colour) — never a subtle count/size change a young child can't spot at a glance", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d > 4) continue;
      const answerFigure = item.options[item.answer];
      item.options.forEach((opt, i) => {
        if (i === item.answer) return;
        const diff = diffAttrs(answerFigure, opt)[0];
        expect(["shape", "color"], `seed${seed} d${d} opt${i}`).toContain(diff);
      });
    }
  });

  it("d<=6: size never drives a distractor on its own — size distractors are reserved for d>=7", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d > 6) continue;
      const answerFigure = item.options[item.answer];
      item.options.forEach((opt, i) => {
        if (i === item.answer) return;
        expect(diffAttrs(answerFigure, opt), `seed${seed} d${d} opt${i}`).not.toContain("size");
      });
    }
  });

  it("rotation is never used anywhere (always 0) — sidesteps the 'rotated non-triangle reads as unchanged' hazard entirely, at every difficulty", () => {
    for (const { item, seed, d } of ITEMS) {
      for (const f of [...item.cars, ...item.options]) {
        expect(f.rot, `seed${seed} d${d}`).toBe(0);
      }
    }
  });

  it("dot is never used anywhere (always false) — not part of this genre's rule vocabulary at any difficulty", () => {
    for (const { item, seed, d } of ITEMS) {
      for (const f of [...item.cars, ...item.options]) {
        expect(f.dot, `seed${seed} d${d}`).toBe(false);
      }
    }
  });

  it("count never exceeds 4 and never drops below 1 anywhere on the track — a Figure literally cannot represent a 5th copy or a 0-count", () => {
    for (const { item, seed, d } of ITEMS) {
      for (const f of [...item.cars, ...item.options]) {
        expect(f.count, `seed${seed} d${d}`).toBeGreaterThanOrEqual(1);
        expect(f.count, `seed${seed} d${d}`).toBeLessThanOrEqual(4);
      }
    }
  });

  it("d5, d6, d9 (the count-growth bands): the shown count sequence never decreases and never wraps back to a small value after reaching the top — 'grows, then holds' only, never 'grows, then resets'", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 5 && d !== 6 && d !== 9) continue;
      const counts = item.cars.map(c => c.count);
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i], `seed${seed} d${d}`).toBeGreaterThanOrEqual(counts[i - 1]);
      }
      // the true next value (the credited answer) is never a wrap back down
      // to something smaller than the last shown car -- it only ever holds
      // at the max or takes the one legal next step up.
      const answerCount = item.options[item.answer].count;
      const lastShown = counts[counts.length - 1];
      expect(answerCount, `seed${seed} d${d}`).toBeGreaterThanOrEqual(lastShown);
    }
  });

  it("d1-4, d7, d8, d10 (the categorical-cycle bands): the active colour/shape attribute repeats a value among the shown cars — proof it is a repeating cycle, not an unguessable one-way 'progression' with no natural order", () => {
    for (const { item, seed, d } of ITEMS) {
      if (![1, 2, 3, 4, 7, 8, 10].includes(d)) continue;
      const colors = item.cars.map(c => c.color);
      const shapes = item.cars.map(c => c.shape);
      const colorRepeats = new Set(colors).size < colors.length;
      const shapeRepeats = new Set(shapes).size < shapes.length;
      expect(colorRepeats || shapeRepeats, `seed${seed} d${d}`).toBe(true);
    }
  });

  it("sample() — the untimed, feedback-free item every block opens with — scores correct when answered with its own displayed answer", () => {
    const { item } = patternTrain.sample();
    expect(patternTrain.score(item, item.answer).correct).toBe(true);
  });
});
