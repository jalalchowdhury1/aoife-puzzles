// Fairness/validity guard for Translator (owner decision #14: "validity is
// sacred"). Each rule below is one named it(...) with a one-line comment
// saying the real bug it prevents. Intentionally overlaps translator.test.ts
// (see fairness.test.ts's header note on the repo's existing genres) — that
// file pins the contract with a handful of hand-picked cases; this file
// sweeps the full 500 seeds x 10 difficulties the way the shared
// fairness.test.ts does for every other genre.
import { describe, it, expect } from "vitest";
import { translator, TRANSLATOR_KEY } from "../translator";
import { DIFFICULTIES } from "../../engine/types";
import type { Difficulty } from "../../engine/types";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);
const KEY_SIZE: Record<Difficulty, number> = { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 5 };

// One 500 x 10 sweep, generated once and reused by every rule below.
const ITEMS = DIFFICULTIES.flatMap(d => SEEDS.map(seed => ({ seed, d, item: translator.generate(seed, d) })));

describe("translator fairness", () => {
  it("generate is deterministic (no seed/date/Math.random leak into the puzzle)", () => {
    for (const { seed, d, item } of ITEMS) {
      expect(translator.generate(seed, d)).toEqual(item);
    }
  });

  it("key size exactly matches the published band (3 at d<=3, 4 at d4-6, 5 at d>=7) — no cliff, no wrong-band item", () => {
    for (const { d, item } of ITEMS) {
      expect(item.key.length).toBe(KEY_SIZE[d]);
    }
  });

  it("the key is always the global map's PREFIX — an animal never maps to a different food across items/difficulties", () => {
    for (const { item } of ITEMS) {
      expect(item.key).toEqual(TRANSLATOR_KEY.slice(0, item.key.length));
    }
  });

  it("the current animal is always present in the shown key — prevents an unanswerable item", () => {
    for (const { item } of ITEMS) {
      expect(item.key.some(k => k.animal === item.animal)).toBe(true);
    }
  });

  it("lookahead is always exactly 4 animals, every one drawn from the shown key", () => {
    for (const { item } of ITEMS) {
      expect(item.lookahead).toHaveLength(4);
      const keyAnimals = new Set(item.key.map(k => k.animal));
      for (const a of item.lookahead) expect(keyAnimals.has(a)).toBe(true);
    }
  });

  it("no two animals in the key ever share the same food, and no two foods repeat — a single unambiguous tap target", () => {
    for (const { item } of ITEMS) {
      expect(new Set(item.key.map(k => k.animal)).size).toBe(item.key.length);
      expect(new Set(item.key.map(k => k.food)).size).toBe(item.key.length);
    }
  });

  it("exactly one food scores full credit for the shown animal — every other food in the key scores 0", () => {
    for (const { item } of ITEMS) {
      const correctFood = item.key.find(k => k.animal === item.animal)!.food;
      expect(translator.score(item, correctFood)).toEqual({ points: 1, max: 1, correct: true });
      for (const { food } of item.key) {
        if (food !== correctFood) expect(translator.score(item, food).points).toBe(0);
      }
    }
  });

  it("a food from outside the currently-shown key still scores 0 — never accidentally credited", () => {
    for (const { item } of ITEMS) {
      const shownFoods = new Set(item.key.map(k => k.food));
      const foreignFood = TRANSLATOR_KEY.map(k => k.food).find(f => !shownFoods.has(f));
      if (foreignFood === undefined) continue; // full 5-pair key: nothing foreign left
      expect(translator.score(item, foreignFood).points).toBe(0);
    }
  });

  it("a null (unanswered) response scores 0, never full credit", () => {
    for (const { item } of ITEMS) {
      expect(translator.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
    }
  });
});
