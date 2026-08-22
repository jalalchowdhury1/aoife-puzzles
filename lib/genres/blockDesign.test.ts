import { describe, it, expect } from "vitest";
import { blockDesign, FACES, faceSvg, type Face, type BlockDesignItem } from "./blockDesign";
import type { Difficulty } from "../engine/types";

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEEDS = Array.from({ length: 500 }, (_, i) => i * 7919 + 1);
const DIAGONALS: Face[] = ["NE", "SE", "SW", "NW"];

function diagBand(d: Difficulty): [number, number] {
  if (d <= 2) return [0, 0];
  if (d <= 4) return [1, 4];
  if (d <= 6) return [1, 3];
  if (d <= 8) return [3, 5];
  return [6, 9];
}

function nFor(d: Difficulty): 2 | 3 {
  return d <= 4 ? 2 : 3;
}

describe("blockDesign generator", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 50)) {
        const a = blockDesign.generate(seed, d);
        const b = blockDesign.generate(seed, d);
        expect(a).toEqual(b);
      }
    }
  });

  it("produces a grid of length n*n and the right n per difficulty", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = blockDesign.generate(seed, d);
        expect(item.n).toBe(nFor(d));
        expect(item.grid.length).toBe(item.n * item.n);
      }
    }
  });

  it("keeps diagonal counts within the difficulty band", () => {
    for (const d of DIFFICULTIES) {
      const [min, max] = diagBand(d);
      for (const seed of SEEDS) {
        const item = blockDesign.generate(seed, d);
        const diagCount = item.grid.filter(f => DIAGONALS.includes(f)).length;
        expect(diagCount).toBeGreaterThanOrEqual(min);
        expect(diagCount).toBeLessThanOrEqual(max);
      }
    }
  });

  it("shows grid lines iff d < 7", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = blockDesign.generate(seed, d);
        expect(item.showGridLines).toBe(d < 7);
      }
    }
  });

  it("at d1-2 uses only W/R and is never all one face", () => {
    for (const d of [1, 2] as Difficulty[]) {
      for (const seed of SEEDS) {
        const item = blockDesign.generate(seed, d);
        for (const f of item.grid) expect(["W", "R"]).toContain(f);
        expect(item.grid.every(f => f === item.grid[0])).toBe(false);
      }
    }
  });

  it("every cell is a legal face", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 100)) {
        const item = blockDesign.generate(seed, d);
        for (const f of item.grid) expect(FACES).toContain(f);
      }
    }
  });
});

describe("blockDesign scoring", () => {
  it("scores 1 for an exact match", () => {
    const item: BlockDesignItem = { n: 2, grid: ["R", "W", "W", "R"], showGridLines: true };
    const result = blockDesign.score(item, ["R", "W", "W", "R"]);
    expect(result).toEqual({ points: 1, max: 1, correct: true });
  });

  it("scores 0 for a rotated copy of the grid", () => {
    const item: BlockDesignItem = { n: 2, grid: ["R", "W", "W", "R"], showGridLines: true };
    const result = blockDesign.score(item, ["W", "R", "R", "W"]);
    expect(result.points).toBe(0);
    expect(result.correct).toBe(false);
  });

  it("scores 0 for a null response", () => {
    const item: BlockDesignItem = { n: 2, grid: ["R", "W", "W", "R"], showGridLines: true };
    const result = blockDesign.score(item, null);
    expect(result).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 0 for a near miss (one cell off)", () => {
    const item: BlockDesignItem = { n: 3, grid: ["W", "R", "NE", "SE", "R", "SW", "NW", "W", "R"], showGridLines: false };
    const near = ["W", "R", "NE", "SE", "R", "SW", "NW", "W", "W"] as Face[];
    const result = blockDesign.score(item, near);
    expect(result.points).toBe(0);
  });
});

describe("faceSvg", () => {
  it("returns non-empty svg markup for every face", () => {
    for (const f of FACES) {
      const svg = faceSvg(f, 96);
      expect(typeof svg).toBe("string");
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    }
  });

  it("FACES cycle order is W,R,NE,SE,SW,NW", () => {
    expect(FACES).toEqual(["W", "R", "NE", "SE", "SW", "NW"]);
  });
});

describe("blockDesign metadata", () => {
  it("has a sample with an explanation", () => {
    const { item, explanation } = blockDesign.sample();
    expect(item.grid.length).toBe(item.n * item.n);
    expect(typeof explanation).toBe("string");
    expect(explanation.length).toBeGreaterThan(0);
  });

  it("declares id, domain, and staircase mode", () => {
    expect(blockDesign.id).toBe("blockDesign");
    expect(blockDesign.domain).toBe("VS");
    expect(blockDesign.mode).toBe("staircase");
  });
});
