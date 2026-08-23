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
import type { Difficulty, Genre, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";

export interface PictureSudokuItem {
  n: 2 | 3 | 4;
  cells: (string | null)[]; // row-major, length n*n; null = blank (asked OR grey/unasked)
  symbols: string[]; // the n distinct pictures used in this item's Latin square
  options: string[]; // n pictures (+1 foreign distractor from d>=6), shuffled
  answer: number; // index into options
  missing: number; // row-major index into `cells` of the ASKED (question-marked) cell
}

// Fixed 8-emoji bank (original friendly pictures, no image assets) — every
// item draws its n distinct symbols from here.
export const EMOJI_BANK = ["🍎", "🐶", "⭐", "🌸", "🐟", "🎈", "🍌", "🐱"];

function nFor(d: Difficulty): 2 | 3 | 4 {
  if (d === 1) return 2;
  if (d <= 6) return 3;
  return 4;
}

/** Extra (grey, unasked) blank cells beyond the one asked cell, by band. */
function extraCountFor(d: Difficulty): number {
  if (d === 4 || d === 5 || d === 8) return 1;
  if (d === 9) return 2;
  if (d === 10) return 3;
  return 0;
}

function pickSymbols(rng: Rng, n: number): string[] {
  return rng.shuffle(EMOJI_BANK).slice(0, n);
}

/** A canonical Latin square of symbol-INDICES: base[r][c] = (r + c) % n. */
function baseSquare(n: number): number[][] {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r + c) % n));
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

/** Candidate symbol-indices for one blank cell, from row+column elimination
 * against currently-VISIBLE cells only. */
export function candidatesFor(grid: (number | null)[][], n: number, r: number, c: number): number[] {
  const row = visibleInRow(grid, r);
  const col = visibleInCol(grid, c, n);
  const out: number[] = [];
  for (let v = 0; v < n; v++) if (!row.has(v) && !col.has(v)) out.push(v);
  return out;
}

/** Iterative constraint propagation: repeatedly fills any blank cell whose
 * candidate set narrows to exactly one value, until no more progress. This
 * IS the "brute-force check" — a Latin square has only row/column
 * constraints, so row+column elimination to a fixed point is a complete
 * solver for it (no deeper search is ever needed). Returns a fresh grid;
 * cells that stay ambiguous remain `null`. */
export function solveGrid(grid: (number | null)[][], n: number): (number | null)[][] {
  const g = grid.map(row => [...row]);
  let progress = true;
  while (progress) {
    progress = false;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] !== null) continue;
        const cands = candidatesFor(g, n, r, c);
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
  const idxGrid = randomLatinSquareIdx(rng, n);

  const askedR = rng.int(0, n - 1);
  const askedC = rng.int(0, n - 1);
  const blanks = new Set<string>([`${askedR},${askedC}`]);

  const extraCount = extraCountFor(d);
  if (extraCount === 1) {
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
  } else if (extraCount > 1) {
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
  // row/column elimination over the visible cells. d9-d10 place blanks
  // randomly enough that this can occasionally fail to resolve in one pass
  // for a given placement — GenFail and the caller re-seeds the whole item.
  const solved = solveGrid(grid, n);
  if (solved[askedR][askedC] === null) throw new GenFail("pictureSudoku: asked cell not uniquely determined");

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

  return { n, cells, symbols, options, answer, missing };
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
// per-genre renderers.
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Self-contained HTML for one item: the grid (asked cell marked "?", other
 * blanks grey) and the options with the correct one outlined green. */
export function audit(item: PictureSudokuItem): string {
  const cellsHtml = item.cells
    .map((cell, i) => {
      if (cell !== null) return `<div class="ps-cell">${cell}</div>`;
      if (i === item.missing) return `<div class="ps-cell ps-asked">?</div>`;
      return `<div class="ps-cell ps-grey"></div>`;
    })
    .join("");
  const optionsHtml = item.options
    .map((o, i) => `<div class="ps-option${i === item.answer ? " correct" : ""}">${o}</div>`)
    .join("");
  return (
    `<div class="ps-audit">` +
    `<div class="ps-grid" style="grid-template-columns:repeat(${item.n},1fr)">${cellsHtml}</div>` +
    `<div class="ps-options">${optionsHtml}</div>` +
    `<div class="ps-meta">symbols: ${esc(item.symbols.join(" "))}</div>` +
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
};
