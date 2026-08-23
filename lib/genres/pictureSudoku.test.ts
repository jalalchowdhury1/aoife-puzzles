import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type BaseDifficulty } from "../engine/types";
import { pictureSudoku, EMOJI_BANK, audit, type PictureSudokuItem } from "./pictureSudoku";

const N_BY_D: Record<BaseDifficulty, 2 | 3 | 4> = {
  1: 2, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4, 10: 4,
};
const EXTRA_BLANKS_BY_D: Record<BaseDifficulty, number> = {
  1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 0, 7: 0, 8: 1, 9: 2, 10: 3,
};

/** Independent (test-local) row/column-elimination solver over the item's
 * own visible `cells`/`symbols` — deliberately NOT importing the genre's
 * `solveGrid`, so a bug in that solver wouldn't hide itself from this check. */
function isUniquelyDeducible(item: PictureSudokuItem): { ok: boolean; value: string | null } {
  const n = item.n;
  const grid: (string | null)[][] = [];
  for (let r = 0; r < n; r++) grid.push(item.cells.slice(r * n, r * n + n));

  let progress = true;
  while (progress) {
    progress = false;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] !== null) continue;
        const rowVals = new Set(grid[r].filter((v): v is string => v !== null));
        const colVals = new Set(grid.map(row => row[c]).filter((v): v is string => v !== null));
        const candidates = item.symbols.filter(s => !rowVals.has(s) && !colVals.has(s));
        if (candidates.length === 1) {
          grid[r][c] = candidates[0];
          progress = true;
        }
      }
    }
  }
  const askedR = Math.floor(item.missing / n);
  const askedC = item.missing % n;
  return { ok: grid[askedR][askedC] !== null, value: grid[askedR][askedC] };
}

describe("pictureSudoku metadata", () => {
  it("matches the FR untimed staircase contract", () => {
    expect(pictureSudoku.id).toBe("pictureSudoku");
    expect(pictureSudoku.domain).toBe("FR");
    expect(pictureSudoku.mode).toBe("staircase");
    expect(pictureSudoku.timing).toEqual({ kind: "none" });
  });
});

