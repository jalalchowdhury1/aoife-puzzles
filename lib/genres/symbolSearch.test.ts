import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../engine/types";
import { GLYPHS } from "./glyphs";
import { symbolSearch } from "./symbolSearch";

const ALL_IDS = new Set(GLYPHS.map(g => g.id));

function twinOf(id: string): string {
  return id.endsWith("1") ? `${id[0]}2` : `${id[0]}1`;
}

describe("symbolSearch", () => {
  it("is a speed-block genre with the fixed 120s timing", () => {
    expect(symbolSearch.mode).toBe("speedBlock");
    expect(symbolSearch.timing.kind).toBe("block");
    if (symbolSearch.timing.kind === "block") expect(symbolSearch.timing.ms).toBe(120_000);
  });

  it("generate is deterministic and produces valid rows across 500 seeds x 10 difficulties", () => {
    let presentCount = 0;
    let total = 0;
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = symbolSearch.generate(seed, d);
        const b = symbolSearch.generate(seed, d);
        expect(b).toEqual(a); // determinism

        expect(ALL_IDS.has(a.target)).toBe(true);
        expect(a.group).toHaveLength(3);
        expect(new Set(a.group).size).toBe(3);
        for (const id of a.group) expect(ALL_IDS.has(id)).toBe(true);
        expect(a.group.includes(a.target)).toBe(a.present);

        total++;
        if (a.present) presentCount++;
      }
    }
    const rate = presentCount / total;
    expect(rate).toBeGreaterThan(0.4);
    expect(rate).toBeLessThan(0.6);
  });

  it("prefers the confusable twin when the target is absent", () => {
    let twinIncluded = 0;
    let absentCount = 0;
    for (let seed = 0; seed < 2000; seed++) {
      const item = symbolSearch.generate(seed, 1);
      if (!item.present) {
        absentCount++;
        if (item.group.includes(twinOf(item.target))) twinIncluded++;
      }
    }
    const rate = twinIncluded / absentCount;
    expect(rate).toBeGreaterThan(0.55);
    expect(rate).toBeLessThan(0.85);
  });

  it("scores 1 for YES iff present, 1 for NO iff absent, 0 otherwise", () => {
    const present = { target: "a1", group: ["a1", "b1", "c1"], present: true };
    const absent = { target: "a1", group: ["a2", "b1", "c1"], present: false };

    expect(symbolSearch.score(present, true)).toEqual({ points: 1, max: 1, correct: true });
    expect(symbolSearch.score(present, false)).toEqual({ points: 0, max: 1, correct: false });
    expect(symbolSearch.score(absent, false)).toEqual({ points: 1, max: 1, correct: true });
    expect(symbolSearch.score(absent, true)).toEqual({ points: 0, max: 1, correct: false });
    expect(symbolSearch.score(present, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("sample() is a row where the target is present, with an explanation", () => {
    const { item, explanation } = symbolSearch.sample();
    expect(item.present).toBe(true);
    expect(item.group).toContain(item.target);
    expect(explanation.length).toBeGreaterThan(0);
  });
});
