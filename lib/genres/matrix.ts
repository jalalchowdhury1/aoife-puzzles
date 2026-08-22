// Matrix Reasoning: "What's Missing?" — a 2x2/3x3 grid (or 1x5 series) of attribute
// figures with the last cell missing; pick the option that completes the pattern.
import { makeRng } from "../engine/rng";
import type { Difficulty, Genre, ScoreResult } from "../engine/types";
import type { Figure } from "./shapes";
import { COLORS } from "./shapes";
import { buildGrid, buildOptions, buildRulePlan, buildSeriesFigures } from "./matrixRules";

export type { Figure } from "./shapes";

export interface MatrixItem {
  form: "matrix" | "series";
  rows: 2 | 3;
  cells: (Figure | null)[];
  options: Figure[];
  answer: number;
}

function generate(seed: number, d: Difficulty): MatrixItem {
  const rng = makeRng(seed);
  // Series only ever shows up from d3 (a sample-only 2x2 is all she's seen
  // by d1-2), and at <=30% of seeds even then.
  const useSeries = d >= 3 && d <= 6 && rng.next() < 0.3;

  if (useSeries) {
    const figures = buildSeriesFigures(rng, d);
    const visible = figures.slice(0, 4);
    const answerFigure = figures[4];
    const { options, answerIndex } = buildOptions(rng, answerFigure, visible, d);
    return { form: "series", rows: d <= 3 ? 2 : 3, cells: [...visible, null], options, answer: answerIndex };
  }

  const { rows, rules } = buildRulePlan(rng, d);
  const grid = buildGrid(rng, rows, rules, d).flat();
  const visible = grid.slice(0, -1);
  const answerFigure = grid[grid.length - 1];
  const { options, answerIndex } = buildOptions(rng, answerFigure, visible, d);
  return { form: "matrix", rows, cells: [...visible, null], options, answer: answerIndex };
}

function score(item: MatrixItem, response: number | null): ScoreResult {
  const correct = response !== null && response === item.answer;
  return { points: correct ? 1 : 0, max: 1, correct };
}

function sampleFigure(shape: Figure["shape"], color: string): Figure {
  return { shape, color, size: "M", count: 1, rot: 0, dot: false };
}

function sample(): { item: MatrixItem; explanation: string } {
  const red = COLORS[0];
  const teal = COLORS[1];
  const yellow = COLORS[2];
  const blue = COLORS[3];

  // Row-constant shape: row 1 is all circles, row 2 is all squares — the
  // exact d1-2 pattern (a single varying attribute, everything else pinned:
  // count 1, no rotation, no dot). The missing cell completes row 2.
  const row1Cell = sampleFigure("circle", red);
  const row2Visible = sampleFigure("square", blue);
  const answer = sampleFigure("square", blue);

  // Every distractor differs from the answer by shape or color only —
  // never size/rotation/dot/count — matching the d1-2 distractor rule.
  const options = [
    sampleFigure("triangle", blue), // shape differs
    answer,
    sampleFigure("square", teal),   // colour differs
    sampleFigure("star", blue),     // shape differs
    sampleFigure("square", yellow), // colour differs
  ];

  return {
    item: {
      form: "matrix",
      rows: 2,
      cells: [row1Cell, row1Cell, row2Visible, null],
      options,
      answer: 1,
    },
    explanation: "Each row has the same shape, so the missing one is a blue square.",
  };
}

export const matrix: Genre<MatrixItem, number> = {
  id: "matrix",
  subtest: "Matrix Reasoning",
  domain: "FR",
  kidTitle: "What's Missing?",
  instructions:
    "Look at the picture puzzle. One box is empty. Find the picture that finishes the pattern, then tap Done.",
  sample,
  generate,
  score,
  timing: { kind: "none" },   // spec §1.3: Matrix Reasoning is untimed (time recorded)
  mode: "staircase",
};
