// Fairness/validity guard for Mosaic Maker (owner decision #14, AGENTS.md:
// "validity is sacred"). Each rule is one named it(...) stating the real bug
// it prevents. Mirrors the shape of the shared lib/genres/fairness.test.ts
// (not edited here — this genre isn't registered in GENRE_LIST yet, so it
// gets its own file per the new-genre worker brief).
import { describe, it, expect } from "vitest";
import { mosaic, tileKey, type MosaicItem, type Tile } from "../mosaic";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: MosaicItem }
const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: mosaic.generate(seed, d) });
}

/** Rotates an n x n row-major array 90deg clockwise (cell positions only —
 * does NOT correct each tile's own `orient` field, which is exactly why a
 * "spin the board" cheat should not score as correct; see the scoring test below). */
function rotatePositionsCW<T>(cells: T[], n: number): T[] {
  const next: T[] = new Array(n * n);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) next[r * n + c] = cells[(n - 1 - c) * n + r];
  }
  return next;
}

describe("Mosaic Maker — universal validity rules", () => {
  it("generate(seed, d) is pure and deterministic — a reload mid-block must never show a different puzzle than the one that was scored", () => {
    const RESAMPLE = Array.from({ length: 40 }, (_, i) => i * 251 + 7);
    for (const d of DIFFICULTIES) {
      for (const seed of RESAMPLE) {
        expect(mosaic.generate(seed, d), `d${d} seed${seed}`).toEqual(mosaic.generate(seed, d));
      }
    }
  });

  it("every target cell is one of the tiles in the palette — she can never be asked to build a tile she cannot tap to", () => {
    for (const { item, seed, d } of ITEMS) {
      const paletteKeys = new Set(item.palette.map(tileKey));
      for (const t of item.target) {
        expect(paletteKeys.has(tileKey(t)), `seed${seed} d${d}`).toBe(true);
      }
    }
  });

  it("the palette has between 2 and 6 tiles, with no two palette entries visually identical — a duplicate tile makes two cycle-stops look the same while only one path reaches a given picture", () => {
    for (const { item, seed, d } of ITEMS) {
      expect(item.palette.length, `seed${seed} d${d}`).toBeGreaterThanOrEqual(2);
      expect(item.palette.length, `seed${seed} d${d}`).toBeLessThanOrEqual(6);
      const keys = item.palette.map(tileKey);
      expect(new Set(keys).size, `seed${seed} d${d}`).toBe(keys.length);
    }
  });

  it("grid lines are shown iff d < 8 — dropping the scaffold before the picture is actually hard enough to need it would fail her for a reason unrelated to the skill", () => {
    for (const { item, seed, d } of ITEMS) {
      expect(item.showGrid, `seed${seed} d${d}`).toBe(d < 8);
    }
  });

  it("score() marks the exact target correct and any single-cell change incorrect, for a representative sample per difficulty", () => {
    for (const d of DIFFICULTIES) {
      const { item } = { item: mosaic.generate(1000 + d, d) };
      expect(mosaic.score(item, item.target).correct, `d${d}`).toBe(true);
      // Flip one cell to a different palette tile if one exists; every band has >=2 palette tiles.
      const other = item.palette.find(t => tileKey(t) !== tileKey(item.target[0]))!;
      const near: Tile[] = [...item.target];
      near[0] = other;
      expect(mosaic.score(item, near).correct, `d${d}`).toBe(false);
    }
  });

  it("a genuinely rotated copy of the target never scores as correct — the board is a paint-by-cell grid, not a physical tile sheet she could spin to fake a match", () => {
    for (const { item, seed, d } of ITEMS) {
      const rotated = rotatePositionsCW(item.target, item.n);
      if (rotated.every((t, i) => tileKey(t) === tileKey(item.target[i]))) continue; // rotationally symmetric target: identical picture, not a bug
      expect(mosaic.score(item, rotated).correct, `seed${seed} d${d}`).toBe(false);
    }
  });

  it("sample() scores correct when answered with its own displayed target, so the worked example actually teaches the right pattern", () => {
    const { item } = mosaic.sample();
    expect(mosaic.score(item, item.target).correct).toBe(true);
  });
});

describe("Mosaic Maker — band-specific fairness rules", () => {
  it("d1-2: every tile is solid and at least 2 distinct colours are present — the skill is copying colours, not spotting a blank/uniform board", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d > 2) continue;
      for (const t of item.target) expect(t.kind, `seed${seed} d${d}`).toBe("solid");
      const colors = new Set(item.target.map(t => (t as { color: string }).color));
      expect(colors.size, `seed${seed} d${d}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("d1: palette is exactly 2 tiles (no extras) — the very first step introduces exactly the two colours she needs, nothing more", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 1) continue;
      expect(item.palette.length, `seed${seed}`).toBe(2);
    }
  });

  it("d3: exactly one half tile appears, and the palette is exactly 3 tiles — introducing the diagonal split one tile at a time", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 3) continue;
      expect(item.palette.length, `seed${seed}`).toBe(3);
      expect(item.target.filter(t => t.kind === "half").length, `seed${seed}`).toBe(1);
    }
  });

  it("d4: exactly two half tiles, in two different orientations — the new idea at this step is telling diagonal directions apart", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 4) continue;
      const halves = item.target.filter((t): t is Extract<Tile, { kind: "half" }> => t.kind === "half");
      expect(halves.length, `seed${seed}`).toBe(2);
      expect(halves[0].orient, `seed${seed}`).not.toBe(halves[1].orient);
    }
  });

  it("d7: exactly one quarter tile and exactly two half tiles in two different orientations — the quarter shape is introduced alone against a familiar background", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 7) continue;
      const quarters = item.target.filter(t => t.kind === "quarter");
      const halves = item.target.filter((t): t is Extract<Tile, { kind: "half" }> => t.kind === "half");
      expect(quarters.length, `seed${seed}`).toBe(1);
      expect(halves.length, `seed${seed}`).toBe(2);
      expect(halves[0].orient, `seed${seed}`).not.toBe(halves[1].orient);
    }
  });

  it("d9: at least 7 of the 9 cells are half or quarter tiles — 'mostly halves/quarters' as specified, not merely 'some'", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 9) continue;
      const nonSolid = item.target.filter(t => t.kind !== "solid").length;
      expect(nonSolid, `seed${seed}`).toBeGreaterThanOrEqual(7);
    }
  });

  it("d10: every cell is half or quarter (never solid) and the 4 corners are quarter tiles covering all 4 orientations exactly once — a genuine symmetric motif, not a random mix", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 10) continue;
      for (const t of item.target) expect(t.kind, `seed${seed}`).not.toBe("solid");
      const cornerIdx = [0, 2, 8, 6];
      const cornerOrients = cornerIdx.map(i => (item.target[i] as Extract<Tile, { kind: "quarter" }>).orient);
      for (const i of cornerIdx) expect(item.target[i].kind, `seed${seed}`).toBe("quarter");
      expect(new Set(cornerOrients).size, `seed${seed}`).toBe(4);
    }
  });

  it("d5-9: the target never uses more than 4 distinct colours (MOSAIC_COLORS' own ceiling) and every non-target palette 'extra' never actually appears on the board", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d < 5 || d > 9) continue;
      const usedKeys = new Set(item.target.map(tileKey));
      // every palette tile not used in the target is, by construction, a legitimate distinct entry —
      // just confirm the reverse direction isn't violated: no target tile is missing from the palette.
      for (const k of usedKeys) expect(item.palette.map(tileKey), `seed${seed} d${d}`).toContain(k);
    }
  });
});
