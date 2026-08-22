import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../engine/types";
import {
  visualPuzzles,
  generate,
  score,
  rotate,
  mirror,
  normalize,
  isConnected,
  equalShape,
  type Cell,
  type VisualPuzzlesItem,
} from "./visualPuzzles";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

function areaBand(d: Difficulty): { size: number; min: number; max: number } {
  if (d <= 2) return { size: 4, min: 5, max: 6 };
  if (d <= 4) return { size: 4, min: 6, max: 8 };
  if (d <= 7) return { size: 5, min: 9, max: 12 };
  return { size: 6, min: 12, max: 16 };
}

function targetCells(item: VisualPuzzlesItem): Cell[] {
  const cells: Cell[] = [];
  item.target.forEach((v, i) => {
    if (v) cells.push([Math.floor(i / item.size), i % item.size]);
  });
  return cells;
}

function key(c: Cell): string {
  return `${c[0]},${c[1]}`;
}

describe("polyomino helpers", () => {
  it("normalize shifts to min row/col 0 and sorts canonically", () => {
    expect(normalize([[3, 5], [3, 6], [4, 5]])).toEqual([[0, 0], [0, 1], [1, 0]]);
  });

  it("rotate by 0 is a no-op up to normalization", () => {
    const shape: Cell[] = [[0, 0], [0, 1], [1, 0]];
    expect(rotate(shape, 0)).toEqual(normalize(shape));
  });

  it("rotate 4 times by 90 returns to the original normalized shape", () => {
    const shape: Cell[] = [[0, 0], [0, 1], [1, 1]];
    let r = shape;
    for (let i = 0; i < 4; i++) r = rotate(r, 90);
    expect(r).toEqual(normalize(shape));
  });

  it("rotate changes an asymmetric L shape", () => {
    const shape: Cell[] = [[0, 0], [1, 0], [2, 0], [2, 1]];
    expect(rotate(shape, 90)).not.toEqual(normalize(shape));
  });

  it("mirror flips an asymmetric shape and is its own inverse", () => {
    const shape: Cell[] = [[0, 0], [1, 0], [2, 0], [2, 1]];
    const mirrored = mirror(shape);
    expect(mirrored).not.toEqual(normalize(shape));
    expect(mirror(mirrored)).toEqual(normalize(shape));
  });

  it("isConnected true for a connected shape, false for a disjoint one, true for a single cell", () => {
    expect(isConnected([[0, 0], [0, 1], [1, 1]])).toBe(true);
    expect(isConnected([[0, 0], [5, 5]])).toBe(false);
    expect(isConnected([[2, 2]])).toBe(true);
  });

  it("equalShape without rotation requires exact match", () => {
    const a: Cell[] = [[0, 0], [0, 1], [1, 0]];
    const rotated90 = rotate(a, 90);
    expect(equalShape(a, a, false)).toBe(true);
    expect(equalShape(a, rotated90, false)).toBe(false);
  });

  it("equalShape with rotation accepts any of the 4 rotations but not a mirror", () => {
    const a: Cell[] = [[0, 0], [0, 1], [0, 2], [1, 0]];
    const rotated180 = rotate(a, 180);
    expect(equalShape(a, rotated180, true)).toBe(true);
    expect(equalShape(a, mirror(a), true)).toBe(false);
  });
});