describe("pictureSudoku.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = pictureSudoku.generate(seed, d);
        const b = pictureSudoku.generate(seed, d);
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      }
    }
  });

  it("produces a well-formed, solvable item for every seed and difficulty (500 seeds x 10 difficulties)", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const item = pictureSudoku.generate(seed, d);
        const n = N_BY_D[d as BaseDifficulty];

        // --- shape contract ---
        expect(item.n, `seed${seed} d${d}`).toBe(n);
        expect(item.cells.length, `seed${seed} d${d}`).toBe(n * n);
        expect(item.symbols.length, `seed${seed} d${d}`).toBe(n);
        expect(new Set(item.symbols).size, `seed${seed} d${d}`).toBe(n);
        for (const s of item.symbols) expect(EMOJI_BANK, `seed${seed} d${d}`).toContain(s);

        // exactly one blank is the asked one, and cells[missing] is null
        expect(item.missing).toBeGreaterThanOrEqual(0);
        expect(item.missing).toBeLessThan(n * n);
        expect(item.cells[item.missing]).toBeNull();

        // total blank count matches this band's asked + extra budget
        const blankCount = item.cells.filter(c => c === null).length;
        expect(blankCount, `seed${seed} d${d}`).toBe(1 + EXTRA_BLANKS_BY_D[d as BaseDifficulty]);

        // every non-null cell is one of this item's own symbols
        for (const c of item.cells) {
          if (c !== null) expect(item.symbols, `seed${seed} d${d}`).toContain(c);
        }

        // Latin square validity, checked only against the VISIBLE cells (a
        // blanked-out cell can't violate the constraint by definition): no
        // row or column shows the same picture twice.
        for (let r = 0; r < n; r++) {
          const row = item.cells.slice(r * n, r * n + n).filter((c): c is string => c !== null);
          expect(new Set(row).size, `seed${seed} d${d} row${r}`).toBe(row.length);
        }
        for (let c = 0; c < n; c++) {
          const col = Array.from({ length: n }, (_, r) => item.cells[r * n + c]).filter((v): v is string => v !== null);
          expect(new Set(col).size, `seed${seed} d${d} col${c}`).toBe(col.length);
        }

        // options: no duplicates, contain the answer exactly once, correct
        // count (n, or n+1 with a foreign distractor from d>=6)
        expect(new Set(item.options).size).toBe(item.options.length);
        const expectedOptionCount = d >= 6 ? n + 1 : n;
        expect(item.options.length, `seed${seed} d${d}`).toBe(expectedOptionCount);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(item.options.length);

        const foreignOptions = item.options.filter(o => !item.symbols.includes(o));
        if (d >= 6) {
          expect(foreignOptions.length, `seed${seed} d${d}`).toBe(1);
        } else {
          expect(foreignOptions.length, `seed${seed} d${d}`).toBe(0);
        }

        // the deliverable's core fairness rule: the asked cell's value is
        // uniquely deducible from the visible cells alone (independent solver)
        const deduced = isUniquelyDeducible(item);
        expect(deduced.ok, `seed${seed} d${d}`).toBe(true);
        expect(deduced.value, `seed${seed} d${d}`).toBe(item.options[item.answer]);
      }
    }
  }, 30000);

  it("d1 is always a 2x2 with no extra blanks", () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = pictureSudoku.generate(seed, 1);
      expect(item.n).toBe(2);
      expect(item.cells.filter(c => c === null).length).toBe(1);
    }
  });

  it("d4: the one extra blank shares the asked cell's ROW (never its column) — the column alone is always the sufficient line", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = pictureSudoku.generate(seed, 4);
      const n = item.n;
      const askedR = Math.floor(item.missing / n);
      const askedC = item.missing % n;
      const extraIdx = item.cells.findIndex((c, i) => c === null && i !== item.missing);
      const extraR = Math.floor(extraIdx / n);
      const extraC = extraIdx % n;
      expect(extraR, `seed${seed}`).toBe(askedR);
      expect(extraC, `seed${seed}`).not.toBe(askedC);
    }
  });

  it("d5/d8: the one extra blank shares the asked cell's row OR column (both patterns occur across seeds)", () => {
    let sawRowShare = false;
    let sawColShare = false;
    for (let seed = 0; seed < 500; seed++) {
      for (const d of [5, 8] as const) {
        const item = pictureSudoku.generate(seed, d);
        const n = item.n;
        const askedR = Math.floor(item.missing / n);
        const askedC = item.missing % n;
        const extraIdx = item.cells.findIndex((c, i) => c === null && i !== item.missing);
        const extraR = Math.floor(extraIdx / n);
        const extraC = extraIdx % n;
        const sharesRow = extraR === askedR;
        const sharesCol = extraC === askedC;
        expect(sharesRow || sharesCol, `seed${seed} d${d}`).toBe(true);
        expect(sharesRow && sharesCol, `seed${seed} d${d}`).toBe(false); // can't be the same cell as `missing`
        if (sharesRow) sawRowShare = true;
        if (sharesCol) sawColShare = true;
      }
    }
    expect(sawRowShare).toBe(true);
    expect(sawColShare).toBe(true);
  });

  it("d9 has 2 extra blanks and d10 has 3, all on a 4x4 grid", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item9 = pictureSudoku.generate(seed, 9);
      expect(item9.n).toBe(4);
      expect(item9.cells.filter(c => c === null).length).toBe(3);

      const item10 = pictureSudoku.generate(seed, 10);
      expect(item10.n).toBe(4);
      expect(item10.cells.filter(c => c === null).length).toBe(4);
    }
  });
});

describe("pictureSudoku.sample", () => {
  it("shows a 2x2 apple/dog square missing the dog", () => {
    const { item, explanation } = pictureSudoku.sample();
    expect(item.n).toBe(2);
    expect(item.cells[item.missing]).toBeNull();
    expect(item.options[item.answer]).toBe("🐶");
    expect(explanation).toBe("Each row and each column has one apple and one dog. The dog is missing here.");
  });

  it("scores correct when answered with its own displayed answer", () => {
    const { item } = pictureSudoku.sample();
    expect(pictureSudoku.score(item, item.answer).correct).toBe(true);
  });
});

describe("pictureSudoku.score", () => {
  it("awards 1 point for the correct index and 0 for any other", () => {
    const item = pictureSudoku.generate(3, 6);
    expect(pictureSudoku.score(item, item.answer)).toEqual({ points: 1, max: 1, correct: true });
    for (let i = 0; i < item.options.length; i++) {
      if (i === item.answer) continue;
      expect(pictureSudoku.score(item, i)).toEqual({ points: 0, max: 1, correct: false });
    }
  });

  it("awards 0 points for a null response (timeout)", () => {
    const item = pictureSudoku.generate(3, 6);
    expect(pictureSudoku.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });
});

describe("pictureSudoku audit", () => {
  it("returns self-contained HTML with the correct option marked", () => {
    const item = pictureSudoku.generate(5, 8);
    const html = audit(item);
    expect(html).toContain("ps-audit");
    expect(html).toContain("correct");
    expect(html).toContain("ps-grid");
  });
});
