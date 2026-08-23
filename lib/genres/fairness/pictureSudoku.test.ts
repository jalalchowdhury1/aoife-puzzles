// Fairness/validity guard for Picture Sudoku (owner decision #14: "validity
// is sacred"). Each rule is one named `it(...)` stating the concrete bug it
// prevents. Intentionally overlaps ../pictureSudoku.test.ts (which pins the
// exact per-band contract); this is the cross-cutting sweep.
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { pictureSudoku, EMOJI_BANK, boxDimsFor, type PictureSudokuItem } from "../pictureSudoku";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: PictureSudokuItem }
const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: pictureSudoku.generate(seed, d) });
}

// d11-15 (owner decision #17, 2026-08-24): the genre's own earned extension
// past 10, introducing a genuine SUDOKU BOX constraint. DIFFICULTIES itself
// stays 1-10 per the shared contract; this is a local widened band just for
// this genre's own extended fairness sweep.
const EXT_D: Difficulty[] = [11, 12, 13, 14, 15];
const ITEMS_EXT: Cached[] = [];
for (const d of EXT_D) {
  for (const seed of SEEDS) ITEMS_EXT.push({ seed, d, item: pictureSudoku.generate(seed, d) });
}
const REQUIRES_BOX_D = new Set<Difficulty>([12, 14, 15]);

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

/** Box-aware sibling of `deduce` above — deliberately a separate, from-
 * scratch implementation (not a reuse of the genre's own `solveGrid`/
 * `candidatesFor`) so a bug in those wouldn't hide itself from this check.
 * `deduce` above already IS the "row/column only, no box" solver — used
 * below to prove the box constraint is genuinely load-bearing at d12/14/15
 * (row/column alone must leave the asked cell undetermined) while NOT
 * required at d11/13 (the deliberately easy introductions). */
