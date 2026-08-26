// Validity/fairness guard for Swap Shop (owner decision #14, AGENTS.md
// "validity is sacred"). Each rule below is one named `it()` describing the
// real bug it would catch. This intentionally overlaps ../swapShop.test.ts
// (see lib/genres/fairness.test.ts's own header comment for why both stay).
import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../../engine/types";
import { swapShop, totalValue, type SwapShopItem, type Token } from "../swapShop";

const SEEDS = Array.from({ length: 500 }, (_, i) => i + 1);

interface Cached { seed: number; d: Difficulty; item: SwapShopItem }

const ITEMS: Cached[] = [];
for (const d of DIFFICULTIES) {
  for (const seed of SEEDS) ITEMS.push({ seed, d, item: swapShop.generate(seed, d) });
}

function multisetKey(tokens: Token[]): string {
  return [...tokens].sort().join(",");
}

describe("swapShop fairness", () => {
  it("is deterministic — the same seed+difficulty always produces the same item (prevents a hidden Math.random/Date leak)", () => {
    for (const { seed, d, item } of ITEMS) {
      const again = swapShop.generate(seed, d);
      expect(JSON.stringify(again), `d${d} seed${seed}`).toBe(JSON.stringify(item));
    }
  });

  it("every rule is value-consistent — a rule's give side and get side total the same hidden value (prevents an unfair trade card that doesn't actually balance)", () => {
    for (const { d, item } of ITEMS) {
      for (const rule of item.rules) {
        expect(totalValue(rule.give, item.values), `d${d}`).toBe(totalValue(rule.get, item.values));
      }
    }
  });

  it("exactly one option matches what she has — never zero (unsolvable) and never two-or-more (ambiguous, two 'right' answers)", () => {
    for (const { d, item } of ITEMS) {
      const target = totalValue(item.question, item.values);
      const hits = item.options.filter(o => totalValue(o, item.values) === target);
      expect(hits.length, `d${d}`).toBe(1);
    }
  });

  it("item.answer actually points at the one matching option (prevents an off-by-one / stale index bug from a shuffle step)", () => {
    for (const { d, item } of ITEMS) {
      const target = totalValue(item.question, item.values);
      expect(totalValue(item.options[item.answer], item.values), `d${d}`).toBe(target);
    }
  });

  it("every option's total is distinct from every other (prevents two visually-different piles that are secretly worth the same, an accidental second 'correct' reading)", () => {
    for (const { d, item } of ITEMS) {
      const totals = item.options.map(o => totalValue(o, item.values));
      expect(new Set(totals).size, `d${d}`).toBe(totals.length);
    }
  });

  it("every option is a distinct pile (no two options show the exact same tokens, which would be visually confusing even before scoring)", () => {
    for (const { d, item } of ITEMS) {
      const keys = item.options.map(multisetKey);
      expect(new Set(keys).size, `d${d}`).toBe(keys.length);
    }
  });

  it("option count matches the band — 3 at d1, 4 from d2 on (prevents a stray/missing option slipping in)", () => {
    for (const { d, item } of ITEMS) {
      expect(item.options.length, `d${d}`).toBe(d === 1 ? 3 : 4);
    }
  });

  it("rule count matches the band — 0 at d1-2, 1 at d3-7, 2 at d8-10 (prevents an under- or over-scaffolded item for its difficulty; bands re-cut 2026-08-26)", () => {
    for (const { d, item } of ITEMS) {
      const expected = d <= 2 ? 0 : d <= 7 ? 1 : 2;
      expect(item.rules.length, `d${d}`).toBe(expected);
    }
  });

  it("the question, every rule side, and every option hold at most 4 tokens (prevents a cluttered, hard-to-count pile)", () => {
    for (const { d, item } of ITEMS) {
      expect(item.question.length, `d${d}`).toBeLessThanOrEqual(4);
      expect(item.question.length, `d${d}`).toBeGreaterThanOrEqual(1);
      for (const rule of item.rules) {
        expect(rule.give.length, `d${d}`).toBeLessThanOrEqual(4);
        expect(rule.get.length, `d${d}`).toBeLessThanOrEqual(4);
        expect(rule.give.length, `d${d}`).toBeGreaterThanOrEqual(1);
        expect(rule.get.length, `d${d}`).toBeGreaterThanOrEqual(1);
      }
      for (const opt of item.options) {
        expect(opt.length, `d${d}`).toBeLessThanOrEqual(4);
        expect(opt.length, `d${d}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("at d<=6, every option is built only from tokens shown on the cards/question (prevents ruling an option out by 'I've never seen that token' instead of by its value)", () => {
    for (const { d, item } of ITEMS) {
      if (d > 6) continue;
      const seen = new Set<Token>([...item.question, ...item.rules.flatMap(r => [...r.give, ...r.get])]);
      for (const opt of item.options) {
        for (const t of opt) expect(seen.has(t), `d${d}`).toBe(true);
      }
    }
  });

  it("d1-2 show no rules — matching is judged on the token itself, not a trade (prevents a premature substitution idea before matching is taught)", () => {
    for (const { d, item } of ITEMS) {
      if (d > 2) continue;
      expect(item.rules).toEqual([]);
    }
  });

  it("d1 asks about exactly 1 token and d2 about 2-3 (prevents the 'matching' bands from silently drifting into a different count)", () => {
    for (const { d, item } of ITEMS) {
      if (d === 1) expect(item.question.length).toBe(1);
      if (d === 2) expect([2, 3]).toContain(item.question.length);
    }
  });

  it("d3-d6's read-off bands never need more than 4 of the 'get' token — the rate is capped so the answer pile never overflows the option budget", () => {
    for (const { d, item } of ITEMS) {
      if (d < 3 || d > 6) continue;
      const target = totalValue(item.question, item.values);
      expect(target, `d${d}`).toBeLessThanOrEqual(4);
    }
  });

  // Bug these two prevent (2026-08-26 re-band): the "0.5 level" between the
  // read-off bands and the mixed-pile bands silently becoming either (a) a
  // second mixed-answer band — recreating the exact cliff it was inserted to
  // remove — or (b) a plain repeat of d5 with no mixed pile in sight, so the
  // new idea it exists to introduce never appears.
  it("d6's correct pile is always a plain count read straight off the card, never a mixed pile (the half-step must not demand the idea it introduces)", () => {
    for (const { d, item } of ITEMS) {
      if (d !== 6) continue;
      const correct = item.options[item.answer];
      expect(new Set(correct).size, "correct pile mixes tokens").toBe(1);
      expect(correct[0]).toBe(item.rules[0].get[0]);
      expect(item.question.length, "question must stay at 1 copy").toBe(1);
    }
  });

  it("d6 always shows at least one mixed pile among the wrong options (the band must actually introduce mixed piles, not regress to d5)", () => {
    for (const { d, item } of ITEMS) {
      if (d !== 6) continue;
      const mixed = item.options.filter(o => new Set(o).size > 1);
      expect(mixed.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("d8-10's two chained rules are mutually value-consistent through the shared middle token (prevents a broken chain where the two cards contradict each other)", () => {
    for (const { d, item } of ITEMS) {
      if (d < 8) continue;
      expect(item.rules.length, `d${d}`).toBe(2);
      const [r1, r2] = item.rules;
      // r1: give -> get; r2's give token is a different token from r1's give
      // token, and both legs must be internally consistent under the same
      // shared values map (checked generically above); here we additionally
      // confirm the two rules don't reuse the same give token (a genuine
      // 2-step chain, not the same rule shown twice).
      expect(multisetKey(r1.give)).not.toBe(multisetKey(r2.give));
    }
  });
});
