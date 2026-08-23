// Fairness/validity guard for Firefly Boxes (owner decision #14: "validity is
// sacred"). Each rule below is one named it(...) with a one-line comment
// saying the real bug it prevents. Intentionally overlaps fireflyBoxes.test.ts
// (see fairness.test.ts's header note on the repo's existing genres) — that
// file pins the contract with a handful of hand-picked cases; this file
// sweeps the full 500 seeds x 10 difficulties the way the shared
// fairness.test.ts does for every other genre.
import { describe, it, expect } from "vitest";
import { fireflyBoxes, GRID_SIZE, EXPOSURE_ON_MS } from "../fireflyBoxes";
import { DIFFICULTIES } from "../../engine/types";
import type { Difficulty } from "../../engine/types";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

const LEN_BY_D: Record<Difficulty, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 2, 8: 3, 9: 4, 10: 5 };
const TASK_BY_D: Record<Difficulty, "same" | "backward"> = {
  1: "same", 2: "same", 3: "same", 4: "same", 5: "same", 6: "same",
  7: "backward", 8: "backward", 9: "backward", 10: "backward",
};

// One 500 x 10 sweep, generated once and reused by every rule below.
const ITEMS = DIFFICULTIES.flatMap(d => SEEDS.map(seed => ({ seed, d, item: fireflyBoxes.generate(seed, d) })));

describe("fireflyBoxes fairness", () => {
  it("generate is deterministic (no seed/date/Math.random leak into the puzzle)", () => {
    for (const { seed, d, item } of ITEMS) {
      expect(fireflyBoxes.generate(seed, d)).toEqual(item);
    }
  });

  it("never lights a box outside the 3x3 grid (0-8) — prevents an off-grid tap target", () => {
    for (const { item } of ITEMS) {
      for (const cell of item.sequence) {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(GRID_SIZE);
      }
    }
  });

  it("never reuses a box within one sequence — prevents 'wait, didn't I already see that one?' confusion", () => {
    for (const { item } of ITEMS) {
      expect(new Set(item.sequence).size).toBe(item.sequence.length);
    }
  });

  it("length and task exactly match the published ramp for every difficulty — no cliff, no wrong-rule item", () => {
    for (const { d, item } of ITEMS) {
      expect(item.sequence.length).toBe(LEN_BY_D[d]);
      expect(item.task).toBe(TASK_BY_D[d]);
    }
  });

  it("length grows by exactly one box per step within a task — no two-idea jump (owner decision #15)", () => {
    for (let d = 2; d <= 6; d++) {
      expect(LEN_BY_D[d as Difficulty]).toBe(LEN_BY_D[(d - 1) as Difficulty] + 1);
    }
    for (let d = 8; d <= 10; d++) {
      expect(LEN_BY_D[d as Difficulty]).toBe(LEN_BY_D[(d - 1) as Difficulty] + 1);
    }
  });

  it("the 'backward' rule is introduced on its own difficulty step, never combined with a length jump bigger than the format needs", () => {
    // d6 -> d7 is the one step that changes the RULE (same -> backward); the
    // format resets to a short length (2) there instead of continuing to grow,
    // so the new idea is introduced at the easiest length again.
    expect(TASK_BY_D[6]).toBe("same");
    expect(TASK_BY_D[7]).toBe("backward");
    expect(LEN_BY_D[7]).toBe(2);
  });

  it("'same' task's expected order is exactly the lit order — prevents an inverted scoring key", () => {
    for (const { item } of ITEMS) {
      if (item.task === "same") expect(item.expected).toEqual(item.sequence);
    }
  });

  it("'backward' task's expected order is exactly the reversed lit order — prevents a forward-scored 'backward' item", () => {
    for (const { item } of ITEMS) {
      if (item.task === "backward") expect(item.expected).toEqual([...item.sequence].reverse());
    }
  });

  it("exactly one tap order scores full credit — the literal expected order — never a second sequence", () => {
    for (const { item } of ITEMS) {
      expect(fireflyBoxes.score(item, item.expected).points).toBe(2);
      if (item.expected.length > 1) {
        const reversedOfExpected = [...item.expected].reverse();
        if (reversedOfExpected.join(",") !== item.expected.join(",")) {
          expect(fireflyBoxes.score(item, reversedOfExpected).points).toBeLessThan(2);
        }
        const rotated = [...item.expected.slice(1), item.expected[0]];
        if (rotated.join(",") !== item.expected.join(",")) {
          expect(fireflyBoxes.score(item, rotated).points).toBeLessThan(2);
        }
      }
    }
  });

  it("a response using any box not in the sequence scores 0 — prevents a 'close enough' false positive", () => {
    for (const { item } of ITEMS) {
      const foreignCell = Array.from({ length: GRID_SIZE }, (_, i) => i).find(c => !item.sequence.includes(c));
      if (foreignCell === undefined) continue; // len === GRID_SIZE never happens, but stay defensive
      const bad = [...item.expected.slice(0, -1), foreignCell];
      expect(fireflyBoxes.score(item, bad).points).toBe(0);
    }
  });

  it("exposureOnMs always matches the documented 600ms flash — prevents a silently-changed presentation speed", () => {
    for (const { item } of ITEMS) {
      expect(item.exposureOnMs).toBe(EXPOSURE_ON_MS);
    }
  });

  it("the grid stays a fixed 3x3 (9 cells) at every difficulty — prevents a board-size regression", () => {
    expect(GRID_SIZE).toBe(9);
    for (const { item } of ITEMS) {
      expect(item.sequence.length).toBeLessThanOrEqual(GRID_SIZE);
    }
  });
});
