import type { ComponentType } from "react";
import type { GenreId, GenreViewProps } from "@/lib/engine/types";
import BlockDesignView from "./BlockDesignView";
import VisualPuzzlesView from "./VisualPuzzlesView";
import MatrixView from "./MatrixView";
import FigureWeightsView from "./FigureWeightsView";
import ArithmeticView from "./ArithmeticView";
import DigitSpanView from "./DigitSpanView";
import PictureSpanView from "./PictureSpanView";
import CodingView from "./CodingView";
import SymbolSearchView from "./SymbolSearchView";
import ChoiceView from "./ChoiceView";

/**
 * GenreId -> the React component that renders its Item and emits its
 * Response. The four bank-backed verbal genres (Similarities, Vocabulary,
 * Information, Comprehension) all share ChoiceView.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VIEWS: Record<GenreId, ComponentType<GenreViewProps<any, any>>> = {
  blockDesign: BlockDesignView,
  visualPuzzles: VisualPuzzlesView,
  matrix: MatrixView,
  figureWeights: FigureWeightsView,
  arithmetic: ArithmeticView,
  digitSpan: DigitSpanView,
  pictureSpan: PictureSpanView,
  coding: CodingView,
  symbolSearch: SymbolSearchView,
  similarities: ChoiceView,
  vocabulary: ChoiceView,
  information: ChoiceView,
  comprehension: ChoiceView,
};

export default VIEWS;
