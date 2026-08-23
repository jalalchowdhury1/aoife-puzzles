import { describe, it, expect } from "vitest";
import { animalParade, ANIMALS, type Animal, type AnimalParadeItem } from "./animalParade";
import { DIFFICULTIES } from "../engine/types";

const SIZE_ORDER: Animal[] = ["ant", "mouse", "cat", "dog", "horse", "elephant"];

// Length/task plan per difficulty (owner spec). d9/d10 list both seed-parity
// variants; a generated item must land on one of them.
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

describe("animalParade.generate", () => {
  it("is deterministic and obeys the length/task plan for 500 seeds x 10 difficulties", () => {
    for (const d of DIFFICULTIES) {
      for (let seed = 0; seed < 500; seed++) {
        const a = animalParade.generate(seed, d);
        const b = animalParade.generate(seed, d);
        expect(a).toEqual(b);

        const plan = PLAN[d];
        const match = plan.find(p => p.task === a.task && p.len === a.animals.length);
        expect(match, `d${d} seed${seed} got ${a.task}/${a.animals.length}`).toBeTruthy();

        // every animal is one of the 6 known animals
        for (const animal of a.animals) expect(ANIMALS).toContain(animal);

        // no two ADJACENT animals repeat
        for (let i = 1; i < a.animals.length; i++) expect(a.animals[i]).not.toBe(a.animals[i - 1]);

        // "size" items use only distinct animals (no repeats at all — sizing a repeat is ambiguous)
        if (a.task === "size") {
          expect(new Set(a.animals).size).toBe(a.animals.length);
        }

        // expected matches the task's transform of animals
        const exp =
          a.task === "same"
            ? a.animals
            : a.task === "backward"
              ? [...a.animals].reverse()
              : [...a.animals].sort((x, y) => SIZE_ORDER.indexOf(x) - SIZE_ORDER.indexOf(y));
        expect(a.expected).toEqual(exp);

        // a "size" item is never already in sorted order (would be a free answer)
        if (a.task === "size") {
          const alreadySorted = a.expected.every((v, i) => v === a.animals[i]);
          expect(alreadySorted).toBe(false);
        }
      }
    }
  });

  it("scores exact sequence only", () => {
    const item: AnimalParadeItem = { animals: ["dog", "ant", "horse"], task: "backward", expected: ["horse", "ant", "dog"] };
    expect(animalParade.score(item, ["horse", "ant", "dog"]).points).toBe(1);
    expect(animalParade.score(item, ["dog", "ant", "horse"]).points).toBe(0);
    expect(animalParade.score(item, ["horse", "ant"]).points).toBe(0);
    expect(animalParade.score(item, null).correct).toBe(false);
  });
});

describe("animalParade.sample", () => {
  it("is a 2-animal 'same' item", () => {
    const { item, explanation } = animalParade.sample();
    expect(item.task).toBe("same");
    expect(item.animals).toEqual(["dog", "cat"]);
    expect(item.expected).toEqual(["dog", "cat"]);
    expect(explanation).toBe("I said dog, then cat. So you tap dog, then cat. Same order.");
  });
});

describe("animalParade genre metadata", () => {
  it("has the expected id, domain, mode, and timing", () => {
    expect(animalParade.id).toBe("animalParade");
    expect(animalParade.domain).toBe("WM");
    expect(animalParade.mode).toBe("staircase");
    expect(animalParade.timing).toEqual({ kind: "none" });
  });
  it("declares a sequence-kind e2e plan", () => {
    expect(animalParade.e2e).toEqual({ kind: "sequence", taps: 2 });
  });
});
