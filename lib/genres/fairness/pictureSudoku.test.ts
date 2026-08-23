// Fairness/validity guard for Picture Sudoku (owner decision #14: "validity
// is sacred"). Each rule is one named `it(...)` stating the concrete bug it
// prevents. Intentionally overlaps ../pictureSudoku.test.ts (which pins the
// exact per-band contract); this is the cross-cutting sweep.
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { pictureSudoku, EMOJI_BANK, type PictureSudokuItem } from "../pictureSudoku";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: PictureSudokuItem }
const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: pictureSudoku.generate(seed, d) });
}

/** Independent row/column-elimination solver over the item's own visible
 * cells/symbols — a real "brute-force" uniqueness check, kept separate from
 * whatever the generator itself uses internally. */
function deduce(item: PictureSudokuItem): string | null {
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
  return grid[askedR][askedC];
}

describe("Picture Sudoku — fairness rules", () => {
  it("generate(seed, d) is pure and deterministic — a reload mid-block, a replay, or re-fetching /api/state must never show a different grid than the one that was actually scored", () => {
    const RESAMPLE = [1, 7, 42, 99, 250, 499];
    for (const d of DIFFICULTIES) {
      for (const seed of RESAMPLE) {
        expect(pictureSudoku.generate(seed, d), `d${d} seed${seed}`).toEqual(pictureSudoku.generate(seed, d));
      }
    }
  });

  it("the asked cell's value is uniquely deducible from the visible cells alone (independent brute-force check) — a guessable-but-unprovable cell would score her on luck, not reasoning", () => {
    for (const { item, seed, d } of ITEMS) {
      const value = deduce(item);
      expect(value, `seed${seed} d${d}`).not.toBeNull();
      expect(value, `seed${seed} d${d}`).toBe(item.options[item.answer]);
    }
  });

  it("the grid is a valid (partial) Latin square: no row or column shows the same picture twice among its visible cells", () => {
    for (const { item, seed, d } of ITEMS) {
      const n = item.n;
      for (let r = 0; r < n; r++) {
        const row = item.cells.slice(r * n, r * n + n).filter((c): c is string => c !== null);
        expect(new Set(row).size, `seed${seed} d${d} row${r}`).toBe(row.length);
      }
      for (let c = 0; c < n; c++) {
        const col = Array.from({ length: n }, (_, r) => item.cells[r * n + c]).filter((v): v is string => v !== null);
        expect(new Set(col).size, `seed${seed} d${d} col${c}`).toBe(col.length);
      }
    }
  });

  it("exactly one option is the answer's own symbol, and every other option is distinct from it — no duplicate correct-looking tile", () => {
    for (const { item, seed, d } of ITEMS) {
      const correct = item.options[item.answer];
      const matches = item.options.filter(o => o === correct).length;
      expect(matches, `seed${seed} d${d}`).toBe(1);
      expect(new Set(item.options).size, `seed${seed} d${d}`).toBe(item.options.length);
    }
  });

  it("every symbol used in an item comes from the fixed 8-emoji bank, and every option is either one of the item's own symbols or (d>=6 only) exactly one foreign picture", () => {
    for (const { item, seed, d } of ITEMS) {
      for (const s of item.symbols) expect(EMOJI_BANK, `seed${seed} d${d}`).toContain(s);
      const foreign = item.options.filter(o => !item.symbols.includes(o));
      expect(foreign.length, `seed${seed} d${d}`).toBe(d >= 6 ? 1 : 0);
      for (const f of foreign) expect(EMOJI_BANK, `seed${seed} d${d}`).toContain(f);
    }
  });

  it("d1-3, d6-7: exactly one cell is blank (the asked one) — extra ungraded blanks only appear from d4 up", () => {
    for (const { item, seed, d } of ITEMS) {
      if (![1, 2, 3, 6, 7].includes(d)) continue;
      expect(item.cells.filter(c => c === null).length, `seed${seed} d${d}`).toBe(1);
    }
  });

  it("d1: the 2x2 board never exceeds its own 2-symbol/2-option budget", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 1) continue;
      expect(item.n, `seed${seed}`).toBe(2);
      expect(item.symbols.length, `seed${seed}`).toBe(2);
      expect(item.options.length, `seed${seed}`).toBe(2);
    }
  });

  it("sample() — the untimed, feedback-free item every block opens with — scores correct when answered with its own displayed answer", () => {
    const { item } = pictureSudoku.sample();
    expect(pictureSudoku.score(item, item.answer).correct).toBe(true);
  });
});
