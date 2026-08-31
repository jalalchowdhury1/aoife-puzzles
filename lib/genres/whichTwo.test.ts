import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty } from "../engine/types";
import { whichTwo } from "./whichTwo";
import { WHICH_TWO_BANK } from "./banks/whichTwo";

// Bank widened to d15 on 2026-08-29 (decision #26) — sweep the authored range,
// not just the default 1-10, or the new bands ship untested.
const ALL_D = [...DIFFICULTIES, 11, 12, 13, 14, 15] as Difficulty[];

describe("whichTwo", () => {
  it("is an untimed staircase genre", () => {
    expect(whichTwo.mode).toBe("staircase");
    expect(whichTwo.timing.kind).toBe("none");
  });

  it("generate is deterministic and always resolves to a real bank item (500 seeds x 15 difficulties)", () => {
    for (let seed = 0; seed < 500; seed++) {
      for (const d of ALL_D) {
        const a = whichTwo.generate(seed, d);
        const b = whichTwo.generate(seed, d);
        expect(b).toEqual(a);
        expect(a.d).toBe(d);
        const bankItem = WHICH_TWO_BANK.find(x => x.id === a.bankId);
        expect(bankItem, a.bankId).toBeTruthy();
        expect(a.explanation).toBe(bankItem!.explanation);
      }
    }
  });

  it("honors excludeBankIds by returning a different bank item", () => {
    for (let seed = 0; seed < 30; seed++) {
      for (const d of ALL_D) {
        const first = whichTwo.generate(seed, d);
        const second = whichTwo.generate(seed, d, { excludeBankIds: [first.bankId] });
        expect(second.bankId).not.toBe(first.bankId);
      }
    }
  });

  it("scores 2 for the correct pair + best reason, 1 for the correct pair + any other reason, 0 for a wrong pair or no response", () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const d of ALL_D) {
        const item = whichTwo.generate(seed, d);
        const bestIdx = item.reasons.findIndex(r => r.points === 2);
        const otherIdx = item.reasons.findIndex(r => r.points !== 2);

        expect(whichTwo.score(item, { pair: item.pair, reason: bestIdx })).toEqual({ points: 2, max: 2, correct: true });
        expect(whichTwo.score(item, { pair: item.pair, reason: otherIdx })).toEqual({ points: 1, max: 2, correct: true });

        const wrongPair = [0, 1, 2, 3].filter(i => !item.pair.includes(i));
        expect(wrongPair.length).toBe(2);
        expect(whichTwo.score(item, { pair: wrongPair, reason: bestIdx })).toEqual({ points: 0, max: 2, correct: false });

        expect(whichTwo.score(item, null)).toEqual({ points: 0, max: 2, correct: false });
      }
    }
  });

  it("accepts the pair in either order", () => {
    const item = whichTwo.generate(1, 1);
    const [a, b] = item.pair;
    const bestIdx = item.reasons.findIndex(r => r.points === 2);
    expect(whichTwo.score(item, { pair: [b, a], reason: bestIdx })).toEqual({ points: 2, max: 2, correct: true });
  });

  it("sample() is the apple and banana d1 item, shuffled like play (the pair must not always be tiles 1 and 2) and stable", () => {
    const { item, explanation } = whichTwo.sample();
    expect(item.bankId).toBe("wt-01");
    expect([...item.items.map(o => o.text)].sort()).toEqual(["apple", "banana", "car", "dog"]);
    expect(item.pair.map(i => item.items[i].text).sort()).toEqual(["apple", "banana"]);
    expect(item.pair).not.toEqual([0, 1]);
    expect(whichTwo.sample().item).toEqual(item);
    expect(explanation.length).toBeGreaterThan(0);
  });

  it("bankId(item) returns the underlying bank id", () => {
    const item = whichTwo.generate(7, 5);
    expect(whichTwo.bankId!(item)).toBe(item.bankId);
  });
});
