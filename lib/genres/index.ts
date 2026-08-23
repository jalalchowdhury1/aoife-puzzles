import type { Genre, GenreId, E2EPlan } from "../engine/types";
// ---- active genres (decision #16 "similar, not same") ----
import { mosaic, audit as auditMosaic } from "./mosaic";
import { fixPicture, audit as auditFixPicture } from "./fixPicture";
import { swapShop, audit as auditSwapShop } from "./swapShop";
import { arithmetic } from "./arithmetic";
import { animalParade, audit as auditAnimalParade } from "./animalParade";
import { fireflyBoxes, audit as auditFireflyBoxes } from "./fireflyBoxes";
import { translator, audit as auditTranslator } from "./translator";
import { spotIt, audit as auditSpotIt, e2ePlan as e2eSpotIt } from "./spotIt";
import { whichTwo, audit as auditWhichTwo, e2ePlan as e2eWhichTwo } from "./whichTwo";
import { fillTheGap, audit as auditFillTheGap } from "./fillTheGap";
import { patternTrain, audit as auditPatternTrain } from "./patternTrain";
import { pictureSudoku, audit as auditPictureSudoku } from "./pictureSudoku";
import { information } from "./information";
import { whatWouldYouDo, audit as auditWhatWouldYouDo } from "./whatWouldYouDo";
// ---- retired replica genres (kept so her Level 1/2 history still renders) ----
import { blockDesign } from "./blockDesign";
import { visualPuzzles } from "./visualPuzzles";
import { matrix } from "./matrix";
import { figureWeights } from "./figureWeights";
import { digitSpan } from "./digitSpan";
import { pictureSpan } from "./pictureSpan";
import { coding } from "./coding";
import { symbolSearch } from "./symbolSearch";
import { similarities } from "./similarities";
import { vocabulary } from "./vocabulary";
import { comprehension } from "./comprehension";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGenre = Genre<any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withHooks = (g: AnyGenre, e2e: E2EPlan, audit?: (item: any) => string): AnyGenre => ({ ...g, e2e, audit: audit ?? g.audit });
const retired = (g: AnyGenre): AnyGenre => ({ ...g, retired: true });

export const GENRES: Record<GenreId, AnyGenre> = {
  // active
  mosaic: withHooks(mosaic, { kind: "buildThenDone" }, auditMosaic),
  fixPicture: withHooks(fixPicture, { kind: "options", pick: 1 }, auditFixPicture),
  patternTrain: withHooks(patternTrain, { kind: "options", pick: 1 }, auditPatternTrain),
  pictureSudoku: withHooks(pictureSudoku, { kind: "options", pick: 1 }, auditPictureSudoku),
  swapShop: withHooks(swapShop, { kind: "options", pick: 1 }, auditSwapShop),
  arithmetic: withHooks(arithmetic, { kind: "numpad" }),
  animalParade: withHooks(animalParade, { kind: "sequence", taps: 2 }, auditAnimalParade),
  fireflyBoxes: withHooks(fireflyBoxes, { kind: "sequence", taps: 1 }, auditFireflyBoxes),
  translator: withHooks(translator, { kind: "tapOnly" }, auditTranslator),
  spotIt: withHooks(spotIt, e2eSpotIt, auditSpotIt),
  whichTwo: withHooks(whichTwo, e2eWhichTwo, auditWhichTwo),
  fillTheGap: withHooks(fillTheGap, { kind: "options", pick: 1 }, auditFillTheGap),
  information: withHooks(information, { kind: "options", pick: 1 }),
  whatWouldYouDo: withHooks(whatWouldYouDo, { kind: "options", pick: 1 }, auditWhatWouldYouDo),
  // retired (decision #16): never put these in a level
  blockDesign: retired(blockDesign),
  visualPuzzles: retired(visualPuzzles),
  matrix: retired(matrix),
  figureWeights: retired(figureWeights),
  digitSpan: retired(digitSpan),
  pictureSpan: retired(pictureSpan),
  coding: retired(coding),
  symbolSearch: retired(symbolSearch),
  similarities: retired(similarities),
  vocabulary: retired(vocabulary),
  comprehension: retired(comprehension),
};

/** Active genres in the order levels/QA/audit use them (retired ones are NOT here). */
export const GENRE_LIST: GenreId[] = [
  "mosaic", "fixPicture", "patternTrain", "pictureSudoku", "swapShop", "arithmetic",
  "animalParade", "fireflyBoxes", "translator", "spotIt",
  "whichTwo", "fillTheGap", "information", "whatWouldYouDo",
];
/** Every id, active and retired (profile/parent history). */
export const ALL_GENRE_IDS: GenreId[] = Object.keys(GENRES) as GenreId[];
export const RETIRED_GENRE_IDS: GenreId[] = ALL_GENRE_IDS.filter((g) => GENRES[g].retired);
