// Piece Picker (Visual Puzzles, VS): a silhouette built from 3 polyomino
// pieces; the player picks the 3 true pieces out of 6 options (3 true + 3
// distractors). See docs/superpowers/specs/2026-08-22-aoife-puzzles-design.md §2.2.
import { makeRng, type Rng } from "../engine/rng";
import type { Difficulty, Genre, ScoreResult } from "../engine/types";
import {
  type Cell,
  boundaryCells,
  equalShape,
  growCells,
  isConnected,
  mirror,
  neighborsOf,
  normalize,
  partitionIntoThree,
  rotate,
} from "./polyomino";

export type { Cell };
export { rotate, mirror, normalize, isConnected, equalShape };

export interface Piece {
  cells: Cell[]; // normalized (min row/col = 0)
  rot: 0 | 90 | 180 | 270; // display rotation applied by the view
}

export interface VisualPuzzlesItem {
  size: 4 | 5 | 6;
  target: boolean[]; // row-major, length size*size
  pieces: Piece[]; // 6 options: 3 true + 3 distractors, shuffled
  answer: number[]; // sorted indices of the 3 true pieces in `pieces`
  /** The 3 true pieces' original absolute cells on the target grid, index-aligned with `answer`. Internal — the view must not use this. */
  placed: Cell[][];
}

const MAX_ATTEMPTS = 200;
const MAX_RESEED_DEPTH = 20;
const RESEED_STEP = 1_000_003;

function bandFor(d: Difficulty): { size: 4 | 5 | 6; minArea: number; maxArea: number } {
  // d1-2: a smaller 5-6 cell target — big enough for 3 pieces, small enough
  // that the "obviously wrong" distractor counts (below) stay well clear.
  if (d <= 2) return { size: 4, minArea: 5, maxArea: 6 };
  if (d <= 4) return { size: 4, minArea: 6, maxArea: 8 };
  if (d <= 7) return { size: 5, minArea: 9, maxArea: 12 };
  return { size: 6, minArea: 12, maxArea: 16 };
}

interface Entry {
  cells: Cell[];
  isTrue: boolean;
  placedCells?: Cell[];
  rot: 0 | 90 | 180 | 270;
}

function generateWithRetries<T>(maxAttempts: number, fn: () => T | null): T | null {
  for (let i = 0; i < maxAttempts; i++) {
    const result = fn();
    if (result) return result;
  }
  return null;
}

function buildDistractors(rng: Rng, trueShapes: Cell[][], allowRotation: boolean): Cell[][] | null {
  const accepted: Cell[][] = [];

  const isDuplicate = (candidate: Cell[]) =>
    trueShapes.some(t => equalShape(candidate, t, allowRotation)) ||
    accepted.some(a => equalShape(candidate, a, allowRotation));

  // (a) mirror of a random true piece.
  const mirrorDistractor = generateWithRetries(25, () => {
    const source = rng.pick(trueShapes);
    const candidate = mirror(source);
    return isDuplicate(candidate) ? null : candidate;
  });
  if (!mirrorDistractor) return null;
  accepted.push(mirrorDistractor);

  // (b) a true piece with one boundary cell moved to another adjacent empty position.
  const movedDistractor = generateWithRetries(25, () => {
    const source = rng.pick(trueShapes);
    const boundary = boundaryCells(source);
    if (boundary.length === 0) return null;
    const removed = rng.pick(boundary);
    const rest = source.filter(c => !(c[0] === removed[0] && c[1] === removed[1]));
    const candidates: Cell[] = [];
    for (const c of rest) {
      for (const n of neighborsOf(c)) {
        if (!rest.some(rc => rc[0] === n[0] && rc[1] === n[1]) && !candidates.some(cc => cc[0] === n[0] && cc[1] === n[1])) {
          candidates.push(n);
        }
      }
    }
    if (candidates.length === 0) return null;
    const newPos = rng.pick(candidates);
    const candidate = normalize([...rest, newPos]);
    if (equalShape(candidate, source, true)) return null; // must actually differ
    return isDuplicate(candidate) ? null : candidate;
  });
  if (!movedDistractor) return null;
  accepted.push(movedDistractor);

  // (c) a fresh random connected piece with the same cell count as a true piece.
  const freshDistractor = generateWithRetries(25, () => {
    const area = rng.pick(trueShapes).length;
    const grown = growCells(rng, area, [0, 0], () => true);
    if (!grown) return null;
    const candidate = normalize(grown);
    return isDuplicate(candidate) ? null : candidate;
  });
  if (!freshDistractor) return null;
  accepted.push(freshDistractor);

  return accepted;
}

