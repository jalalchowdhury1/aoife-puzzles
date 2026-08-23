// Fairness/validity guard for Fix the Picture (owner decision #14, AGENTS.md:
// "validity is sacred"). Each rule is one named it(...) stating the real bug
// it prevents. Mirrors the shape of the shared lib/genres/fairness.test.ts
// (not edited here — this genre isn't registered in GENRE_LIST yet, so it
// gets its own file per the new-genre worker brief).
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import {
  fixPicture,
  generate,
  mirror,
  isConnected,
  equalShape,
  type Cell,
  type FixPictureItem,
} from "../fixPicture";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: FixPictureItem }
const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: generate(seed, d) });
}

function holeRegions(item: FixPictureItem): Cell[][] {
  // Split item.hole back into connected components — used only by tests, to
  // check each region is independently connected (production code never
  // needs this: the view just paints every `hole` cell the same way).
  const cells = item.hole;
  const key = ([r, c]: Cell) => `${r},${c}`;
  const set = new Set(cells.map(key));
  const seen = new Set<string>();
  const regions: Cell[][] = [];
  for (const c of cells) {
    const k = key(c);
    if (seen.has(k)) continue;
    const region: Cell[] = [];
    const stack: Cell[] = [c];
    seen.add(k);
    while (stack.length) {
      const cur = stack.pop()!;
      region.push(cur);
      const [r, cc] = cur;
      for (const n of [[r - 1, cc], [r + 1, cc], [r, cc - 1], [r, cc + 1]] as Cell[]) {
        const nk = key(n);
        if (set.has(nk) && !seen.has(nk)) {
          seen.add(nk);
          stack.push(n);
        }
      }
    }
    regions.push(region);
  }
  return regions;
}

const rotatedFrom: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: true, 7: true, 8: false, 9: true, 10: true };
const pieceCountFrom: Record<number, 1 | 2> = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 2, 9: 2, 10: 2 };
const optionCountFrom: Record<number, 3 | 4 | 5> = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 5 };
const sizeFrom: Record<number, 4 | 5> = { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5 };

describe("Fix the Picture — universal validity rules", () => {
  it("generate(seed, d) is pure and deterministic — a reload mid-block must never show a different puzzle than the one that was scored", () => {
    const RESAMPLE = Array.from({ length: 40 }, (_, i) => i * 251 + 7);
    for (const d of DIFFICULTIES) {
      for (const seed of RESAMPLE) {
        expect(generate(seed, d), `d${d} seed${seed}`).toEqual(generate(seed, d));
      }
    }
  });

  it("pieceCount/optionCount/size match the ramp exactly, and options.length === optionCount, answer.length === pieceCount", () => {
    for (const { item, seed, d } of ITEMS) {
      expect(item.pieceCount, `seed${seed} d${d}`).toBe(pieceCountFrom[d]);
      expect(item.optionCount, `seed${seed} d${d}`).toBe(optionCountFrom[d]);
      expect(item.size, `seed${seed} d${d}`).toBe(sizeFrom[d]);
      expect(item.options.length, `seed${seed} d${d}`).toBe(item.optionCount);
      expect(item.answer.length, `seed${seed} d${d}`).toBe(item.pieceCount);
      expect(new Set(item.answer).size, `seed${seed} d${d}`).toBe(item.pieceCount);
      for (const idx of item.answer) {
        expect(idx, `seed${seed} d${d}`).toBeGreaterThanOrEqual(0);
        expect(idx, `seed${seed} d${d}`).toBeLessThan(item.optionCount);
      }
    }
  });

  it("exactly one option (or, at d8-10, exactly one PAIR of options) fits the hole — two full-credit answers would silently double her real odds of a 'correct' mark on the staircase", () => {
    for (const { item, seed, d } of ITEMS) {
      const allowRotation = rotatedFrom[d];
      if (item.pieceCount === 1) {
        const trueShape = item.options[item.answer[0]].cells;
        const fits = item.options.filter(o => equalShape(o.cells, trueShape, allowRotation));
        expect(fits.length, `seed${seed} d${d}`).toBe(1);
      } else {
        // Two-piece bands: no option other than the two recorded true ones may
        // match either hole-region shape (checked individually — a spare
        // option congruent to either region would be a second valid pick).
        const trueShapes = item.answer.map(i => item.options[i].cells);
        item.options.forEach((opt, i) => {
          const matchesCount = trueShapes.filter(t => equalShape(opt.cells, t, allowRotation)).length;
          if (item.answer.includes(i)) {
            expect(matchesCount, `seed${seed} d${d} opt${i}`).toBeGreaterThanOrEqual(1);
          } else {
            expect(matchesCount, `seed${seed} d${d} opt${i}`).toBe(0);
          }
        });
      }
    }
  });

  it("score() marks the recorded answer correct and a shuffled-but-wrong answer incorrect", () => {
    for (const { item, seed, d } of ITEMS) {
      expect(fixPicture.score(item, item.answer).correct, `seed${seed} d${d}`).toBe(true);
      const wrongPick = item.options.map((_, i) => i).filter(i => !item.answer.includes(i)).slice(0, item.pieceCount);
      if (wrongPick.length === item.pieceCount) {
        expect(fixPicture.score(item, wrongPick).correct, `seed${seed} d${d}`).toBe(false);
      }
    }
  });

  it("sample() scores correct when answered with its own displayed answer, so the worked example actually teaches the right pattern", () => {
    const { item } = fixPicture.sample();
    expect(fixPicture.score(item, item.answer).correct).toBe(true);
  });

  it("every hole region is internally connected — a hole split across disconnected cells cannot be described as 'one missing piece' to a 5 year old", () => {
    for (const { item, seed, d } of ITEMS) {
      for (const region of holeRegions(item)) {
        expect(isConnected(region), `seed${seed} d${d}`).toBe(true);
      }
    }
  });

  it("the visible (filled) picture plus the hole always forms one connected silhouette — a floating disconnected chunk would not read as 'a picture with a piece missing'", () => {
    for (const { item, seed, d } of ITEMS) {
      const all: Cell[] = [];
      item.filled.forEach((f, i) => { if (f) all.push([Math.floor(i / item.size), i % item.size]); });
      all.push(...item.hole);
      expect(isConnected(all), `seed${seed} d${d}`).toBe(true);
    }
  });

  it("no two rendered options look pixel-identical as displayed (cells + display rotation) — a visual duplicate would make two taps indistinguishable while only one is credited", () => {
    for (const { item, seed, d } of ITEMS) {
      const displayed = item.options.map(o => rotateForKey(o));
      for (let i = 0; i < displayed.length; i++) {
        for (let j = i + 1; j < displayed.length; j++) {
          expect(equalShape(displayed[i], displayed[j], false), `seed${seed} d${d} opt${i}v${j}`).toBe(false);
        }
      }
    }
  });
});

