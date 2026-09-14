import { describe, expect, it } from "vitest";
import { GENRES } from "./index";
import type { Difficulty } from "../engine/types";

// 2026-09-14, owner: "we can't be repeating the same questions. Fresh ones will
// challenge her more. This is for her regular questions NOT the rematches."
// Every bank genre honours the soft cross-session avoid list, not just Fill the Gap.
const BANK_GENRES = [
  ["arithmetic", 11],
  ["information", 9],
  ["whichTwo", 4],
  ["whatWouldYouDo", 8],
  ["fillTheGap", 7],
] as const;

type Gen = { generate: (seed: number, d: Difficulty, opts?: { avoidBankIds?: string[] }) => { bankId?: string } };

function tierIds(g: Gen, d: Difficulty): string[] {
  const ids = new Set<string>();
  for (let seed = 1; seed <= 400; seed++) ids.add(g.generate(seed, d).bankId!);
  return [...ids].sort();
}

describe("every bank genre prefers questions she has not seen", () => {
  for (const [id, d] of BANK_GENRES) {
    const g = GENRES[id] as unknown as Gen;

    it(`${id} d${d}: with all but one tier item served, the unserved one is always picked`, () => {
      const ids = tierIds(g, d as Difficulty);
      expect(ids.length).toBeGreaterThan(1);
      const [fresh, ...served] = ids;
      for (let seed = 1; seed <= 100; seed++) {
        expect(g.generate(seed, d as Difficulty, { avoidBankIds: served }).bankId).toBe(fresh);
      }
    });

    it(`${id} d${d}: with the whole tier served, the least recently served item is reused`, () => {
      const ids = tierIds(g, d as Difficulty);
      const oldestFirst = [...ids].reverse();
      for (let seed = 1; seed <= 50; seed++) {
        expect(g.generate(seed, d as Difficulty, { avoidBankIds: oldestFirst }).bankId).toBe(oldestFirst[0]);
      }
    });

    it(`${id} d${d}: an empty avoid list is the original draw exactly (history replays rely on it)`, () => {
      for (let seed = 1; seed <= 50; seed++) {
        expect(g.generate(seed, d as Difficulty, { avoidBankIds: [] })).toEqual(g.generate(seed, d as Difficulty));
      }
    });
  }
});
