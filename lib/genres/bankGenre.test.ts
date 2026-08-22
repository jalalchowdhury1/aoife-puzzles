import { describe, it, expect } from "vitest";
import { DIFFICULTIES, type Difficulty, type Genre } from "../engine/types";
import type { ChoiceItem, ArithmeticItem } from "./bankGenre";
import { similarities } from "./similarities";
import { vocabulary } from "./vocabulary";
import { information } from "./information";
import { comprehension } from "./comprehension";
import { arithmetic } from "./arithmetic";
import { SIMILARITIES_BANK } from "./banks/similarities";
import { VOCABULARY_BANK } from "./banks/vocabulary";
import { INFORMATION_BANK } from "./banks/information";
import { COMPREHENSION_BANK } from "./banks/comprehension";
import { ARITHMETIC_BANK } from "./banks/arithmetic";

interface BankLike { id: string; d: Difficulty }

/** Determinism, exclusion, and widening behavior shared by every bank-backed genre. */
function testCommonBehavior<I extends { d: Difficulty }>(genre: Genre<I, number>, bank: readonly BankLike[], name: string) {
  describe(`${name}: generate`, () => {
    it("is deterministic and never widens when nothing is excluded (500 seeds x 10 difficulties)", () => {
      for (let seed = 0; seed < 500; seed++) {
        for (const d of DIFFICULTIES) {
          const first = genre.generate(seed, d);
          const second = genre.generate(seed, d);
          expect(second, `seed ${seed} d ${d}`).toEqual(first);
          expect(first.d, `seed ${seed} d ${d}`).toBe(d);
          const id = genre.bankId!(first);
          expect(bank.some(b => b.id === id), `seed ${seed} d ${d} id ${id}`).toBe(true);
        }
      }
    });

    it("honors excludeBankIds by returning a different bank item", () => {
      for (let seed = 0; seed < 30; seed++) {
        for (const d of DIFFICULTIES) {
          const first = genre.generate(seed, d);
          const firstId = genre.bankId!(first);
          const second = genre.generate(seed, d, { excludeBankIds: [firstId!] });
          expect(genre.bankId!(second), `seed ${seed} d ${d}`).not.toBe(firstId);
        }
      }
    });

    it("widens to a neighboring difficulty when every item at d is excluded", () => {
      for (const d of DIFFICULTIES) {
        const idsAtD = bank.filter(b => b.d === d).map(b => b.id);
        for (let seed = 0; seed < 5; seed++) {
          const item = genre.generate(seed, d, { excludeBankIds: idsAtD });
          expect(item.d, `seed ${seed} d ${d}`).not.toBe(d);
        }
      }
    });
  });

  it("sample() returns a fixed item with a non-empty explanation", () => {
    const { item, explanation } = genre.sample();
    expect(item).toBeTruthy();
    expect(explanation.length).toBeGreaterThan(0);
  });
}

function testChoiceScoring(genre: Genre<ChoiceItem, number>, name: string) {
  describe(`${name}: score`, () => {
    it("matches the points/max formula for every option, and 0 for a null response", () => {
      for (let seed = 0; seed < 50; seed++) {
        for (const d of DIFFICULTIES) {
          const item = genre.generate(seed, d);
          const max = item.options.reduce((m, o) => Math.max(m, o.points), 0);
          for (let i = 0; i < item.options.length; i++) {
            const result = genre.score(item, i);
            expect(result.max, `d ${d} option ${i}`).toBe(max);
            expect(result.points, `d ${d} option ${i}`).toBe(item.options[i].points);
            const expectedCorrect = max === 2 ? item.options[i].points >= 1 : item.options[i].points === max;
            expect(result.correct, `d ${d} option ${i}`).toBe(expectedCorrect);
          }
          const nullResult = genre.score(item, null);
          expect(nullResult).toEqual({ points: 0, max, correct: false });
        }
      }
    });
  });
}

function testArithmeticScoring(genre: Genre<ArithmeticItem, number>, name: string) {
  describe(`${name}: score`, () => {
    it("is 1 point for the right answer, 0 for a wrong one or a null response", () => {
      for (let seed = 0; seed < 50; seed++) {
        for (const d of DIFFICULTIES) {
          const item = genre.generate(seed, d);
          expect(genre.score(item, item.answer)).toEqual({ points: 1, max: 1, correct: true });
          expect(genre.score(item, item.answer + 1)).toEqual({ points: 0, max: 1, correct: false });
          expect(genre.score(item, null)).toEqual({ points: 0, max: 1, correct: false });
        }
      }
    });
  });

  it(`${name}: sample() is the fixed apples problem`, () => {
    const { item, explanation } = genre.sample();
    expect(item.text).toBe("Aoife has 2 apples and picks 1 more. How many apples now?");
    expect(item.answer).toBe(3);
    expect(explanation.length).toBeGreaterThan(0);
  });
}

testCommonBehavior(similarities, SIMILARITIES_BANK, "similarities");
testChoiceScoring(similarities, "similarities");

testCommonBehavior(vocabulary, VOCABULARY_BANK, "vocabulary");
testChoiceScoring(vocabulary, "vocabulary");

testCommonBehavior(information, INFORMATION_BANK, "information");
testChoiceScoring(information, "information");

testCommonBehavior(comprehension, COMPREHENSION_BANK, "comprehension");
testChoiceScoring(comprehension, "comprehension");

testCommonBehavior(arithmetic, ARITHMETIC_BANK, "arithmetic");
testArithmeticScoring(arithmetic, "arithmetic");
