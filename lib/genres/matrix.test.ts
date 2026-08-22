import { describe, it, expect } from "vitest";
import { matrix } from "./matrix";
import type { Figure } from "./matrix";
import { DIFFICULTIES } from "../engine/types";

const SEEDS = Array.from({ length: 500 }, (_, i) => i * 97 + 1);
const ATTRS: (keyof Figure)[] = ["shape", "color", "size", "count", "rot", "dot"];

function fig(v: unknown): string {
  return JSON.stringify(v);
}

/** All attrs that differ between two figures. */
function diffAttrs(a: Figure, b: Figure): (keyof Figure)[] {
  return ATTRS.filter(attr => a[attr] !== b[attr]);
}

/** The full set of Figures an item shows: every visible cell plus every option (answer + distractors). */
function allFigures(item: ReturnType<typeof matrix.generate>): Figure[] {
  const visible = item.cells.filter((c): c is Figure => c !== null);
  return [...visible, ...item.options];
}

describe("matrix genre", () => {
  it("id/domain/mode match the registry contract", () => {
    expect(matrix.id).toBe("matrix");
    expect(matrix.domain).toBe("FR");
    expect(matrix.mode).toBe("staircase");
  });

  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 25)) {
        const a = matrix.generate(seed, d);
        const b = matrix.generate(seed, d);
        expect(b).toEqual(a);
      }
    }
  });

  it("produces a well-formed item for every seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);

        const expectedLen = item.form === "series" ? 5 : item.rows * item.rows;
        expect(item.cells.length).toBe(expectedLen);

        const nullCells = item.cells.filter(c => c === null);
        expect(nullCells.length).toBe(1);
        expect(item.cells[item.cells.length - 1]).toBeNull();

        expect(item.options.length).toBe(5);
        expect(new Set(item.options.map(fig)).size).toBe(5);

        expect(Number.isInteger(item.answer)).toBe(true);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(5);

        // distractors never duplicate a still-visible cell (the correct answer may
        // legitimately match a row/column-mate, e.g. "same shape per row").
        const visible = item.cells.filter((c): c is Figure => c !== null);
        const visibleSet = new Set(visible.map(fig));
        item.options.forEach((opt, i) => {
          if (i === item.answer) return;
          expect(visibleSet.has(fig(opt))).toBe(false);
        });

        if (d >= 4) expect(item.rows).toBe(3);
        else if (item.form === "matrix") expect(item.rows).toBe(2);
      }
    }
  });

  it("d1-2 is always the 2x2 matrix form (no series — she's only ever seen a 2x2 sample)", () => {
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        expect(item.form).toBe("matrix");
        expect(item.rows).toBe(2);
      }
    }
  });

  it("d1-2: every figure (visible cells + answer) is count:1, rot:0, dot:false", () => {
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        for (const f of allFigures(item)) {
          expect(f.count).toBe(1);
          expect(f.rot).toBe(0);
          expect(f.dot).toBe(false);
        }
      }
    }
  });

  it("d1-2: exactly one attribute (shape or color) varies row to row, everything else constant", () => {
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);

        const full = [...item.cells];
        full[3] = item.options[item.answer];
        const row0 = full.slice(0, 2) as Figure[];
        const row1 = full.slice(2, 4) as Figure[];

        for (const attr of ATTRS) {
          expect(row0[0][attr]).toBe(row0[1][attr]);
          expect(row1[0][attr]).toBe(row1[1][attr]);
        }
        const varying = ATTRS.filter(attr => row0[0][attr] !== row1[0][attr]);
        expect(varying.length).toBe(1);
        expect(["shape", "color"]).toContain(varying[0]);
      }
    }
  });

  it("d1-2: every distractor differs from the answer by shape or color only", () => {
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        const answerFigure = item.options[item.answer];
        item.options.forEach((opt, i) => {
          if (i === item.answer) return;
          const diff = diffAttrs(answerFigure, opt);
          expect(diff.length).toBeGreaterThanOrEqual(1);
          for (const attr of diff) expect(["shape", "color"]).toContain(attr);
        });
      }
    }
  });

  it("d3-4 matrix form: the progressing attribute is count (contiguous run within 1-3) or size (S/L only, never M); everything else is grid-constant", () => {
    for (const d of [3, 4] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        if (item.form !== "matrix") continue;

        const full = [...item.cells];
        full[full.length - 1] = item.options[item.answer];
        const grid = full as Figure[];

        for (const attr of ["shape", "color", "rot", "dot"] as const) {
          const values = new Set(grid.map(f => f[attr]));
          expect(values.size).toBe(1);
        }
        expect(grid.every(f => f.rot === 0)).toBe(true);
        expect(grid.every(f => f.dot === false)).toBe(true);

        const sizeValues = new Set(grid.map(f => f.size));
        const countValues = new Set(grid.map(f => f.count));
        // Exactly one of {size, count} varies across the grid (the "progressing" attribute).
        const sizeVaries = sizeValues.size > 1;
        const countVaries = countValues.size > 1;
        expect(sizeVaries && countVaries).toBe(false);
        expect(sizeVaries || countVaries).toBe(true);

        if (sizeVaries) {
          for (const v of sizeValues) expect(["S", "L"]).toContain(v);
        }
        if (countVaries) {
          for (const v of countValues) expect([1, 2, 3]).toContain(v);
        }
      }
    }
  });

  it("d3-4 series form (when it appears) is a clean 2-value alternation A B A B ?, never a 3-cycle", () => {
    let sawSeries = false;
    for (const d of [3, 4] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        if (item.form !== "series") continue;
        sawSeries = true;

        const visible = item.cells.slice(0, 4) as Figure[];
        const answerFigure = item.options[item.answer];
        const five = [...visible, answerFigure];

        // A B A B A: positions 0/2/4 identical, 1/3 identical, and the two groups differ.
        for (const attr of ATTRS) {
          expect(five[0][attr]).toBe(five[2][attr]);
          expect(five[2][attr]).toBe(five[4][attr]);
          expect(five[1][attr]).toBe(five[3][attr]);
        }
        const varying = ATTRS.filter(attr => five[0][attr] !== five[1][attr]);
        expect(varying.length).toBe(1);
        expect(varying[0]).not.toBe("rot"); // rotation never drives a d3-4 series
        if (varying[0] === "size") {
          expect([five[0].size, five[1].size].sort()).toEqual(["L", "S"]);
        }
        if (varying[0] === "count") {
          expect([five[0].count, five[1].count]).not.toContain(4);
        }
      }
    }
    expect(sawSeries).toBe(true); // the 500-seed sweep should have hit series form at least once
  });

  it("rotation is only ever applied to a triangle, and only from d>=5", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        for (const f of allFigures(item)) {
          if (d < 5) {
            expect(f.rot).toBe(0);
          } else if (f.rot !== 0) {
            expect(f.shape).toBe("triangle");
          }
        }
      }
    }
  });

  it("dot is only ever true from d>=6", () => {
    for (const d of DIFFICULTIES) {
      if (d >= 6) continue;
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        for (const f of allFigures(item)) {
          expect(f.dot).toBe(false);
        }
      }
    }
  });

  it("size distractors at d<=6 differ from the answer by a full 2 steps (S vs L), never landing on M or adjacent", () => {
    for (const d of DIFFICULTIES) {
      if (d > 6) continue;
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        const answerFigure = item.options[item.answer];
        for (const opt of item.options) {
          if (opt.size === answerFigure.size) continue;
          expect([answerFigure.size, opt.size].sort()).toEqual(["L", "S"]);
        }
      }
    }
  });

  it("distractor salience at d<=4: each distractor differs from the answer in exactly one of shape/color/count", () => {
    for (const d of [1, 2, 3, 4] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        const answerFigure = item.options[item.answer];
        item.options.forEach((opt, i) => {
          if (i === item.answer) return;
          const diff = diffAttrs(answerFigure, opt);
          expect(diff.length).toBe(1);
          expect(["shape", "color", "count"]).toContain(diff[0]);
        });
      }
    }
  });

  it("d9-10 matrix items contain at least 2 Latin-square (dist3) attributes", () => {
    const candidateAttrs: (keyof Figure)[] = ["shape", "color", "size", "count", "rot"];
    for (const d of [9, 10] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        expect(item.form).toBe("matrix");
        expect(item.rows).toBe(3);

        const grid = [...item.cells];
        grid[8] = item.options[item.answer];
        const g = grid as Figure[];

        let latinCount = 0;
        for (const attr of candidateAttrs) {
          let ok = true;
          for (let r = 0; r < 3 && ok; r++) {
            const row = [g[r * 3][attr], g[r * 3 + 1][attr], g[r * 3 + 2][attr]];
            if (new Set(row).size !== 3) ok = false;
          }
          for (let c = 0; c < 3 && ok; c++) {
            const col = [g[c][attr], g[c + 3][attr], g[c + 6][attr]];
            if (new Set(col).size !== 3) ok = false;
          }
          if (ok) latinCount++;
        }
        expect(latinCount).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("series form is disabled at d1-2, allowed from d3 through d6 at <=30% of seeds, and off again at d>=7", () => {
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        expect(matrix.generate(seed, d).form).toBe("matrix");
      }
    }

    for (const d of [3, 4, 5, 6] as const) {
      let seriesCount = 0;
      for (const seed of SEEDS) {
        if (matrix.generate(seed, d).form === "series") seriesCount++;
      }
      expect(seriesCount).toBeGreaterThan(100);
      expect(seriesCount).toBeLessThan(220);
    }

    for (const d of [7, 8, 9, 10] as const) {
      for (const seed of SEEDS) {
        expect(matrix.generate(seed, d).form).toBe("matrix");
      }
    }
  });

  it("scores 1 for the correct index, 0 for a wrong or missing response", () => {
    const item = matrix.generate(1, 1);
    expect(matrix.score(item, item.answer)).toEqual({ points: 1, max: 1, correct: true });
    const wrong = (item.answer + 1) % 5;
    expect(matrix.score(item, wrong)).toEqual({ points: 0, max: 1, correct: false });
    expect(matrix.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("sample() is a 2x2 matrix whose missing cell is a blue square, matching the explanation and the d1-2 rules", () => {
    const { item, explanation } = matrix.sample();
    expect(item.form).toBe("matrix");
    expect(item.rows).toBe(2);
    expect(item.cells.length).toBe(4);
    expect(item.cells[3]).toBeNull();
    expect(item.options.length).toBe(5);
    expect(new Set(item.options.map(fig)).size).toBe(5);

    const answerFigure = item.options[item.answer];
    expect(answerFigure.shape).toBe("square");
    expect(explanation.toLowerCase()).toContain("square");
    expect(explanation.length).toBeGreaterThan(0);

    for (const f of allFigures(item)) {
      expect(f.count).toBe(1);
      expect(f.rot).toBe(0);
      expect(f.dot).toBe(false);
    }
    item.options.forEach((opt, i) => {
      if (i === item.answer) return;
      const diff = diffAttrs(answerFigure, opt);
      expect(diff.length).toBeGreaterThanOrEqual(1);
      for (const attr of diff) expect(["shape", "color"]).toContain(attr);
    });
  });
});
