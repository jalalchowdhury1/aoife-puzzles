// Piece Picker (Visual Puzzles, VS): a silhouette built from `pieceCount`
// (2 or 3) polyomino pieces; the player picks the `pieceCount` true pieces
// out of `optionCount` (3, 4, or 6) options. Rebuilt 2026-08-23 (owner
// decision: "build these from level 0, the absolute easiest stuff first")
// after a 5-year-old passed the 1/2/3-cell items then hit notched
// squares/L-pieces with 6 options and timed out four times running — the old
// d1 (always 3 pieces / 6 options) was not basic enough and d3->d4 was a
// cliff. The new ramp starts at 2 pieces / 3 options (d1) and only reaches
// the old 3-piece / 6-option format at d5, gently re-climbing through the
// old ramp (d5-10 mirror old d1-10, see bandOptionsFor below) up to rotation
// at d9-10. See docs/superpowers/specs/2026-08-22-aoife-puzzles-design.md §2.2
// for the original design and AGENTS.md §5 "Piece Picker ramp (2026-08-23)".
import { makeRng, type Rng } from "../engine/rng";
import { itemMs } from "../engine/timing";
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
  partitionIntoN,
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
  pieceCount: 2 | 3; // how many of `pieces` are true (and how many taps score it)
  optionCount: 3 | 4 | 6; // total number of pieces shown
  pieces: Piece[]; // optionCount options: pieceCount true + (optionCount - pieceCount) distractors, shuffled
  answer: number[]; // sorted indices of the pieceCount true pieces in `pieces`
  /** The true pieces' original absolute cells on the target grid, index-aligned with `answer`. Internal — the view must not use this. */
  placed: Cell[][];
}

const MAX_ATTEMPTS = 200;
const MAX_RESEED_DEPTH = 20;
const RESEED_STEP = 1_000_003;

interface Band {
  size: 4 | 5 | 6;
  minArea: number;
  maxArea: number;
  pieceCount: 2 | 3;
  optionCount: 3 | 4 | 6;
  minPieceSize: 1 | 2;
  allowRotation: boolean;
  // "obvious" = every distractor's cell count is outside the true pieces'
  // cell counts (d<=7); "real" = mirror + one-cell-moved + fresh-random-size
  // distractors (d>=8 only, always exactly 3 of them since those bands are
  // all pieceCount 3 / optionCount 6).
  distractorStyle: "obvious" | "real";
}

/**
 * New level-0 ramp (2026-08-23). d1-4 are brand new, easier-than-anything-
 * before bands (2 pieces before 3, 3-4 options before 6). d5-10 replay the
 * OLD ramp's bands verbatim (see the git history of this file / AGENTS.md §5)
 * just shifted up by 4-6 slots so the "6 options, rotated pieces" difficulty
 * she struggled with no longer shows up until she has had 4 gentler steps
 * first. d8 folds the old d4 and d5 bands into one difficulty (two
 * candidate sub-bands, chosen once per item) since the old ramp had no
 * single band spanning both; d9/d10 fold 2-3 old difficulties each that
 * already shared one band.
 */