function deduceWithBox(item: PictureSudokuItem): string | null {
  const n = item.n;
  const box = item.boxed ? boxDimsFor(n) : null;
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
        const boxVals = new Set<string>();
        if (box) {
          const boxR = Math.floor(r / box.h) * box.h;
          const boxC = Math.floor(c / box.w) * box.w;
          for (let rr = boxR; rr < boxR + box.h; rr++) {
            for (let cc = boxC; cc < boxC + box.w; cc++) {
              const v = grid[rr][cc];
              if (v !== null) boxVals.add(v);
            }
          }
        }
        const candidates = item.symbols.filter(s => !rowVals.has(s) && !colVals.has(s) && !boxVals.has(s));
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

// ---------------------------------------------------------------------------
// d11-15 (owner decision #17, 2026-08-24): "go beyond level 10 for those she
// has already reached". d1-10 fully explore row/column elimination, so the
// earned "one new idea" past 10 is a genuine third SUDOKU BOX constraint.
// ---------------------------------------------------------------------------
describe("Picture Sudoku d11-15 — the sudoku box constraint is real, not cosmetic", () => {
  it("generate(seed, d) stays pure and deterministic at d11-15 too", () => {
    const RESAMPLE = [1, 7, 42, 99, 250, 499];
    for (const d of EXT_D) {
      for (const seed of RESAMPLE) {
        expect(pictureSudoku.generate(seed, d), `d${d} seed${seed}`).toEqual(pictureSudoku.generate(seed, d));
      }
    }
  });

  it("d11-15 items are marked boxed and the asked cell is uniquely deducible from the visible cells using row+column+box elimination (independent brute-force check)", () => {
    for (const { item, seed, d } of ITEMS_EXT) {
      expect(item.boxed, `seed${seed} d${d}`).toBe(true);
      const value = deduceWithBox(item);
      expect(value, `seed${seed} d${d}`).not.toBeNull();
      expect(value, `seed${seed} d${d}`).toBe(item.options[item.answer]);
    }
  });

  it("the grid is a genuine (partial) SUDOKU: no row, column, OR box shows the same picture twice among its visible cells", () => {
    for (const { item, seed, d } of ITEMS_EXT) {
      const n = item.n;
      for (let r = 0; r < n; r++) {
        const row = item.cells.slice(r * n, r * n + n).filter((c): c is string => c !== null);
        expect(new Set(row).size, `seed${seed} d${d} row${r}`).toBe(row.length);
      }
      for (let c = 0; c < n; c++) {
        const col = Array.from({ length: n }, (_, r) => item.cells[r * n + c]).filter((v): v is string => v !== null);
        expect(new Set(col).size, `seed${seed} d${d} col${c}`).toBe(col.length);
      }
      const box = boxDimsFor(n)!;
      for (let br = 0; br < n / box.h; br++) {
        for (let bc = 0; bc < n / box.w; bc++) {
          const vals: string[] = [];
          for (let r = br * box.h; r < br * box.h + box.h; r++) {
            for (let c = bc * box.w; c < bc * box.w + box.w; c++) {
              const v = item.cells[r * n + c];
              if (v !== null) vals.push(v);
            }
          }
          expect(new Set(vals).size, `seed${seed} d${d} box(${br},${bc})`).toBe(vals.length);
        }
      }
    }
  });

  it("THE KEY PROOF: d12/14/15's asked cell CANNOT be determined by row+column elimination alone — but CAN be determined once the box constraint is added. This is what makes the new mechanic real, not decorative.", () => {
    for (const { item, seed, d } of ITEMS_EXT) {
      if (!REQUIRES_BOX_D.has(d)) continue;
      const rowColOnly = deduce(item); // the pre-existing, box-blind solver above
      expect(rowColOnly, `seed${seed} d${d}: row+column alone should NOT be enough`).toBeNull();
      const withBox = deduceWithBox(item);
      expect(withBox, `seed${seed} d${d}: adding the box should resolve it`).toBe(item.options[item.answer]);
    }
  });

  it("d11 and d13 (the deliberately easy 'new rule at a familiar/new size' steps) do NOT need the box — row+column elimination alone already determines the asked cell, matching the 'start it easy' design intent", () => {
    for (const { item, seed, d } of ITEMS_EXT) {
      if (d !== 11 && d !== 13) continue;
      const rowColOnly = deduce(item);
      expect(rowColOnly, `seed${seed} d${d}`).toBe(item.options[item.answer]);
    }
  });

  it("n and total blank count match the d11-15 band table: n=4 at d11-12, n=6 at d13-15; blanks 1/4/1/4/5", () => {
    const N_BY_D: Record<number, number> = { 11: 4, 12: 4, 13: 6, 14: 6, 15: 6 };
    const BLANKS_BY_D: Record<number, number> = { 11: 1, 12: 4, 13: 1, 14: 4, 15: 5 };
    for (const { item, seed, d } of ITEMS_EXT) {
      expect(item.n, `seed${seed} d${d}`).toBe(N_BY_D[d]);
      expect(item.cells.filter(c => c === null).length, `seed${seed} d${d}`).toBe(BLANKS_BY_D[d]);
    }
  });

  it("d11-15 keep the d>=6 foreign-distractor option rule: n+1 options, exactly one foreign", () => {
    for (const { item, seed, d } of ITEMS_EXT) {
      expect(item.options.length, `seed${seed} d${d}`).toBe(item.n + 1);
      const foreign = item.options.filter(o => !item.symbols.includes(o));
      expect(foreign.length, `seed${seed} d${d}`).toBe(1);
      for (const f of foreign) expect(EMOJI_BANK, `seed${seed} d${d}`).toContain(f);
    }
  });

  it("the genre declares maxDifficulty: 15, so the staircase/adapt/profile pipeline and the audit page all pick up the extended ramp automatically", () => {
    expect(pictureSudoku.maxDifficulty).toBe(15);
  });
});
