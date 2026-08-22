import { makeArithmeticGenre } from "./bankGenre";
import { ARITHMETIC_BANK } from "./banks/arithmetic";

export const arithmetic = makeArithmeticGenre(
  {
    id: "arithmetic",
    subtest: "Arithmetic",
    domain: "FR",
    kidTitle: "Story Sums",
    instructions: "Listen to the story problem, then type the answer and press Done.",
  },
  ARITHMETIC_BANK,
);

export default arithmetic;
