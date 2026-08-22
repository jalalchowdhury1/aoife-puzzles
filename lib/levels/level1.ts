import type { LevelConfig } from "../engine/types";

export const level1: LevelConfig = {
  id: 1,
  title: "Find Your Superpowers",
  feedback: "none",
  teachingItems: 2,
  parts: [
    {
      id: "A",
      title: "Shapes",
      sticker: "🧩",
      blocks: [{ genre: "blockDesign" }, { genre: "visualPuzzles" }, { genre: "matrix" }, { genre: "figureWeights" }],
    },
    {
      id: "B",
      title: "Memory and Speed",
      sticker: "⚡",
      blocks: [
        { genre: "digitSpan" },
        { genre: "pictureSpan" },
        { genre: "coding" },
        { genre: "symbolSearch" },
        { genre: "arithmetic", display: "both" },
      ],
    },
    {
      id: "C",
      title: "Words",
      sticker: "📚",
      blocks: [{ genre: "similarities" }, { genre: "vocabulary" }, { genre: "information" }, { genre: "comprehension" }],
    },
  ],
};
