import { describe, it, expect } from "vitest";
import { mosaic, tileKey, tileEqual, tileSvg, audit, type MosaicItem, type Tile } from "./mosaic";
import type { Difficulty } from "../engine/types";

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEEDS = Array.from({ length: 500 }, (_, i) => i * 7919 + 1);

function nFor(d: Difficulty): 2 | 3 {
  return d <= 4 ? 2 : 3;
}

describe("mosaic generator", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 50)) {
        expect(mosaic.generate(seed, d)).toEqual(mosaic.generate(seed, d));
      }
    }
  });

  it("produces a target of length n*n and the right n per difficulty", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = mosaic.generate(seed, d);
        expect(item.n).toBe(nFor(d));
        expect(item.target.length).toBe(item.n * item.n);
      }
    }
  });

  it("shows grid lines iff d < 8", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const item = mosaic.generate(seed, d);
        expect(item.showGrid).toBe(d < 8);
      }
    }
  });

  it("d1: exactly 2 solid colours, both present, never solid-uniform", () => {
    for (const seed of SEEDS) {
      const item = mosaic.generate(seed, 1);
      expect(item.palette.length).toBe(2);
      for (const t of item.target) expect(t.kind).toBe("solid");
      const colors = new Set(item.target.map(t => (t as { color: string }).color));
      expect(colors.size).toBe(2);
    }
  });

  it("d3: exactly one half tile, palette is exactly 3", () => {
    for (const seed of SEEDS) {
      const item = mosaic.generate(seed, 3);
      expect(item.palette.length).toBe(3);
      const halves = item.target.filter(t => t.kind === "half");
      expect(halves.length).toBe(1);
    }
  });

  it("d10: every cell is half or quarter, never solid", () => {
    for (const seed of SEEDS) {
      const item = mosaic.generate(seed, 10);
      for (const t of item.target) expect(t.kind).not.toBe("solid");
    }
  });
});

describe("mosaic scoring", () => {
  it("scores 1 for an exact match", () => {
    const item: MosaicItem = {
      n: 2,
      target: [
        { kind: "solid", color: "#f06b7a" },
        { kind: "solid", color: "#2bb3a9" },
        { kind: "solid", color: "#2bb3a9" },
        { kind: "solid", color: "#f06b7a" },
      ],
      palette: [{ kind: "solid", color: "#f06b7a" }, { kind: "solid", color: "#2bb3a9" }],
      showGrid: true,
    };
    const result = mosaic.score(item, item.target);
    expect(result).toEqual({ points: 1, max: 1, correct: true });
  });

  it("scores 0 for a null response", () => {
    const item = mosaic.generate(1, 1);
    expect(mosaic.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });

  it("scores 0 for a rotated copy of the target", () => {
    const item = mosaic.generate(1, 1);
    const rotated = [item.target[2], item.target[3], item.target[0], item.target[1]];
    // Only a real bug if the rotation actually produces a different layout.
    if (!rotated.every((t, i) => tileEqual(t, item.target[i]))) {
      expect(mosaic.score(item, rotated).correct).toBe(false);
    }
  });

  it("scores 0 when one cell differs", () => {
    const item = mosaic.generate(1, 3);
    const near: Tile[] = [...item.target];
    const otherIdx = item.palette.findIndex(t => !tileEqual(t, near[0]));
    near[0] = item.palette[otherIdx >= 0 ? otherIdx : 0];
    if (!tileEqual(near[0], item.target[0])) {
      expect(mosaic.score(item, near).correct).toBe(false);
    }
  });
});

describe("tile helpers", () => {
  it("tileKey/tileEqual agree: same content -> equal, different content -> not equal", () => {
    const a: Tile = { kind: "half", a: "#111", b: "#222", orient: 0 };
    const b: Tile = { kind: "half", a: "#111", b: "#222", orient: 0 };
    const c: Tile = { kind: "half", a: "#111", b: "#222", orient: 1 };
    expect(tileKey(a)).toBe(tileKey(b));
    expect(tileEqual(a, b)).toBe(true);
    expect(tileEqual(a, c)).toBe(false);
  });

  it("tileSvg returns non-empty svg markup for every kind", () => {
    const tiles: Tile[] = [
      { kind: "solid", color: "#f06b7a" },
      { kind: "half", a: "#f06b7a", b: "#2bb3a9", orient: 0 },
      { kind: "quarter", a: "#f06b7a", b: "#2bb3a9", orient: 2 },
    ];
    for (const t of tiles) {
      const svg = tileSvg(t, 64);
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    }
  });
});

describe("mosaic metadata", () => {
  it("has a sample with an explanation matching its picture", () => {
    const { item, explanation } = mosaic.sample();
    expect(item.target.length).toBe(4);
    expect(explanation).toContain("teal");
    expect(explanation).toContain("amber");
    expect(mosaic.score(item, item.target).correct).toBe(true);
  });

  it("declares id, domain, and staircase mode", () => {
    expect(mosaic.id).toBe("mosaic");
    expect(mosaic.domain).toBe("VS");
    expect(mosaic.mode).toBe("staircase");
  });

  it("time caps: 60s d<=4, 75s d5-7, 120s d>=8", () => {
    if (mosaic.timing.kind !== "item") throw new Error("expected item timing");
    expect(mosaic.timing.ms(1)).toBe(60000);
    expect(mosaic.timing.ms(4)).toBe(60000);
    expect(mosaic.timing.ms(5)).toBe(75000);
    expect(mosaic.timing.ms(7)).toBe(75000);
    expect(mosaic.timing.ms(8)).toBe(120000);
    expect(mosaic.timing.ms(10)).toBe(120000);
  });

  it("audit() returns self-contained, non-empty HTML/SVG", () => {
    const { item } = mosaic.sample();
    const html = audit(item);
    expect(html).toContain("<svg");
    expect(html).toContain("</html>");
  });
});
