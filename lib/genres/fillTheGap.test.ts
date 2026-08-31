import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../engine/types";
import { fillTheGap, audit } from "./fillTheGap";
import { FILL_THE_GAP_BANK } from "./banks/fillTheGap";
import type { ChoiceItem } from "./bankGenre";

// Matches ASCII hyphen-minus plus the common unicode dash characters
// (U+2010..U+2015) — mirrors lib/genres/banks/banks.test.ts's NO_DASH.
const NO_DASH = /[-‐‑‒–—―]/;
function noDashes(s: string): boolean {
  return !NO_DASH.test(s);
}

// Owner decision #8 / AGENTS.md: kid text is warm and never "wrong/bad/oops".
const BANNED_WORDS = /\b(wrong|bad|oops)\b/i;
function noBannedWords(s: string): boolean {
  return !BANNED_WORDS.test(s);
}

// ---------------------------------------------------------------------------
// Bank shape (mirrors lib/genres/banks/banks.test.ts's checkChoiceBankShape /
// checkPointsProfile, inlined here since fillTheGap is new and banks.test.ts
// is a shared file this worker does not edit).
// ---------------------------------------------------------------------------
describe("fillTheGap bank shape", () => {
  it("has unique ids", () => {
    const ids = FILL_THE_GAP_BANK.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has every item's d within 1..10", () => {
    for (const item of FILL_THE_GAP_BANK) expect(DIFFICULTIES).toContain(item.d);
  });

  it("has at least 4 items at every difficulty", () => {
    for (const d of DIFFICULTIES) {
      const count = FILL_THE_GAP_BANK.filter(b => b.d === d).length;
      expect(count, `difficulty ${d}`).toBeGreaterThanOrEqual(4);
    }
  });

  it("has at least 44 items total", () => {
    expect(FILL_THE_GAP_BANK.length).toBeGreaterThanOrEqual(44);
  });

  it("every item has exactly 4 options with unique text", () => {
    for (const item of FILL_THE_GAP_BANK) {
      expect(item.options.length, item.id).toBe(4);
      const texts = item.options.map(o => o.text);
      expect(new Set(texts).size, item.id).toBe(4);
    }
  });

  it("every item has exactly one 2-point option and exactly one 1-point option", () => {
    for (const item of FILL_THE_GAP_BANK) {
      expect(item.options.filter(o => o.points === 2).length, item.id).toBe(1);
      expect(item.options.filter(o => o.points === 1).length, item.id).toBe(1);
      expect(item.options.filter(o => o.points === 0).length, item.id).toBe(2);
    }
  });

  it("d1-2 items have an emoji and a blank in the prompt; d3+ have no emoji", () => {
    for (const item of FILL_THE_GAP_BANK) {
      if (item.d <= 2) expect(item.emoji, item.id).toBeTruthy();
      else expect(item.emoji, item.id).toBeUndefined();
      expect(item.prompt.includes("___"), item.id).toBe(true);
    }
  });

  it("every item has a non-empty prompt and explanation with no dashes and no banned words", () => {
    for (const item of FILL_THE_GAP_BANK) {
      expect(item.prompt.length, item.id).toBeGreaterThan(0);
      expect(item.explanation.length, item.id).toBeGreaterThan(0);
      expect(noDashes(item.prompt), `${item.id} prompt: ${item.prompt}`).toBe(true);
      expect(noDashes(item.explanation), `${item.id} explanation: ${item.explanation}`).toBe(true);
      expect(noBannedWords(item.prompt), `${item.id} prompt: ${item.prompt}`).toBe(true);
      expect(noBannedWords(item.explanation), `${item.id} explanation: ${item.explanation}`).toBe(true);
      for (const o of item.options) {
        expect(noDashes(o.text), `${item.id} option: ${o.text}`).toBe(true);
        expect(noBannedWords(o.text), `${item.id} option: ${o.text}`).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Generator / scorer (mirrors lib/genres/bankGenre.test.ts's
// testCommonBehavior / testChoiceScoring, inlined for the same reason).
// ---------------------------------------------------------------------------
describe("fillTheGap: generate", () => {
  it("is deterministic and never widens when nothing is excluded (500 seeds x 10 difficulties)", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const first = fillTheGap.generate(seed, d);
        const second = fillTheGap.generate(seed, d);
        expect(second, `seed ${seed} d ${d}`).toEqual(first);
        expect(first.d, `seed ${seed} d ${d}`).toBe(d);
        expect(first.explanation.length, `seed ${seed} d ${d}`).toBeGreaterThan(0);
        const id = fillTheGap.bankId!(first);
        const matched = FILL_THE_GAP_BANK.find(b => b.id === id);
        expect(matched, `seed ${seed} d ${d} id ${id}`).toBeTruthy();
      }
    }
  });

  it("honors excludeBankIds by returning a different bank item", () => {
    for (let seed = 0; seed < 30; seed++) {
      for (const d of DIFFICULTIES) {
        const first = fillTheGap.generate(seed, d);
        const firstId = fillTheGap.bankId!(first);
        const second = fillTheGap.generate(seed, d, { excludeBankIds: [firstId!] });
        expect(fillTheGap.bankId!(second), `seed ${seed} d ${d}`).not.toBe(firstId);
      }
    }
  });

  it("widens to a neighboring difficulty when every item at d is excluded", () => {
    for (const d of DIFFICULTIES) {
      const idsAtD = FILL_THE_GAP_BANK.filter(b => b.d === d).map(b => b.id);
      for (let seed = 0; seed < 5; seed++) {
        const item = fillTheGap.generate(seed, d, { excludeBankIds: idsAtD });
        expect(item.d, `seed ${seed} d ${d}`).not.toBe(d);
      }
    }
  });
});

describe("fillTheGap: score", () => {
  it("matches the points/max formula for every option, and 0 for a null response", () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const d of DIFFICULTIES) {
        const item = fillTheGap.generate(seed, d);
        const max = item.options.reduce((m, o) => Math.max(m, o.points), 0);
        for (let i = 0; i < item.options.length; i++) {
          const result = fillTheGap.score(item, i);
          expect(result.max, `d ${d} option ${i}`).toBe(max);
          expect(result.points, `d ${d} option ${i}`).toBe(item.options[i].points);
          const expectedCorrect = max === 2 ? item.options[i].points >= 1 : item.options[i].points === max;
          expect(result.correct, `d ${d} option ${i}`).toBe(expectedCorrect);
        }
        const nullResult = fillTheGap.score(item, null);
        expect(nullResult).toEqual({ points: 0, max, correct: false });
      }
    }
  });
});

describe("fillTheGap: sample", () => {
  it("returns the fixed d1 cat item with a non-empty explanation", () => {
    const { item, explanation } = fillTheGap.sample();
    expect(item.prompt).toBe("The cat is ___ on the mat and has not opened her eyes since lunch.");
    expect(item.d).toBe(1);
    expect(explanation.length).toBeGreaterThan(0);
  });

  it("scores full credit for its own displayed best answer", () => {
    const { item } = fillTheGap.sample();
    const best = item.options.findIndex(o => o.points === 2);
    const result = fillTheGap.score(item, best);
    expect(result.correct).toBe(true);
  });
});

describe("fillTheGap: audit", () => {
  it("renders self-contained HTML with the prompt and every option's points, no React", () => {
    for (const d of DIFFICULTIES) {
      const item = fillTheGap.generate(1, d) as ChoiceItem;
      const html = audit(item);
      expect(html).toContain(item.prompt.replace(/&/g, "&amp;"));
      for (const o of item.options) {
        expect(html).toContain(`(${o.points}pt)`);
      }
    }
  });
});
