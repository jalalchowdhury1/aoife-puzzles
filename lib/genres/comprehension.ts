import { makeChoiceGenre } from "./bankGenre";
import { COMPREHENSION_BANK } from "./banks/comprehension";

export const comprehension = makeChoiceGenre(
  {
    id: "comprehension",
    subtest: "Comprehension",
    domain: "VC",
    kidTitle: "What Should You Do",
    instructions: "I will ask what you should do. Pick the best answer, then press Done.",
    sampleId: "co-01",
    sampleExplanation: "Washing our hands before eating washes away germs so we do not get sick.",
  },
  COMPREHENSION_BANK,
);

export default comprehension;
