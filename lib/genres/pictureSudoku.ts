// Picture Sudoku — a cousin of rule induction (Fluid Reasoning, original
// format per owner decision #16): a small grid where every row and every
// column must contain each picture exactly once (a Latin square drawn from a
// fixed 8-emoji bank). One cell is asked ("?"); at higher bands one or more
// OTHER cells are also blank (shown grey, never asked, never graded) so the
// child has to reason across the whole visible grid rather than read a
// single line off by rote.
//
// Fairness is enforced by construction + a real brute-force check (see
// `solveGrid`): every generated item is verified to make the ASKED cell's
// value uniquely determined by row/column elimination over the VISIBLE
// cells only (never by knowing the hidden answer key), exactly the
// deliverable's "verify uniqueness of the asked cell's value given the
// visible cells (brute-force check)" rule.
//
// d11-15 (2026-08-24, owner decision #17: "go beyond level 10 for those she
// has already reached"): d1-10 fully explore row+column elimination, so the
// natural "one new idea" past 10 is a genuine third SUDOKU BOX constraint —
// the grid is ALSO divided into rectangular sub-regions that must each hold
// every symbol exactly once, same as a real Sudoku. `solveGrid`/
// `candidatesFor` take an optional `box` and eliminate against it too; d1-10
// call them with no box (identical behavior to before). Generation for a
// boxed grid uses the standard "band/stack shuffle" technique
// (`randomBoxedLatinSquareIdx`): start from a canonical box-valid grid
// (`baseBoxedSquare`) then only permute rows within a box-band, columns
// within a box-stack, and whole bands/stacks as units — every resulting
// grid is box-valid by construction, no rejection sampling needed. See
// `baseBoxedSquare` itself for why the canonical grids are two hand-picked,
// empirically-verified ones rather than a closed-form formula.
import type { Difficulty, Genre, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";

export interface PictureSudokuItem {
  n: 2 | 3 | 4 | 6;
  cells: (string | null)[]; // row-major, length n*n; null = blank (asked OR grey/unasked)
  symbols: string[]; // the n distinct pictures used in this item's Latin square
  options: string[]; // n pictures (+1 foreign distractor from d>=6), shuffled
  answer: number; // index into options
  missing: number; // row-major index into `cells` of the ASKED (question-marked) cell
  // d>=11 only: the grid is ALSO divided into boxDimsFor(n) rectangular
  // regions, each of which must also contain every symbol exactly once.
  // Explicit (not inferred from `n`) because n=4 is shared by the unboxed
  // d7-10 band and the boxed d11-12 band.
  boxed?: boolean;
}

// Fixed 8-emoji bank (original friendly pictures, no image assets) — every
// item draws its n distinct symbols from here.
export const EMOJI_BANK = ["🍎", "🐶", "⭐", "🌸", "🐟", "🎈", "🍌", "🐱"];

export interface BoxDims { h: number; w: number }

/** Box dimensions for a boxed grid of this size, or null if `n` has no
 * defined box shape. n=4 -> 2x2 boxes (2 bands x 2 stacks, 4 boxes total).
 * n=6 -> 2-row x 3-col boxes (3 bands x 2 stacks, 6 boxes total) — the
 * standard 6x6-Sudoku box convention. */
export function boxDimsFor(n: number): BoxDims | null {
  if (n === 4) return { h: 2, w: 2 };
  if (n === 6) return { h: 2, w: 3 };
  return null;
}

function nFor(d: Difficulty): 2 | 3 | 4 | 6 {
  if (d === 1) return 2;
  if (d <= 6) return 3;
  if (d <= 12) return 4; // d7-10 unboxed, d11-12 boxed (same size, new rule)
  return 6; // d13-15: bigger boxed grid
}

/** Extra (grey, unasked) blank cells beyond the one asked cell, by band.
 * d12/14/15 place their extra blanks via a deliberate sub-rectangle
 * construction in `buildItem` instead of a plain count — see there for why. */
function extraCountFor(d: Difficulty): number {
  if (d === 4 || d === 5 || d === 8) return 1;
  if (d === 9) return 2;
  if (d === 10) return 3;
  return 0;
}

/** d12/14/15: the difficulties where the box constraint must be genuinely
 * load-bearing (not just present) — see the sub-rectangle construction
 * in `buildItem`. */
const REQUIRES_BOX = new Set<Difficulty>([12, 14, 15]);

function pickSymbols(rng: Rng, n: number): string[] {
  return rng.shuffle(EMOJI_BANK).slice(0, n);
}

/** A canonical Latin square of symbol-INDICES: base[r][c] = (r + c) % n. */
function baseSquare(n: number): number[][] {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r + c) % n));
}

