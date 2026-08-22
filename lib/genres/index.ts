import type { Genre, GenreId } from "../engine/types";
import { blockDesign } from "./blockDesign";
import { visualPuzzles } from "./visualPuzzles";
import { matrix } from "./matrix";
import { figureWeights } from "./figureWeights";
import { arithmetic } from "./arithmetic";
import { digitSpan } from "./digitSpan";
import { pictureSpan } from "./pictureSpan";
import { coding } from "./coding";
import { symbolSearch } from "./symbolSearch";
import { similarities } from "./similarities";
import { vocabulary } from "./vocabulary";
import { information } from "./information";
import { comprehension } from "./comprehension";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GENRES: Record<GenreId, Genre<any, any>> = {
  blockDesign,
  visualPuzzles,
  matrix,
  figureWeights,
  arithmetic,
  digitSpan,
  pictureSpan,
  coding,
  symbolSearch,
  similarities,
  vocabulary,
  information,
  comprehension,
};

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
