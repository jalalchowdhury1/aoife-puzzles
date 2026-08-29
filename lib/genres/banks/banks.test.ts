import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { makeRng } from "../../engine/rng";
import { renderArithmetic, fallbackVars, type ChoiceBankItem, type ArithmeticBankItem } from "../bankGenre";
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

// `dRange` defaults to the standard 1-10 ramp; a widened bank (decision #17,
// e.g. information to d15) passes its own full range so every authored band
// is coverage-checked, not just the base ten.
function checkChoiceBankShape(bank: ChoiceBankItem[], name: string, minPerD: number, dRange: Difficulty[] = DIFFICULTIES) {
  describe(`${name} bank shape`, () => {
    it("has unique ids", () => {
      const ids = bank.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it(`has every item's d within 1..${dRange[dRange.length - 1]}`, () => {
      for (const item of bank) expect(dRange).toContain(item.d);
    });

    it(`has at least ${minPerD} items at every difficulty`, () => {
      for (const d of dRange) {
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

// Information was widened to d15 on 2026-08-28 (decision #17 — she reached
// the d10 cap on 2026-08-27), so its whole 1-15 ramp is coverage-checked.
const INFORMATION_DS = [...DIFFICULTIES, 11, 12, 13, 14, 15] as Difficulty[];
checkChoiceBankShape(INFORMATION_BANK, "information", 4, INFORMATION_DS);
checkPointsProfile(INFORMATION_BANK, "information", () => [1, 0, 0, 0]);

checkChoiceBankShape(COMPREHENSION_BANK, "comprehension", 4);
checkPointsProfile(COMPREHENSION_BANK, "comprehension", () => [2, 1, 0, 0]);

// Arithmetic's authored range, base ramp plus both widenings.
const WIDENED_DS = [...DIFFICULTIES, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as Difficulty[];

describe("arithmetic bank shape", () => {
  it("has unique ids", () => {
    const ids = ARITHMETIC_BANK.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Arithmetic was widened to d15 on 2026-08-28 (decision #17 — she topped
  // the d10 cap with clean wins on the 1.5x clock), then to d20 on
  // 2026-08-29 (decision #26 — she topped d15 the same way).
  it("has every item's d within 1..20", () => {
    for (const item of ARITHMETIC_BANK) expect(WIDENED_DS).toContain(item.d);
  });

  it("has at least 6 items at every base difficulty (1-10)", () => {
    for (const d of DIFFICULTIES) {
      const count = ARITHMETIC_BANK.filter((b: ArithmeticBankItem) => b.d === d).length;
      expect(count, `difficulty ${d}`).toBeGreaterThanOrEqual(6);
    }
  });

  it("has at least 4 items at every widened difficulty (11-20)", () => {
    for (const d of WIDENED_DS.filter(d => d > 10)) {
      const count = ARITHMETIC_BANK.filter((b: ArithmeticBankItem) => b.d === d).length;
      expect(count, `difficulty ${d}`).toBeGreaterThanOrEqual(4);
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

  // Added 2026-08-29 after an audit found 19 templates that could render an
  // UNANSWERABLE item (a fractional "correct" answer) whenever all 50 random
  // draws missed their `ok` — rare, but a false weakness every time it fired.
  // bankGenre.ts's fallback now returns a draw that satisfies `ok`; these two
  // rules are what keep that guarantee true as the bank grows.
  it("every template's ok predicate is satisfiable, so the fallback draw never throws", () => {
    for (const tmpl of ARITHMETIC_BANK) {
      expect(() => fallbackVars(tmpl), tmpl.id).not.toThrow();
    }
  });

  it("every template's fallback draw satisfies its own ok and yields a non-negative whole answer", () => {
    for (const tmpl of ARITHMETIC_BANK) {
      const vars = fallbackVars(tmpl);
      // Inside the declared ranges...
      for (const [k, [lo, hi]] of Object.entries(tmpl.vars)) {
        expect(vars[k], `${tmpl.id} var ${k}`).toBeGreaterThanOrEqual(lo);
        expect(vars[k], `${tmpl.id} var ${k}`).toBeLessThanOrEqual(hi);
      }
      // ...satisfying ok, which is the whole point...
      if (tmpl.ok) expect(tmpl.ok(vars), `${tmpl.id} fallback violates its own ok`).toBe(true);
      // ...and therefore answerable by a child typing whole numbers.
      const answer = tmpl.answer(vars);
      expect(Number.isInteger(answer), `${tmpl.id} fallback answer ${answer}`).toBe(true);
      expect(answer, tmpl.id).toBeGreaterThanOrEqual(0);
    }
  });

  it("no ok-satisfying draw anywhere in a template's range produces a fractional or negative answer", () => {
    // 2000 accepted draws per template: the ok path is what she actually
    // sees, so it has to be airtight, not merely usually right.
    for (const tmpl of ARITHMETIC_BANK) {
      let checked = 0;
      for (let seed = 0; checked < 2000 && seed < 40000; seed++) {
        const rng = makeRng(seed * 2654435761);
        const vars: Record<string, number> = {};
        for (const [k, [lo, hi]] of Object.entries(tmpl.vars)) vars[k] = rng.int(lo, hi);
        if (tmpl.ok && !tmpl.ok(vars)) continue;
        checked++;
        const answer = tmpl.answer(vars);
        expect(Number.isInteger(answer), `${tmpl.id} ${JSON.stringify(vars)} -> ${answer}`).toBe(true);
        expect(answer, `${tmpl.id} ${JSON.stringify(vars)}`).toBeGreaterThanOrEqual(0);
      }
      expect(checked, `${tmpl.id}: ok predicate is too strict to sample`).toBeGreaterThan(0);
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