// Local helper: reproduces "the shape as actually shown" (cells rotated by
// the option's own display rot), independent of production code, so the
// no-visual-duplicate check above isn't just re-testing the same function.
function rotateForKey(o: { cells: Cell[]; rot: 0 | 90 | 180 | 270 }): Cell[] {
  const steps = (o.rot / 90) % 4;
  let cells = o.cells;
  for (let i = 0; i < steps; i++) cells = cells.map(([r, c]): Cell => [c, -r]);
  const minR = Math.min(...cells.map(c => c[0]));
  const minC = Math.min(...cells.map(c => c[1]));
  return cells.map(([r, c]): Cell => [r - minR, c - minC]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

describe("Fix the Picture — band-specific fairness rules", () => {
  it("d1-3: distractors differ from the hole by cell count alone (never a same-count or mirror confusion)", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d > 3) continue;
      const trueLen = item.options[item.answer[0]].cells.length;
      item.options.forEach((opt, i) => {
        if (item.answer.includes(i)) return;
        expect(opt.cells.length, `seed${seed} d${d} opt${i}`).not.toBe(trueLen);
      });
    }
  });

  it("no mirror-image distractor appears below d5 — mirrors are the harder-to-spot distractor, introduced only once count/shape differentiation is established", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d >= 5) continue;
      const trueShapes = item.answer.map(i => item.options[i].cells);
      item.options.forEach((opt, i) => {
        if (item.answer.includes(i)) return;
        for (const t of trueShapes) {
          expect(equalShape(opt.cells, mirror(t), false), `seed${seed} d${d} opt${i}`).toBe(false);
        }
      });
    }
  });

  it("display rotation is never used below d6 (single hole) or d9 (two holes) — every option renders exactly as its own underlying shape until the mental-rotation step is introduced", () => {
    for (const { item, seed, d } of ITEMS) {
      if (rotatedFrom[d]) continue;
      for (const o of item.options) expect(o.rot, `seed${seed} d${d}`).toBe(0);
    }
  });

  it("from d6 (single hole) / d9 (two holes), every TRUE option is displayed pre-rotated — that's the whole point of the band", () => {
    for (const { item, seed, d } of ITEMS) {
      if (!rotatedFrom[d]) continue;
      for (const idx of item.answer) expect(item.options[idx].rot, `seed${seed} d${d}`).not.toBe(0);
    }
  });

  it("d7 and d10 always include a genuine mirror-of-a-true-piece distractor", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 7 && d !== 10) continue;
      const trueShapes = item.answer.map(i => item.options[i].cells);
      const hasMirror = item.options.some((opt, i) => !item.answer.includes(i) && trueShapes.some(t => equalShape(opt.cells, mirror(t), true)));
      expect(hasMirror, `seed${seed} d${d}`).toBe(true);
    }
  });

  it("d8-10: the two hole regions never touch (4-adjacent) — otherwise they would read as one merged gap, not two separate missing pieces", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d < 8) continue;
      const regions = holeRegions(item);
      expect(regions.length, `seed${seed} d${d}`).toBe(2);
      const [a, b] = regions;
      const aSet = new Set(a.map(([r, c]) => `${r},${c}`));
      const touches = b.some(([r, c]) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([nr, nc]) => aSet.has(`${nr},${nc}`)));
      expect(touches, `seed${seed} d${d}`).toBe(false);
    }
  });

  it("d8: no rotation at all, even though it's a two-piece item", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d !== 8) continue;
      for (const o of item.options) expect(o.rot, `seed${seed}`).toBe(0);
    }
  });
});
