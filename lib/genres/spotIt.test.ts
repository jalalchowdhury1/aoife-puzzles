import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../engine/types";
import { spotIt, FAMILIES } from "./spotIt";

describe("spotIt", () => {
  it("is a speed-block genre with the fixed 120s timing", () => {
    expect(spotIt.mode).toBe("speedBlock");
    expect(spotIt.timing.kind).toBe("block");
    if (spotIt.timing.kind === "block") expect(spotIt.timing.ms).toBe(120_000);
  });

  it("generate is deterministic and produces a valid item across 500 seeds x 10 difficulties", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = spotIt.generate(seed, d);
        const b = spotIt.generate(seed, d);
        expect(b).toEqual(a); // determinism

        expect(FAMILIES.some(f => f.includes(a.target))).toBe(true);
        expect(a.group.includes(a.target)).toBe(a.present);
        expect(new Set(a.group).size).toBe(a.group.length);
        expect(a.group.length).toBe(d <= 3 ? 3 : 4);
      }
    }
  });

  it("scores 1 for YES iff present, 1 for NO iff absent, 0 otherwise", () => {
    const present = { target: "🐶", group: ["🐶", "🚗", "⭐", "🍎"], present: true };
    const absent = { target: "🐶", group: ["🐺", "🚗", "⭐", "🍎"], present: false };

    expect(spotIt.score(present, true)).toEqual({ points: 1, max: 1, correct: true });
    expect(spotIt.score(present, false)).toEqual({ points: 0, max: 1, correct: false });
    expect(spotIt.score(absent, false)).toEqual({ points: 1, max: 1, correct: true });
    expect(spotIt.score(absent, true)).toEqual({ points: 0, max: 1, correct: false });
    expect(spotIt.score(present, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("sample() is a group where the target is present, with an explanation", () => {
    const { item, explanation } = spotIt.sample();
    expect(item.present).toBe(true);
    expect(item.group).toContain(item.target);
    expect(explanation.length).toBeGreaterThan(0);
  });
});