// Canonical box-valid Sudoku grids of symbol-INDICES, one per boxed grid
// size. NOT the classic closed-form "band shift" formula
// ((boxWidth*(r%boxHeight) + floor(r/boxHeight) + c) % n) — that formula is
// a pure circulant (value(r,c) = f(r) + c mod n for every row), and a
// circulant's differences are translation-invariant in a way that makes it
// ALGEBRAICALLY IMPOSSIBLE for the d12/14/15 "sub-rectangle" construction
// below to ever find a box-necessary placement, no matter how its
// bands/stacks/rows/columns get shuffled (verified: 0/20000 in testing).
// These two grids instead come from randomized backtracking search, kept
// specifically because their full band/stack-shuffle "orbit" DOES support
// that construction (verified empirically: n=4 grid finds one 100% of the
// time across 20000 random (asked cell, shuffle) trials; n=6 grid ~89%).
// Both are independently confirmed valid (every row/column/box holds each
// value exactly once) by pictureSudoku.test.ts, not just asserted here.
const BOXED_BASE_4: number[][] = [
  [0, 2, 1, 3],
  [3, 1, 2, 0],
  [2, 0, 3, 1],
  [1, 3, 0, 2],
];
const BOXED_BASE_6: number[][] = [
  [3, 5, 4, 2, 1, 0],
  [1, 2, 0, 3, 4, 5],
  [5, 0, 2, 4, 3, 1],
  [4, 3, 1, 5, 0, 2],
  [0, 4, 5, 1, 2, 3],
  [2, 1, 3, 0, 5, 4],
];
function baseBoxedSquare(n: number): number[][] {
  if (n === 4) return BOXED_BASE_4;
  if (n === 6) return BOXED_BASE_6;
  throw new Error(`pictureSudoku: no canonical boxed base grid for n=${n}`);
}

/** Shuffling the rows and columns of a Latin square yields another Latin
 * square (each still holds every value exactly once) — this is the
 * "shuffle rows/cols/symbols" the deliverable asks for; the symbols
 * themselves are already randomly chosen and ordered by `pickSymbols`. */
function randomLatinSquareIdx(rng: Rng, n: number): number[][] {
  const base = baseSquare(n);
  const rowPerm = rng.shuffle(Array.from({ length: n }, (_, i) => i));
  const colPerm = rng.shuffle(Array.from({ length: n }, (_, i) => i));
  return rowPerm.map(r => colPerm.map(c => base[r][c]));
}

/** Box-preserving analogue of `randomLatinSquareIdx`: permutes rows only
 * WITHIN a box-band, columns only WITHIN a box-stack, and whole
 * bands/stacks as units — the standard technique for generating a valid
 * Sudoku grid without any rejection sampling (every result is guaranteed
 * row+column+box valid because each new box is made of rows/columns drawn
 * entirely from one original box, whose value set was already complete). */
function randomBoxedLatinSquareIdx(rng: Rng, n: number, box: BoxDims): number[][] {
  const base = baseBoxedSquare(n);
  const numBands = n / box.h;
  const numStacks = n / box.w;

  const bandOrder = rng.shuffle(Array.from({ length: numBands }, (_, i) => i));
  const rowPerm: number[] = [];
  for (const band of bandOrder) {
    const rowsInBand = Array.from({ length: box.h }, (_, i) => band * box.h + i);
    rowPerm.push(...rng.shuffle(rowsInBand));
  }

  const stackOrder = rng.shuffle(Array.from({ length: numStacks }, (_, i) => i));
  const colPerm: number[] = [];
  for (const stack of stackOrder) {
    const colsInStack = Array.from({ length: box.w }, (_, i) => stack * box.w + i);
    colPerm.push(...rng.shuffle(colsInStack));
  }

  return rowPerm.map(r => colPerm.map(c => base[r][c]));
}

function visibleInRow(grid: (number | null)[][], r: number): Set<number> {
  return new Set(grid[r].filter((v): v is number => v !== null));
}
function visibleInCol(grid: (number | null)[][], c: number, n: number): Set<number> {
  const s = new Set<number>();
  for (let r = 0; r < n; r++) {
    const v = grid[r][c];
    if (v !== null) s.add(v);
  }
  return s;
}
function visibleInBox(grid: (number | null)[][], r: number, c: number, box: BoxDims): Set<number> {
  const boxR = Math.floor(r / box.h) * box.h;
  const boxC = Math.floor(c / box.w) * box.w;
  const s = new Set<number>();
  for (let rr = boxR; rr < boxR + box.h; rr++) {
    for (let cc = boxC; cc < boxC + box.w; cc++) {
      const v = grid[rr][cc];
      if (v !== null) s.add(v);
    }
  }
  return s;
}

