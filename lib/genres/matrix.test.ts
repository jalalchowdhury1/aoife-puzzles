import { describe, it, expect } from "vitest";
import { matrix } from "./matrix";
import type { Figure } from "./matrix";
import { DIFFICULTIES } from "../engine/types";

const SEEDS = Array.from({ length: 500 }, (_, i) => i * 97 + 1);
const ATTRS: (keyof Figure)[] = ["shape", "color", "size", "count", "rot", "dot"];

function fig(v: unknown): string {
  return JSON.stringify(v);
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

  it("d1-2 matrix items vary exactly one attribute row to row (rest constant)", () => {
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        const item = matrix.generate(seed, d);
        if (item.form !== "matrix") continue;

        const full = [...item.cells];
        full[3] = item.options[item.answer];
        const row0 = full.slice(0, 2) as Figure[];
        const row1 = full.slice(2, 4) as Figure[];

        for (const attr of ATTRS) {
          expect(row0[0][attr]).toBe(row0[1][attr]);
          expect(row1[0][attr]).toBe(row1[1][attr]);
        }
        const varying = ATTRS.filter(attr => row0[0][attr] !== row1[0][attr]);
        expect(varying.length).toBeGreaterThanOrEqual(1);
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

  it("series form shows up for a healthy share of seeds at d <= 6 and never at d >= 7", () => {
    let seriesCount = 0;
    for (const seed of SEEDS) {
      if (matrix.generate(seed, 5).form === "series") seriesCount++;
    }
    expect(seriesCount).toBeGreaterThan(100);
    expect(seriesCount).toBeLessThan(220);

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

  it("sample() is a 2x2 matrix whose missing cell is a blue square, matching the explanation", () => {
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
  });
});
