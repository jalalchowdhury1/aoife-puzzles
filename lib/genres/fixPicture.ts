// Fix the Picture (Object Assembly, VS): a cousin of mental assembly. A
// silhouette has a hole (1-7) or two holes (d8-10); she taps the ONE piece
// (or, from d8, the TWO pieces) that would exactly fill it. Reuses the
// pure polyomino/shape math in polyomino.ts (rotate/mirror/normalize/
// isConnected/equalShape/growCells) — that file is not modified here. No
// React, no DOM, no Math.random — see AGENTS.md §5/decision #14
// ("validity is sacred").
import { clampToBase } from "../engine/types";
import type { Genre, Difficulty, BaseDifficulty, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { itemMs } from "../engine/timing";
import {
  type Cell,
  normalize,
  rotate,
  mirror,
  isConnected,
  equalShape,
  neighborsOf,
  growCells,
} from "./polyomino";

export type { Cell };
export { rotate, mirror, normalize, isConnected, equalShape };

export interface Piece {
  cells: Cell[]; // normalized (min row/col = 0)
  rot: 0 | 90 | 180 | 270; // display rotation applied by the view — not part of the piece's identity
}

export interface FixPictureItem {
  size: 4 | 5;
  filled: boolean[]; // row-major, length size*size — the visible (non-missing) part of the picture
  hole: Cell[]; // absolute cells of the missing region(s): one region (d1-7) or two (d8-10)
  options: Piece[]; // optionCount pieces: pieceCount true + distractors, shuffled
  answer: number[]; // sorted indices of the pieceCount true pieces in `options`
  pieceCount: 1 | 2;
  optionCount: 3 | 4 | 5;
}

const MAX_ATTEMPTS = 200;
const MAX_RESEED_DEPTH = 20;
const RESEED_STEP = 1_000_003;

function key([r, c]: Cell): string {
  return `${r},${c}`;
}

interface Band {
  size: 4 | 5;
  holeCount: 1 | 2;
  holeRange: [number, number]; // per-region cell count
  optionCount: 3 | 4 | 5;
  distractor: "count" | "shape" | "mirror";
  rotatedDisplay: boolean;
}

/**
 * One new idea per step (owner decision #15): d1-3 tell pieces apart by
 * SIZE alone; d4 introduces same-size-different-shape; d5 adds a mirror
 * distractor; d6 adds display rotation (mental rotation); d7 combines
 * rotation + mirror; d8 introduces a SECOND hole with everything else reset
 * to the easiest distractor style and no rotation; d9 re-adds rotation to
 * two holes; d10 combines two holes + rotation + mirror on a bigger 5x5 grid.
 */
function bandFor(d: BaseDifficulty): Band {
  switch (d) {
    case 1: return { size: 4, holeCount: 1, holeRange: [1, 1], optionCount: 3, distractor: "count", rotatedDisplay: false };
    case 2: return { size: 4, holeCount: 1, holeRange: [2, 2], optionCount: 3, distractor: "count", rotatedDisplay: false };
    case 3: return { size: 4, holeCount: 1, holeRange: [3, 3], optionCount: 4, distractor: "count", rotatedDisplay: false };
    case 4: return { size: 4, holeCount: 1, holeRange: [3, 4], optionCount: 4, distractor: "shape", rotatedDisplay: false };
    case 5: return { size: 4, holeCount: 1, holeRange: [4, 4], optionCount: 4, distractor: "mirror", rotatedDisplay: false };
    case 6: return { size: 4, holeCount: 1, holeRange: [4, 5], optionCount: 4, distractor: "shape", rotatedDisplay: true };
    case 7: return { size: 4, holeCount: 1, holeRange: [5, 5], optionCount: 5, distractor: "mirror", rotatedDisplay: true };
    case 8: return { size: 4, holeCount: 2, holeRange: [2, 3], optionCount: 5, distractor: "shape", rotatedDisplay: false };
    case 9: return { size: 4, holeCount: 2, holeRange: [2, 3], optionCount: 5, distractor: "shape", rotatedDisplay: true };
    // holeRange starts at 4 here (not 2-3 like d8/d9): a 2- or 3-cell piece is
    // always its own mirror image (no chirality is possible below 4 cells),
    // which would make the "mirror distractor" requirement impossible to
    // satisfy — see the asymmetry guard in buildItem.
    case 10: return { size: 5, holeCount: 2, holeRange: [4, 5], optionCount: 5, distractor: "mirror", rotatedDisplay: true };
  }
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

/** Grows the visible "filled" region, then grows each hole region attached to
 * its border (guaranteeing filled+hole together form one connected picture,
 * and — for two holes — that neither hole touches the other, so they read as
 * genuinely separate missing pieces rather than one merged gap). */
function buildFilledAndHoles(
  rng: Rng,
  size: 4 | 5,
  holeCount: 1 | 2,
  holeRange: [number, number]
): { filledCells: Cell[]; holes: Cell[][] } | null {
  const inBounds = (c: Cell) => c[0] >= 0 && c[0] < size && c[1] >= 0 && c[1] < size;
  const start: Cell = [Math.floor(size / 2), Math.floor(size / 2)];
  const filledSize = size === 4 ? rng.int(5, 8) : rng.int(6, 10);

  const filled = growCells(rng, filledSize, start, inBounds);
  if (!filled || filled.length < filledSize || !isConnected(filled)) return null;

  const blocked = new Set(filled.map(key));
  const holes: Cell[][] = [];

  for (let h = 0; h < holeCount; h++) {
    const seen = new Set<string>();
    const frontier = filled
      .flatMap(neighborsOf)
      .filter(c => inBounds(c) && !blocked.has(key(c)))
      .filter(c => (seen.has(key(c)) ? false : (seen.add(key(c)), true)));
    if (frontier.length === 0) return null;

    const holeSize = rng.int(holeRange[0], holeRange[1]);
    let placed: Cell[] | null = null;
    for (const seedCell of rng.shuffle(frontier)) {
      if (blocked.has(key(seedCell))) continue;
      const grown = growCells(rng, holeSize, seedCell, c => inBounds(c) && !blocked.has(key(c)));
      if (grown && grown.length === holeSize && isConnected(grown)) {
        placed = grown;
        break;
      }
    }
    if (!placed) return null;
    holes.push(placed);
    for (const c of placed) blocked.add(key(c));
  }

  // Two holes must not be 4-adjacent — otherwise they'd read as one merged gap, not two pieces.
  if (holeCount === 2) {
    const [h1, h2] = holes;
    const h1Set = new Set(h1.map(key));
    if (h2.some(c => neighborsOf(c).some(n => h1Set.has(key(n))))) return null;
  }

  return { filledCells: filled, holes };
}

function growLocalPiece(rng: Rng, area: number): Cell[] | null {
  const grown = growCells(rng, area, [0, 0], c => c[0] >= -4 && c[0] <= 4 && c[1] >= -4 && c[1] <= 4);
  return grown ? normalize(grown) : null;
}

function buildMirrorDistractor(rng: Rng, trueShapes: Cell[][], isDuplicate: (c: Cell[]) => boolean): Cell[] | null {
  for (let t = 0; t < 25; t++) {
    const source = rng.pick(trueShapes);
    const candidate = mirror(source);
    if (!isDuplicate(candidate)) return candidate;
  }
  return null;
}

/**
 * Same-count-different-shape is the intended style for "shape"/"mirror" bands,
 * but a small area (2 cells has exactly 1 rotation-class; 3 cells has exactly
 * 2) can make "same area, not equal to either true piece" mathematically
 * impossible once both true pieces already occupy every class at that area
 * (e.g. two 3-cell holes, one straight and one bent — every 3-cell shape is
 * one of those two). When the intended same-area search is exhausted this
 * falls back to a different-area distractor (always achievable — at most 2 of
 * the 6 candidate areas are ever excluded) rather than failing generation
 * outright; a rare easier-than-designed distractor beats an unsolvable item.
 */
function generateDistractorShape(rng: Rng, trueShapes: Cell[][], band: Band, isDuplicate: (c: Cell[]) => boolean): Cell[] | null {
  const trueCounts = trueShapes.map(s => s.length);
  const differentCountAreas = [1, 2, 3, 4, 5, 6].filter(n => !trueCounts.includes(n));
  const areaPools: { areas: number[]; sameArea: boolean }[] =
    band.distractor === "count"
      ? [{ areas: differentCountAreas, sameArea: false }]
      : [{ areas: trueCounts, sameArea: true }, { areas: differentCountAreas, sameArea: false }];

  for (const { areas, sameArea } of areaPools) {
    if (areas.length === 0) continue;
    for (let attempt = 0; attempt < 60; attempt++) {
      const area = rng.pick(areas);
      const piece = growLocalPiece(rng, area);
      if (!piece) continue;
      if (trueShapes.some(t => equalShape(piece, t, band.rotatedDisplay))) continue;
      if (band.distractor === "shape" && sameArea) {
        // "no mirrors below d5" / shape-style bands stay strictly non-mirror.
        const isMirrorOfATrue = trueShapes.some(t => t.length === area && equalShape(piece, mirror(t), band.rotatedDisplay));
        if (isMirrorOfATrue) continue;
      }
      if (isDuplicate(piece)) continue;
      return piece;
    }
  }
  return null;
}

function buildDistractors(rng: Rng, trueShapes: Cell[][], band: Band): Cell[][] | null {
  const need = band.optionCount - trueShapes.length;
  const accepted: Cell[][] = [];
  const isDuplicate = (candidate: Cell[]) =>
    trueShapes.some(t => equalShape(candidate, t, band.rotatedDisplay)) ||
    accepted.some(a => equalShape(candidate, a, band.rotatedDisplay));

  if (band.distractor === "mirror") {
    const m = buildMirrorDistractor(rng, trueShapes, isDuplicate);
    if (!m) return null;
    accepted.push(m);
  }

  while (accepted.length < need) {
    const piece = generateDistractorShape(rng, trueShapes, band, isDuplicate);
    if (!piece) return null;
    accepted.push(piece);
  }
  return accepted;
}

function buildItem(rng: Rng, band: Band): FixPictureItem | null {
  const built = buildFilledAndHoles(rng, band.size, band.holeCount, band.holeRange);
  if (!built) return null;
  const { filledCells, holes } = built;

  const trueShapes = holes.map(h => normalize(h));

  // Two true pieces must be genuinely different shapes (under the band's own
  // rotation-equivalence) — otherwise "tap the 2 correct pieces" could have
  // two visually-identical correct slots, which reads as one ambiguous choice.
  if (band.holeCount === 2 && equalShape(trueShapes[0], trueShapes[1], band.rotatedDisplay)) return null;

  // A "mirror" band needs the true shape to actually be asymmetric — otherwise
  // its own mirror is itself, and the intended distractor would be a second
  // correct answer.
  if (band.distractor === "mirror") {
    for (const shape of trueShapes) {
      if (equalShape(shape, mirror(shape), band.rotatedDisplay)) return null;
    }
  }

  const distractors = buildDistractors(rng, trueShapes, band);
  if (!distractors || distractors.length !== band.optionCount - trueShapes.length) return null;

  const entries: { cells: Cell[]; isTrue: boolean }[] = [
    ...trueShapes.map(cells => ({ cells, isTrue: true })),
    ...distractors.map(cells => ({ cells, isTrue: false })),
  ];

  const rots: (0 | 90 | 180 | 270)[] = entries.map(e => {
    if (!band.rotatedDisplay) return 0;
    if (e.isTrue) {
      const nonZero: (90 | 180 | 270)[] = [90, 180, 270];
      return rng.pick(nonZero);
    }
    return rng.pick([0, 90, 180, 270] as const);
  });

  // No two AS-DISPLAYED shapes may look pixel-identical — a real visual-duplicate bug,
  // distinct from the underlying-shape uniqueness already enforced above.
  const displayed = entries.map((e, i) => rotate(e.cells, rots[i]));
  for (let i = 0; i < displayed.length; i++) {
    for (let j = i + 1; j < displayed.length; j++) {
      if (equalShape(displayed[i], displayed[j], false)) return null;
    }
  }

  const order = rng.shuffle(entries.map((_, i) => i));
  const options: Piece[] = order.map(origIdx => ({ cells: entries[origIdx].cells, rot: rots[origIdx] }));
  const answer: number[] = order.reduce<number[]>((acc, origIdx, newIdx) => {
    if (entries[origIdx].isTrue) acc.push(newIdx);
    return acc;
  }, []);

  const filled: boolean[] = new Array(band.size * band.size).fill(false);
  for (const [r, c] of filledCells) filled[r * band.size + c] = true;
  const hole: Cell[] = holes.flat();

  return {
    size: band.size,
    filled,
    hole,
    options,
    answer,
    pieceCount: band.holeCount,
    optionCount: band.optionCount,
  };
}

function generateAttempt(seed: number, d: BaseDifficulty, reseedDepth: number): FixPictureItem {
  const rng = makeRng(seed);
  const band = bandFor(d);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const item = buildItem(rng, band);
    if (item) return item;
  }
  if (reseedDepth >= MAX_RESEED_DEPTH) {
    throw new Error(`fixPicture: could not generate an item for seed=${seed} d=${d}`);
  }
  return generateAttempt(seed + RESEED_STEP, d, reseedDepth + 1);
}

export function generate(seed: number, d: Difficulty): FixPictureItem {
  return generateAttempt(seed, clampToBase(d), 0);   // this genre's own ramp is 1-10 only
}

export function score(item: FixPictureItem, response: number[] | null): ScoreResult {
  const respSet = new Set(response ?? []);
  const answerSet = new Set(item.answer);
  const correct = respSet.size === answerSet.size && [...respSet].every(x => answerSet.has(x));
  return { points: correct ? 1 : 0, max: 1, correct };
}

// Hand-authored so the sample is always exactly this shape: a 2x2 block with
// one corner missing, and the single missing square as the obviously-right
// option among a domino and a tromino (a d1-style item).
export function sample(): { item: FixPictureItem; explanation: string } {
  const size = 4;
  const filled: boolean[] = new Array(size * size).fill(false);
  filled[1 * size + 1] = true;
  filled[1 * size + 2] = true;
  filled[2 * size + 1] = true;
  const holeCell: Cell = [2, 2];

  const options: Piece[] = [
    { cells: normalize([[0, 0]]), rot: 0 },
    { cells: normalize([[0, 0], [0, 1]]), rot: 0 },
    { cells: normalize([[0, 0], [0, 1], [0, 2]]), rot: 0 },
  ];

  return {
    item: {
      size,
      filled,
      hole: [holeCell],
      options,
      answer: [0],
      pieceCount: 1,
      optionCount: 3,
    },
    explanation: "The picture has one square missing. The single square fills it.",
  };
}

const BG = "#faf6ee";
const FILLED_COLOR = "#2bb3a9";
const PIECE_COLOR = "#8cc9ff";

/** Self-contained HTML/SVG audit: the picture with its hole, and every option (correct outlined green). */
export function audit(item: FixPictureItem): string {
  const CELL = 28;
  const holeSet = new Set(item.hole.map(key));
  const gridCells: string[] = [];
  for (let r = 0; r < item.size; r++) {
    for (let c = 0; c < item.size; c++) {
      const i = r * item.size + c;
      const x = c * CELL;
      const y = r * CELL;
      if (item.filled[i]) {
        gridCells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${FILLED_COLOR}" stroke="${BG}" stroke-width="1"/>`);
      } else if (holeSet.has(`${r},${c}`)) {
        gridCells.push(
          `<rect x="${x + 1}" y="${y + 1}" width="${CELL - 2}" height="${CELL - 2}" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>`
        );
      }
    }
  }
  const gridSvg = `<svg width="${item.size * CELL}" height="${item.size * CELL}">${gridCells.join("")}</svg>`;

  const optCell = 18;
  const optionsSvg = item.options
    .map((piece, i) => {
      const displayCells = rotate(piece.cells, piece.rot);
      const rows = Math.max(...displayCells.map(c => c[0])) + 1;
      const cols = Math.max(...displayCells.map(c => c[1])) + 1;
      const rects = displayCells
        .map(([r, c]) => `<rect x="${c * optCell}" y="${r * optCell}" width="${optCell}" height="${optCell}" fill="${PIECE_COLOR}" stroke="${BG}" stroke-width="1"/>`)
        .join("");
      const border = item.answer.includes(i)
        ? `<rect x="0" y="0" width="${cols * optCell}" height="${rows * optCell}" fill="none" stroke="#6fcf6f" stroke-width="3"/>`
        : "";
      return `<div style="display:inline-block;margin:6px"><svg width="${cols * optCell}" height="${rows * optCell}">${rects}${border}</svg></div>`;
    })
    .join("");

  return `<!doctype html><html><body style="font-family:sans-serif;background:${BG};padding:16px">
  <h3>Picture with the hole</h3>
  ${gridSvg}
  <h3>Options (correct outlined green)</h3>
  ${optionsSvg}
</body></html>`;
}

export const fixPicture: Genre<FixPictureItem, number[]> = {
  id: "fixPicture",
  subtest: "Object Assembly",
  domain: "VS",
  kidTitle: "Fix the Picture",
  instructions:
    "This picture has a piece missing. Tap the piece, or pieces, that would fill the hole perfectly, then press Done.",
  sample,
  generate,
  score,
  timing: { kind: "item", ms: itemMs([[4, 45000], [10, 30000]]) },
  mode: "staircase",
};
