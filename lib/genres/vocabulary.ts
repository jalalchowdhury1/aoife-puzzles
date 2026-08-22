import { makeChoiceGenre } from "./bankGenre";
import { VOCABULARY_BANK } from "./banks/vocabulary";

export const vocabulary = makeChoiceGenre(
  {
    id: "vocabulary",
    subtest: "Vocabulary",
    domain: "VC",
    kidTitle: "Meaning",
    instructions: "I will show you a word or a picture. Pick what it means, then press Done.",
    sampleId: "vo-01",
    sampleExplanation: "The picture shows a ladder.",
  },
  VOCABULARY_BANK,
);

export default vocabulary;
