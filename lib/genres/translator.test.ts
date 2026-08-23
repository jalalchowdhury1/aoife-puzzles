import { describe, it, expect } from "vitest";
import { translator, TRANSLATOR_KEY } from "./translator";
import { DIFFICULTIES } from "../engine/types";
import type { BaseDifficulty } from "../engine/types";

const KEY_SIZE: Record<BaseDifficulty, number> = { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 5 };

describe("translator metadata", () => {
  it("is a speed-block genre with the fixed 120s timing", () => {
    expect(translator.id).toBe("translator");
    expect(translator.domain).toBe("PS");
    expect(translator.mode).toBe("speedBlock");
    expect(translator.timing.kind).toBe("block");
    if (translator.timing.kind === "block") expect(translator.timing.ms).toBe(120_000);
    expect(translator.e2e).toEqual({ kind: "tapOnly" });
  });

  it("TRANSLATOR_KEY has the 5 fixed animal-to-food mappings", () => {
    expect(TRANSLATOR_KEY).toHaveLength(5);
    expect(new Set(TRANSLATOR_KEY.map(k => k.animal)).size).toBe(5);
    expect(new Set(TRANSLATOR_KEY.map(k => k.food)).size).toBe(5);
  });
});

describe("translator.generate", () => {
  it("is deterministic and produces valid items across 500 seeds x 10 difficulties", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = translator.generate(seed, d);
        const b = translator.generate(seed, d);
        expect(b).toEqual(a); // determinism

        const n = KEY_SIZE[d as BaseDifficulty];
        expect(a.key).toEqual(TRANSLATOR_KEY.slice(0, n));

        const keyAnimals = a.key.map(k => k.animal);
        expect(keyAnimals).toContain(a.animal); // the current animal is always in the key

        expect(a.lookahead).toHaveLength(4);
        for (const animal of a.lookahead) expect(keyAnimals).toContain(animal);
      }
    }
  });

  it("difficulty only changes the key size, not the mapping itself", () => {
    for (const d of DIFFICULTIES) {
      const item = translator.generate(7, d);
      for (const pair of item.key) {
        const global = TRANSLATOR_KEY.find(k => k.animal === pair.animal)!;
        expect(pair.food).toBe(global.food);
      }
    }
  });
});

describe("translator.score", () => {
  it("scores 1 for the food matching the animal's key entry, 0 otherwise", () => {
    const item = translator.generate(1, 5);
    const correctFood = item.key.find(k => k.animal === item.animal)!.food;
    const wrongFood = item.key.find(k => k.food !== correctFood)!.food;

    expect(translator.score(item, correctFood)).toEqual({ points: 1, max: 1, correct: true });
    expect(translator.score(item, wrongFood)).toEqual({ points: 0, max: 1, correct: false });
    expect(translator.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });
});

describe("translator.sample", () => {
  it("is a dog that maps to meat, with an explanation", () => {
    const { item, explanation } = translator.sample();
    expect(item.animal).toBe(TRANSLATOR_KEY[0].animal);
    expect(item.key.find(k => k.animal === item.animal)!.food).toBe(TRANSLATOR_KEY[0].food);
    expect(item.lookahead).toHaveLength(4);
    expect(explanation.length).toBeGreaterThan(0);
  });
});
