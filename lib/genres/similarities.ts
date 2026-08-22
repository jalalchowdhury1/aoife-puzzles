import { makeChoiceGenre } from "./bankGenre";
import { SIMILARITIES_BANK } from "./banks/similarities";

export const similarities = makeChoiceGenre(
  {
    id: "similarities",
    subtest: "Similarities",
    domain: "VC",
    kidTitle: "Alike",
    instructions: "I will ask how two things are alike. Pick the best answer, then press Done.",
    sampleId: "si-01",
    sampleExplanation: "An apple and a banana are both fruits, which is the best shared category.",
  },
  SIMILARITIES_BANK,
);

export default similarities;
