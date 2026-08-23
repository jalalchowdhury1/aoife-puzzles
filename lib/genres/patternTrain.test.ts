import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty, type BaseDifficulty } from "../engine/types";
import { patternTrain, figuresEqual, audit, type PatternTrainItem } from "./patternTrain";
import type { Figure } from "./shapes";

// Total carriages (shown cars + 1 missing) per band — the exact contract each
// buildDN in patternTrain.ts implements. Kept independent of the
// implementation so this test actually pins the shape of the deliverable.
const TOTAL_CARS: Record<BaseDifficulty, number> = {
  1: 5, 2: 5, 3: 6, 4: 6, 5: 5, 6: 5, 7: 7, 8: 6, 9: 7, 10: 7,
};

function diffAttrs(a: Figure, b: Figure): string[] {
  const attrs: (keyof Figure)[] = ["shape", "color", "size", "count"];
  return attrs.filter(attr => a[attr] !== b[attr]);
}

/** Attributes a distractor is allowed to differ on, by band (mirrors the
 * deliverable's fairness rule: shape/colour only through d4, count joins at
 * d5-6, size only from d7 up — never a size-only distractor at d<=6). */
function eligibleDistractorAttrs(d: Difficulty): string[] {
  if (d <= 4) return ["shape", "color"];
  if (d <= 6) return ["shape", "color", "count"];
  return ["shape", "color", "count", "size"];
}

describe("patternTrain metadata", () => {
  it("matches the FR untimed staircase contract", () => {
    expect(patternTrain.id).toBe("patternTrain");
    expect(patternTrain.domain).toBe("FR");
    expect(patternTrain.mode).toBe("staircase");
    expect(patternTrain.timing).toEqual({ kind: "none" });
  });
});

