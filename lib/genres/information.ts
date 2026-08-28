import { makeChoiceGenre } from "./bankGenre";
import { INFORMATION_BANK } from "./banks/information";

export const information = makeChoiceGenre(
  {
    id: "information",
    subtest: "Information",
    domain: "VC",
    kidTitle: "Do You Know",
    instructions: "I will ask a question. Pick the best answer, then press Done.",
    // Widened 2026-08-28 (decision #17): she reached the d10 cap on
    // 2026-08-27 (Level 7, ceiling 10). d11-15 extend the general-knowledge
    // ramp into early-teen territory.
    maxDifficulty: 15,
    sampleId: "in-01",
    sampleExplanation: "A dog has four legs.",
  },
  INFORMATION_BANK,
);

export default information;
