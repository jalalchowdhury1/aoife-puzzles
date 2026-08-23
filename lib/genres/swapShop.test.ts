import { describe, it, expect } from "vitest";
import { DIFFICULTIES } from "../engine/types";
import { swapShop, totalValue, type SwapShopItem, type Token } from "./swapShop";

function multisetKey(tokens: Token[]): string {
  return [...tokens].sort().join(",");
}

function expectedOptionCount(d: number): number {
  return d === 1 ? 3 : 4;
}

function expectedRuleCount(d: number): number {
  if (d <= 2) return 0;
  if (d <= 6) return 1;
  return 2;
}

describe("totalValue", () => {
  it("sums values for a multiset of tokens", () => {
    expect(totalValue(["⭐", "⭐"], { "⭐": 3 })).toBe(6);
    expect(totalValue(["⭐", "🪙"], { "⭐": 3, "🪙": 2 })).toBe(5);
  });
  it("returns 0 for an empty multiset", () => {
    expect(totalValue([], { "⭐": 3 })).toBe(0);
  });
  it("treats a token with no defined value as 0", () => {
    expect(totalValue(["⭐"], {})).toBe(0);
  });
});

describe("swapShop.generate", () => {
  it("is deterministic for a given seed and difficulty", () => {
    for (const d of DIFFICULTIES) {
      const a = swapShop.generate(12345, d);
      const b = swapShop.generate(12345, d);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("produces a valid, solvable item for every seed and difficulty (500 seeds x 10 difficulties)", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of DIFFICULTIES) {
        const item: SwapShopItem = swapShop.generate(seed, d);

        // rule count matches this band exactly
        expect(item.rules.length, `d${d}`).toBe(expectedRuleCount(d));

        // every rule is value-consistent under item.values
        for (const rule of item.rules) {
          expect(totalValue(rule.give, item.values), `d${d} rule give`).toBe(totalValue(rule.get, item.values));
        }

        // token budget: question, every rule side, and every option <= 4 tokens
        expect(item.question.length).toBeGreaterThanOrEqual(1);
        expect(item.question.length).toBeLessThanOrEqual(4);
        for (const rule of item.rules) {
          expect(rule.give.length).toBeLessThanOrEqual(4);
          expect(rule.get.length).toBeLessThanOrEqual(4);
        }
        for (const opt of item.options) {
          expect(opt.length).toBeGreaterThanOrEqual(1);
          expect(opt.length).toBeLessThanOrEqual(4);
        }

        // option count matches the band, all options distinct as multisets
        const expectedCount = expectedOptionCount(d);
        expect(item.options.length, `d${d}`).toBe(expectedCount);
        const keys = item.options.map(multisetKey);
        expect(new Set(keys).size).toBe(expectedCount);

        // option totals are pairwise distinct
        const totals = item.options.map(o => totalValue(o, item.values));
        expect(new Set(totals).size).toBe(expectedCount);

        // exactly one option matches the hidden value of what she has
        const target = totalValue(item.question, item.values);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(expectedCount);
        totals.forEach((total, i) => {
          if (i === item.answer) expect(total, `d${d}`).toBe(target);
          else expect(total, `d${d}`).not.toBe(target);
        });

        // at d <= 5, every option is built only from tokens shown on the
        // cards/question (no foreign token to rule out by "never seen it")
        if (d <= 5) {
          const seen = new Set<Token>([
            ...item.question,
            ...item.rules.flatMap(r => [...r.give, ...r.get]),
          ]);
          for (const opt of item.options) {
            for (const t of opt) expect(seen.has(t), `d${d}`).toBe(true);
          }
        }
      }
    }
  }, 30000);
});

describe("swapShop.sample", () => {
  it("is 1 star with no rules, and the answer is 1 star", () => {
    const { item, explanation } = swapShop.sample();
    expect(item.rules).toEqual([]);
    expect(item.question).toEqual(["⭐"]);
    expect(item.options[item.answer]).toEqual(["⭐"]);
    expect(explanation).toBe("One star is the same as one star. The same thing is worth the same.");
  });
});

describe("swapShop.score", () => {
  it("awards 1 point for the correct option index", () => {
    const item = swapShop.generate(1, 5);
    expect(swapShop.score(item, item.answer)).toEqual({ points: 1, max: 1, correct: true });
  });
  it("awards 0 points for a wrong option index", () => {
    const item = swapShop.generate(1, 5);
    const wrong = (item.answer + 1) % item.options.length;
    expect(swapShop.score(item, wrong)).toEqual({ points: 0, max: 1, correct: false });
  });
  it("awards 0 points for a null response (timeout)", () => {
    const item = swapShop.generate(1, 5);
    expect(swapShop.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
  });
});

describe("swapShop genre metadata", () => {
  it("has the expected id, domain, mode, and timing", () => {
    expect(swapShop.id).toBe("swapShop");
    expect(swapShop.domain).toBe("FR");
    expect(swapShop.mode).toBe("staircase");
    expect(swapShop.timing).toEqual({ kind: "item", ms: expect.any(Function) });
    // itemMs: 45s at d<=5, 30s at d>=6, matching the common brief's timing knob
    expect(swapShop.timing.kind === "item" && swapShop.timing.ms(5)).toBe(45000);
    expect(swapShop.timing.kind === "item" && swapShop.timing.ms(6)).toBe(30000);
  });
  it("declares an options-kind e2e plan", () => {
    expect(swapShop.e2e).toEqual({ kind: "options", pick: 1 });
  });
});