describe("patternTrain.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = patternTrain.generate(seed, d);
        const b = patternTrain.generate(seed, d);
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      }
    }
  });

  it("produces a solvable, well-formed item for every seed and difficulty (500 seeds x 10 difficulties)", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const item = patternTrain.generate(seed, d);

        // --- shape contract ---
        expect(item.cars.length, `d${d}`).toBe(TOTAL_CARS[d as BaseDifficulty] - 1);
        expect(item.options.length, `d${d}`).toBe(4);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(4);
        expect(typeof item.rule).toBe("string");
        expect(item.rule.length).toBeGreaterThan(0);

        // rot/dot are never used anywhere in this genre
        for (const f of [...item.cars, ...item.options]) {
          expect(f.rot, `seed${seed} d${d}`).toBe(0);
          expect(f.dot, `seed${seed} d${d}`).toBe(false);
        }

        // all 4 options are pairwise distinct
        for (let i = 0; i < item.options.length; i++) {
          for (let j = i + 1; j < item.options.length; j++) {
            expect(figuresEqual(item.options[i], item.options[j]), `seed${seed} d${d} opt${i} vs opt${j}`).toBe(false);
          }
        }

        // exactly one option scores full credit (score() is the literal contract)
        const fullCredit = item.options.filter((_, i) => patternTrain.score(item, i).correct).length;
        expect(fullCredit, `seed${seed} d${d}`).toBe(1);

        const answerFigure = item.options[item.answer];

        // every distractor differs from the answer by exactly one attribute,
        // drawn only from this band's eligible set
        const eligible = eligibleDistractorAttrs(d);
        item.options.forEach((opt, i) => {
          if (i === item.answer) return;
          const diff = diffAttrs(answerFigure, opt);
          expect(diff.length, `seed${seed} d${d} opt${i}`).toBe(1);
          expect(eligible, `seed${seed} d${d} opt${i}`).toContain(diff[0]);
        });

        // no distractor equals any visible car (a distractor that matches an
        // earlier carriage exactly would be a legitimate-looking duplicate)
        item.options.forEach((opt, i) => {
          if (i === item.answer) return;
          for (const car of item.cars) {
            expect(figuresEqual(car, opt), `seed${seed} d${d} opt${i}`).toBe(false);
          }
        });
      }
    }
  }, 30000);

  it("d1: colours alternate ABAB over 5 cars, shape constant, answer continues the cycle", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 1);
      const shapes = new Set(item.cars.map(c => c.shape));
      expect(shapes.size, `seed${seed}`).toBe(1);
      const [c0, c1, c2, c3] = item.cars;
      expect(c2.color).toBe(c0.color);
      expect(c3.color).toBe(c1.color);
      expect(c0.color).not.toBe(c1.color);
      const answer = item.options[item.answer];
      expect(answer.color).toBe(c0.color); // position 5 (index 4) continues the A,B,A,B,A cycle
      expect(answer.shape).toBe(c0.shape);
    }
  });

  it("d2: shapes alternate ABAB over 5 cars, colour constant, answer continues the cycle", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 2);
      const colors = new Set(item.cars.map(c => c.color));
      expect(colors.size, `seed${seed}`).toBe(1);
      const [c0, c1, c2, c3] = item.cars;
      expect(c2.shape).toBe(c0.shape);
      expect(c3.shape).toBe(c1.shape);
      expect(c0.shape).not.toBe(c1.shape);
      const answer = item.options[item.answer];
      expect(answer.shape).toBe(c0.shape);
      expect(answer.color).toBe(c0.color);
    }
  });

  it("d3: AAB AAB over 6 cars on exactly one of colour/shape, the other pinned constant", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 3);
      const colors = new Set(item.cars.map(c => c.color));
      const shapes = new Set(item.cars.map(c => c.shape));
      // exactly one attribute varies
      expect([colors.size, shapes.size].filter(n => n > 1).length, `seed${seed}`).toBe(1);
      const activeIsColor = colors.size > 1;
      const values = item.cars.map(c => (activeIsColor ? c.color : c.shape));
      expect(values).toEqual([values[0], values[0], values[2], values[0], values[0]]);
      const answer = item.options[item.answer];
      const answerValue = activeIsColor ? answer.color : answer.shape;
      expect(answerValue).toBe(values[2]); // AAB AAB: position 6 (index 5) is the "B" slot, same as position 3
    }
  });

  it("d4: ABC ABC over 6 cars on exactly one of colour/shape, the other pinned constant", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 4);
      const colors = new Set(item.cars.map(c => c.color));
      const shapes = new Set(item.cars.map(c => c.shape));
      expect([colors.size, shapes.size].filter(n => n > 1).length, `seed${seed}`).toBe(1);
      const activeIsColor = colors.size > 1;
      const values = item.cars.map(c => (activeIsColor ? c.color : c.shape));
      expect(new Set(values).size).toBe(3);
      expect(values).toEqual([values[0], values[1], values[2], values[0], values[1]]);
      const answer = item.options[item.answer];
      const answerValue = activeIsColor ? answer.color : answer.shape;
      expect(answerValue).toBe(values[2]); // ABC ABC: position 6 (index 5) is "C" again
    }
  });

  it("d5: count grows 1,2,3,4 and holds at 4 (never wraps, never exceeds 4)", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 5);
      expect(item.cars.map(c => c.count)).toEqual([1, 2, 3, 4]);
      const shapes = new Set(item.cars.map(c => c.shape));
      const colors = new Set(item.cars.map(c => c.color));
      expect(shapes.size).toBe(1);
      expect(colors.size).toBe(1);
      const answer = item.options[item.answer];
      expect(answer.count).toBe(4);
    }
  });

  it("d6: colour ABAB and count-growth run together on the same 5 cars", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 6);
      expect(item.cars.map(c => c.count)).toEqual([1, 2, 3, 4]);
      const [c0, c1, c2, c3] = item.cars;
      expect(c2.color).toBe(c0.color);
      expect(c3.color).toBe(c1.color);
      expect(c0.color).not.toBe(c1.color);
      const shapes = new Set(item.cars.map(c => c.shape));
      expect(shapes.size).toBe(1);
      const answer = item.options[item.answer];
      expect(answer.count).toBe(4);
      expect(answer.color).toBe(c0.color); // position 5 (index 4, even) continues the colour cycle at "A"
    }
  });

  it("d7: ABCD ABCD over 7 cars on exactly one of colour/shape, the other pinned constant", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 7);
      const colors = new Set(item.cars.map(c => c.color));
      const shapes = new Set(item.cars.map(c => c.shape));
      expect([colors.size, shapes.size].filter(n => n > 1).length, `seed${seed}`).toBe(1);
      const activeIsColor = colors.size > 1;
      const values = item.cars.map(c => (activeIsColor ? c.color : c.shape));
      expect(new Set(values).size).toBe(4);
      expect(values).toEqual([values[0], values[1], values[2], values[3], values[0], values[1]]);
      const answer = item.options[item.answer];
      const answerValue = activeIsColor ? answer.color : answer.shape;
      expect(answerValue).toBe(values[2]); // position 7 (index 6) = pool[6 % 4] = pool[2]
    }
  });

  it("d8: colour cycles ABC while shape alternates AB, both on the same 6 cars", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 8);
      const colors = item.cars.map(c => c.color);
      const shapes = item.cars.map(c => c.shape);
      expect(new Set(colors).size).toBe(3);
      expect(new Set(shapes).size).toBe(2);
      expect(colors).toEqual([colors[0], colors[1], colors[2], colors[0], colors[1]]);
      expect(shapes).toEqual([shapes[0], shapes[1], shapes[0], shapes[1], shapes[0]]);
      const answer = item.options[item.answer];
      expect(answer.color).toBe(colors[2]); // position 6 (index 5) -> colorPool[5 % 3] = colorPool[2]
      expect(answer.shape).toBe(shapes[1]); // position 6 (index 5) -> shapePool[5 % 2] = shapePool[1]
    }
  });

  it("d9: count grows in pairs 1,1,2,2,3,3 and the answer is 4 (never wraps)", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 9);
      expect(item.cars.map(c => c.count)).toEqual([1, 1, 2, 2, 3, 3]);
      const answer = item.options[item.answer];
      expect(answer.count).toBe(4);
    }
  });

  it("d10: colour chain (cars 1,3,5) and shape chain (cars 2,4,6) interleave; the answer continues the colour chain", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = patternTrain.generate(seed, 10);
      const [c1, c2, c3, c4, c5, c6] = item.cars;
      // colour chain: cars 1,3,5 alternate A,B,A; shape is pinned (filler) throughout that chain
      expect(c5.color).toBe(c1.color);
      expect(c3.color).not.toBe(c1.color);
      expect(c1.shape).toBe(c3.shape);
      expect(c3.shape).toBe(c5.shape);
      // shape chain: cars 2,4,6 alternate A,B,A; colour is pinned (filler) throughout that chain
      expect(c6.shape).toBe(c2.shape);
      expect(c4.shape).not.toBe(c2.shape);
      expect(c2.color).toBe(c4.color);
      expect(c4.color).toBe(c6.color);
      // car 7 (the missing one) is an odd car, so it continues the COLOUR chain: A,B,A,? -> B
      const answer = item.options[item.answer];
      expect(answer.color).toBe(c3.color);
      expect(answer.shape).toBe(c1.shape); // the colour chain's pinned filler shape
    }
  });
});

