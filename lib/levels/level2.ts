import type { LevelConfig } from "../engine/types";

// "Practice Round 1": the first post-diagnostic level. Every block starts
// "fromProfile" and the level opts into remedial weighting (AGENTS.md
// decision #13 / §7) — adaptPart resolves each block's actual start,
// maxItems, and any repeat blocks from her Level 1 profile at play time.
export const level2: LevelConfig = {
  id: 2,
  title: "Practice Round 1",
  feedback: "reveal",
  weighting: "remedial",
  released: true, // released 2026-08-22 after reviewing her Level 1 + replay data
  teachingItems: 2,
  parts: [
    {
      id: "A",
      title: "Shapes",
      sticker: "🌟",
      blocks: [
        { genre: "blockDesign", start: "fromProfile" },
        { genre: "visualPuzzles", start: "fromProfile" },
        { genre: "matrix", start: "fromProfile" },
        { genre: "figureWeights", start: "fromProfile" },
      ],
    },
    {
      id: "B",
      title: "Memory and Speed",
      sticker: "🚀",
      blocks: [
        { genre: "digitSpan", start: "fromProfile" },
        { genre: "pictureSpan", start: "fromProfile" },
        { genre: "coding", start: "fromProfile" },
        { genre: "symbolSearch", start: "fromProfile" },
        { genre: "arithmetic", start: "fromProfile", display: "both" },
      ],
    },
    {
      id: "C",
      title: "Words",
      sticker: "🏆",
      blocks: [
        { genre: "similarities", start: "fromProfile" },
        { genre: "vocabulary", start: "fromProfile" },
        { genre: "information", start: "fromProfile" },
        { genre: "comprehension", start: "fromProfile" },
      ],
    },
    {
      // Added 2026-08-23 after the Piece Picker / Balance ramps were rebuilt from level 0
      // while her Part A was already in progress: a short extra sitting so she meets the
      // new basics properly instead of replaying Part A.
      id: "D",
      title: "Shapes again",
      sticker: "🧱",
      blocks: [
        { genre: "visualPuzzles", start: "fromProfile" },
        { genre: "figureWeights", start: "fromProfile" },
      ],
    },
  ],
};
