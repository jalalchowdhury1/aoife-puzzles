import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty, type BaseDifficulty } from "../engine/types";
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

// Independent re-statement of the production ramp (lib/genres/visualPuzzles.ts
// bandOptionsFor) for the invariant sweep below — see AGENTS.md §5 "Piece
// Picker ramp (2026-08-23)". d8 has two candidate sub-bands (the old d4 and
// d5 bands folded together); every other difficulty has exactly one.
interface BandSpec { size: 4 | 5 | 6; min: number; max: number; pieceCount: 2 | 3; optionCount: 3 | 4 | 6; minPieceSize: 1 | 2; allowRotation: boolean }

function bandsFor(d: BaseDifficulty): BandSpec[] {
  switch (d) {
    case 1: return [{ size: 4, min: 3, max: 3, pieceCount: 2, optionCount: 3, minPieceSize: 1, allowRotation: false }];
    case 2: return [{ size: 4, min: 4, max: 4, pieceCount: 2, optionCount: 4, minPieceSize: 1, allowRotation: false }];
    case 3: return [{ size: 4, min: 5, max: 6, pieceCount: 2, optionCount: 4, minPieceSize: 2, allowRotation: false }];
    case 4: return [{ size: 4, min: 6, max: 6, pieceCount: 3, optionCount: 4, minPieceSize: 1, allowRotation: false }];
    case 5: return [{ size: 4, min: 5, max: 6, pieceCount: 3, optionCount: 6, minPieceSize: 1, allowRotation: false }];
    case 6: return [{ size: 4, min: 5, max: 6, pieceCount: 3, optionCount: 6, minPieceSize: 1, allowRotation: false }];
    case 7: return [{ size: 4, min: 6, max: 8, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: false }];
    case 8: return [
      { size: 4, min: 6, max: 8, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: false },
      { size: 5, min: 9, max: 12, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: false },
    ];
    case 9: return [{ size: 5, min: 9, max: 12, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: true }];
    case 10: return [{ size: 6, min: 12, max: 16, pieceCount: 3, optionCount: 6, minPieceSize: 2, allowRotation: true }];
  }
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
      const bands = bandsFor(d as BaseDifficulty);
      const allowRotation = bands[0].allowRotation;
      const pieceCount = bands[0].pieceCount;
      const optionCount = bands[0].optionCount;

      for (const seed of SEEDS) {
        const item = generate(seed, d);

        // pieceCount/optionCount are fixed per difficulty (only d8's size/area
        // sub-band varies per item, never the piece/option counts).
        expect(item.pieceCount, `seed${seed} d${d}`).toBe(pieceCount);
        expect(item.optionCount, `seed${seed} d${d}`).toBe(optionCount);
        expect(item.pieces.length).toBe(optionCount);
        expect(item.answer.length).toBe(pieceCount);
        expect(new Set(item.answer).size).toBe(pieceCount);
        expect(item.placed.length).toBe(pieceCount);
        for (const idx of item.answer) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(optionCount);
        }

        // size/area matches exactly one candidate band for this difficulty
        const tCells = targetCells(item);
        const matchingBand = bands.find(b => b.size === item.size);
        expect(matchingBand, `seed${seed} d${d} size${item.size}`).toBeTruthy();
        expect(tCells.length).toBeGreaterThanOrEqual(matchingBand!.min);
        expect(tCells.length).toBeLessThanOrEqual(matchingBand!.max);
        expect(isConnected(tCells)).toBe(true);

        // the true pieces exactly tile the target: disjoint union == target
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

        // every piece (true or distractor) is at least 1 cell and connected;
        // the band's minPieceSize floor is only guaranteed for the TRUE
        // pieces (an "obvious" distractor's cell count is whatever isn't
        // among the true counts, which can occasionally dip below the true
        // floor — see buildObviousDistractors in visualPuzzles.ts).
        for (const piece of item.pieces) {
          expect(piece.cells.length).toBeGreaterThanOrEqual(1);
          expect(isConnected(piece.cells)).toBe(true);
        }
        for (const idx of item.answer) {
          expect(item.pieces[idx].cells.length, `seed${seed} d${d}`).toBeGreaterThanOrEqual(matchingBand!.minPieceSize);
        }

        // No two of the options are the same shape (exact match below d9,
        // rotation-equivalent from d9) — covers true-vs-true, true-vs-
        // distractor, and distractor-vs-distractor pairs alike.
        for (let i = 0; i < item.pieces.length; i++) {
          for (let j = i + 1; j < item.pieces.length; j++) {
            expect(equalShape(item.pieces[i].cells, item.pieces[j].cells, allowRotation)).toBe(false);
          }
        }

        // rotation is the display difficulty driver, starting at d9
        if (d <= 8) {
          for (const piece of item.pieces) expect(piece.rot).toBe(0);
        } else {
          expect(item.answer.some(i => item.pieces[i].rot !== 0)).toBe(true);
        }
      }
    }
  }, 30000);

  it("d1-4: pieceCount/optionCount match the new level-0 ramp exactly", () => {
    const expected: Record<number, { pieceCount: number; optionCount: number }> = {
      1: { pieceCount: 2, optionCount: 3 },
      2: { pieceCount: 2, optionCount: 4 },
      3: { pieceCount: 2, optionCount: 4 },
      4: { pieceCount: 3, optionCount: 4 },
    };
    for (const [dStr, exp] of Object.entries(expected)) {
      const d = Number(dStr) as Difficulty;
      for (const seed of SEEDS) {
        const item = generate(seed, d);
        expect(item.pieceCount, `d${d} seed${seed}`).toBe(exp.pieceCount);
        expect(item.optionCount, `d${d} seed${seed}`).toBe(exp.optionCount);
      }
    }
  });

  it("d1: the target is always exactly a 1-cell piece + a 2-cell piece (a monomino/domino tromino) — the absolute easiest possible split", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 1);
      const trueLens = item.answer.map(i => item.pieces[i].cells.length).sort((a, b) => a - b);
      expect(trueLens, `seed${seed}`).toEqual([1, 2]);
    }
  });

  it("d2: the target is always a 1+3 split or a 2+2 split (two different-orientation dominoes)", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 2);
      const trueLens = item.answer.map(i => item.pieces[i].cells.length).sort((a, b) => a - b);
      expect([[1, 3], [2, 2]], `seed${seed}`).toContainEqual(trueLens);
    }
  });

  it("d3: the target is always a 2+3, 2+4, or 3+3 split of two distinct pieces, never a monomino", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 3);
      const trueLens = item.answer.map(i => item.pieces[i].cells.length).sort((a, b) => a - b);
      expect([[2, 3], [2, 4], [3, 3]], `seed${seed}`).toContainEqual(trueLens);
      expect(Math.min(...trueLens), `seed${seed}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("d4: the target is always exactly a 1+2+3 split (six cells, three distinct pieces)", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 4);
      const trueLens = item.answer.map(i => item.pieces[i].cells.length).sort((a, b) => a - b);
      expect(trueLens, `seed${seed}`).toEqual([1, 2, 3]);
    }
  });

  it("d5-6: true pieces are pairwise non-equal, and (since 3 distinct positive counts need >=6 cells) usually land on 3 distinct cell counts", () => {
    let sawDistinctCounts = 0;
    for (const d of [5, 6] as const) {
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

  it("d<=7: distractors are 'obviously wrong' by cell count, never a mirror or near-miss of a true piece", () => {
    for (let d = 1; d <= 7; d++) {
      for (const seed of SEEDS) {
        const item = generate(seed, d as Difficulty);
        const trueShapes = item.answer.map(i => item.pieces[i].cells);
        const trueCounts = new Set(trueShapes.map(s => s.length));

        item.pieces.forEach((piece, i) => {
          if (item.answer.includes(i)) return;
          expect(trueCounts.has(piece.cells.length), `d${d} seed${seed} piece${i}`).toBe(false);
          for (const trueShape of trueShapes) {
            expect(equalShape(piece.cells, mirror(trueShape), false), `d${d} seed${seed} piece${i}`).toBe(false);
          }
        });
      }
    }
  });

  it("d8-10: every item has a mirror-of-a-true-piece distractor (the 'real' distractor style, vs. d<=7's obvious-only)", () => {
    for (let d = 8; d <= 10; d++) {
      for (const seed of SEEDS) {
        const item = generate(seed, d as Difficulty);
        const trueShapes = item.answer.map(i => item.pieces[i].cells);
        const distractors = item.pieces.filter((_, i) => !item.answer.includes(i)).map(p => p.cells);
        const hasMirror = distractors.some(dist => trueShapes.some(t => equalShape(dist, mirror(t), false)));
        expect(hasMirror, `d${d} seed${seed}`).toBe(true);
      }
    }
  });
});

describe("visualPuzzles.score", () => {
  it("scores 1 for the correct set in any order (pieceCount 2)", () => {
    const item = generate(1, 1);
    const answer = item.answer as [number, number];
    const shuffledOrder = [answer[1], answer[0]];
    expect(score(item, shuffledOrder)).toEqual({ points: 1, max: 1, correct: true });
  });

  it("scores 0 for 1 of 2 correct (pieceCount 2)", () => {
    const item = generate(1, 1);
    const answer = item.answer as [number, number];
    const others = item.pieces.map((_, i) => i).filter(i => !answer.includes(i));
    const partial = [answer[0], others[0]];
    expect(score(item, partial)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 1 for the correct set in any order (pieceCount 3)", () => {
    const item = generate(1, 5);
    const answer = item.answer as [number, number, number];
    const shuffledOrder = [answer[2], answer[0], answer[1]];
    expect(score(item, shuffledOrder)).toEqual({ points: 1, max: 1, correct: true });
  });

  it("scores 0 for 2 of 3 correct (pieceCount 3)", () => {
    const item = generate(1, 5);
    const answer = item.answer as [number, number, number];
    const others = item.pieces.map((_, i) => i).filter(i => !answer.includes(i));
    const partial = [answer[0], answer[1], others[0]];
    expect(score(item, partial)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 0 for a null response", () => {
    const item = generate(1, 1);
    expect(score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 1 even with a duplicate entry, once de-duplicated it matches the answer set", () => {
    const item = generate(1, 5);
    const answer = item.answer as [number, number, number];
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
      // d<=3 (the new absolute-basics bands) get more time; d4-10 keep the
      // original 30s cap (see AGENTS.md §5).
      expect(visualPuzzles.timing.ms(1)).toBe(45000);
      expect(visualPuzzles.timing.ms(3)).toBe(45000);
      expect(visualPuzzles.timing.ms(4)).toBe(30000);
      expect(visualPuzzles.timing.ms(10)).toBe(30000);
    }
  });

  it("sample() returns a well-formed d4-style item matching its explanation: single cell + domino + tromino = 6 cells, 1 obviously-wrong distractor", () => {
    const { item, explanation } = visualPuzzles.sample();
    expect(item.pieceCount).toBe(3);
    expect(item.optionCount).toBe(4);
    expect(item.pieces.length).toBe(4);
    expect(item.answer.length).toBe(3);
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

    expect(explanation).toContain("Three of these four pieces");
    expect(explanation).toContain("6");
  });
});
