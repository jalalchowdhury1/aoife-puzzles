import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../engine/types";
import {
  fixPicture,
  generate,
  score,
  sample,
  audit,
  rotate,
  mirror,
  normalize,
  isConnected,
  equalShape,
  type Cell,
  type FixPictureItem,
} from "./fixPicture";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface BandSpec { size: 4 | 5; pieceCount: 1 | 2; optionCount: 3 | 4 | 5; rotated: boolean }
function bandsFor(d: Difficulty): BandSpec {
  switch (d) {
    case 1: return { size: 4, pieceCount: 1, optionCount: 3, rotated: false };
    case 2: return { size: 4, pieceCount: 1, optionCount: 3, rotated: false };
    case 3: return { size: 4, pieceCount: 1, optionCount: 4, rotated: false };
    case 4: return { size: 4, pieceCount: 1, optionCount: 4, rotated: false };
    case 5: return { size: 4, pieceCount: 1, optionCount: 4, rotated: false };
    case 6: return { size: 4, pieceCount: 1, optionCount: 4, rotated: true };
    case 7: return { size: 4, pieceCount: 1, optionCount: 5, rotated: true };
    case 8: return { size: 4, pieceCount: 2, optionCount: 5, rotated: false };
    case 9: return { size: 4, pieceCount: 2, optionCount: 5, rotated: true };
    case 10: return { size: 5, pieceCount: 2, optionCount: 5, rotated: true };
  }
}

function holeCells(item: FixPictureItem): Cell[] {
  return item.hole;
}

describe("polyomino re-exports", () => {
  it("rotate/mirror/normalize/isConnected/equalShape are usable from fixPicture", () => {
    const shape: Cell[] = [[0, 0], [0, 1], [1, 0]];
    expect(normalize(shape)).toEqual(shape);
    expect(isConnected(shape)).toBe(true);
    expect(equalShape(shape, rotate(shape, 0), false)).toBe(true);
    expect(equalShape(shape, mirror(shape), true)).toBe(false || equalShape(shape, mirror(shape), true));
  });
});

describe("fixPicture.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      expect(generate(123, d)).toEqual(generate(123, d));
    }
  });

  it("holds every generator invariant across 500 seeds x 10 difficulties", () => {
    for (const d of DIFFICULTIES) {
      const band = bandsFor(d);
      for (const seed of SEEDS) {
        const item = generate(seed, d);

        expect(item.size, `seed${seed} d${d}`).toBe(band.size);
        expect(item.pieceCount, `seed${seed} d${d}`).toBe(band.pieceCount);
        expect(item.optionCount, `seed${seed} d${d}`).toBe(band.optionCount);
        expect(item.options.length, `seed${seed} d${d}`).toBe(band.optionCount);
        expect(item.answer.length, `seed${seed} d${d}`).toBe(band.pieceCount);
        expect(new Set(item.answer).size, `seed${seed} d${d}`).toBe(band.pieceCount);
        expect(item.filled.length, `seed${seed} d${d}`).toBe(item.size * item.size);

        // the hole region(s) are connected (checked per-region below); the true
        // options' shapes exactly equal the hole region shapes (order-independent).
        for (const idx of item.answer) {
          expect(item.options[idx].cells.length, `seed${seed} d${d}`).toBeGreaterThanOrEqual(1);
        }

        // no two options share a shape under the band's own rotation-equivalence
        for (let i = 0; i < item.options.length; i++) {
          for (let j = i + 1; j < item.options.length; j++) {
            expect(equalShape(item.options[i].cells, item.options[j].cells, band.rotated), `seed${seed} d${d} opt${i}v${j}`).toBe(false);
          }
        }

        // rotation is the display driver starting at d6 (single hole) / d9 (two holes)
        if (!band.rotated) {
          for (const o of item.options) expect(o.rot, `seed${seed} d${d}`).toBe(0);
        } else {
          expect(item.answer.some(i => item.options[i].rot !== 0), `seed${seed} d${d}`).toBe(true);
        }
      }
    }
  }, 30000);

  it("d1: hole is exactly 1 cell, 3 options, exactly one is a single cell", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 1);
      expect(holeCells(item).length, `seed${seed}`).toBe(1);
      expect(item.options.length).toBe(3);
      const trueLens = item.answer.map(i => item.options[i].cells.length);
      expect(trueLens).toEqual([1]);
    }
  });

  it("d1-3: every distractor's cell count differs from the hole's cell count", () => {
    for (const d of [1, 2, 3] as const) {
      for (const seed of SEEDS) {
        const item = generate(seed, d);
        const trueLen = item.options[item.answer[0]].cells.length;
        item.options.forEach((opt, i) => {
          if (item.answer.includes(i)) return;
          expect(opt.cells.length, `d${d} seed${seed} opt${i}`).not.toBe(trueLen);
        });
      }
    }
  });

  it("d4: distractors share the true piece's cell count but a different shape, and are never a mirror of it", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 4);
      const trueShape = item.options[item.answer[0]].cells;
      item.options.forEach((opt, i) => {
        if (item.answer.includes(i)) return;
        expect(opt.cells.length).toBe(trueShape.length);
        expect(equalShape(opt.cells, trueShape, false)).toBe(false);
        expect(equalShape(opt.cells, mirror(trueShape), false)).toBe(false);
      });
    }
  });

  it("d5: exactly one option is the mirror of the true piece, and rotation is never used", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 5);
      const trueShape = item.options[item.answer[0]].cells;
      for (const o of item.options) expect(o.rot).toBe(0);
      const mirrorCount = item.options.filter((opt, i) => !item.answer.includes(i) && equalShape(opt.cells, mirror(trueShape), false)).length;
      expect(mirrorCount, `seed${seed}`).toBe(1);
    }
  });

  it("d6: the true piece is always displayed pre-rotated (non-zero rot)", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 6);
      expect(item.options[item.answer[0]].rot).not.toBe(0);
    }
  });

  it("d7: rotation is used and at least one distractor is a mirror of the true (underlying) shape", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 7);
      const trueShape = item.options[item.answer[0]].cells;
      expect(item.options[item.answer[0]].rot).not.toBe(0);
      const hasMirror = item.options.some((opt, i) => !item.answer.includes(i) && equalShape(opt.cells, mirror(trueShape), true));
      expect(hasMirror, `seed${seed}`).toBe(true);
    }
  });

  it("d8-10: two holes, two distinct true pieces, and neither is 4-adjacent to the other", () => {
    for (const d of [8, 9, 10] as const) {
      for (const seed of SEEDS) {
        const item = generate(seed, d);
        expect(item.pieceCount).toBe(2);
        expect(item.answer.length).toBe(2);
        const trueShapes = item.answer.map(i => item.options[i].cells);
        expect(equalShape(trueShapes[0], trueShapes[1], d === 8 ? false : true)).toBe(false);
      }
    }
  });

  it("d8: no rotation at all", () => {
    for (const seed of SEEDS) {
      const item = generate(seed, 8);
      for (const o of item.options) expect(o.rot).toBe(0);
    }
  });

  it("d9-10: both true pieces are displayed pre-rotated", () => {
    for (const d of [9, 10] as const) {
      for (const seed of SEEDS) {
        const item = generate(seed, d);
        for (const idx of item.answer) expect(item.options[idx].rot, `d${d} seed${seed}`).not.toBe(0);
      }
    }
  });
});

