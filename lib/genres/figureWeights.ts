import type { Genre, ScoreResult, Difficulty } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { SHAPES, type Shape } from "./shapes";

/** One pan-balance: `right: null` marks the "?" pan (only on the last scale of an item). */
export interface Scale {
  left: Shape[];
  right: Shape[] | null;
}

export interface FigureWeightsItem {
  scales: Scale[];
  options: Shape[][];
  answer: number;
  weights: Partial<Record<Shape, number>>;
}

type WeightMap = Partial<Record<Shape, number>>;

/** Pure helper: sums the (hidden) weights of a multiset of shapes. Missing weights count as 0. */
export function totalWeight(shapes: Shape[], weights: WeightMap): number {
  return shapes.reduce((sum, s) => sum + (weights[s] ?? 0), 0);
}

/** Thrown internally when a bounded random search exhausts its tries; caller re-seeds and retries the whole item. */
class GenFail extends Error {}

const MAX_TRIES = 500;
const RESEED_STEP = 1_000_003;
const MAX_ATTEMPTS = 200;
const MAX_PAN = 4;

function multisetKey(shapes: Shape[]): string {
  return [...shapes].sort().join(",");
}

function sameShapeSet(a: Shape[], b: Shape[]): boolean {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const s of sa) if (!sb.has(s)) return false;
  return true;
}

function randomMultiset(rng: Rng, shapes: Shape[], len: number): Shape[] {
  return Array.from({ length: len }, () => rng.pick(shapes));
}

/** Finds lengths lx,ly (<= maxLen) and distinct weights wx,wy (1-6) with lx*wx === ly*wy. */
function findBalancedPair(rng: Rng, maxLen: number): { lx: number; ly: number; wx: number; wy: number } {
  for (let i = 0; i < MAX_TRIES; i++) {
    const lx = rng.int(1, maxLen);
    const ly = rng.int(1, maxLen);
    if (lx === ly) continue;
    const wx = rng.int(1, 6);
    const total = lx * wx;
    if (total % ly !== 0) continue;
    const wy = total / ly;
    if (wy < 1 || wy > 6 || wy === wx) continue;
    return { lx, ly, wx, wy };
  }
  throw new GenFail("no balanced pair found");
}

/** Given a fixed weight (already assigned to one shape), finds a partner length/weight pair for a second scale. */
function findBalancedPartner(
  rng: Rng,
  fixedWeight: number,
  maxLen: number,
  excludeWeights: number[]
): { lenFixed: number; lenOther: number; otherWeight: number } {
  for (let i = 0; i < MAX_TRIES; i++) {
    const lenFixed = rng.int(1, maxLen);
    const lenOther = rng.int(1, maxLen);
    if (lenFixed === lenOther) continue;
    const total = lenFixed * fixedWeight;
    if (total % lenOther !== 0) continue;
    const otherWeight = total / lenOther;
    if (otherWeight < 1 || otherWeight > 6) continue;
    if (excludeWeights.includes(otherWeight)) continue;
    return { lenFixed, lenOther, otherWeight };
  }
  throw new GenFail("no balanced partner found");
}

/** A 2-4 shape multiset drawn from usedShapes that mixes at least two distinct shapes. */
function findMixedLeft(rng: Rng, usedShapes: Shape[], maxLen: number): Shape[] {
  for (let i = 0; i < MAX_TRIES; i++) {
    const len = rng.int(2, maxLen);
    const m = randomMultiset(rng, usedShapes, len);
    if (new Set(m).size >= 2) return m;
  }
  throw new GenFail("no mixed question pan found");
}

function findCorrectOption(
  rng: Rng,
  usedShapes: Shape[],
  weights: WeightMap,
  target: number,
  questionLeft: Shape[],
  maxLen: number
): Shape[] {
  const qKey = multisetKey(questionLeft);
  for (let i = 0; i < MAX_TRIES; i++) {
    const len = rng.int(1, maxLen);
    const m = randomMultiset(rng, usedShapes, len);
    if (totalWeight(m, weights) !== target) continue;
    if (multisetKey(m) === qKey) continue;
    if (sameShapeSet(m, questionLeft)) continue;
    return m;
  }
  throw new GenFail("no correct option found");
}

function findDistractors(
  rng: Rng,
  usedShapes: Shape[],
  weights: WeightMap,
  target: number,
  correct: Shape[],
  maxLen: number,
  count: number
): Shape[][] {
  const result: Shape[][] = [];
  const usedKeys = new Set([multisetKey(correct)]);
  for (let n = 0; n < count; n++) {
    let found: Shape[] | null = null;
    for (let i = 0; i < MAX_TRIES; i++) {
      const len = rng.int(1, maxLen);
      const m = randomMultiset(rng, usedShapes, len);
      const total = totalWeight(m, weights);
      if (total === target) continue;
      if (Math.abs(total - target) > 3) continue;
      const key = multisetKey(m);
      if (usedKeys.has(key)) continue;
      found = m;
      usedKeys.add(key);
      break;
    }
    if (!found) throw new GenFail("no distractor found");
    result.push(found);
  }
  return result;
}

function assembleOptions(
  rng: Rng,
  correct: Shape[],
  distractors: Shape[][]
): { options: Shape[][]; answer: number } {
  const entries = [
    { shapes: correct, isCorrect: true },
    ...distractors.map(shapes => ({ shapes, isCorrect: false })),
  ];
  const shuffled = rng.shuffle(entries);
  return { options: shuffled.map(e => e.shapes), answer: shuffled.findIndex(e => e.isCorrect) };
}

