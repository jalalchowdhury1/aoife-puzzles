import { describe, it, expect } from "vitest";
import { pictureSpan } from "./pictureSpan";
import type { PictureSpanItem } from "./pictureSpan";
import { DIFFICULTIES } from "../engine/types";
import type { BaseDifficulty } from "../engine/types";

// Mirrors the spec's k-by-difficulty table (section 2.7 / task 7), kept independent
// of the implementation so the test actually pins the contract.
const K_BY_D: Record<BaseDifficulty, number> = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 7 };

describe("pictureSpan metadata", () => {
  it("matches the WM staircase contract", () => {
    expect(pictureSpan.id).toBe("pictureSpan");
    expect(pictureSpan.domain).toBe("WM");
    expect(pictureSpan.mode).toBe("staircase");
  });
});

describe("pictureSpan.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = pictureSpan.generate(seed, d);
        const b = pictureSpan.generate(seed, d);
        expect(b).toEqual(a);
      }
    }
  });

  it("satisfies the shape contract for every seed and difficulty", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const item = pictureSpan.generate(seed, d);
        const k = K_BY_D[d as BaseDifficulty];
        const expectedChoiceCount = k + (d <= 5 ? 4 : 6);

        expect(item.shown.length).toBe(k);
        expect(new Set(item.shown).size).toBe(k);

        expect(item.choices.length).toBe(expectedChoiceCount);
        expect(new Set(item.choices).size).toBe(expectedChoiceCount);

        for (const icon of item.shown) {
          expect(item.choices).toContain(icon);
        }

        expect(item.exposureMs).toBe(k <= 2 ? 3000 : 5000);
      }
    }
  });
});

describe("pictureSpan.score", () => {
  const item: PictureSpanItem = {
    shown: ["🍎", "🐶", "🚗"],
    choices: ["🍎", "🐶", "🚗", "⭐", "🌸", "🐟", "🎈"],
    exposureMs: 5000,
  };

  it("awards 2 for the exact order", () => {
    expect(pictureSpan.score(item, ["🍎", "🐶", "🚗"])).toEqual({ points: 2, max: 2, correct: true });
  });

  it("awards 1 for the right set in the wrong order", () => {
    expect(pictureSpan.score(item, ["🐶", "🍎", "🚗"])).toEqual({ points: 1, max: 2, correct: true });
  });

  it("awards 1 for the fully reversed order", () => {
    expect(pictureSpan.score(item, ["🚗", "🐶", "🍎"])).toEqual({ points: 1, max: 2, correct: true });
  });

  it("awards 0 for a wrong pick", () => {
    expect(pictureSpan.score(item, ["🍎", "🐶", "⭐"])).toEqual({ points: 0, max: 2, correct: false });
  });

  it("awards 0 for the wrong number of taps", () => {
    expect(pictureSpan.score(item, ["🍎", "🐶"])).toEqual({ points: 0, max: 2, correct: false });
  });

  it("awards 0 for a null response", () => {
    expect(pictureSpan.score(item, null)).toEqual({ points: 0, max: 2, correct: false });
  });

  it("awards 0 for an empty response", () => {
    expect(pictureSpan.score(item, [])).toEqual({ points: 0, max: 2, correct: false });
  });

  it("scores a single-picture span correctly", () => {
    const one: PictureSpanItem = { shown: ["🌙"], choices: ["🌙", "🍪", "🐸", "⚽", "🎁"], exposureMs: 3000 };
    expect(pictureSpan.score(one, ["🌙"])).toEqual({ points: 2, max: 2, correct: true });
    expect(pictureSpan.score(one, ["🍪"])).toEqual({ points: 0, max: 2, correct: false });
  });
});

describe("pictureSpan.sample", () => {
  it("shows the dog then the star and explains tapping them in that order", () => {
    const { item, explanation } = pictureSpan.sample();
    expect(item.shown).toEqual(["🐶", "⭐"]);
    expect(item.shown.every(icon => item.choices.includes(icon))).toBe(true);
    expect(new Set(item.choices).size).toBe(item.choices.length);
    expect(explanation).toBe("You saw the 🐶, then the ⭐. So you tap the 🐶 first, then the ⭐.");
  });
});