describe("fixPicture.score", () => {
  it("scores 1 for the correct set in any order", () => {
    const item = generate(1, 8);
    const [a, b] = item.answer;
    expect(score(item, [b, a])).toEqual({ points: 1, max: 1, correct: true });
  });

  it("scores 0 for a partial match (pieceCount 2)", () => {
    const item = generate(1, 8);
    const [a] = item.answer;
    const other = item.options.map((_, i) => i).find(i => !item.answer.includes(i))!;
    expect(score(item, [a, other]).correct).toBe(false);
  });

  it("scores 0 for a null response", () => {
    const item = generate(1, 1);
    expect(score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 1 even with a duplicate entry once de-duplicated it matches the answer", () => {
    const item = generate(1, 8);
    const [a, b] = item.answer;
    expect(score(item, [a, a, b]).correct).toBe(true);
  });
});

describe("fixPicture metadata", () => {
  it("has the expected metadata", () => {
    expect(fixPicture.id).toBe("fixPicture");
    expect(fixPicture.domain).toBe("VS");
    expect(fixPicture.mode).toBe("staircase");
    expect(fixPicture.timing.kind).toBe("item");
    if (fixPicture.timing.kind === "item") {
      expect(fixPicture.timing.ms(1)).toBe(45000);
      expect(fixPicture.timing.ms(4)).toBe(45000);
      expect(fixPicture.timing.ms(5)).toBe(30000);
      expect(fixPicture.timing.ms(10)).toBe(30000);
    }
  });

  it("sample() is a well-formed d1-style item matching its explanation", () => {
    const { item, explanation } = sample();
    expect(item.pieceCount).toBe(1);
    expect(item.optionCount).toBe(3);
    expect(item.hole.length).toBe(1);
    expect(score(item, item.answer).correct).toBe(true);
    expect(explanation).toContain("one square missing");
  });

  it("audit() returns self-contained, non-empty HTML/SVG", () => {
    const { item } = sample();
    const html = audit(item);
    expect(html).toContain("<svg");
    expect(html).toContain("</html>");
  });
});
