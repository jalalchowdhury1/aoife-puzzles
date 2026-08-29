import { makeArithmeticGenre } from "./bankGenre";
import { ARITHMETIC_BANK } from "./banks/arithmetic";

export const arithmetic = makeArithmeticGenre(
  {
    id: "arithmetic",
    subtest: "Arithmetic",
    domain: "FR",
    kidTitle: "Story Sums",
    instructions: "Listen to the story problem, then type the answer and press Done.",
    // Widened 2026-08-28 (decision #17): she hit the d10 cap with clean wins
    // on the 1.5x clock (Level 5A work absorbed into Level 7; AGENTS.md §6
    // "earned but not built"). d11-15 extend the word-problem ramp through
    // multi-step percent/fraction/rate territory.
    // Widened again 2026-08-29 (decision #26): Level 8A took her d10 -> d15
    // with 13/14 and no miss above d10, topping that cap too. d16-20 add
    // sequences, combined rates, two unknowns, and working backwards.
    maxDifficulty: 20,
  },
  ARITHMETIC_BANK,
);

export default arithmetic;
