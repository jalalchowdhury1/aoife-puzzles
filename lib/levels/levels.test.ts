import { describe, expect, it } from "vitest";
import { GENRES, GENRE_LIST } from "../genres";
import type { GenreId } from "../engine/types";
import { LEVELS } from "./index";

describe("LEVELS registry", () => {
  it("has unique, ascending level ids", () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  for (const level of LEVELS) {
    describe(`Level ${level.id} (${level.title})`, () => {
      it("only references genre ids that exist in the registry", () => {
        for (const part of level.parts) {
          for (const block of part.blocks) {
            expect(Object.keys(GENRES)).toContain(block.genre);
          }
        }
      });

      it("has unique part ids", () => {
        const ids = level.parts.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});

function usesEveryGenreOnce(level: (typeof LEVELS)[number]) {
  const used: GenreId[] = level.parts.flatMap((p) => p.blocks.map((b) => b.genre));
  const counts = new Map<GenreId, number>();
  for (const g of used) counts.set(g, (counts.get(g) ?? 0) + 1);

  for (const g of GENRE_LIST) expect(counts.get(g)).toBe(1);
  expect(used.length).toBe(GENRE_LIST.length);
}

describe("Level 1", () => {
  const level1 = LEVELS.find((l) => l.id === 1)!;

  it("exists in the registry", () => {
    expect(level1).toBeDefined();
  });

  it("is the ungraded diagnostic: no feedback, no remedial weighting", () => {
    expect(level1.feedback).toBe("none");
    expect(level1.weighting).toBeUndefined();
  });

  it("used each of the 13 original (now retired) genres exactly once — kept as history (decision #16)", () => {
    const all = level1.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(all.length).toBe(13);
    expect(new Set(all).size).toBe(13);
  });
});

describe("Level 2 (Practice Round 1)", () => {
  const level2 = LEVELS.find((l) => l.id === 2)!;

  it("exists in the registry, unlocked only after Level 1", () => {
    expect(level2).toBeDefined();
  });

  it("opts into remedial weighting with reveal feedback", () => {
    expect(level2.weighting).toBe("remedial");
    expect(level2.feedback).toBe("reveal");
  });

  it("starts every block 'fromProfile' so adaptPart drives it from her Level 1 profile", () => {
    for (const part of level2.parts) {
      for (const block of part.blocks) {
        expect(block.start, `${part.id}/${block.genre}`).toBe("fromProfile");
      }
    }
  });

  it("covers every genre, and Part D (added 2026-08-23) repeats only the two rebuilt-ramp genres", () => {
    const all = level2.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(new Set(all).size).toBe(13);
    const partD = level2.parts.find((p) => p.id === "D")!;
    expect(partD.blocks.map((b) => b.genre)).toEqual(["visualPuzzles", "figureWeights"]);
    const dupes = all.filter((g, i) => all.indexOf(g) !== i);
    expect(new Set(dupes)).toEqual(new Set(["visualPuzzles", "figureWeights"]));
  });
});

describe("Level 99 (hidden QA level)", () => {
  const levelQa = LEVELS.find((l) => l.id === 99)!;

  it("exists in the registry but is hidden (released: false)", () => {
    expect(levelQa).toBeDefined();
    expect(levelQa.released).toBe(false);
  });

  it("has one part with every genre in GENRE_LIST exactly once", () => {
    expect(levelQa.parts.length).toBe(1);
    usesEveryGenreOnce(levelQa);
  });

  it("caps every block at maxItems: 2", () => {
    for (const block of levelQa.parts[0].blocks) {
      expect(block.maxItems).toBe(2);
    }
  });

  it("shortens only the two speed genres' block window via blockMs", () => {
    for (const block of levelQa.parts[0].blocks) {
      if (GENRES[block.genre].mode === "speedBlock") {
        expect(block.blockMs).toBe(4000);
      } else {
        expect(block.blockMs).toBeUndefined();
      }
    }
  });
});

import { RELEASED_LEVELS } from "./index";
describe("release gating", () => {
  it("levels 1, 3 and 4 are released; Level 2 (replica formats) is retired (decision #16)", () => {
    expect(RELEASED_LEVELS.map((l) => l.id)).toEqual([1, 3, 4]);
  });
  it("Level 3 uses every ACTIVE genre exactly once and only active genres", () => {
    const level3 = LEVELS.find((l) => l.id === 3)!;
    const all = level3.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(new Set(all)).toEqual(new Set(GENRE_LIST));
    expect(all.length).toBe(GENRE_LIST.length);
    for (const g of all) expect(GENRES[g].retired).toBeFalsy();
  });

  it("the hidden QA level (99) is never in RELEASED_LEVELS", () => {
    expect(RELEASED_LEVELS.map((l) => l.id)).not.toContain(99);
  });
});

describe("Level 4 (Pip's Power-Ups — owner decision #18)", () => {
  const level4 = LEVELS.find((l) => l.id === 4)!;

  it("exists, is released, and is a single short part", () => {
    expect(level4).toBeDefined();
    expect(level4.released).toBe(true);
    expect(level4.parts).toHaveLength(1);
    expect(level4.parts[0].blocks).toHaveLength(4);
  });

  it("covers exactly the four Level 3 pain points", () => {
    const genres = level4.parts[0].blocks.map((b) => b.genre);
    expect(genres).toEqual(["swapShop", "pictureSudoku", "fireflyBoxes", "arithmetic"]);
  });

  // Bug this prevents: a start above the "30% under the Not-fun peak" rule
  // silently recreating the frustration the level exists to undo.
  it("starts 30% under each Not-fun / timeout peak (rounded down), never above", () => {
    const peaks: Record<string, number> = { swapShop: 8, pictureSudoku: 4, fireflyBoxes: 6, arithmetic: 10 };
    for (const block of level4.parts[0].blocks) {
      const peak = peaks[block.genre];
      expect(typeof block.start).toBe("number");
      expect(block.start as number).toBeLessThanOrEqual(Math.floor(peak * 0.7));
      expect(block.start as number).toBeGreaterThanOrEqual(1);
    }
  });

  it("is win-heavy by construction: stepUp 2, fast lane OFF, reveal feedback, no teaching items", () => {
    expect(level4.stepUp).toBe(2);
    expect(level4.fastLane).toBe(false);
    expect(level4.feedback).toBe("reveal");
    expect(level4.teachingItems).toBe(0);
    expect(level4.weighting).toBe("none");
  });

  it("gives Story Sums the 1.5x clock (her d10 losses were timeouts, not maths)", () => {
    const arith = level4.parts[0].blocks.find((b) => b.genre === "arithmetic")!;
    expect(arith.timeScale).toBe(1.5);
  });
});
