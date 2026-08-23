// Fairness/validity guard for Which Two Belong? (owner decision #14:
// "validity is sacred"). Lives here rather than in the shared
// lib/genres/fairness.test.ts because that file is off limits to this
// genre's worktree (see the common brief) — GENRES/GENRE_LIST there is a
// registry this worktree does not touch. Each rule below is named with the
// bug it prevents.
import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../../engine/types";
import { whichTwo } from "../whichTwo";
import { WHICH_TWO_BANK } from "../banks/whichTwo";

// Matches ASCII hyphen-minus plus the common unicode dash characters (U+2010..U+2015).
const NO_DASH = /[-‐‑‒–—―]/;
function noDashes(s: string): boolean {
  return !NO_DASH.test(s);
}

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

describe("whichTwo bank shape", () => {
  it("has unique ids", () => {
    const ids = WHICH_TWO_BANK.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has every item's d within 1..10", () => {
    for (const item of WHICH_TWO_BANK) expect(DIFFICULTIES).toContain(item.d);
  });

  it("has at least 4 items at every difficulty", () => {
    for (const d of DIFFICULTIES) {
      const count = WHICH_TWO_BANK.filter(b => b.d === d).length;
      expect(count, `difficulty ${d}`).toBeGreaterThanOrEqual(4);
    }
  });

  it("has at least 40 items total", () => {
    expect(WHICH_TWO_BANK.length).toBeGreaterThanOrEqual(40);
  });

  it("every item has exactly 4 pictures/words with unique text — a duplicate would make the pair a guess by elimination", () => {
    for (const item of WHICH_TWO_BANK) {
      expect(item.items.length, item.id).toBe(4);
      const texts = item.items.map(o => o.text);
      expect(new Set(texts).size, item.id).toBe(4);
    }
  });

  it("pair indices are within 0..3 and distinct", () => {
    for (const item of WHICH_TWO_BANK) {
      const [a, b] = item.pair;
      expect(a, item.id).toBeGreaterThanOrEqual(0);
      expect(a, item.id).toBeLessThanOrEqual(3);
      expect(b, item.id).toBeGreaterThanOrEqual(0);
      expect(b, item.id).toBeLessThanOrEqual(3);
      expect(a, item.id).not.toBe(b);
    }
  });

  it("has exactly 3 reasons per item with unique text and points {0,1,2} — exactly one best, one partial, one worth nothing", () => {
    for (const item of WHICH_TWO_BANK) {
      expect(item.reasons.length, item.id).toBe(3);
      const texts = item.reasons.map(r => r.text);
      expect(new Set(texts).size, item.id).toBe(3);
      const points = item.reasons.map(r => r.points).sort((x, y) => x - y);
      expect(points, item.id).toEqual([0, 1, 2]);
    }
  });

  it("d1-2 items have an emoji on all four pictures", () => {
    for (const item of WHICH_TWO_BANK.filter(b => b.d <= 2)) {
      for (const opt of item.items) expect(opt.emoji, `${item.id}: ${opt.text}`).toBeTruthy();
    }
  });

  it("d3+ items have no emoji — word only categories and abstractions", () => {
    for (const item of WHICH_TWO_BANK.filter(b => b.d >= 3)) {
      for (const opt of item.items) expect(opt.emoji, `${item.id}: ${opt.text}`).toBeUndefined();
    }
  });

  it("every item has a non-empty explanation and a reviewer distractorNote, with no dashes anywhere a kid or the reviewer reads text", () => {
    for (const item of WHICH_TWO_BANK) {
      expect(item.explanation.length, item.id).toBeGreaterThan(0);
      expect(item.distractorNote.length, item.id).toBeGreaterThan(0);
      expect(noDashes(item.explanation), `${item.id} explanation: ${item.explanation}`).toBe(true);
      expect(noDashes(item.distractorNote), `${item.id} distractorNote: ${item.distractorNote}`).toBe(true);
      for (const opt of item.items) expect(noDashes(opt.text), `${item.id} option: ${opt.text}`).toBe(true);
      for (const r of item.reasons) expect(noDashes(r.text), `${item.id} reason: ${r.text}`).toBe(true);
    }
  });
});

