// Pure polyomino/shape math shared by Visual Puzzles (Piece Picker): cell-set
// normalization, rotation/mirroring, connectivity, shape equality, and the
// small random-growth / partition routines used to build a target silhouette
// and split it into 2 or 3 connected pieces (the difficulty-dependent
// `pieceCount`, see visualPuzzles.ts). No React, no DOM, no Math.random.
import type { Rng } from "../engine/rng";

export type Cell = [number, number]; // [row, col]

function cellKey([r, c]: Cell): string {
  return `${r},${c}`;
}

function cellsEqualOrdered(a: Cell[], b: Cell[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  }
  return true;
}

/** Shifts cells so the minimum row/col is 0, then sorts to a canonical order. */
export function normalize(cells: Cell[]): Cell[] {
  const minR = Math.min(...cells.map(c => c[0]));
  const minC = Math.min(...cells.map(c => c[1]));
  const shifted: Cell[] = cells.map(([r, c]) => [r - minR, c - minC]);
  shifted.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return shifted;
}

/** Rotates cells clockwise by rot degrees (0/90/180/270) and normalizes the result. */
export function rotate(cells: Cell[], rot: 0 | 90 | 180 | 270): Cell[] {
  const steps = (rot / 90) % 4;
  let result = cells;
  for (let i = 0; i < steps; i++) {
    result = result.map(([r, c]): Cell => [c, -r]);
  }
  return normalize(result);
}

/** Horizontal flip (mirror image) of cells, normalized. */
export function mirror(cells: Cell[]): Cell[] {
  return normalize(cells.map(([r, c]): Cell => [r, -c]));
}

/** True if every cell is reachable from any other via 4-connected neighbors. */
export function isConnected(cells: Cell[]): boolean {
  if (cells.length === 0) return false;
  const present = new Set(cells.map(cellKey));
  const visited = new Set<string>();
  const stack: Cell[] = [cells[0]];
  visited.add(cellKey(cells[0]));
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    for (const n of neighborsOf([r, c])) {
      const k = cellKey(n);
      if (present.has(k) && !visited.has(k)) {
        visited.add(k);
        stack.push(n);
      }
    }
  }
  return visited.size === cells.length;
}

/**
 * Shape equality. `allowRotation` false requires exact same cell set (after
 * normalizing); true also accepts any of the 4 rotations of `b`.
 */
export function equalShape(a: Cell[], b: Cell[], allowRotation: boolean): boolean {
  const na = normalize(a);
  if (!allowRotation) return cellsEqualOrdered(na, normalize(b));
  const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
  return rotations.some(rot => cellsEqualOrdered(na, rotate(b, rot)));
}

export function neighborsOf([r, c]: Cell): Cell[] {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ];
}

export function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/**
 * Cells in `shape` whose removal leaves the rest connected (or empty) — safe
 * candidates for the "moved boundary cell" distractor.
 */
export function boundaryCells(shape: Cell[]): Cell[] {
  return shape.filter(cell => {
    const rest = shape.filter(c => !(c[0] === cell[0] && c[1] === cell[1]));
    return rest.length === 0 || isConnected(rest);
  });
}

/**
 * Randomly grows a connected region of exactly `area` cells starting at
 * `start`, one frontier cell at a time, staying within `inBounds`. Returns
 * null if the growth gets boxed in before reaching `area` (caller retries).
 */
export function growCells(rng: Rng, area: number, start: Cell, inBounds: (c: Cell) => boolean): Cell[] | null {
  const cells: Cell[] = [start];
  const has = new Set([cellKey(start)]);
  const frontier: Cell[] = neighborsOf(start).filter(inBounds);

  while (cells.length < area) {
    if (frontier.length === 0) return null;
    const idx = rng.int(0, frontier.length - 1);
    const [next] = frontier.splice(idx, 1);
    const k = cellKey(next);
    if (has.has(k)) continue;
    has.add(k);
    cells.push(next);
    for (const n of neighborsOf(next)) {
      const nk = cellKey(n);
      if (inBounds(n) && !has.has(nk) && !frontier.some(f => cellKey(f) === nk)) {
        frontier.push(n);
      }
    }
  }
  return cells;
}

/**
 * Splits `targetCells` (one connected region) into `n` connected pieces by
 * picking `n` far-apart seed cells and growing them via alternating
 * multi-source BFS until every cell is claimed. Returns null (caller
 * retries with a fresh rng draw) if it cannot fully partition within a
 * bounded number of iterations. Used for both the 2-piece bands (d1-3) and
 * the 3-piece bands (d4-10) of Piece Picker — see bandOptionsFor in
 * visualPuzzles.ts.
 */
export function partitionIntoN(rng: Rng, targetCells: Cell[], n: number): Cell[][] | null {
  // n non-empty pieces need at least n cells; per-difficulty area bands
  // (see bandOptionsFor in visualPuzzles.ts) enforce the real floor.
  if (targetCells.length < n) return null;
  const inTarget = new Set(targetCells.map(cellKey));

  let bestSeeds: Cell[] | null = null;
  let bestScore = -1;
  for (let t = 0; t < 20; t++) {
    const idxs = new Set<number>();
    while (idxs.size < n) idxs.add(rng.int(0, targetCells.length - 1));
    const seeds = Array.from(idxs).map(i => targetCells[i]);
    let score = 0;
    for (let i = 0; i < seeds.length; i++) {
      for (let j = i + 1; j < seeds.length; j++) score += manhattan(seeds[i], seeds[j]);
    }
    if (score > bestScore) {
      bestScore = score;
      bestSeeds = seeds;
    }
  }
  if (!bestSeeds) return null;

  const claimedBy = new Map<string, number>();
  const pieces: Cell[][] = bestSeeds.map(s => [s]);
  bestSeeds.forEach((s, i) => claimedBy.set(cellKey(s), i));

  const frontiers: Cell[][] = bestSeeds.map(s =>
    neighborsOf(s).filter(nb => inTarget.has(cellKey(nb)) && !claimedBy.has(cellKey(nb)))
  );

  const total = targetCells.length;
  let claimedCount = n;
  const maxIterations = total * 10 + 60;
  let turn = 0;
  let iterations = 0;

  while (claimedCount < total && iterations < maxIterations) {
    iterations++;
    const pieceIdx = turn % n;
    turn++;
    frontiers[pieceIdx] = frontiers[pieceIdx].filter(c => !claimedBy.has(cellKey(c)));
    if (frontiers[pieceIdx].length === 0) continue;
    const pickIdx = rng.int(0, frontiers[pieceIdx].length - 1);
    const [cell] = frontiers[pieceIdx].splice(pickIdx, 1);
    if (claimedBy.has(cellKey(cell))) continue;
    claimedBy.set(cellKey(cell), pieceIdx);
    pieces[pieceIdx].push(cell);
    claimedCount++;
    for (const nb of neighborsOf(cell)) {
      if (inTarget.has(cellKey(nb)) && !claimedBy.has(cellKey(nb))) {
        frontiers[pieceIdx].push(nb);
      }
    }
  }

  return claimedCount === total ? pieces : null;
}