describe("patternTrain.sample", () => {
  it("shows red, blue, red, blue and explains that red comes next", () => {
    const { item, explanation } = patternTrain.sample();
    expect(item.cars.map(c => c.color)).toEqual(["#f06b7a", "#8cc9ff", "#f06b7a", "#8cc9ff"]);
    expect(item.options[item.answer].color).toBe("#f06b7a");
    expect(explanation).toBe("The colours take turns. Red, blue, red, blue. So red comes next.");
  });

  it("scores correct when answered with its own displayed answer", () => {
    const { item } = patternTrain.sample();
    expect(patternTrain.score(item, item.answer).correct).toBe(true);
  });
});

describe("patternTrain.score", () => {
  it("awards 1 point for the correct index and 0 for any other", () => {
    const item = patternTrain.generate(1, 5);
    expect(patternTrain.score(item, item.answer)).toEqual({ points: 1, max: 1, correct: true });
    for (let i = 0; i < 4; i++) {
      if (i === item.answer) continue;
      expect(patternTrain.score(item, i)).toEqual({ points: 0, max: 1, correct: false });
    }
  });

  it("awards 0 points for a null response (timeout)", () => {
    const item = patternTrain.generate(1, 5);
    expect(patternTrain.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });
});

describe("patternTrain audit", () => {
  it("returns self-contained HTML with the correct option marked", () => {
    const item: PatternTrainItem = patternTrain.generate(7, 3);
    const html = audit(item);
    expect(html).toContain("pt-audit");
    expect(html).toContain("correct");
    expect(html).toContain("<svg");
  });
});