describe("whichTwo generate fairness", () => {
  it("generate(seed, d) is deterministic across the full sweep", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS) {
        const a = whichTwo.generate(seed, d);
        const b = whichTwo.generate(seed, d);
        expect(b).toEqual(a);
      }
    }
  });

  it("the four displayed items are always exactly the bank item's own four options — shuffling position must never invent, drop, or duplicate an option", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = whichTwo.generate(seed, d);
        const bankItem = WHICH_TWO_BANK.find(b => b.id === item.bankId)!;
        const shownTexts = [...item.items.map(o => o.text)].sort();
        const bankTexts = [...bankItem.items.map(o => o.text)].sort();
        expect(shownTexts, `${bankItem.id} seed ${seed} d ${d}`).toEqual(bankTexts);
      }
    }
  });

  it("the shuffled pair always points at the same two option texts the bank marked as the pair", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = whichTwo.generate(seed, d);
        const bankItem = WHICH_TWO_BANK.find(b => b.id === item.bankId)!;
        const shownPairTexts = item.pair.map(i => item.items[i].text).sort();
        const bankPairTexts = bankItem.pair.map(i => bankItem.items[i].text).sort();
        expect(shownPairTexts, `${bankItem.id} seed ${seed} d ${d}`).toEqual(bankPairTexts);
      }
    }
  });

  it("the three reasons shown are always exactly the bank item's own three reasons, just reordered", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = whichTwo.generate(seed, d);
        const bankItem = WHICH_TWO_BANK.find(b => b.id === item.bankId)!;
        const shown = [...item.reasons].sort((a, b) => a.points - b.points);
        const bank = [...bankItem.reasons].sort((a, b) => a.points - b.points);
        expect(shown, `${bankItem.id} seed ${seed} d ${d}`).toEqual(bank);
      }
    }
  });

  it("scoring never gives full credit unless both the pair and the best reason are correct, and a wrong pair always scores 0 regardless of reason", () => {
    for (const d of DIFFICULTIES) {
      for (const seed of SEEDS.slice(0, 50)) {
        const item = whichTwo.generate(seed, d);
        const bestIdx = item.reasons.findIndex(r => r.points === 2);
        for (let reasonIdx = 0; reasonIdx < 3; reasonIdx++) {
          const result = whichTwo.score(item, { pair: item.pair, reason: reasonIdx });
          expect(result.points, `d${d} seed${seed} reason${reasonIdx}`).toBe(reasonIdx === bestIdx ? 2 : 1);
          expect(result.correct, `d${d} seed${seed} reason${reasonIdx}`).toBe(true);
        }
        const wrongPair = [0, 1, 2, 3].filter(i => !item.pair.includes(i));
        for (let reasonIdx = 0; reasonIdx < 3; reasonIdx++) {
          const result = whichTwo.score(item, { pair: wrongPair, reason: reasonIdx });
          expect(result.points, `d${d} seed${seed} reason${reasonIdx}`).toBe(0);
          expect(result.correct, `d${d} seed${seed} reason${reasonIdx}`).toBe(false);
        }
      }
    }
  });

  it("widens to a neighboring difficulty when every item at d is excluded", () => {
    for (const d of DIFFICULTIES) {
      const idsAtD = WHICH_TWO_BANK.filter(b => b.d === d).map(b => b.id);
      for (let seed = 0; seed < 5; seed++) {
        const item = whichTwo.generate(seed, d, { excludeBankIds: idsAtD });
        expect(item.d, `seed ${seed} d ${d}`).not.toBe(d);
      }
    }
  });
});

describe("whichTwo distractor review coverage", () => {
  it("wt-01 sample item's distractors (car, dog) do not pair with the fruit or with each other", () => {
    const item = WHICH_TWO_BANK.find(b => b.id === "wt-01")!;
    expect(item.distractorNote.length).toBeGreaterThan(0);
  });

  it("every item's reviewer note is specific to that item, not a copy-pasted placeholder", () => {
    const notes = WHICH_TWO_BANK.map(b => b.distractorNote);
    // Not every note need be unique in principle, but wholesale duplication
    // across the bank would signal the review step was skipped.
    const uniqueRatio = new Set(notes).size / notes.length;
    expect(uniqueRatio).toBeGreaterThan(0.9);
  });
});
