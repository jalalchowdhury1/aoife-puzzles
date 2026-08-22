import { describe, it, expect } from "vitest";
import { matrix, planFor } from "./matrix";
import type { Figure } from "./matrix";
import { DIFFICULTIES } from "../engine/types";
import { COLORS, SHAPES } from "./shapes";

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

/**
 * True iff `indices` are all different AND consecutive ones satisfy
 * index_{k+1} = index_k + 1 (mod len) — i.e. a genuine "step through the
 * list, wrapping" progression, the pattern only const/constRow/constCol/
 * dist3 may leave behind on colour or shape (2026-08-22 fix). A period-2
 * alternation (A B A B ...) does NOT satisfy this for any list length > 2
 * used here, so it never false-flags the still-allowed alternating rules.
 */
function isWrapProgression(indices: number[], len: number): boolean {
  if (new Set(indices).size !== indices.length) return false;
  for (let i = 1; i < indices.length; i++) {
    if ((indices[i - 1] + 1) % len !== indices[i]) return false;
  }
  return true;
}

const COLOR_SHAPE_CHECKS: [attr: "color" | "shape", list: readonly string[]][] = [
  ["color", COLORS],
  ["shape", SHAPES],
];

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

  it("matrix-form rule plans never assign the progressing (stepping) rule to colour or shape", () => {
    // Colour and shape have no natural order, so a "progressRow" step
    // through either is unguessable — real Matrix Reasoning only ever
    // progresses size, count, or rotation. Checked directly against the
    // RulePlan `generate` used, via the test-only `planFor` window.
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const plan = planFor(seed, d);
        if (plan.form !== "matrix") continue;
        expect(plan.kinds.color).not.toBe("progressRow");
        expect(plan.kinds.shape).not.toBe("progressRow");
      }
    }
  });

  it("matrix-form items: colour/shape never show a row-wise list-order wrap progression unless the same pattern also holds column-wise (Latin square)", () => {
    // Behavioral cross-check of the same rule, reconstructed from the
    // rendered grid rather than the plan: a row is a "wrap progression" if
    // its values are all different AND index_{k+1} = index_k + 1 (mod n).
    // That's exactly what an unguarded progressRow on colour/shape used to
    // produce (2026-08-22 bug). It's fine for a Latin square (dist3), which
    // is why the same check must also hold column-wise before this fails.
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        if (item.form !== "matrix") continue;

        const full = [...item.cells];
        full[full.length - 1] = item.options[item.answer];
        const grid = full as Figure[];
        const n = item.rows;

        for (const [attr, list] of COLOR_SHAPE_CHECKS) {
          for (let r = 0; r < n; r++) {
            const rowIdx = Array.from({ length: n }, (_, c) => list.indexOf(grid[r * n + c][attr]));
            if (!isWrapProgression(rowIdx, list.length)) continue;
            for (let c = 0; c < n; c++) {
              const colVals = Array.from({ length: n }, (_, rr) => grid[rr * n + c][attr]);
              expect(new Set(colVals).size).toBe(n);
            }
          }
        }
      }
    }
  });

  it("series items (d3-6) never show colour or shape as a full-range step (wrap) progression", () => {
    // The series form's "progressing" attribute is the same kind of
    // stepping rule as matrix-form's progressRow (see matrixRules.ts
    // buildSeriesFigures) and is subject to the same restriction: only
    // count/size/rot may step; a genuine wrap progression on colour/shape
    // would be unguessable. The still-allowed 2-value alternation never
    // satisfies isWrapProgression for these list lengths, so this can't
    // false-flag it.
    let sawSeries = false;
    for (const d of [3, 4, 5, 6] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        if (item.form !== "series") continue;
        sawSeries = true;

        const visible = item.cells.slice(0, 4) as Figure[];
        const answerFigure = item.options[item.answer];
        const five = [...visible, answerFigure];

        for (const [attr, list] of COLOR_SHAPE_CHECKS) {
          const idx = five.map(f => list.indexOf(f[attr]));
          expect(isWrapProgression(idx, list.length)).toBe(false);
        }
      }
    }
    expect(sawSeries).toBe(true);
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

describe("progression never wraps", () => {
  it("count/size/rot rows step by +1 without wrapping, 500 seeds × d3-10", () => {
    const ATTR_LEN: Record<string, number> = { count: 4, size: 3, rot: 4 };
    const idx = (f: Figure, a: string) =>
      a === "count" ? f.count - 1 : a === "size" ? ["S", "M", "L"].indexOf(f.size) : [0, 90, 180, 270].indexOf(f.rot);
    for (const d of [3, 4, 5, 6, 7, 8, 9, 10] as const) for (let seed = 0; seed < 500; seed++) {
      const plan = planFor(seed, d);
      if (plan.form !== "matrix") continue;
      const item = matrix.generate(seed, d);
      const full = [...item.cells]; full[full.length - 1] = item.options[item.answer];
      for (const [attr, kind] of Object.entries(plan.kinds)) {
        if (kind !== "progressRow") continue;
        for (let r = 0; r < item.rows; r++) {
          const row = full.slice(r * item.rows, (r + 1) * item.rows) as Figure[];
          for (let c = 1; c < row.length; c++) {
            const a = idx(row[c - 1], attr), b = idx(row[c], attr);
            expect(b === a + 1 || (b === a && a === ATTR_LEN[attr] - 1)).toBe(true);
            expect(b).toBeGreaterThanOrEqual(a);
          }
        }
      }
    }
  });
});