function bandOptionsFor(d: Difficulty): Band[] {
  switch (d) {
    // d1: a domino + a single cell forming a 3-cell tromino; 1 obviously
    // wrong distractor (e.g. a 4-cell square or a 3-cell straight piece).
    case 1:
      return [{ size: 4, minArea: 3, maxArea: 3, pieceCount: 2, optionCount: 3, minPieceSize: 1, allowRotation: false, distractorStyle: "obvious" }];
    // d2: a 4-cell target from 2 pieces (1+3, or two dominoes in different
    // orientations); 2 obviously-wrong distractors.
    case 2:
      return [{ size: 4, minArea: 4, maxArea: 4, pieceCount: 2, optionCount: 4, minPieceSize: 1, allowRotation: false, distractorStyle: "obvious" }];
    // d3: a 5-6 cell target from 2 distinct pieces (2+3, 2+4, 3+3); 2
    // obviously-wrong distractors. No monominoes any more.
    case 3:
      return [{ size: 4, minArea: 5, maxArea: 6, pieceCount: 2, optionCount: 4, minPieceSize: 2, allowRotation: false, distractorStyle: "obvious" }];
    // d4: back to 3 pieces (1+2+3=6 cells), but only 1 obviously-wrong
    // distractor (4 options total) — a gentler re-introduction of 3 pieces
    // before the old 6-option format returns at d5.
    case 4:
      return [{ size: 4, minArea: 6, maxArea: 6, pieceCount: 3, optionCount: 4, minPieceSize: 1, allowRotation: false, distractorStyle: "obvious" }];
    // d5: the OLD d1 — same 1+2+3 target, now with 3 obviously-wrong
    // distractors (6 options total, the classic Piece Picker format).
    case 5:
      return [{ size: 4, minArea: 5, maxArea: 6, pieceCount: 3, optionCount: 6, minPieceSize: 1, allowRotation: false, distractorStyle: "obvious" }];
    // d6: the OLD d2 — identical band to d5 (the old ramp's d1 and d2 were
    // themselves the same band).
    case 6:
      return [{ size: 4, minArea: 5, maxArea: 6, pieceCount: 3, optionCount: 6, minPieceSize: 1, allowRotation: false, distractorStyle: "obvious" }];
    // d7: the OLD d3 — bigger target (6-8 cells), no more monominoes,
    // distractors still obviously wrong by cell count.
    case 7:
      return [{ size: 4, minArea: 6, maxArea: 8, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: false, distractorStyle: "obvious" }];
    // d8: the OLD d4 (4x4, 6-8 cells) and d5 (5x5, 9-12 cells) folded into
    // one difficulty — real (mirror/near-miss) distractors begin, still no
    // rotation; one of the two sub-bands is picked once per item.
    case 8:
      return [
        { size: 4, minArea: 6, maxArea: 8, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: false, distractorStyle: "real" },
        { size: 5, minArea: 9, maxArea: 12, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: false, distractorStyle: "real" },
      ];
    // d9: the OLD d6-7 (already the same band in the old ramp) — rotation begins.
    case 9:
      return [{ size: 5, minArea: 9, maxArea: 12, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: true, distractorStyle: "real" }];
    // d10: the OLD d8-10 (already the same band in the old ramp) — 6x6, rotation.
    case 10:
      return [{ size: 6, minArea: 12, maxArea: 16, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: true, distractorStyle: "real" }];
  }
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
 * "Obvious" distractors (d<=7): never a mirror, never a one-cell-moved near
 * miss (those start at d>=8, see buildDistractors above) — a piece whose
 * cell count isn't even among the true pieces' counts can't be confused for
 * one at a glance. Her real old-d1 data showed a mirror-image distractor and
 * a same-size "close enough" piece both fooled her.
 */
function buildObviousDistractors(rng: Rng, trueShapes: Cell[][], count: number): Cell[][] | null {
  const trueCounts = new Set(trueShapes.map(s => s.length));
  const candidateCounts = [1, 2, 3, 4, 5, 6].filter(n => !trueCounts.has(n));
  if (candidateCounts.length === 0) return null;

  const accepted: Cell[][] = [];
  const isDuplicate = (candidate: Cell[]) =>
    trueShapes.some(t => equalShape(candidate, t, false)) ||
    accepted.some(a => equalShape(candidate, a, false));

  for (let i = 0; i < count; i++) {
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

function assignRotations(rng: Rng, entries: Entry[], allowRotation: boolean): void {
  if (!allowRotation) {
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

function buildItem(rng: Rng, band: Band, area: number): VisualPuzzlesItem | null {
  const { size, pieceCount, optionCount, minPieceSize, allowRotation, distractorStyle } = band;
  const center: Cell = [Math.floor(size / 2), Math.floor(size / 2)];
  const inGrid = (c: Cell) => c[0] >= 0 && c[0] < size && c[1] >= 0 && c[1] < size;

  const targetCells = growCells(rng, area, center, inGrid);
  if (!targetCells || targetCells.length < area || !isConnected(targetCells)) return null;

  const partition = partitionIntoN(rng, targetCells, pieceCount);
  if (!partition) return null;
  for (const piece of partition) {
    if (piece.length < minPieceSize || !isConnected(piece)) return null;
  }

  const normalizedTrue = partition.map(cells => normalize(cells));
  // No two true pieces may be the same shape (exact match below d9,
  // rotation-equivalent from d9) — her real old-d1 data had two identical
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

  const distractorCount = optionCount - pieceCount;
  const distractors = distractorStyle === "obvious"
    ? buildObviousDistractors(rng, trueEntries.map(e => e.cells), distractorCount)
    : buildDistractors(rng, trueEntries.map(e => e.cells), allowRotation);
  if (!distractors || distractors.length !== distractorCount) return null;

  const entries: Entry[] = [
    ...trueEntries,
    ...distractors.map((cells): Entry => ({ cells, isTrue: false, rot: 0 })),
  ];

  assignRotations(rng, entries, allowRotation);

  const shuffled = rng.shuffle(entries);
  const pieces: Piece[] = shuffled.map(e => ({ cells: e.cells, rot: e.rot }));
  const answer: number[] = shuffled.reduce<number[]>((acc, e, i) => {
    if (e.isTrue) acc.push(i);
    return acc;
  }, []);
  const placed: Cell[][] = answer.map(i => shuffled[i].placedCells!);

  const target: boolean[] = new Array(size * size).fill(false);
  for (const [r, c] of targetCells) target[r * size + c] = true;

  return { size, target, pieceCount, optionCount, pieces, answer, placed };
}

function generateAttempt(seed: number, d: Difficulty, reseedDepth: number): VisualPuzzlesItem {
  const rng = makeRng(seed);
  const bands = bandOptionsFor(d);
  const band = bands.length > 1 ? rng.pick(bands) : bands[0];
  const area = rng.int(band.minArea, band.maxArea);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const item = buildItem(rng, band, area);
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
// straight tromino (1+2+3=6 cells) tile a 2x3 rectangle — a d4-style item
// (3 true pieces, 1 obviously-wrong distractor, 4 options total).
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

  const distractorSquare: Cell[] = [[0, 0], [0, 1], [1, 0], [1, 1]]; // 4 cells — not among the true pieces' 1/2/3

  const pieces: Piece[] = [
    { cells: normalize(singleCell), rot: 0 },
    { cells: normalize(domino), rot: 0 },
    { cells: normalize(distractorSquare), rot: 0 },
    { cells: normalize(tromino), rot: 0 },
  ];

  return {
    item: {
      size,
      target,
      pieceCount: 3,
      optionCount: 4,
      pieces,
      answer: [0, 1, 3], // singleCell, domino, tromino
      placed: [singleCell, domino, tromino],
    },
    explanation:
      "Three of these four pieces fit together with no gaps or overlaps to make the shape at the top: " +
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
    "Look at the shape at the top. Some of these pieces fit together to make it exactly. Tap the pieces you would use, then press Done.",
  sample,
  generate,
  score,
  // d<=3 (the new absolute-basics bands) get 45s; d4-10 keep the original 30s
  // cap (d4-7's own comment in this table matches d>=8's value, so one entry
  // covers both — see AGENTS.md §5).
  timing: { kind: "item", ms: itemMs([[3, 45000], [10, 30000]]) },
  mode: "staircase",
};
