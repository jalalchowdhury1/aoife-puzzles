import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { makeRng } from "../../engine/rng";
import { renderArithmetic, type ChoiceBankItem, type ArithmeticBankItem } from "../bankGenre";
import { SIMILARITIES_BANK } from "./similarities";
import { VOCABULARY_BANK } from "./vocabulary";
import { INFORMATION_BANK } from "./information";
import { COMPREHENSION_BANK } from "./comprehension";
import { ARITHMETIC_BANK } from "./arithmetic";

// Matches ASCII hyphen-minus plus the common unicode dash characters (U+2010..U+2015).
const NO_DASH = /[-‐‑‒–—―]/;

function noDashes(s: string): boolean {
  return !NO_DASH.test(s);
}

function checkChoiceBankShape(bank: ChoiceBankItem[], name: string, minPerD: number) {
  describe(`${name} bank shape`, () => {
    it("has unique ids", () => {
      const ids = bank.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("has every item's d within 1..10", () => {
      for (const item of bank) expect(DIFFICULTIES).toContain(item.d);
    });

    it(`has at least ${minPerD} items at every difficulty`, () => {
      for (const d of DIFFICULTIES) {
        const count = bank.filter(b => b.d === d).length;
        expect(count, `difficulty ${d}`).toBeGreaterThanOrEqual(minPerD);
      }
    });

    it("has at least 40 items total", () => {
      expect(bank.length).toBeGreaterThanOrEqual(40);
    });

    it("every item has exactly 4 options with unique text", () => {
      for (const item of bank) {
        expect(item.options.length, item.id).toBe(4);
        const texts = item.options.map(o => o.text);
        expect(new Set(texts).size, item.id).toBe(4);
      }
    });

    it("every item has a non-empty prompt and explanation with no dashes", () => {
      for (const item of bank) {
        expect(item.prompt.length, item.id).toBeGreaterThan(0);
        expect(item.explanation.length, item.id).toBeGreaterThan(0);
        expect(noDashes(item.prompt), `${item.id} prompt: ${item.prompt}`).toBe(true);
        expect(noDashes(item.explanation), `${item.id} explanation: ${item.explanation}`).toBe(true);
        for (const o of item.options) {
          expect(noDashes(o.text), `${item.id} option: ${o.text}`).toBe(true);
        }
      }
    });
  });
}

function checkPointsProfile(bank: ChoiceBankItem[], name: string, profileFor: (d: Difficulty) => number[]) {
  describe(`${name} bank scoring shape`, () => {
    it("has the expected points distribution for every item", () => {
      for (const item of bank) {
        const expected = [...profileFor(item.d)].sort((a, b) => b - a);
        const actual = item.options.map(o => o.points).sort((a, b) => b - a);
        expect(actual, item.id).toEqual(expected);
      }
    });
  });
}

checkChoiceBankShape(SIMILARITIES_BANK, "similarities", 4);
checkPointsProfile(SIMILARITIES_BANK, "similarities", () => [2, 1, 0, 0]);

checkChoiceBankShape(VOCABULARY_BANK, "vocabulary", 4);
checkPointsProfile(VOCABULARY_BANK, "vocabulary", d => (d <= 2 ? [1, 0, 0, 0] : [2, 1, 0, 0]));
describe("vocabulary bank picture items", () => {
  it("d1-2 items have an emoji and the picture prompt", () => {
    for (const item of VOCABULARY_BANK.filter(b => b.d <= 2)) {
      expect(item.emoji, item.id).toBeTruthy();
      expect(item.prompt, item.id).toBe("What is this?");
    }
  });
  it("d3+ items have no emoji", () => {
    for (const item of VOCABULARY_BANK.filter(b => b.d >= 3)) {
      expect(item.emoji, item.id).toBeUndefined();
    }
  });
});

checkChoiceBankShape(INFORMATION_BANK, "information", 4);
checkPointsProfile(INFORMATION_BANK, "information", () => [1, 0, 0, 0]);

checkChoiceBankShape(COMPREHENSION_BANK, "comprehension", 4);
checkPointsProfile(COMPREHENSION_BANK, "comprehension", () => [2, 1, 0, 0]);

describe("arithmetic bank shape", () => {
  it("has unique ids", () => {
    const ids = ARITHMETIC_BANK.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has every item's d within 1..10", () => {
    for (const item of ARITHMETIC_BANK) expect(DIFFICULTIES).toContain(item.d);
  });

  it("has at least 6 items at every difficulty", () => {
    for (const d of DIFFICULTIES) {
      const count = ARITHMETIC_BANK.filter((b: ArithmeticBankItem) => b.d === d).length;
      expect(count, `difficulty ${d}`).toBeGreaterThanOrEqual(6);
    }
  });

  it("has at least 60 items total", () => {
    expect(ARITHMETIC_BANK.length).toBeGreaterThanOrEqual(60);
  });

  it("template text has no dashes", () => {
    for (const tmpl of ARITHMETIC_BANK) {
      expect(noDashes(tmpl.template), tmpl.id).toBe(true);
    }
  });

  for (const tmpl of ARITHMETIC_BANK) {
    it(`template ${tmpl.id} always renders a fully substituted, non-negative integer answer`, () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = makeRng(seed * 97 + 13);
        const { text, answer } = renderArithmetic(tmpl, rng);
        expect(text.includes("{"), `${tmpl.id} seed ${seed}: ${text}`).toBe(false);
        expect(Number.isInteger(answer), `${tmpl.id} seed ${seed}: ${answer}`).toBe(true);
        expect(answer, `${tmpl.id} seed ${seed}`).toBeGreaterThanOrEqual(0);
      }
    });
  }
});