/**
 * d<=3 distractors: "obviously wrong" by cell count alone — never a mirror,
 * never a one-cell-moved near miss (those start at d>=4, see buildDistractors
 * above). Her real d1 data showed a mirror-image distractor and a same-size
 * "close enough" piece both fooled her; a piece whose count isn't even among
 * the true pieces' counts can't be confused for one at a glance.
 */
function buildObviousDistractors(rng: Rng, trueShapes: Cell[][]): Cell[][] | null {
  const trueCounts = new Set(trueShapes.map(s => s.length));
  const candidateCounts = [1, 2, 3, 4, 5, 6].filter(n => !trueCounts.has(n));
  if (candidateCounts.length === 0) return null;

  const accepted: Cell[][] = [];
  const isDuplicate = (candidate: Cell[]) =>
    trueShapes.some(t => equalShape(candidate, t, false)) ||
    accepted.some(a => equalShape(candidate, a, false));

  for (let i = 0; i < 3; i++) {
    const piece = generateWithRetries(25, () => {
      const area = rng.pick(candidateCounts);
      const grown = growCells(rng, area, [0, 0], c => c[0] >= -4 && c[0] <= 4 && c[1] >= -4 && c[1] <= 4);
      if (!grown) return null;
      const candidate = normalize(grown);
      return isDuplicate(candidate) ? null : candidate;
    });
    if (!piece) return null;
    accepted.push(piece);
  }
  return accepted;
}

function assignRotations(rng: Rng, entries: Entry[], d: Difficulty): void {
  if (d < 6) {
    for (const e of entries) e.rot = 0;
    return;
  }
  const options: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
  for (const e of entries) e.rot = rng.pick(options);
  if (!entries.some(e => e.isTrue && e.rot !== 0)) {
    const trueEntries = entries.filter(e => e.isTrue);
    const nonZero: (90 | 180 | 270)[] = [90, 180, 270];
    rng.pick(trueEntries).rot = rng.pick(nonZero);
  }
}

function buildItem(rng: Rng, size: 4 | 5 | 6, area: number, d: Difficulty): VisualPuzzlesItem | null {
  const center: Cell = [Math.floor(size / 2), Math.floor(size / 2)];
  const inGrid = (c: Cell) => c[0] >= 0 && c[0] < size && c[1] >= 0 && c[1] < size;

  const targetCells = growCells(rng, area, center, inGrid);
  if (!targetCells || targetCells.length < area || !isConnected(targetCells)) return null;

  const partition = partitionIntoThree(rng, targetCells);
  if (!partition) return null;
  // d1-2 areas (5-6 cells) can only reach 3 distinct shapes if a 1-cell
  // piece is allowed (3 distinct positive counts need at least 1+2+3=6);
  // every other difficulty keeps the original 2-cell floor.
  const minPieceSize = d <= 2 ? 1 : 2;
  for (const piece of partition) {
    if (piece.length < minPieceSize || !isConnected(piece)) return null;
  }

  const allowRotation = d >= 6;
  const normalizedTrue = partition.map(cells => normalize(cells));
  // No two true pieces may be the same shape (exact match below d>=6,
  // rotation-equivalent at d>=6) — her real d1 data had two identical
  // vertical dominoes among the true pieces. Re-partition on a collision.
  for (let i = 0; i < normalizedTrue.length; i++) {
    for (let j = i + 1; j < normalizedTrue.length; j++) {
      if (equalShape(normalizedTrue[i], normalizedTrue[j], allowRotation)) return null;
    }
  }

  const trueEntries: Entry[] = partition.map((cells, i) => ({
    cells: normalizedTrue[i],
    isTrue: true,
    placedCells: cells,
    rot: 0,
  }));

  const distractors = d <= 3
    ? buildObviousDistractors(rng, trueEntries.map(e => e.cells))
    : buildDistractors(rng, trueEntries.map(e => e.cells), allowRotation);
  if (!distractors) return null;

  const entries: Entry[] = [
    ...trueEntries,
    ...distractors.map((cells): Entry => ({ cells, isTrue: false, rot: 0 })),
  ];

  assignRotations(rng, entries, d);

  const shuffled = rng.shuffle(entries);
  const pieces: Piece[] = shuffled.map(e => ({ cells: e.cells, rot: e.rot }));
  const answer: number[] = shuffled.reduce<number[]>((acc, e, i) => {
    if (e.isTrue) acc.push(i);
    return acc;
  }, []);
  const placed: Cell[][] = answer.map(i => shuffled[i].placedCells!);

  const target: boolean[] = new Array(size * size).fill(false);
  for (const [r, c] of targetCells) target[r * size + c] = true;

  return { size, target, pieces, answer, placed };
}

