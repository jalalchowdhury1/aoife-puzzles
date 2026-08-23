// Consolidated fairness/validity guard for every genre (owner decision #14,
// AGENTS.md: "validity is sacred"). Each rule below is one named `it(...)`
// with a one-line comment saying the real bug it prevents — most trace back
// to a documented incident in matrixRules.ts / visualPuzzles.ts / this repo's
// history. This file INTENTIONALLY overlaps the per-genre *.test.ts files;
// keep both. A single shared helper (`ITEMS`, built once below) generates
// every genre's full 500-seed x 10-difficulty sweep exactly once, so the many
// rules here don't each pay the cost of re-generating it.
import { describe, it, expect } from "vitest";
import { GENRES, RETIRED_GENRE_IDS } from "./index";
import { DIFFICULTIES, type Difficulty, type BaseDifficulty, type GenreId } from "../engine/types";
import { makeRng } from "../engine/rng";

import { planFor, type MatrixItem } from "./matrix";
import type { Figure } from "./shapes";
import {
  rotate,
  mirror,
  isConnected,
  equalShape,
  type Cell,
  type VisualPuzzlesItem,
} from "./visualPuzzles";
import { blockDesign, type BlockDesignItem, type Face } from "./blockDesign";
import { totalWeight, type FigureWeightsItem } from "./figureWeights";
import type { DigitSpanItem } from "./digitSpan";
import type { PictureSpanItem } from "./pictureSpan";
import { CODE_KEY, type CodingItem, type Mark } from "./coding";
import type { SymbolSearchItem } from "./symbolSearch";
import { renderArithmetic, type ChoiceItem, type ArithmeticItem, type ChoiceBankItem } from "./bankGenre";
import { SIMILARITIES_BANK } from "./banks/similarities";
import { VOCABULARY_BANK } from "./banks/vocabulary";
import { INFORMATION_BANK } from "./banks/information";
import { COMPREHENSION_BANK } from "./banks/comprehension";
import { ARITHMETIC_BANK } from "./banks/arithmetic";

// ---------------------------------------------------------------------------
// Shared helper: one 500-seed x 10-difficulty sweep per genre, generated once
// at module load and reused by every rule below (per the deliverable's "use a
// shared helper" instruction) instead of each `it()` re-paying generation cost.
// ---------------------------------------------------------------------------
const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: unknown }

const ITEMS: Record<GenreId, Cached[]> = {} as Record<GenreId, Cached[]>;
const CACHED_GENRES: GenreId[] = [...RETIRED_GENRE_IDS, "arithmetic", "information"];   // legacy suite: retired replicas + the two bank genres kept active; new genres live in fairness/<id>.test.ts
for (const id of CACHED_GENRES) {
  const genre = GENRES[id];
  const list: Cached[] = [];
  for (const d of DIFFICULTIES) {
    for (const seed of SEEDS) list.push({ seed, d, item: genre.generate(seed, d) });
  }
  ITEMS[id] = list;
}

/** Typed view onto the shared sweep for one genre — no re-generation, just a cast. */
function itemsOf<I>(id: GenreId): { seed: number; d: Difficulty; item: I }[] {
  return ITEMS[id] as { seed: number; d: Difficulty; item: I }[];
}

// ---------------------------------------------------------------------------
// ALL GENRES: universal rules, one genre-agnostic adapter ("probe") per genre
// so a single generic `it()` per rule can sweep all 13 without special-casing
// each genre's Item/Response shape inline.
// ---------------------------------------------------------------------------
interface GenreProbe {
  /** Enumerable candidate responses to try against score(), when the response
   *  space is small enough — drives "exactly one full-score answer". Omitted
   *  when the space is effectively unbounded (blockDesign/digitSpan/
   *  pictureSpan/arithmetic): score() there is an exact-equality check, so
   *  uniqueness of the full-score answer is definitional, not enumerable. */
  candidates?: (item: unknown) => unknown[];
  /** The response that must score full credit. */
  correct: (item: unknown) => unknown;
  /** At least one response guaranteed to score less than full credit. */
  wrongs: (item: unknown) => unknown[];
  /** The rendered, child-visible option/piece values, pre-keyed for equality
   *  comparison — omitted where the genre has no discrete per-item list. */
  optionKeys?: (item: unknown) => string[];
}

/** All k-element index combinations out of n (n choose k), used for
 * visualPuzzles below since `pieceCount`/`optionCount` now vary by
 * difficulty (2026-08-23 level-0 ramp) instead of always being 3-of-6. */
function combinationsK(n: number, k: number): number[][] {
  const out: number[][] = [];
  const combo: number[] = [];
  function rec(start: number): void {
    if (combo.length === k) {
      out.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(i);
      rec(i + 1);
      combo.pop();
    }
  }
  rec(0);
  return out;
}

function choiceProbe(): GenreProbe {
  return {
    candidates: () => [0, 1, 2, 3],
    correct: item => {
      const it = item as ChoiceItem;
      const max = Math.max(...it.options.map(o => o.points));
      return it.options.findIndex(o => o.points === max);
    },
    wrongs: item => {
      const it = item as ChoiceItem;
      return it.options.map((_, i) => i).filter(i => it.options[i].points === 0);
    },
    optionKeys: item => (item as ChoiceItem).options.map(o => o.text),
  };
}
const CHOICE_PROBE = choiceProbe();

