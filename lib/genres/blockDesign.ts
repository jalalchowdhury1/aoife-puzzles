import type { Genre, Difficulty, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { itemMs } from "../engine/timing";

/** The six legal block faces: plain white, plain red, and four red diagonal halves. */
export type Face = "W" | "R" | "NE" | "SE" | "SW" | "NW";
export const FACES: Face[] = ["W", "R", "NE", "SE", "SW", "NW"];
const DIAGONAL_FACES: Face[] = ["NE", "SE", "SW", "NW"];

export interface BlockDesignItem {
  n: 2 | 3;
  grid: Face[]; // row-major, length n*n
  showGridLines: boolean;
}

const RED = "#e0413f";
const WHITE = "#ffffff";
const BORDER = "#9ca3af";

/** Pure SVG markup for one face in a size x size box. No React, no DOM. */
export function faceSvg(face: Face, size: number): string {
  const s = size;
  const open = `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">`;
  const whiteBg = `<rect x="0" y="0" width="${s}" height="${s}" fill="${WHITE}" stroke="${BORDER}" stroke-width="1"/>`;
  switch (face) {
    case "W":
      return `${open}${whiteBg}</svg>`;
    case "R":
      return `${open}<rect x="0" y="0" width="${s}" height="${s}" fill="${RED}"/></svg>`;
    case "NE":
      return `${open}${whiteBg}<polygon points="0,0 ${s},0 ${s},${s}" fill="${RED}"/></svg>`;
    case "SE":
      return `${open}${whiteBg}<polygon points="${s},0 ${s},${s} 0,${s}" fill="${RED}"/></svg>`;
    case "SW":
      return `${open}${whiteBg}<polygon points="0,0 0,${s} ${s},${s}" fill="${RED}"/></svg>`;
    case "NW":
      return `${open}${whiteBg}<polygon points="0,0 ${s},0 0,${s}" fill="${RED}"/></svg>`;
  }
}

interface Band { n: 2 | 3; minDiag: number; maxDiag: number; gridLines: boolean }

function band(d: Difficulty): Band {
  if (d <= 2) return { n: 2, minDiag: 0, maxDiag: 0, gridLines: true };
  if (d <= 4) return { n: 2, minDiag: 1, maxDiag: 4, gridLines: true };
  if (d <= 6) return { n: 3, minDiag: 1, maxDiag: 3, gridLines: true };
  if (d <= 8) return { n: 3, minDiag: 3, maxDiag: 5, gridLines: false };
  return { n: 3, minDiag: 6, maxDiag: 9, gridLines: false };
}

// 3x3 layout (row-major indices):
//   0 1 2
//   3 4 5
//   6 7 8
const CORNERS_3 = [0, 2, 6, 8];
const EDGES_AND_CENTER_3 = [1, 3, 5, 7, 4];

// "Diamond" template: each corner's red half points toward the grid's center,
// so a fully-diagonal grid reads as a pinwheel/diamond rather than noise.
const INWARD_2: Record<number, Face> = { 0: "SE", 1: "SW", 2: "NE", 3: "NW" };
const INWARD_3: Record<number, Face> = { 0: "SE", 2: "SW", 6: "NE", 8: "NW" };

function buildGrid(rng: Rng, n: 2 | 3, diagCount: number): Face[] {
  const size = n * n;
  const cornerIdx = n === 2 ? [0, 1, 2, 3] : CORNERS_3;
  const otherIdx = n === 2 ? [] : EDGES_AND_CENTER_3;
  const inward = n === 2 ? INWARD_2 : INWARD_3;

  // Corners fill first (they carry the "pointing inward" look); overflow spills to edges/center.
  const order = [...rng.shuffle(cornerIdx), ...rng.shuffle(otherIdx)];
  const diagPositions = new Set(order.slice(0, diagCount));

  const grid: Face[] = new Array(size).fill("W");
  for (let i = 0; i < size; i++) {
    if (diagPositions.has(i)) {
      grid[i] = cornerIdx.includes(i) ? inward[i] : rng.pick(DIAGONAL_FACES);
    } else {
      grid[i] = rng.pick(["W", "R"]);
    }
  }
  return grid;
}

function generate(seed: number, d: Difficulty): BlockDesignItem {
  const rng = makeRng((seed + d * 1000003) >>> 0);
  const b = band(d);
  const diagCount = rng.int(b.minDiag, b.maxDiag);
  const grid = buildGrid(rng, b.n, diagCount);

  // d1-2: guarantee the target isn't a solid block (real skill is copying two colors).
  if (d <= 2 && grid.every(f => f === grid[0])) {
    grid[0] = grid[0] === "W" ? "R" : "W";
  }

  // d9-10: nudge 0-2 diagonal cells to a different orientation for extra variety,
  // without changing the diagonal count (keeps the difficulty band intact).
  if (d >= 9) {
    const diagPositions = grid.reduce<number[]>((acc, f, i) => (DIAGONAL_FACES.includes(f) ? [...acc, i] : acc), []);
    const mutateCount = rng.int(0, Math.min(2, diagPositions.length));
    for (const pos of rng.shuffle(diagPositions).slice(0, mutateCount)) {
      grid[pos] = rng.pick(DIAGONAL_FACES);
    }
  }

  return { n: b.n, grid, showGridLines: b.gridLines };
}

function score(item: BlockDesignItem, response: Face[] | null): ScoreResult {
  const max = 1;
  if (!response || response.length !== item.grid.length) return { points: 0, max, correct: false };
  const correct = response.every((f, i) => f === item.grid[i]);
  return { points: correct ? 1 : 0, max, correct };
}

export const blockDesign: Genre<BlockDesignItem, Face[]> = {
  id: "blockDesign",
  subtest: "Block Design",
  domain: "VS",
  kidTitle: "Block Builder",
  instructions:
    "Look at the picture. Use the empty squares to build the exact same pattern. Tap a square to change its color. Press done when your board matches the picture.",
  sample() {
    return {
      item: { n: 2, grid: ["R", "W", "W", "R"], showGridLines: true },
      explanation: "Two squares are red and two are white. Build the same pattern on your board.",
    };
  },
  generate,
  score,
  timing: { kind: "item", ms: itemMs([[3, 45000], [6, 75000], [10, 120000]]) },
  mode: "staircase",
};
