import type { Genre, GenreId } from "../engine/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GENRES: Partial<Record<GenreId, Genre<any, any>>> = {};

export const GENRE_LIST: GenreId[] = [
  "blockDesign",
  "visualPuzzles",
  "matrix",
  "figureWeights",
  "arithmetic",
  "digitSpan",
  "pictureSpan",
  "coding",
  "symbolSearch",
  "similarities",
  "vocabulary",
  "information",
  "comprehension",
];