// d1-3: one scale, k (1-4) copies of one shape on the left, "?" on the right.
// The rule is direct: the answer is the same multiset. 2-3 shapes are in play overall
// so the 4 distractors can be built from more than just the one pictured shape.
function buildTier1(rng: Rng): FigureWeightsItem {
  const shapesUsedCount = rng.int(2, 3);
  const usedShapes = rng.shuffle(SHAPES).slice(0, shapesUsedCount);
  const weightValues = rng.shuffle([1, 2, 3, 4, 5, 6]).slice(0, shapesUsedCount);
  const weights: WeightMap = {};
  usedShapes.forEach((s, i) => {
    weights[s] = weightValues[i];
  });

  const primary = usedShapes[0];
  const k = rng.int(1, 4);
  const questionLeft = Array.from({ length: k }, () => primary);
  const scale: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = [...questionLeft];
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 4);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale], options, answer, weights };
}

// d4-6: scale 1 balances two shapes (single shape type per pan, random lengths <=4);
// scale 2 (the question) is 1-3 copies of one of those two shapes, "?" on the right.
function buildTier2(rng: Rng): FigureWeightsItem {
  const [shapeA, shapeB] = rng.shuffle(SHAPES).slice(0, 2);
  const pair = findBalancedPair(rng, MAX_PAN);
  const weights: WeightMap = { [shapeA]: pair.wx, [shapeB]: pair.wy };
  const scale1: Scale = { left: Array.from({ length: pair.lx }, () => shapeA), right: Array.from({ length: pair.ly }, () => shapeB) };

  const usedShapes = [shapeA, shapeB];
  const chosen = rng.pick(usedShapes);
  const lenQ = rng.int(1, 3);
  const questionLeft = Array.from({ length: lenQ }, () => chosen);
  const scaleQ: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = findCorrectOption(rng, usedShapes, weights, T, questionLeft, MAX_PAN);
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 4);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale1, scaleQ], options, answer, weights };
}

// d7-8 (mixed=false) / d9-10 (mixed=true): two balanced scales chained through a shared
// shape over 3 shapes total, then a question scale. At d9-10 the question's left pan
// mixes two of the three shapes instead of repeating just one.
function buildTier34(rng: Rng, mixed: boolean): FigureWeightsItem {
  const [shapeA, shapeB, shapeC] = rng.shuffle(SHAPES).slice(0, 3);

  const pair1 = findBalancedPair(rng, MAX_PAN);
  const weights: WeightMap = { [shapeA]: pair1.wx, [shapeB]: pair1.wy };
  const scale1: Scale = { left: Array.from({ length: pair1.lx }, () => shapeA), right: Array.from({ length: pair1.ly }, () => shapeB) };

  const partner = findBalancedPartner(rng, pair1.wy, MAX_PAN, [pair1.wx, pair1.wy]);
  weights[shapeC] = partner.otherWeight;
  const scale2: Scale = { left: Array.from({ length: partner.lenFixed }, () => shapeB), right: Array.from({ length: partner.lenOther }, () => shapeC) };

  const usedShapes = [shapeA, shapeB, shapeC];
  let questionLeft: Shape[];
  if (mixed) {
    questionLeft = findMixedLeft(rng, usedShapes, MAX_PAN);
  } else {
    const chosen = rng.pick(usedShapes);
    const lenQ = rng.int(1, 3);
    questionLeft = Array.from({ length: lenQ }, () => chosen);
  }
  const scaleQ: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = findCorrectOption(rng, usedShapes, weights, T, questionLeft, MAX_PAN);
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 4);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale1, scale2, scaleQ], options, answer, weights };
}

function buildItem(rng: Rng, d: Difficulty): FigureWeightsItem {
  if (d <= 3) return buildTier1(rng);
  if (d <= 6) return buildTier2(rng);
  if (d <= 8) return buildTier34(rng, false);
  return buildTier34(rng, true);
}

function generate(seed: number, d: Difficulty): FigureWeightsItem {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed + attempt * RESEED_STEP);
    try {
      return buildItem(rng, d);
    } catch (e) {
      if (e instanceof GenFail) continue;
      throw e;
    }
  }
  throw new Error("figureWeights: failed to generate a solvable item after many attempts");
}

function sample(): { item: FigureWeightsItem; explanation: string } {
  const weights: WeightMap = { circle: 2, square: 4, triangle: 5 };
  const scale: Scale = { left: ["circle", "circle"], right: null };
  const options: Shape[][] = [
    ["circle"],
    ["circle", "circle"],
    ["square", "square"],
    ["triangle"],
    ["square", "circle", "triangle"],
  ];
  const item: FigureWeightsItem = { scales: [scale], options, answer: 1, weights };
  return { item, explanation: "Two circles on one side need two circles on the other side to balance." };
}

function score(item: FigureWeightsItem, response: number | null): ScoreResult {
  const correct = response !== null && response === item.answer;
  return { points: correct ? 1 : 0, max: 1, correct };
}

export const figureWeights: Genre<FigureWeightsItem, number> = {
  id: "figureWeights",
  subtest: "Figure Weights",
  domain: "FR",
  kidTitle: "Balance",
  instructions:
    "Look at the scale. Some shapes have a hidden weight. Find the shapes that will make the last scale balance too.",
  sample,
  generate,
  score,
  timing: { kind: "item", ms: () => 30000 },
  mode: "staircase",
};
