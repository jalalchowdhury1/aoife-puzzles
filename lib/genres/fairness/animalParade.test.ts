// Validity/fairness guard for Animal Parade (owner decision #14, AGENTS.md
// "validity is sacred"). Each rule below is one named `it()` describing the
// real bug it would catch. This intentionally overlaps ../animalParade.test.ts
// (see lib/genres/fairness.test.ts's own header comment for why both stay).
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { animalParade, ANIMALS, type Animal, type AnimalParadeItem } from "../animalParade";

const SIZE_ORDER: Animal[] = ["ant", "mouse", "cat", "dog", "horse", "elephant"];
const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: AnimalParadeItem }

const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: animalParade.generate(seed, d) });
}

// Length/task plan per difficulty (owner spec).
const PLAN: Record<number, { task: AnimalParadeItem["task"]; len: number }[]> = {
  1: [{ task: "same", len: 2 }],
  2: [{ task: "same", len: 3 }],
  3: [{ task: "same", len: 4 }],
  4: [{ task: "backward", len: 2 }],
  5: [{ task: "backward", len: 3 }],
  6: [{ task: "backward", len: 4 }],
  7: [{ task: "size", len: 3 }],
  8: [{ task: "size", len: 4 }],
  9: [
    { task: "same", len: 5 },
    { task: "backward", len: 4 },
  ],
  10: [
    { task: "backward", len: 5 },
    { task: "size", len: 5 },
  ],
};

describe("animalParade fairness", () => {
  it("is deterministic — the same seed+difficulty always produces the same item (prevents a hidden Math.random/Date leak)", () => {
    for (const { seed, d, item } of ITEMS) {
      const again = animalParade.generate(seed, d);
      expect(again, `d${d} seed${seed}`).toEqual(item);
    }
  });

  it("every animal is one of the 6 board animals (prevents a stray/unrenderable animal id)", () => {
    for (const { d, item } of ITEMS) {
      for (const a of item.animals) expect(ANIMALS, `d${d}`).toContain(a);
      for (const a of item.expected) expect(ANIMALS, `d${d}`).toContain(a);
    }
  });

  it("length and task match the difficulty's plan exactly (prevents a band silently drifting to the wrong span or task)", () => {
    for (const { d, item } of ITEMS) {
      const plan = PLAN[d];
      const match = plan.some(p => p.task === item.task && p.len === item.animals.length);
      expect(match, `d${d} got ${item.task}/${item.animals.length}`).toBe(true);
    }
  });

  it("no two adjacent animals repeat (prevents a run like dog, dog that's ambiguous to tap back)", () => {
    for (const { d, item } of ITEMS) {
      for (let i = 1; i < item.animals.length; i++) {
        expect(item.animals[i], `d${d}`).not.toBe(item.animals[i - 1]);
      }
    }
  });

  it("'size' items use only distinct animals (prevents an unsortable tie — two of the same animal have no order between them)", () => {
    for (const { d, item } of ITEMS) {
      if (item.task !== "size") continue;
      expect(new Set(item.animals).size, `d${d}`).toBe(item.animals.length);
    }
  });

  it("expected is exactly the task's transform of the heard list — same order, reversed, or smallest-to-biggest (prevents a scoring key that doesn't match what was asked)", () => {
    for (const { d, item } of ITEMS) {
      const exp =
        item.task === "same"
          ? item.animals
          : item.task === "backward"
            ? [...item.animals].reverse()
            : [...item.animals].sort((x, y) => SIZE_ORDER.indexOf(x) - SIZE_ORDER.indexOf(y));
      expect(item.expected, `d${d}`).toEqual(exp);
    }
  });

  it("a 'size' item is never already in heard order (prevents a free answer that needs no reordering)", () => {
    for (const { d, item } of ITEMS) {
      if (item.task !== "size") continue;
      const alreadySorted = item.expected.every((v, i) => v === item.animals[i]);
      expect(alreadySorted, `d${d}`).toBe(false);
    }
  });

  it("expected.length always equals animals.length (prevents a truncated/padded scoring key)", () => {
    for (const { d, item } of ITEMS) {
      expect(item.expected.length, `d${d}`).toBe(item.animals.length);
    }
  });

  it("scoring requires the exact sequence — a partial or reordered match still scores 0 (prevents accidental partial credit)", () => {
    for (const { item } of ITEMS.slice(0, 50)) {
      expect(animalParade.score(item, item.expected).points).toBe(1);
      if (item.expected.length > 1) {
        const swapped = [...item.expected].reverse();
        if (JSON.stringify(swapped) !== JSON.stringify(item.expected)) {
          expect(animalParade.score(item, swapped).points).toBe(0);
        }
        expect(animalParade.score(item, item.expected.slice(0, -1)).points).toBe(0);
      }
    }
  });
});
