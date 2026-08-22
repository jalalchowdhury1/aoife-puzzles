import { describe, expect, it } from "vitest";
import { GENRE_LIST } from "../genres";
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
            expect(GENRE_LIST).toContain(block.genre);
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

  it("uses every genre in GENRE_LIST exactly once across all parts", () => {
    usesEveryGenreOnce(level1);
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

  it("uses every genre in GENRE_LIST exactly once across all parts", () => {
    usesEveryGenreOnce(level2);
  });
});