function generateAttempt(seed: number, d: Difficulty, reseedDepth: number): VisualPuzzlesItem {
  const rng = makeRng(seed);
  const { size, minArea, maxArea } = bandFor(d);
  const area = rng.int(minArea, maxArea);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const item = buildItem(rng, size, area, d);
    if (item) return item;
  }
  if (reseedDepth >= MAX_RESEED_DEPTH) {
    throw new Error(`visualPuzzles: could not generate an item for seed=${seed} d=${d}`);
  }
  return generateAttempt(seed + RESEED_STEP, d, reseedDepth + 1);
}

export function generate(seed: number, d: Difficulty): VisualPuzzlesItem {
  return generateAttempt(seed, d, 0);
}

export function score(item: VisualPuzzlesItem, response: number[] | null): ScoreResult {
  const respSet = new Set(response ?? []);
  const answerSet = new Set(item.answer);
  const correct = respSet.size === answerSet.size && [...respSet].every(x => answerSet.has(x));
  return { points: correct ? 1 : 0, max: 1, correct };
}

// Hand-authored so the sample is always exactly this shape, rather than
// whatever a lucky seed happens to produce: a single cell, a domino, and a
// straight tromino (1+2+3=6 cells) tile a 2x3 rectangle; the three
// distractors are all "obviously wrong" by cell count (4, 5, and 6 — never
// among the true pieces' 1/2/3), matching the d<=3 distractor rule.
export function sample(): { item: VisualPuzzlesItem; explanation: string } {
  const size = 4;
  const target = new Array(size * size).fill(false) as boolean[];
  const mark = (cells: Cell[]) => cells.forEach(([r, c]) => { target[r * size + c] = true; });

  const singleCell: Cell[] = [[0, 0]];
  const domino: Cell[] = [[0, 1], [0, 2]];
  const tromino: Cell[] = [[1, 0], [1, 1], [1, 2]];
  mark(singleCell);
  mark(domino);
  mark(tromino);

  const distractorSquare: Cell[] = [[0, 0], [0, 1], [1, 0], [1, 1]]; // 4 cells
  const distractorLine: Cell[] = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]; // 5 cells
  const distractorBigL: Cell[] = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2]]; // 6 cells

  const pieces: Piece[] = [
    { cells: normalize(singleCell), rot: 0 },
    { cells: normalize(domino), rot: 0 },
    { cells: normalize(distractorSquare), rot: 0 },
    { cells: normalize(tromino), rot: 0 },
    { cells: normalize(distractorLine), rot: 0 },
    { cells: normalize(distractorBigL), rot: 0 },
  ];

  return {
    item: {
      size,
      target,
      pieces,
      answer: [0, 1, 3], // singleCell, domino, tromino
      placed: [singleCell, domino, tromino],
    },
    explanation:
      "Three of these pieces fit together with no gaps or overlaps to make the shape at the top: " +
      "one square, two squares in a row, and three squares in a row. Count them: 1 plus 2 plus 3 is 6. " +
      "Tap those three, then press Done.",
  };
}

export const visualPuzzles: Genre<VisualPuzzlesItem, number[]> = {
  id: "visualPuzzles",
  subtest: "Visual Puzzles",
  domain: "VS",
  kidTitle: "Piece Picker",
  instructions:
    "Look at the shape at the top. Three of these six pieces fit together to make it exactly. Tap the three pieces you would use, then press Done.",
  sample,
  generate,
  score,
  timing: { kind: "item", ms: () => 30000 },
  mode: "staircase",
};
