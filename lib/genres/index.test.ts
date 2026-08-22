import { describe, it, expect } from "vitest";
import { GENRES, GENRE_LIST } from "./index";
import { DIFFICULTIES } from "../engine/types";

// 50 seeds, spread out rather than sequential, mirroring the per-genre test files.
const SEEDS = Array.from({ length: 50 }, (_, i) => i * 7919 + 1);

describe("GENRES registry", () => {
  it("has an entry for every id in GENRE_LIST, self-identified correctly", () => {
    for (const id of GENRE_LIST) {
      expect(GENRES[id], id).toBeDefined();
      expect(GENRES[id].id, id).toBe(id);
    }
  });

  it("GENRE_LIST and the registry's keys are the same set", () => {
    expect(new Set(Object.keys(GENRES))).toEqual(new Set(GENRE_LIST));
  });
});

describe("cross-genre invariants", () => {
  for (const id of GENRE_LIST) {
    const genre = GENRES[id];

    describe(id, () => {
      it("has non-empty instructions and kidTitle", () => {
        expect(genre.instructions.length).toBeGreaterThan(0);
        expect(genre.kidTitle.length).toBeGreaterThan(0);
      });

      it("timing.kind is 'block' if and only if mode is 'speedBlock'", () => {
        expect(genre.timing.kind === "block").toBe(genre.mode === "speedBlock");
      });

      it("sample() returns an item with a non-empty explanation", () => {
        const { item, explanation } = genre.sample();
        expect(item).toBeDefined();
        expect(item).not.toBeNull();
        expect(typeof explanation).toBe("string");
        expect(explanation.length).toBeGreaterThan(0);
      });

      it("generate(seed, d) does not throw for 50 seeds x d 1..10", () => {
        for (const d of DIFFICULTIES) {
          for (const seed of SEEDS) {
            expect(() => genre.generate(seed, d)).not.toThrow();
          }
        }
      });
    });
  }
});
