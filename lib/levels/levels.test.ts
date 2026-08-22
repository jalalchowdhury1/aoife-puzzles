import { describe, expect, it } from "vitest";
import { GENRE_LIST } from "../genres";
import type { GenreId } from "../engine/types";
import { LEVELS } from "./index";

describe("Level 1", () => {
  const level1 = LEVELS.find((l) => l.id === 1)!;

  it("exists in the registry", () => {
    expect(level1).toBeDefined();
  });

  it("only references genre ids from GENRE_LIST (the registry is filled in later)", () => {
    for (const part of level1.parts) {
      for (const block of part.blocks) {
        expect(GENRE_LIST).toContain(block.genre);
      }
    }
  });

  it("has unique part ids", () => {
    const ids = level1.parts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses every genre in GENRE_LIST exactly once across all parts", () => {
    const used: GenreId[] = level1.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    const counts = new Map<GenreId, number>();
    for (const g of used) counts.set(g, (counts.get(g) ?? 0) + 1);

    for (const g of GENRE_LIST) expect(counts.get(g)).toBe(1);
    expect(used.length).toBe(GENRE_LIST.length);
  });
});
