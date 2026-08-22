import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../engine/types";
import { SHAPES } from "./shapes";
import { coding, CODE_KEY } from "./coding";

const CODE_SHAPES = CODE_KEY.map(k => k.shape);

describe("coding", () => {
  it("is a speed-block genre with the fixed 120s timing", () => {
    expect(coding.mode).toBe("speedBlock");
    expect(coding.timing.kind).toBe("block");
    if (coding.timing.kind === "block") expect(coding.timing.ms).toBe(120_000);
  });

  it("CODE_KEY has the 5 fixed shape-to-mark mappings", () => {
    expect(CODE_KEY).toEqual([
      { shape: "star", mark: "bar" },
      { shape: "circle", mark: "dash" },
      { shape: "triangle", mark: "ring" },
      { shape: "square", mark: "hat" },
      { shape: "hexagon", mark: "cross" },
    ]);
  });

  it("generate is deterministic and produces valid items across 500 seeds x 10 difficulties", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const a = coding.generate(seed, d);
        const b = coding.generate(seed, d);
        expect(b).toEqual(a); // determinism

        expect(CODE_SHAPES).toContain(a.shape);
        expect(SHAPES.slice(0, 5)).toEqual(expect.arrayContaining(CODE_SHAPES));
        expect(a.lookahead).toHaveLength(4);
        for (const s of a.lookahead) expect(CODE_SHAPES).toContain(s);
      }
    }
  });

  it("scores 1 for the mark matching the shape's key entry, 0 otherwise", () => {
    const item = coding.generate(1, 5);
    const correctMark = CODE_KEY.find(k => k.shape === item.shape)!.mark;
    const wrongMark = CODE_KEY.find(k => k.mark !== correctMark)!.mark;

    const right = coding.score(item, correctMark);
    expect(right).toEqual({ points: 1, max: 1, correct: true });

    const wrong = coding.score(item, wrongMark);
    expect(wrong).toEqual({ points: 0, max: 1, correct: false });

    const timedOut = coding.score(item, null);
    expect(timedOut).toEqual({ points: 0, max: 1, correct: false });
  });

  it("sample() is a star that maps to bar, with an explanation", () => {
    const { item, explanation } = coding.sample();
    expect(item.shape).toBe("star");
    expect(CODE_KEY.find(k => k.shape === "star")!.mark).toBe("bar");
    expect(item.lookahead).toHaveLength(4);
    expect(explanation.length).toBeGreaterThan(0);
  });

  it("difficulty is ignored (same seed yields the same item at any d)", () => {
    const items = DIFFICULTIES.map(d => coding.generate(99, d));
    for (const it of items) expect(it).toEqual(items[0]);
  });
});
