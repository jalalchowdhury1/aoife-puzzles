// Fairness/validity guard for Spot It (owner decision #14: "validity is
// sacred"). Lives here rather than in the shared lib/genres/fairness.test.ts
// because that file is off limits to this genre's worktree (see the common
// brief) — GENRES/GENRE_LIST there is a registry this worktree does not
// touch. Each rule below is named with the bug it prevents. A single shared
// 500-seed x 10-difficulty sweep is built once and reused by every rule.
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { spotIt, FAMILIES, familyOf, type SpotItItem } from "../spotIt";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: SpotItItem }
const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: spotIt.generate(seed, d) });
}

describe("spotIt fairness", () => {
  it("generate(seed, d) is deterministic — a re-roll must never change her graded item", () => {
    for (const { seed, d, item } of ITEMS) {
      expect(spotIt.generate(seed, d)).toEqual(item);
    }
  });

  it("present is true iff the target actually appears in the group — this is the entire YES/NO scoring contract", () => {
    for (const { item } of ITEMS) {
      expect(item.group.includes(item.target)).toBe(item.present);
    }
  });

  it("the group never contains a duplicate picture — a repeated icon would shrink her real search space without her knowing", () => {
    for (const { item } of ITEMS) {
      expect(new Set(item.group).size).toBe(item.group.length);
    }
  });

  it("group size is exactly 3 at d<=3 and 4 at d>=4, per the ramp", () => {
    for (const { d, item } of ITEMS) {
      expect(item.group.length).toBe(d <= 3 ? 3 : 4);
    }
  });

  it("when the target is absent, the group always contains one of its own look-alikes — otherwise NO would be a free tell instead of a real scan", () => {
    for (const { item } of ITEMS) {
      if (item.present) continue;
      const family = familyOf(item.target);
      expect(family, item.target).toBeTruthy();
      const lookalikes = family!.filter(icon => icon !== item.target);
      expect(item.group.some(icon => lookalikes.includes(icon)), JSON.stringify(item)).toBe(true);
    }
  });

  it("the target is present 40-60% of the time over the full sweep — a lopsided rate would let her learn to tap one button without scanning", () => {
    const presentCount = ITEMS.filter(({ item }) => item.present).length;
    const rate = presentCount / ITEMS.length;
    expect(rate).toBeGreaterThan(0.4);
    expect(rate).toBeLessThan(0.6);
  });

  it("no family shares an icon with another family — the look-alike guarantee above depends on families never overlapping", () => {
    const seen = new Set<string>();
    for (const family of FAMILIES) {
      for (const icon of family) {
        expect(seen.has(icon), icon).toBe(false);
        seen.add(icon);
      }
    }
  });

  it("difficulty never changes which pictures can appear, only the group size — the ramp note says d is ignored except for group size", () => {
    const targetsByD = new Map<Difficulty, Set<string>>();
    for (const { d, item } of ITEMS) {
      if (!targetsByD.has(d)) targetsByD.set(d, new Set());
      targetsByD.get(d)!.add(item.target);
    }
    const allTargets = new Set(FAMILIES.map(f => f[0]));
    for (const d of DIFFICULTIES) {
      for (const target of targetsByD.get(d) ?? []) {
        expect(allTargets.has(target), `d${d} target ${target}`).toBe(true);
      }
    }
  });

  it("sample() is a present=true item consistent with its own family", () => {
    const { item } = spotIt.sample();
    expect(item.present).toBe(true);
    expect(item.group).toContain(item.target);
    expect(new Set(item.group).size).toBe(item.group.length);
    expect(familyOf(item.target)).toBeTruthy();
  });
});