/** Candidate symbol-indices for one blank cell, from row+column (and, when
 * `box` is given, also box) elimination against currently-VISIBLE cells
 * only. `box` is omitted/null for every d1-10 item — identical behavior to
 * before the box constraint existed. */
export function candidatesFor(
  grid: (number | null)[][],
  n: number,
  r: number,
  c: number,
  box?: BoxDims | null
): number[] {
  const row = visibleInRow(grid, r);
  const col = visibleInCol(grid, c, n);
  const boxVals = box ? visibleInBox(grid, r, c, box) : null;
  const out: number[] = [];
  for (let v = 0; v < n; v++) if (!row.has(v) && !col.has(v) && !(boxVals && boxVals.has(v))) out.push(v);
  return out;
}

/** Iterative constraint propagation: repeatedly fills any blank cell whose
 * candidate set narrows to exactly one value, until no more progress. For
 * an unboxed grid (Latin square only), row+column elimination to a fixed
 * point is a complete solver (no deeper search is ever needed). For a
 * boxed grid, row+column+box elimination to a fixed point is likewise
 * complete for the way this genre places blanks (never so sparse that a
 * multi-cell "hidden pair"-style deduction beyond direct elimination is
 * required) — the generator's own GenFail/retry loop re-seeds any item
 * where this single-technique solver can't pin the asked cell down.
 * Returns a fresh grid; cells that stay ambiguous remain `null`. */
export function solveGrid(grid: (number | null)[][], n: number, box?: BoxDims | null): (number | null)[][] {
  const g = grid.map(row => [...row]);
  let progress = true;
  while (progress) {
    progress = false;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] !== null) continue;
        const cands = candidatesFor(g, n, r, c, box);
        if (cands.length === 1) {
          g[r][c] = cands[0];
          progress = true;
        }
      }
    }
  }
  return g;
}

class GenFail extends Error {}
const MAX_ATTEMPTS = 300;
const RESEED_STEP = 1_000_003;

