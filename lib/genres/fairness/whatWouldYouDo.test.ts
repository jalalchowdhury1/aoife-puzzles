// Fairness/validity guard for "What Would You Do?" (owner decision #14,
// AGENTS.md: "validity is sacred"). This worker's genre is not registered in
// the shared lib/genres/index.ts / lib/genres/fairness.test.ts yet (see
// AGENTS.md's "do not edit shared files" rule for new-genre workers), so this
// file runs its own full 500-seed x 10-difficulty sweep exactly like
// fairness.test.ts does for the existing genres — same rule shapes, applied
// to just this genre.
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { whatWouldYouDo } from "../whatWouldYouDo";
import type { ChoiceItem } from "../bankGenre";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: ChoiceItem }

const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: whatWouldYouDo.generate(seed, d) as ChoiceItem });
}

describe("What Would You Do? — fairness rules", () => {
  it("generate(seed, d) is pure and deterministic — a reload mid-block, a replay, or re-fetching /api/state must never show a different story than the one that was actually scored", () => {
    const RESAMPLE = Array.from({ length: 40 }, (_, i) => i * 251 + 7);
    for (const d of DIFFICULTIES) {
      for (const seed of RESAMPLE) {
        expect(whatWouldYouDo.generate(seed, d), `d${d} seed${seed}`).toEqual(whatWouldYouDo.generate(seed, d));
      }
    }
  });

  it("every item has exactly 4 options with no two reading as the same choice to a child — a duplicate option would make two taps look identical while only one scores", () => {
    for (const { item, seed, d } of ITEMS) {
      expect(item.options.length, `seed${seed} d${d}`).toBe(4);
      const texts = item.options.map(o => o.text);
      expect(new Set(texts).size, `seed${seed} d${d}`).toBe(texts.length);
    }
  });

  it("exactly one option is the best (2-point, kind AND sensible) choice per item — a tie for best would silently double her real odds of a full-credit tap", () => {
    for (const { item, seed, d } of ITEMS) {
      const fullCount = item.options.filter(o => o.points === 2).length;
      expect(fullCount, `seed${seed} d${d}`).toBe(1);
    }
  });

  it("exactly one option is the partial (1-point, kind but not the best) choice per item — a tie at the partial tier would blur the 2/1/0 scoring the runner and profile both rely on", () => {
    for (const { item, seed, d } of ITEMS) {
      const partialCount = item.options.filter(o => o.points === 1).length;
      expect(partialCount, `seed${seed} d${d}`).toBe(1);
    }
  });

  it("exactly two options are unkind/unsafe/unrelated (0-point) per item — anything else would mean the 2/1/0/0 profile silently drifted", () => {
    for (const { item, seed, d } of ITEMS) {
      const zeroCount = item.options.filter(o => o.points === 0).length;
      expect(zeroCount, `seed${seed} d${d}`).toBe(2);
    }
  });

  it("score() marks the 2-point option correct and a 0-point option incorrect for every item — this is the literal contract the staircase, ceiling, and profile all read", () => {
    for (const { item, seed, d } of ITEMS) {
      const best = item.options.findIndex(o => o.points === 2);
      const zero = item.options.findIndex(o => o.points === 0);
      expect(whatWouldYouDo.score(item, best).correct, `seed${seed} d${d}`).toBe(true);
      expect(whatWouldYouDo.score(item, zero).correct, `seed${seed} d${d}`).toBe(false);
    }
  });

  it("d1-2 items carry an emoji; d3+ carry no emoji — mixing the two ramp styles within a difficulty would break the age ramp's one-new-idea-per-step rule", () => {
    for (const { item, seed, d } of ITEMS) {
      if (d <= 2) expect(item.emoji, `seed${seed} d${d}`).toBeTruthy();
      else expect(item.emoji, `seed${seed} d${d}`).toBeUndefined();
    }
  });

  it("every prompt is a story ending in 'What would you do?', never the 'why do we' convention-question shape that Comprehension/What Should You Do already owns", () => {
    for (const { item, seed, d } of ITEMS) {
      expect(item.prompt.endsWith("What would you do?"), `seed${seed} d${d}: ${item.prompt}`).toBe(true);
      expect(/^why do (we|you)\b/i.test(item.prompt), `seed${seed} d${d}: ${item.prompt}`).toBe(false);
    }
  });

  it("sample() — the untimed, feedback-free item every block opens with — scores full credit when answered with its own best-scoring option, so the worked example actually teaches the right pattern", () => {
    const { item } = whatWouldYouDo.sample();
    const best = (item as ChoiceItem).options.findIndex(o => o.points === 2);
    expect(whatWouldYouDo.score(item, best).correct).toBe(true);
  });
});