describe("visualPuzzles.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      expect(generate(123, d)).toEqual(generate(123, d));
    }
  });

  // One pass over the full 500-seed x 10-difficulty grid asserting every
  // generator invariant per item, so we only pay for `generate()` once
  // per (seed, d) pair instead of once per property.
  it("holds every generator invariant across 500 seeds x 10 difficulties", () => {
    for (const d of DIFFICULTIES) {
      const { size, min, max } = areaBand(d);
      const allowRotation = d >= 6;

      for (const seed of SEEDS) {
        const item = generate(seed, d);

        // shape / size
        expect(item.size).toBe(size);
        expect(item.target.length).toBe(size * size);
        expect(item.pieces.length).toBe(6);
        expect(item.answer.length).toBe(3);
        expect(new Set(item.answer).size).toBe(3);
        expect(item.placed.length).toBe(3);
        for (const idx of item.answer) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(6);
        }

        // target area in band and connected
        const tCells = targetCells(item);
        expect(tCells.length).toBeGreaterThanOrEqual(min);
        expect(tCells.length).toBeLessThanOrEqual(max);
        expect(isConnected(tCells)).toBe(true);

        // the 3 answer pieces exactly tile the target: disjoint union == target
        const targetSet = new Set(tCells.map(key));
        const seen = new Set<string>();
        let totalPlacedCells = 0;
        for (const piece of item.placed) {
          totalPlacedCells += piece.length;
          for (const c of piece) {
            const k = key(c);
            expect(seen.has(k)).toBe(false); // disjoint
            seen.add(k);
            expect(targetSet.has(k)).toBe(true); // within target
          }
        }
        expect(totalPlacedCells).toBe(targetSet.size);
        expect(seen.size).toBe(targetSet.size);

        // every piece: internally connected, and at least 1 cell (d<=3 "obviously
        // wrong" distractors, and d1-2 true pieces, may be a lone single cell —
        // every other difficulty keeps the original 2-cell floor).
        const minPieceSize = d <= 3 ? 1 : 2;
        for (const piece of item.pieces) {
          expect(piece.cells.length).toBeGreaterThanOrEqual(minPieceSize);
          expect(isConnected(piece.cells)).toBe(true);
        }

        // No two of the six option pieces are the same shape (exact match
        // below d>=6, rotation-equivalent from d>=6) — covers true-vs-true,
        // true-vs-distractor, and distractor-vs-distractor pairs alike.
        for (let i = 0; i < item.pieces.length; i++) {
          for (let j = i + 1; j < item.pieces.length; j++) {
            expect(equalShape(item.pieces[i].cells, item.pieces[j].cells, allowRotation)).toBe(false);
          }
        }

        // rotation is the display difficulty driver
        if (d <= 5) {
          for (const piece of item.pieces) expect(piece.rot).toBe(0);
        } else {
          expect(item.answer.some(i => item.pieces[i].rot !== 0)).toBe(true);
        }
      }
    }
  }, 30000);

  it("d1-2: true pieces are pairwise non-equal, and (since 3 distinct positive counts need >=6 cells) usually land on 3 distinct cell counts", () => {
    let sawDistinctCounts = 0;
    for (const d of [1, 2] as const) {
      for (const seed of SEEDS) {
        const item = generate(seed, d);
        const trueShapes = item.answer.map(i => item.pieces[i].cells);
        for (let i = 0; i < trueShapes.length; i++) {
          for (let j = i + 1; j < trueShapes.length; j++) {
            expect(equalShape(trueShapes[i], trueShapes[j], false)).toBe(false);
          }
        }
        if (new Set(trueShapes.map(s => s.length)).size === 3) sawDistinctCounts++;
      }
    }
    expect(sawDistinctCounts).toBeGreaterThan(0);
  });

  it("d<=3: distractors are 'obviously wrong' by cell count, never a mirror or near-miss of a true piece", () => {
    for (const d of [1, 2, 3] as const) {
      for (const seed of SEEDS) {
        const item = generate(seed, d);
        const trueShapes = item.answer.map(i => item.pieces[i].cells);
        const trueCounts = new Set(trueShapes.map(s => s.length));

        item.pieces.forEach((piece, i) => {
          if (item.answer.includes(i)) return;
          expect(trueCounts.has(piece.cells.length)).toBe(false);
          for (const trueShape of trueShapes) {
            expect(equalShape(piece.cells, mirror(trueShape), false)).toBe(false);
          }
        });
      }
    }
  });
});

describe("visualPuzzles.score", () => {
  const item = generate(1, 1);
  const answer = item.answer as [number, number, number];

  it("scores 1 for the correct set in any order", () => {
    const shuffledOrder = [answer[2], answer[0], answer[1]];
    expect(score(item, shuffledOrder)).toEqual({ points: 1, max: 1, correct: true });
  });

  it("scores 0 for 2 of 3 correct", () => {
    const others = item.pieces.map((_, i) => i).filter(i => !answer.includes(i));
    const partial = [answer[0], answer[1], others[0]];
    expect(score(item, partial)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 0 for a null response", () => {
    expect(score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 1 even with a duplicate entry, once de-duplicated it matches the answer set", () => {
    const dup = [answer[0], answer[0], answer[1], answer[2]];
    expect(score(item, dup)).toEqual({ points: 1, max: 1, correct: true });
  });
});

describe("visualPuzzles genre object", () => {
  it("has the expected metadata", () => {
    expect(visualPuzzles.id).toBe("visualPuzzles");
    expect(visualPuzzles.domain).toBe("VS");
    expect(visualPuzzles.mode).toBe("staircase");
    expect(visualPuzzles.timing.kind).toBe("item");
    if (visualPuzzles.timing.kind === "item") {
      expect(visualPuzzles.timing.ms(1)).toBe(30000);
    }
  });

  it("sample() returns a well-formed item matching its explanation: single cell + domino + tromino = 6 cells", () => {
    const { item, explanation } = visualPuzzles.sample();
    expect(item.pieces.length).toBe(6);
    expect(typeof explanation).toBe("string");
    expect(explanation.length).toBeGreaterThan(0);

    const trueShapes = item.answer.map(i => item.pieces[i].cells);
    expect(trueShapes.map(s => s.length).sort()).toEqual([1, 2, 3]);
    for (let i = 0; i < trueShapes.length; i++) {
      for (let j = i + 1; j < trueShapes.length; j++) {
        expect(equalShape(trueShapes[i], trueShapes[j], false)).toBe(false);
      }
    }

    const trueCounts = new Set(trueShapes.map(s => s.length));
    item.pieces.forEach((piece, i) => {
      if (item.answer.includes(i)) return;
      expect(trueCounts.has(piece.cells.length)).toBe(false);
    });

    expect(explanation).toContain("6");
  });
});