// Legacy (retired) genres keep their probes here; every ACTIVE genre has its own
// rules in lib/genres/fairness/<id>.test.ts (decision #16).
const PROBES: Partial<Record<GenreId, GenreProbe>> = {
  matrix: {
    candidates: () => [0, 1, 2, 3, 4],
    correct: item => (item as MatrixItem).answer,
    wrongs: item => {
      const a = (item as MatrixItem).answer;
      return [0, 1, 2, 3, 4].filter(i => i !== a);
    },
    optionKeys: item => (item as MatrixItem).options.map(f => JSON.stringify(f)),
  },
  figureWeights: {
    candidates: () => [0, 1, 2, 3, 4],
    correct: item => (item as FigureWeightsItem).answer,
    wrongs: item => {
      const a = (item as FigureWeightsItem).answer;
      return [0, 1, 2, 3, 4].filter(i => i !== a);
    },
    // Multiset, not positional, equality: two options holding the same
    // shapes in a different left-right order still total the same hidden
    // weight, so they'd score identically — an exact-order comparison would
    // miss that duplicate (see figureWeights.test.ts precedent).
    optionKeys: item => (item as FigureWeightsItem).options.map(o => [...o].sort().join(",")),
  },
  visualPuzzles: {
    // pieceCount (2 or 3) and optionCount (3, 4, or 6) vary by difficulty
    // since the 2026-08-23 level-0 ramp — compute per-item, not a fixed 6-choose-3.
    candidates: item => {
      const vp = item as VisualPuzzlesItem;
      return combinationsK(vp.optionCount, vp.pieceCount);
    },
    correct: item => (item as VisualPuzzlesItem).answer,
    wrongs: item => {
      const vp = item as VisualPuzzlesItem;
      const ans = new Set(vp.answer);
      return combinationsK(vp.optionCount, vp.pieceCount).filter(c => !(c.length === ans.size && c.every(x => ans.has(x))));
    },
    // Keyed on the actually-DISPLAYED cells (post display-rotation): two
    // pieces that render pixel-identical on screen are a real duplicate even
    // if their underlying (pre-rotation) cell sets differ.
    optionKeys: item => (item as VisualPuzzlesItem).pieces.map(p => JSON.stringify(rotate(p.cells, p.rot))),
  },
  similarities: CHOICE_PROBE,
  vocabulary: CHOICE_PROBE,
  information: CHOICE_PROBE,
  comprehension: CHOICE_PROBE,
  arithmetic: {
    correct: item => (item as ArithmeticItem).answer,
    wrongs: item => [(item as ArithmeticItem).answer + 1],
  },
  digitSpan: {
    correct: item => (item as DigitSpanItem).expected,
    // One element shorter is always a different (and always incomplete,
    // hence wrong) response, regardless of what values happen to repeat.
    wrongs: item => [(item as DigitSpanItem).expected.slice(0, -1)],
  },
  pictureSpan: {
    correct: item => (item as PictureSpanItem).shown,
    wrongs: item => [(item as PictureSpanItem).shown.slice(0, -1)],
  },
  blockDesign: {
    correct: item => (item as BlockDesignItem).grid,
    wrongs: item => {
      const g = [...(item as BlockDesignItem).grid];
      const last = g.length - 1;
      g[last] = g[last] === "W" ? "R" : "W"; // always a different, legal face
      return [g];
    },
  },
  coding: {
    candidates: () => CODE_KEY.map(k => k.mark),
    correct: item => CODE_KEY.find(k => k.shape === (item as CodingItem).shape)!.mark,
    wrongs: item => {
      const c = CODE_KEY.find(k => k.shape === (item as CodingItem).shape)!.mark;
      return CODE_KEY.map(k => k.mark).filter(m => m !== c);
    },
  },
  symbolSearch: {
    candidates: () => [true, false],
    correct: item => (item as SymbolSearchItem).present,
    wrongs: item => [!(item as SymbolSearchItem).present],
  },
};
const PROBED_GENRES = Object.keys(PROBES) as GenreId[];

