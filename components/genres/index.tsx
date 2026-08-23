import type { ComponentType } from "react";
import type { GenreId, GenreViewProps } from "@/lib/engine/types";
// active (decision #16)
import MosaicView from "./MosaicView";
import FixPictureView from "./FixPictureView";
import SwapShopView from "./SwapShopView";
import ArithmeticView from "./ArithmeticView";
import AnimalParadeView from "./AnimalParadeView";
import FireflyBoxesView from "./FireflyBoxesView";
import TranslatorView from "./TranslatorView";
import SpotItView from "./SpotItView";
import WhichTwoView from "./WhichTwoView";
import ChoiceView from "./ChoiceView";
// retired (history only)
import BlockDesignView from "./BlockDesignView";
import VisualPuzzlesView from "./VisualPuzzlesView";
import MatrixView from "./MatrixView";
import FigureWeightsView from "./FigureWeightsView";
import DigitSpanView from "./DigitSpanView";
import PictureSpanView from "./PictureSpanView";
import CodingView from "./CodingView";
import SymbolSearchView from "./SymbolSearchView";

/** GenreId -> the React component that renders its Item and emits its Response. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VIEWS: Record<GenreId, ComponentType<GenreViewProps<any, any>>> = {
  mosaic: MosaicView,
  fixPicture: FixPictureView,
  swapShop: SwapShopView,
  arithmetic: ArithmeticView,
  animalParade: AnimalParadeView,
  fireflyBoxes: FireflyBoxesView,
  translator: TranslatorView,
  spotIt: SpotItView,
  whichTwo: WhichTwoView,
  fillTheGap: ChoiceView,
  information: ChoiceView,
  whatWouldYouDo: ChoiceView,
  blockDesign: BlockDesignView,
  visualPuzzles: VisualPuzzlesView,
  matrix: MatrixView,
  figureWeights: FigureWeightsView,
  digitSpan: DigitSpanView,
  pictureSpan: PictureSpanView,
  coding: CodingView,
  symbolSearch: SymbolSearchView,
  similarities: ChoiceView,
  vocabulary: ChoiceView,
  comprehension: ChoiceView,
};

export default VIEWS;