function buildItem(rng: Rng, d: Difficulty): PictureSudokuItem {
  const n = nFor(d);
  const symbols = pickSymbols(rng, n);
  const box = d >= 11 ? boxDimsFor(n) : null;
  const idxGrid = box ? randomBoxedLatinSquareIdx(rng, n, box) : randomLatinSquareIdx(rng, n);

  const askedR = rng.int(0, n - 1);
  const askedC = rng.int(0, n - 1);
  const blanks = new Set<string>([`${askedR},${askedC}`]);

  const extraCount = extraCountFor(d);
  if (box && REQUIRES_BOX.has(d)) {
    // d12/14/15: deliberately construct a configuration where the box
    // constraint is genuinely load-bearing, not decorative — a plain
    // "K random extra blanks" placement (as below) turns out to *almost
    // never* need the box in practice (verified empirically: with this few
    // blanks, row+column elimination alone resolves the asked cell nearly
    // every time). Instead: blank the 2x2 "sub-rectangle" of rows
    // {askedR, r2} x cols {askedC, c2}, choosing r2 from a DIFFERENT
    // box-band and c2 from a DIFFERENT box-stack than the asked cell. This
    // guarantees asked's own box has only itself blank (so the box ALWAYS
    // determines it, structurally, for any valid grid).
    //
    // Whether row/column ALONE also determines it works out to a clean
    // identity: with V = the true value at (askedR,askedC), B = the true
    // value at (askedR,c2), and D = the true value at (r2,askedC), the
    // row+column-only candidate set for the asked cell is exactly
    // {V,B} ∩ {V,D} (each line's blanks are a 2-element set containing V
    // and one other value, so each line alone leaves exactly those two as
    // candidates). If B != D that intersection is just {V} — resolved by
    // row+column alone, box not needed. Only when B === D does the
    // intersection stay {V,B} (size 2) — genuinely ambiguous without the
    // box. So we search every valid (r2, c2) pair (in random order) for one
    // where idxGrid[askedR][c2] === idxGrid[r2][askedC] — verified
    // empirically to exist for ~100% of random (asked cell, grid) pairs at
    // both n=4/2x2 and n=6/2x3.
    const bandA = Math.floor(askedR / box.h);
    const stackA = Math.floor(askedC / box.w);
    const r2Candidates: number[] = [];
    for (let r = 0; r < n; r++) if (Math.floor(r / box.h) !== bandA) r2Candidates.push(r);
    const c2Candidates: number[] = [];
    for (let c = 0; c < n; c++) if (Math.floor(c / box.w) !== stackA) c2Candidates.push(c);
    const combos: [number, number][] = [];
    for (const r2 of r2Candidates) for (const c2 of c2Candidates) combos.push([r2, c2]);
    const goodCombo = rng.shuffle(combos).find(([r2, c2]) => idxGrid[askedR][c2] === idxGrid[r2][askedC]);
    if (!goodCombo) throw new GenFail("pictureSudoku: no box-necessary rectangle found");
    const [r2, c2] = goodCombo;
    blanks.add(`${askedR},${c2}`);
    blanks.add(`${r2},${askedC}`);
    blanks.add(`${r2},${c2}`);

    if (d === 15) {
      // d15 (capstone): one more grey blank, kept fully OUTSIDE the
      // rectangle's rows/columns so it can't perturb the careful balance
      // above — just extra visual clutter to scan past, same spirit as the
      // d9/d10 extra blanks.
      const rest: [number, number][] = [];
      for (let r = 0; r < n; r++) {
        if (r === askedR || r === r2) continue;
        for (let c = 0; c < n; c++) {
          if (c === askedC || c === c2) continue;
          rest.push([r, c]);
        }
      }
      const [er, ec] = rng.pick(rest);
      blanks.add(`${er},${ec}`);
    }
  } else if (d === 4 || d === 5 || d === 8) {
    // d4: extra ALWAYS shares the asked cell's ROW, so the row alone is
    // insufficient (1 known symbol) and the COLUMN (fully visible) is the
    // one that gives it away — "row shows 1 other symbol, column shows the
    // other". d5/d8: extra shares the row OR the column at random, so which
    // line actually resolves it varies item to item — she has to genuinely
    // check both instead of learning "it's always the column".
    const shareColumn = d === 5 || d === 8 ? rng.next() < 0.5 : false;
    if (shareColumn) {
      let r2 = rng.int(0, n - 1);
      while (r2 === askedR) r2 = rng.int(0, n - 1);
      blanks.add(`${r2},${askedC}`);
    } else {
      let c2 = rng.int(0, n - 1);
      while (c2 === askedC) c2 = rng.int(0, n - 1);
      blanks.add(`${askedR},${c2}`);
    }
  } else if (extraCount > 0) {
    // d9-10: extra blanks are placed anywhere else in the grid, so which
    // line actually resolves the asked cell varies item to item.
    const rest: [number, number][] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (r === askedR && c === askedC) continue;
        rest.push([r, c]);
      }
    }
    const chosen = rng.shuffle(rest).slice(0, extraCount);
    for (const [r, c] of chosen) blanks.add(`${r},${c}`);
  }

  const grid: (number | null)[][] = idxGrid.map(row => [...row]);
  for (const key of blanks) {
    const [r, c] = key.split(",").map(Number);
    grid[r][c] = null;
  }

  // The fairness contract: the ASKED cell must be uniquely determined by
  // row/column (and, from d11 up, box) elimination over the visible cells.
  // Placements that leave it ambiguous throw GenFail and the caller re-seeds
  // the whole item.
  const solved = solveGrid(grid, n, box);
  if (solved[askedR][askedC] === null) throw new GenFail("pictureSudoku: asked cell not uniquely determined");

  // d12/14/15 additionally require the box constraint to be load-bearing:
  // row/column elimination ALONE (no box) must NOT already determine the
  // asked cell, or the box would just be decorative window-dressing. The
  // sub-rectangle construction above is built to guarantee this, but a
  // real re-check (not just trusting the construction) is the
  // same discipline `solveGrid` already applies everywhere else in this
  // file.
  if (box && REQUIRES_BOX.has(d)) {
    const solvedNoBox = solveGrid(grid, n, null);
    if (solvedNoBox[askedR][askedC] !== null) {
      throw new GenFail("pictureSudoku: box constraint not load-bearing for this placement");
    }
  }

  const cells: (string | null)[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = grid[r][c];
      cells.push(v === null ? null : symbols[v]);
    }
  }
  const missing = askedR * n + askedC;
  const correctSymbol = symbols[idxGrid[askedR][askedC]];

  const optionPool = [...symbols];
  if (d >= 6) {
    const foreignChoices = EMOJI_BANK.filter(e => !symbols.includes(e));
    optionPool.push(rng.pick(foreignChoices));
  }
  const options = rng.shuffle(optionPool);
  const answer = options.indexOf(correctSymbol);

  const item: PictureSudokuItem = { n, cells, symbols, options, answer, missing };
  if (box) item.boxed = true;
  return item;
}