describe("ALL genres — universal validity rules (owner decision #14: validity is sacred)", () => {
  it("generate(seed, d) is pure and deterministic for every genre — a reload mid-block, a replay, or re-fetching /api/state must never show a different puzzle than the one that was actually scored", () => {
    const RESAMPLE = Array.from({ length: 40 }, (_, i) => i * 251 + 7);
    for (const id of PROBED_GENRES) {
      const genre = GENRES[id];
      for (const d of DIFFICULTIES) {
        for (const seed of RESAMPLE) {
          expect(genre.generate(seed, d), `${id} d${d} seed${seed}`).toEqual(genre.generate(seed, d));
        }
      }
    }
  });

  it("every rendered option/piece list has no two entries a child would see as identical — a duplicate distractor makes two taps look the same while only one is credited, which is unfair rather than merely hard", () => {
    for (const id of PROBED_GENRES) {
      const probe = PROBES[id]!;
      if (!probe.optionKeys) continue;
      for (const { item, seed, d } of ITEMS[id]) {
        const keys = probe.optionKeys(item);
        expect(new Set(keys).size, `${id} seed${seed} d${d}`).toBe(keys.length);
      }
    }
  }, 60_000);

  it("exactly one candidate response earns full credit per item, wherever the response space is small enough to enumerate — two full-credit answers would silently double her real odds of a 'correct' mark on the staircase", () => {
    for (const id of PROBED_GENRES) {
      const genre = GENRES[id];
      const probe = PROBES[id]!;
      if (!probe.candidates) continue;
      for (const { item, seed, d } of ITEMS[id]) {
        const cands = probe.candidates(item);
        const fullScoreCount = cands.filter(c => {
          const r = genre.score(item, c);
          return r.points === r.max;
        }).length;
        expect(fullScoreCount, `${id} seed${seed} d${d}`).toBe(1);
      }
    }
  }, 60_000);

  it("score() marks the recorded answer correct and a representative wrong answer incorrect for every genre — this is the literal contract the staircase, ceiling, and profile all read, not just what generate() intends", () => {
    for (const id of PROBED_GENRES) {
      const genre = GENRES[id];
      const probe = PROBES[id]!;
      for (const { item, seed, d } of ITEMS[id]) {
        const correctResult = genre.score(item, probe.correct(item));
        expect(correctResult.correct, `${id} seed${seed} d${d} (correct response)`).toBe(true);
        for (const wrong of probe.wrongs(item)) {
          const wrongResult = genre.score(item, wrong);
          expect(wrongResult.correct, `${id} seed${seed} d${d} (wrong=${JSON.stringify(wrong)})`).toBe(false);
        }
      }
    }
  }, 60_000);

  it("sample() — the untimed, feedback-free item every block opens with — scores correct when answered with its own displayed answer, so the worked example she sees actually teaches the right pattern", () => {
    for (const id of PROBED_GENRES) {
      const genre = GENRES[id];
      const probe = PROBES[id]!;
      const { item } = genre.sample();
      const result = genre.score(item, probe.correct(item));
      expect(result.correct, id).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// MATRIX REASONING (What's Missing) — see lib/genres/matrixRules.ts for the
// documented 2026-08-22 fixes these rules re-check.
// ---------------------------------------------------------------------------
describe("Matrix Reasoning (What's Missing) — genre-specific fairness rules", () => {
  const MATRIX_ITEMS = itemsOf<MatrixItem>("matrix");
  const FIG_ATTRS: (keyof Figure)[] = ["shape", "color", "size", "count", "rot", "dot"];

  function allFigures(item: MatrixItem): Figure[] {
    const visible = item.cells.filter((c): c is Figure => c !== null);
    return [...visible, ...item.options];
  }
  function diffAttrs(a: Figure, b: Figure): (keyof Figure)[] {
    return FIG_ATTRS.filter(attr => a[attr] !== b[attr]);
  }

  it("no option or visible cell is a rotated non-triangle — her real d1 data showed a rotated hexagon read as 'the same shape' as the upright one; rotation is now pinned to triangles only", () => {
    for (const { item, seed, d } of MATRIX_ITEMS) {
      for (const f of allFigures(item)) {
        if (f.shape !== "triangle") expect(f.rot, `seed${seed} d${d}`).toBe(0);
      }
    }
  });

  it("d1-4: every distractor differs from the answer in exactly one of shape/color/count — two changed attributes at once is unsolvable for a child still learning to isolate one variable", () => {
    for (const { item, seed, d } of MATRIX_ITEMS) {
      if (d > 4) continue;
      const answerFigure = item.options[item.answer];
      item.options.forEach((opt, i) => {
        if (i === item.answer) return;
        const diff = diffAttrs(answerFigure, opt);
        expect(diff.length, `seed${seed} d${d} opt${i}`).toBe(1);
        expect(["shape", "color", "count"], `seed${seed} d${d} opt${i}`).toContain(diff[0]);
      });
    }
  });

  it("d1-6: a size distractor always jumps the full S<->L step, never M or 'one step away' — the real confusion data flagged size M vs L as too close for her to call", () => {
    for (const { item, seed, d } of MATRIX_ITEMS) {
      if (d > 6) continue;
      const answerFigure = item.options[item.answer];
      for (const opt of item.options) {
        if (opt.size === answerFigure.size) continue;
        expect([answerFigure.size, opt.size].sort(), `seed${seed} d${d}`).toEqual(["L", "S"]);
      }
    }
  });

  it("color and shape never drive the 'progressRow' stepping rule — colour and shape have no natural order, so a stepped sequence on either is unguessable, not just hard", () => {
    for (const { seed, d } of MATRIX_ITEMS) {
      const plan = planFor(seed, d);
      if (plan.form !== "matrix") continue;
      expect(plan.kinds.color, `seed${seed} d${d}`).not.toBe("progressRow");
      expect(plan.kinds.shape, `seed${seed} d${d}`).not.toBe("progressRow");
    }
  });

  it("a stepping progression (count/size/rot) never wraps past the end of its value list — '4, 1, ?' cannot be read as +1 by a 5 year old", () => {
    const ATTR_LEN: Record<string, number> = { count: 4, size: 3, rot: 4 };
    const idxOf = (f: Figure, a: string) =>
      a === "count" ? f.count - 1 : a === "size" ? ["S", "M", "L"].indexOf(f.size) : [0, 90, 180, 270].indexOf(f.rot);
    for (const { item, seed, d } of MATRIX_ITEMS) {
      const plan = planFor(seed, d);
      if (plan.form !== "matrix") continue;
      const full = [...item.cells];
      full[full.length - 1] = item.options[item.answer];
      for (const [attr, kind] of Object.entries(plan.kinds)) {
        if (kind !== "progressRow") continue;
        for (let r = 0; r < item.rows; r++) {
          const row = full.slice(r * item.rows, (r + 1) * item.rows) as Figure[];
          for (let c = 1; c < row.length; c++) {
            const a = idxOf(row[c - 1], attr);
            const b = idxOf(row[c], attr);
            expect(b === a + 1 || (b === a && a === ATTR_LEN[attr] - 1), `seed${seed} d${d} attr${attr}`).toBe(true);
          }
        }
      }
    }
  });

  it("no series (1x5 alternation) form appears at d1-2 — the sample screen has only ever shown her a 2x2 matrix, so a series layout here is a format she was never taught", () => {
    for (const { item, seed, d } of MATRIX_ITEMS) {
      if (d > 2) continue;
      expect(item.form, `seed${seed} d${d}`).toBe("matrix");
    }
  });

  it("d1-2: every figure is count 1, rotation 0, and undotted — only shape or colour is allowed to vary at the very first difficulty", () => {
    for (const { item, seed, d } of MATRIX_ITEMS) {
      if (d > 2) continue;
      for (const f of allFigures(item)) {
        expect(f.count, `seed${seed} d${d}`).toBe(1);
        expect(f.rot, `seed${seed} d${d}`).toBe(0);
        expect(f.dot, `seed${seed} d${d}`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// VISUAL PUZZLES (Piece Picker)
// ---------------------------------------------------------------------------
describe("Visual Puzzles (Piece Picker) — genre-specific fairness rules", () => {
  const VP_ITEMS = itemsOf<VisualPuzzlesItem>("visualPuzzles");

  // 2026-08-23 level-0 ramp (AGENTS.md §5): pieceCount 2|3, optionCount
  // 3|4|6 — the exact table the runner and view both depend on.
  const EXPECTED_COUNTS: Record<number, { pieceCount: 2 | 3; optionCount: 3 | 4 | 6 }> = {
    1: { pieceCount: 2, optionCount: 3 },
    2: { pieceCount: 2, optionCount: 4 },
    3: { pieceCount: 2, optionCount: 4 },
    4: { pieceCount: 3, optionCount: 4 },
    5: { pieceCount: 3, optionCount: 6 },
    6: { pieceCount: 3, optionCount: 6 },
    7: { pieceCount: 3, optionCount: 6 },
    8: { pieceCount: 3, optionCount: 6 },
    9: { pieceCount: 3, optionCount: 6 },
    10: { pieceCount: 3, optionCount: 6 },
  };

  it("pieceCount/optionCount match the level-0 ramp exactly at every difficulty, and the view's contract (answer.length === pieceCount, pieces.length === optionCount) always holds", () => {
    for (const { item, seed, d } of VP_ITEMS) {
      const expected = EXPECTED_COUNTS[d];
      expect(item.pieceCount, `seed${seed} d${d}`).toBe(expected.pieceCount);
      expect(item.optionCount, `seed${seed} d${d}`).toBe(expected.optionCount);
      expect(item.answer.length, `seed${seed} d${d}`).toBe(item.pieceCount);
      expect(item.pieces.length, `seed${seed} d${d}`).toBe(item.optionCount);
    }
  });

  it("no two of the options are the same shape (exact match below d9, rotation-equivalent from d9) — her real old-d1 data had two identical vertical dominoes among the true pieces", () => {
    for (const { item, seed, d } of VP_ITEMS) {
      const allowRotation = d >= 9;
      for (let i = 0; i < item.pieces.length; i++) {
        for (let j = i + 1; j < item.pieces.length; j++) {
          expect(
            equalShape(item.pieces[i].cells, item.pieces[j].cells, allowRotation),
            `seed${seed} d${d} piece${i}v${j}`
          ).toBe(false);
        }
      }
    }
  });

  it("d<=7: every distractor's cell count is outside the true pieces' cell counts, never a mirror image or a one-cell-moved near miss of a true piece — both fooled her at the old d1 in real testing", () => {
    for (const { item, seed, d } of VP_ITEMS) {
      if (d > 7) continue;
      const trueShapes = item.answer.map(i => item.pieces[i].cells);
      const trueCounts = new Set(trueShapes.map(s => s.length));
      item.pieces.forEach((piece, i) => {
        if (item.answer.includes(i)) return;
        expect(trueCounts.has(piece.cells.length), `seed${seed} d${d} piece${i}`).toBe(false);
        for (const trueShape of trueShapes) {
          expect(equalShape(piece.cells, mirror(trueShape), false), `seed${seed} d${d} piece${i}`).toBe(false);
        }
      });
    }
  });

  it("no mirror-image distractor appears below d8 — mirrors are the 'real' distractor style, which only begins once the obvious-by-cell-count-alone bands (d<=7) are behind her", () => {
    for (const { item, seed, d } of VP_ITEMS) {
      if (d >= 8) continue;
      const trueShapes = item.answer.map(i => item.pieces[i].cells);
      const distractors = item.pieces.filter((_, i) => !item.answer.includes(i)).map(p => p.cells);
      for (const dist of distractors) {
        for (const t of trueShapes) {
          expect(equalShape(dist, mirror(t), false), `seed${seed} d${d}`).toBe(false);
        }
      }
    }
  });

  it("the true pieces tile the target exactly — disjoint cells whose union is exactly the target, no gaps and no overlaps", () => {
    for (const { item, seed, d } of VP_ITEMS) {
      const cells: Cell[] = [];
      item.target.forEach((v, i) => {
        if (v) cells.push([Math.floor(i / item.size), i % item.size]);
      });
      const targetSet = new Set(cells.map(c => `${c[0]},${c[1]}`));
      const seen = new Set<string>();
      let total = 0;
      for (const piece of item.placed) {
        total += piece.length;
        for (const c of piece) {
          const k = `${c[0]},${c[1]}`;
          expect(seen.has(k), `seed${seed} d${d}`).toBe(false);
          seen.add(k);
          expect(targetSet.has(k), `seed${seed} d${d}`).toBe(true);
        }
      }
      expect(total, `seed${seed} d${d}`).toBe(targetSet.size);
    }
  });

  it("the target silhouette is always one connected shape — a target split into two islands cannot be described as 'this one shape' to a 5 year old", () => {
    for (const { item, seed, d } of VP_ITEMS) {
      const cells: Cell[] = [];
      item.target.forEach((v, i) => {
        if (v) cells.push([Math.floor(i / item.size), i % item.size]);
      });
      expect(isConnected(cells), `seed${seed} d${d}`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// BLOCK DESIGN (Block Builder)
// ---------------------------------------------------------------------------
/** Rotates a Face 90deg clockwise, `times` times. Plain W/R cells are unaffected;
 * a diagonal face cycles NE->SE->SW->NW under one 90deg CW turn (verified against
 * screen-space vector rotation: NE(1,-1) -> SE(1,1) -> SW(-1,1) -> NW(-1,-1) -> NE). */
function rotateFaceCW(face: Face, times: number): Face {
  if (face === "W" || face === "R") return face;
  const order: Face[] = ["NE", "SE", "SW", "NW"];
  const idx = order.indexOf(face);
  return order[(idx + times) % 4];
}

/** Rotates an n x n row-major Face grid 90deg clockwise, `times` times (both cell
 * position AND each diagonal face's own orientation), for the "rotated build
 * never scores" fairness check below. new[r][c] = old[n-1-c][r] is the standard
 * clockwise matrix-rotation formula. */
function rotateGridCW(grid: Face[], n: number, times: number): Face[] {
  let g = grid;
  for (let t = 0; t < times; t++) {
    const next: Face[] = new Array(n * n);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) next[r * n + c] = g[(n - 1 - c) * n + r];
    }
    g = next.map(f => rotateFaceCW(f, 1));
  }
  return g;
}

describe("Block Design (Block Builder) — genre-specific fairness rules", () => {
  const BD_ITEMS = itemsOf<BlockDesignItem>("blockDesign");
  const DIAGONALS: Face[] = ["NE", "SE", "SW", "NW"];

  function diagBand(d: Difficulty): [number, number] {
    if (d <= 2) return [0, 0];
    if (d <= 4) return [1, 4];
    if (d <= 6) return [1, 3];
    if (d <= 8) return [3, 5];
    return [6, 9];
  }

  it("d1-2 designs use only white/red, with no diagonals, and are never a single solid colour — the skill being tested there is copying two colours, not spotting a blank board", () => {
    for (const { item, seed, d } of BD_ITEMS) {
      if (d > 2) continue;
      for (const f of item.grid) expect(["W", "R"], `seed${seed} d${d}`).toContain(f);
      expect(item.grid.every(f => f === item.grid[0]), `seed${seed} d${d}`).toBe(false);
    }
  });

  it("diagonal-cell counts stay within the intended band for every difficulty — too many diagonals below the planned band would make an early item as hard as a late one", () => {
    for (const { item, seed, d } of BD_ITEMS) {
      const [min, max] = diagBand(d);
      const count = item.grid.filter(f => DIAGONALS.includes(f)).length;
      expect(count, `seed${seed} d${d}`).toBeGreaterThanOrEqual(min);
      expect(count, `seed${seed} d${d}`).toBeLessThanOrEqual(max);
    }
  });

  it("grid lines are shown iff d < 7 — dropping the scaffold before the design is actually hard enough to need it would fail her for a reason unrelated to the skill", () => {
    for (const { item, seed, d } of BD_ITEMS) {
      expect(item.showGridLines, `seed${seed} d${d}`).toBe(d < 7);
    }
  });

  it("a genuinely rotated copy of the target grid never scores as correct — the board is a paint-by-cell grid, not a physical block she could spin to fake a match", () => {
    for (const { item, seed, d } of BD_ITEMS) {
      for (const times of [1, 2, 3]) {
        const rotated = rotateGridCW(item.grid, item.n, times);
        if (rotated.every((f, i) => f === item.grid[i])) continue; // rotationally symmetric design: identical picture, not a bug
        const result = blockDesign.score(item, rotated);
        expect(result.correct, `seed${seed} d${d} rot${times * 90}`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// FIGURE WEIGHTS (Balance) — 2026-08-23 "level-0" ramp (AGENTS.md §5 "Balance
// ramp"): rebuilt from absolute basics (d1 matching, d2 counting, d3 mixed
// matching, d4 read-off, d5 doubling) before the old substitution tiers
// (now d6-10) so there is no cliff between "trivial" and "algebra".
// ---------------------------------------------------------------------------
describe("Figure Weights (Balance) — genre-specific fairness rules", () => {
  const FW_ITEMS = itemsOf<FigureWeightsItem>("figureWeights");

  it("every non-question scale is truly balanced under the item's own hidden weights — an unbalanced 'given' scale would teach her false arithmetic before she even reaches the question", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      for (const scale of item.scales.slice(0, -1)) {
        expect(scale.right, `seed${seed} d${d}`).not.toBeNull();
        expect(totalWeight(scale.left, item.weights), `seed${seed} d${d}`).toBe(totalWeight(scale.right!, item.weights));
      }
    }
  });

  it("exactly one option totals the question scale's target weight — a tie would let two different taps both be 'right', silently inflating her real chance of guessing correctly", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      const qScale = item.scales[item.scales.length - 1];
      const target = totalWeight(qScale.left, item.weights);
      const matches = item.options.filter(o => totalWeight(o, item.weights) === target).length;
      expect(matches, `seed${seed} d${d}`).toBe(1);
    }
  });

  it("no pan or option ever holds more than 4 shapes — a cluttered pan beyond what she can subitize turns a reasoning item into a counting item", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      for (const scale of item.scales) {
        expect(scale.left.length, `seed${seed} d${d}`).toBeLessThanOrEqual(4);
        if (scale.right) expect(scale.right.length, `seed${seed} d${d}`).toBeLessThanOrEqual(4);
      }
      for (const opt of item.options) expect(opt.length, `seed${seed} d${d}`).toBeLessThanOrEqual(4);
    }
  });

  it("d1-3 items show exactly one scale — the direct 'what is the same?' rule, before a second scale asks her to combine two separate facts", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      if (d > 3) continue;
      expect(item.scales.length, `seed${seed} d${d}`).toBe(1);
    }
  });

  it("d4-7 items show exactly two scales — one SHOWN equivalence plus the question, before a third scale chains in a second equivalence", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      if (d < 4 || d > 7) continue;
      expect(item.scales.length, `seed${seed} d${d}`).toBe(2);
    }
  });

  it("d8-10 items show exactly three scales — two chained equivalences over three shapes, plus the question", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      if (d < 8) continue;
      expect(item.scales.length, `seed${seed} d${d}`).toBe(3);
    }
  });

  it("option count matches its band — 3 at d1 (one correct + two counts of the same shape), 4 from d2 up; never 5 anymore", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      const expected = d === 1 ? 3 : 4;
      expect(item.options.length, `seed${seed} d${d}`).toBe(expected);
    }
  });

  it("d<=5: every option is built ONLY from shapes that actually appear on the scales — a foreign shape would let her rule out a distractor by 'I haven't seen that shape yet' instead of reasoning about weight", () => {
    for (const { item, seed, d } of FW_ITEMS) {
      if (d > 5) continue;
      const shapesOnScales = new Set(item.scales.flatMap(s => [...s.left, ...(s.right ?? [])]));
      for (const opt of item.options) {
        for (const s of opt) expect(shapesOnScales.has(s), `seed${seed} d${d}`).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// DIGIT SPAN (Number Echo)
// ---------------------------------------------------------------------------
describe("Digit Span (Number Echo) — genre-specific fairness rules", () => {
  const DS_ITEMS = itemsOf<DigitSpanItem>("digitSpan");
  const LEN: Record<number, number[]> = {
    1: [2], 2: [3], 3: [4], 4: [2], 5: [3], 6: [4, 5], 7: [3], 8: [4, 5], 9: [6, 5], 10: [7, 6],
  };

  it("sequence length matches the difficulty's planned span exactly — a longer-than-planned sequence at a given d would silently test a different (unadapted) skill level", () => {
    for (const { item, seed, d } of DS_ITEMS) {
      expect(LEN[d], `seed${seed} d${d}`).toContain(item.digits.length);
    }
  });

  it("no two adjacent digits repeat — an accidental double digit reads to her as 'did I mishear', not as a real memory test", () => {
    for (const { item, seed, d } of DS_ITEMS) {
      for (let i = 1; i < item.digits.length; i++) {
        expect(item.digits[i], `seed${seed} d${d}`).not.toBe(item.digits[i - 1]);
      }
    }
  });

  it("no 3 consecutive digits form a +-1 arithmetic run (e.g. 3,4,5 or 6,5,4) — a run like that recodes into one chunk ('counting up') instead of testing raw digit memory", () => {
    for (const { item, seed, d } of DS_ITEMS) {
      for (let i = 2; i < item.digits.length; i++) {
        const isRun =
          item.digits[i] - item.digits[i - 1] === item.digits[i - 1] - item.digits[i - 2] &&
          Math.abs(item.digits[i] - item.digits[i - 1]) === 1;
        expect(isRun, `seed${seed} d${d}`).toBe(false);
      }
    }
  });

  it("`expected` is always the digits reordered per the item's own task (forward/backward/sequencing) — a mismatch would score her against a sequence she was never actually asked for", () => {
    for (const { item, seed, d } of DS_ITEMS) {
      const exp =
        item.task === "forward" ? item.digits
        : item.task === "backward" ? [...item.digits].reverse()
        : [...item.digits].sort((a, b) => a - b);
      expect(item.expected, `seed${seed} d${d}`).toEqual(exp);
    }
  });
});

// ---------------------------------------------------------------------------
// PICTURE SPAN (Picture Memory)
// ---------------------------------------------------------------------------
describe("Picture Span (Picture Memory) — genre-specific fairness rules", () => {
  const PS_ITEMS = itemsOf<PictureSpanItem>("pictureSpan");
  const K_BY_D: Record<BaseDifficulty, number> = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 7 };

  it("the number of pictures shown matches the difficulty's planned span k", () => {
    for (const { item, seed, d } of PS_ITEMS) {
      expect(item.shown.length, `seed${seed} d${d}`).toBe(K_BY_D[d as BaseDifficulty]);
    }
  });

  it("choices are all distinct and a strict superset of the shown pictures — a missing shown icon would make the correct answer physically untappable", () => {
    for (const { item, seed, d } of PS_ITEMS) {
      expect(new Set(item.choices).size, `seed${seed} d${d}`).toBe(item.choices.length);
      for (const icon of item.shown) expect(item.choices, `seed${seed} d${d}`).toContain(icon);
    }
  });

  it("exposure time is 3s for spans of 2 or fewer and 5s for longer spans — a span that grows without more time to look would confound memory with raw viewing speed", () => {
    for (const { item, seed, d } of PS_ITEMS) {
      expect(item.exposureMs, `seed${seed} d${d}`).toBe(item.shown.length <= 2 ? 3000 : 5000);
    }
  });
});

// ---------------------------------------------------------------------------
// CODING & SYMBOL SEARCH (speed genres)
// ---------------------------------------------------------------------------
describe("Coding & Symbol Search (speed genres) — genre-specific fairness rules", () => {
  const CODING_ITEMS = itemsOf<CodingItem>("coding");
  const SS_ITEMS = itemsOf<SymbolSearchItem>("symbolSearch");

  it("coding: the shape-to-mark key never drifts across items — a code that changed meaning mid-block would make her correct tap on the last item wrong on this one", () => {
    const seen = new Map<string, Mark>();
    for (const { item, seed } of CODING_ITEMS) {
      for (const s of [item.shape, ...item.lookahead]) {
        const mark = CODE_KEY.find(k => k.shape === s)!.mark;
        if (seen.has(s)) expect(mark, `seed${seed} shape ${s}`).toBe(seen.get(s));
        else seen.set(s, mark);
      }
    }
    expect(seen.size).toBe(5); // all 5 code shapes actually appeared somewhere in the sweep
  });

  it("symbolSearch: every group has exactly 3 distinct glyphs — a duplicate glyph in the row would shrink her real search space without her knowing", () => {
    for (const { item, seed, d } of SS_ITEMS) {
      expect(item.group.length, `seed${seed} d${d}`).toBe(3);
      expect(new Set(item.group).size, `seed${seed} d${d}`).toBe(3);
    }
  });

  it("symbolSearch: 'present' is true iff the target glyph actually appears in the group — this is the entire scoring contract for a YES/NO speed item", () => {
    for (const { item, seed, d } of SS_ITEMS) {
      expect(item.group.includes(item.target), `seed${seed} d${d}`).toBe(item.present);
    }
  });

  it("symbolSearch: the target is present 40-60% of the time over the full 500-seed x 10-difficulty sweep — a lopsided rate would let her learn to always tap one button instead of actually searching", () => {
    const presentCount = SS_ITEMS.filter(({ item }) => item.present).length;
    const rate = presentCount / SS_ITEMS.length;
    expect(rate).toBeGreaterThan(0.4);
    expect(rate).toBeLessThan(0.6);
  });
});

// ---------------------------------------------------------------------------
// BANKS (similarities, vocabulary, information, comprehension, arithmetic)
// ---------------------------------------------------------------------------
describe("Verbal + arithmetic banks — genre-specific fairness rules", () => {
  const VERBAL_BANKS: { name: string; bank: ChoiceBankItem[]; minPerD: number }[] = [
    { name: "similarities", bank: SIMILARITIES_BANK, minPerD: 4 },
    { name: "vocabulary", bank: VOCABULARY_BANK, minPerD: 4 },
    { name: "information", bank: INFORMATION_BANK, minPerD: 4 },
    { name: "comprehension", bank: COMPREHENSION_BANK, minPerD: 4 },
  ];
  const NO_DASH = /[-‐‑‒–—―]/;

  it("every bank (4 verbal + arithmetic) has unique ids — a duplicate id would let excludeBankIds silently fail to rule an already-seen item back out", () => {
    for (const { name, bank } of VERBAL_BANKS) {
      const ids = bank.map(b => b.id);
      expect(new Set(ids).size, name).toBe(ids.length);
    }
    const arIds = ARITHMETIC_BANK.map(b => b.id);
    expect(new Set(arIds).size, "arithmetic").toBe(arIds.length);
  });

  it("every verbal bank has at least 4 items at every difficulty 1..10, and the arithmetic bank has at least 6 — too few at one difficulty forces an immediate repeat within a single sitting", () => {
    for (const { name, bank, minPerD } of VERBAL_BANKS) {
      for (const d of DIFFICULTIES) {
        const count = bank.filter(b => b.d === d).length;
        expect(count, `${name} d${d}`).toBeGreaterThanOrEqual(minPerD);
      }
    }
    for (const d of DIFFICULTIES) {
      const count = ARITHMETIC_BANK.filter(b => b.d === d).length;
      expect(count, `arithmetic d${d}`).toBeGreaterThanOrEqual(6);
    }
  });

  it("every verbal bank item has exactly 4 options with unique text — a duplicated option text would let two taps look identical while only one scores", () => {
    for (const { name, bank } of VERBAL_BANKS) {
      for (const item of bank) {
        expect(item.options.length, `${name} ${item.id}`).toBe(4);
        expect(new Set(item.options.map(o => o.text)).size, `${name} ${item.id}`).toBe(4);
      }
    }
  });

  it("every verbal bank item has exactly one option at its own maximum point value — a tie for best answer would silently score two different taps as the single best one", () => {
    for (const { name, bank } of VERBAL_BANKS) {
      for (const item of bank) {
        const max = Math.max(...item.options.map(o => o.points));
        const topCount = item.options.filter(o => o.points === max).length;
        expect(topCount, `${name} ${item.id}`).toBe(1);
      }
    }
  });

  it("similarities and comprehension: every item has exactly one 2-point option and exactly one 1-point option — real WISC-V scoring reserves 2 for the single best answer and 1 for the single partial-credit answer, never a tie at either tier", () => {
    for (const bank of [SIMILARITIES_BANK, COMPREHENSION_BANK]) {
      for (const item of bank) {
        expect(item.options.filter(o => o.points === 2).length, item.id).toBe(1);
        expect(item.options.filter(o => o.points === 1).length, item.id).toBe(1);
      }
    }
  });

  it("no bank text (verbal prompts/options/explanations, arithmetic templates) contains a dash character — a stray em/en dash reads oddly through browser speech synthesis", () => {
    for (const { name, bank } of VERBAL_BANKS) {
      for (const item of bank) {
        expect(NO_DASH.test(item.prompt), `${name} ${item.id} prompt`).toBe(false);
        expect(NO_DASH.test(item.explanation), `${name} ${item.id} explanation`).toBe(false);
        for (const o of item.options) expect(NO_DASH.test(o.text), `${name} ${item.id} option`).toBe(false);
      }
    }
    for (const tmpl of ARITHMETIC_BANK) {
      expect(NO_DASH.test(tmpl.template), `arithmetic ${tmpl.id}`).toBe(false);
    }
  });

  it("arithmetic bank: every template renders a fully substituted, non-negative integer answer across 100 seeds — an unfilled {placeholder} or a negative/fractional answer would be unplayable or unscoreable", () => {
    for (const tmpl of ARITHMETIC_BANK) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = makeRng(seed * 97 + 13);
        const { text, answer } = renderArithmetic(tmpl, rng);
        expect(text.includes("{"), `${tmpl.id} seed${seed}: ${text}`).toBe(false);
        expect(Number.isInteger(answer), `${tmpl.id} seed${seed}: ${answer}`).toBe(true);
        expect(answer, `${tmpl.id} seed${seed}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // "1 apples", "1 hours" etc: a count of 1 in front of a plural noun is bad
  // grammar a 6 year old will stumble over mid-listen. "1 o'clock" (ar-26,
  // ar-32) is correct English and is NOT a case of this bug — and it can
  // never match the pattern below anyway, since "o'clock" ends in "k", not
  // "s". The allowlist is intentionally empty: kept explicit (rather than
  // silently trusting the regex) so a genuine future match — e.g. a
  // reintroduced "1 hours" — fails loudly instead of being waved through.
  const PLURAL_AFTER_ONE = /\b1 [a-z]+s\b/;
  const ALLOWED_PLURAL_AFTER_ONE = new Set<string>();

  it("arithmetic bank: no rendered problem ever says '1 <plural noun>' across 100 seeds per template", () => {
    for (const tmpl of ARITHMETIC_BANK) {
      for (let seed = 0; seed < 100; seed++) {
        const rng = makeRng(seed * 97 + 13);
        const { text } = renderArithmetic(tmpl, rng);
        const match = text.match(PLURAL_AFTER_ONE);
        if (!match) continue;
        expect(ALLOWED_PLURAL_AFTER_ONE.has(match[0]), `${tmpl.id} seed${seed}: "${text}"`).toBe(true);
      }
    }
  });
});
