import { makeChoiceGenre } from "./bankGenre";
import { INFORMATION_BANK } from "./banks/information";

export const information = makeChoiceGenre(
  {
    id: "information",
    subtest: "Information",
    domain: "VC",
    kidTitle: "Do You Know",
    instructions: "I will ask a question. Pick the best answer, then press Done.",
    sampleId: "in-01",
    sampleExplanation: "A dog has four legs.",
  },
  INFORMATION_BANK,
);

export default information;