function generate(seed: number, d: Difficulty): PictureSudokuItem {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed + attempt * RESEED_STEP);
    try {
      return buildItem(rng, d);
    } catch (e) {
      if (e instanceof GenFail) continue;
      throw e;
    }
  }
  throw new Error("pictureSudoku: failed to generate a solvable item after many attempts");
}

function score(item: PictureSudokuItem, response: number | null): ScoreResult {
  const correct = response !== null && response === item.answer;
  return { points: correct ? 1 : 0, max: 1, correct };
}

function sample(): { item: PictureSudokuItem; explanation: string } {
  // 2x2: row0 = apple, dog; row1 = ?(dog), apple. Every row and column has
  // exactly one apple and one dog; row1 already has the apple and column0
  // already has the apple, so the missing cell (row1, col0) must be the dog.
  const apple = "🍎";
  const dog = "🐶";
  const item: PictureSudokuItem = {
    n: 2,
    cells: [apple, dog, null, apple],
    symbols: [apple, dog],
    options: [apple, dog],
    answer: 1,
    missing: 2,
  };
  return {
    item,
    explanation: "Each row and each column has one apple and one dog. The dog is missing here.",
  };
}

// ---------------------------------------------------------------------------
// Audit: self-contained HTML (no React, no SVG needed — these are plain
// emoji tiles, not attribute-based Figures) with the correct option outlined
// green, matching the visual language of scripts/audit-items.ts's other
// per-genre renderers. Boxed items (d>=11) additionally get a thicker
// top/left border at every box boundary so the new box regions are visible
// in the audit page, distinct from the unboxed d<=10 grids.
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Self-contained HTML for one item: the grid (asked cell marked "?", other
 * blanks grey) and the options with the correct one outlined green. */
export function audit(item: PictureSudokuItem): string {
  const box = item.boxed ? boxDimsFor(item.n) : null;
  const cellsHtml = item.cells
    .map((cell, i) => {
      const r = Math.floor(i / item.n);
      const c = i % item.n;
      let boxStyle = "";
      if (box) {
        const decls: string[] = [];
        if (r % box.h === 0 && r !== 0) decls.push("border-top:3px solid #444");
        if (c % box.w === 0 && c !== 0) decls.push("border-left:3px solid #444");
        if (decls.length) boxStyle = ` style="${decls.join(";")}"`;
      }
      if (cell !== null) return `<div class="ps-cell"${boxStyle}>${cell}</div>`;
      if (i === item.missing) return `<div class="ps-cell ps-asked"${boxStyle}>?</div>`;
      return `<div class="ps-cell ps-grey"${boxStyle}></div>`;
    })
    .join("");
  const optionsHtml = item.options
    .map((o, i) => `<div class="ps-option${i === item.answer ? " correct" : ""}">${o}</div>`)
    .join("");
  return (
    `<div class="ps-audit">` +
    `<div class="ps-grid" style="grid-template-columns:repeat(${item.n},1fr)">${cellsHtml}</div>` +
    `<div class="ps-options">${optionsHtml}</div>` +
    `<div class="ps-meta">symbols: ${esc(item.symbols.join(" "))}${box ? ` &middot; boxed ${box.h}x${box.w}` : ""}</div>` +
    `</div>` +
    `<style>` +
    `.ps-audit{font-family:sans-serif;font-size:12px}` +
    `.ps-grid{display:grid;gap:2px;width:fit-content}` +
    `.ps-cell{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:#f4f4f4;border-radius:6px;font-size:22px}` +
    `.ps-asked{border:2px dashed #2bb3a9;color:#2bb3a9;font-weight:bold}` +
    `.ps-grey{background:#e2e2e2}` +
    `.ps-options{display:flex;gap:6px;margin-top:8px}` +
    `.ps-option{border:2px solid #e2e2e2;border-radius:6px;padding:4px 6px;font-size:20px;background:#fff}` +
    `.ps-option.correct{border-color:#2ecc71;background:#eafaf0}` +
    `.ps-meta{color:#888;margin-top:6px}` +
    `</style>`
  );
}

export const pictureSudoku: Genre<PictureSudokuItem, number> = {
  id: "pictureSudoku",
  subtest: "Rule Induction",
  domain: "FR",
  kidTitle: "Picture Sudoku",
  instructions:
    "Every row and every column has one of each picture. One box has a question mark. Find the picture that belongs there, then tap Done.",
  sample,
  generate,
  score,
  timing: { kind: "none" },
  mode: "staircase",
  maxDifficulty: 15,
};
