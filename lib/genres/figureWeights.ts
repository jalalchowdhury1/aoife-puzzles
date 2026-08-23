import type { Genre, ScoreResult, Difficulty } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { itemMs } from "../engine/timing";
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

function repeat(shape: Shape, n: number): Shape[] {
  return Array.from({ length: n }, () => shape);
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

/** Shuffles the 4 possible counts (1-4) of a single shape and reports which
 * shuffled slot holds `target` — the closed-enumeration option set shared by
 * d2 ("which count matches?") and d5 ("doubled" counts): since every count
 * multiplies the same positive weight, all 4 totals are automatically
 * distinct, so there is never a search or a GenFail here. */
function countOptionsSet(rng: Rng, shape: Shape, target: number): { options: Shape[][]; answer: number } {
  const entries = [1, 2, 3, 4].map(n => ({ n, shapes: repeat(shape, n) }));
  const shuffled = rng.shuffle(entries);
  return { options: shuffled.map(e => e.shapes), answer: shuffled.findIndex(e => e.n === target) };
}

// d1: one scale, exactly 1 of one shape on the left, "?" on the right. Options
// (3): 1 of the same shape (correct), 2 of it, 3 of it. Only ONE shape exists
// anywhere in the item — the most literal possible "what is the same?" rule.
function buildD1(rng: Rng): FigureWeightsItem {
  const shape = rng.pick(SHAPES);
  const weight = rng.int(1, 6);
  const weights: WeightMap = { [shape]: weight };
  const scale: Scale = { left: repeat(shape, 1), right: null };

  const correct = repeat(shape, 1);
  const distractors = [repeat(shape, 2), repeat(shape, 3)];
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale], options, answer, weights };
}

// d2: one scale, 2-3 of one shape on the left, "?" on the right. Options (4):
// the full 1-4 count range of that SAME shape — the same count as the left
// pan is correct, other counts are wrong. Still only one shape in the item.
function buildD2(rng: Rng): FigureWeightsItem {
  const shape = rng.pick(SHAPES);
  const weight = rng.int(1, 6);
  const weights: WeightMap = { [shape]: weight };
  const k = rng.int(2, 3);
  const scale: Scale = { left: repeat(shape, k), right: null };

  const { options, answer } = countOptionsSet(rng, shape, k);

  return { scales: [scale], options, answer, weights };
}

// d3: one scale, a MIX of two shapes on the left, "?" on the right. Options
// (4): the identical multiset (correct) plus 3 different multisets built
// from those same two shapes (different counts, no foreign shape).
function buildD3(rng: Rng): FigureWeightsItem {
  const [shapeA, shapeB] = rng.shuffle(SHAPES).slice(0, 2);
  const weightValues = rng.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2);
  const weights: WeightMap = { [shapeA]: weightValues[0], [shapeB]: weightValues[1] };
  const usedShapes = [shapeA, shapeB];

  const questionLeft = findMixedLeft(rng, usedShapes, MAX_PAN);
  const scale: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = [...questionLeft];
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 3);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale], options, answer, weights };
}

// d4: scale 1 is a SHOWN, balanced equivalence (e.g. 1 square = 2 circles);
// scale 2 (the question) literally repeats scale 1's left pan, so the answer
// is scale 1's right pan read straight off — no arithmetic required. Options
// (4) are the full 1-4 count range of the answer's own shape.
function buildD4(rng: Rng): FigureWeightsItem {
  const [shapeA, shapeB] = rng.shuffle(SHAPES).slice(0, 2);
  const pair = findBalancedPair(rng, MAX_PAN);
  const weights: WeightMap = { [shapeA]: pair.wx, [shapeB]: pair.wy };
  const scale1: Scale = { left: repeat(shapeA, pair.lx), right: repeat(shapeB, pair.ly) };

  const scaleQ: Scale = { left: repeat(shapeA, pair.lx), right: null };

  const { options, answer } = countOptionsSet(rng, shapeB, pair.ly);

  return { scales: [scale1, scaleQ], options, answer, weights };
}

// d5: the same kind of shown equivalence as d4, but the question DOUBLES the
// pictured count (e.g. scale 1 shows 1 square = 2 circles; the question asks
// about 2 squares). Lengths are capped at 2 on scale 1 so the doubled counts
// never exceed the 4-shape pan/option budget. Options (4) are again the full
// 1-4 count range of the answer's own shape.
function buildD5(rng: Rng): FigureWeightsItem {
  const [shapeA, shapeB] = rng.shuffle(SHAPES).slice(0, 2);
  const pair = findBalancedPair(rng, 2);
  const weights: WeightMap = { [shapeA]: pair.wx, [shapeB]: pair.wy };
  const scale1: Scale = { left: repeat(shapeA, pair.lx), right: repeat(shapeB, pair.ly) };

  const qCount = pair.lx * 2;
  const targetCount = pair.ly * 2;
  const scaleQ: Scale = { left: repeat(shapeA, qCount), right: null };

  const { options, answer } = countOptionsSet(rng, shapeB, targetCount);

  return { scales: [scale1, scaleQ], options, answer, weights };
}

// d6: one shown equivalence (scale 1) plus a question scale of 1-3 copies of
// EITHER shape, with mixed-shape distractor options (a distractor may be a
// different shape, or a mix, from the question pan) — the old d4 design.
function buildD6(rng: Rng): FigureWeightsItem {
  const [shapeA, shapeB] = rng.shuffle(SHAPES).slice(0, 2);
  const pair = findBalancedPair(rng, MAX_PAN);
  const weights: WeightMap = { [shapeA]: pair.wx, [shapeB]: pair.wy };
  const scale1: Scale = { left: repeat(shapeA, pair.lx), right: repeat(shapeB, pair.ly) };

  const usedShapes = [shapeA, shapeB];
  const chosen = rng.pick(usedShapes);
  const lenQ = rng.int(1, 3);
  const questionLeft = repeat(chosen, lenQ);
  const scaleQ: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = findCorrectOption(rng, usedShapes, weights, T, questionLeft, MAX_PAN);
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 3);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale1, scaleQ], options, answer, weights };
}

// d7: same shape as d6 but with larger counts (question pan up to 4, not 3)
// and, about half the time, a MIXED question pan (both shapes at once) —
// the old d5-6 design, one step before the two-equivalence tiers.
function buildD7(rng: Rng): FigureWeightsItem {
  const [shapeA, shapeB] = rng.shuffle(SHAPES).slice(0, 2);
  const pair = findBalancedPair(rng, MAX_PAN);
  const weights: WeightMap = { [shapeA]: pair.wx, [shapeB]: pair.wy };
  const scale1: Scale = { left: repeat(shapeA, pair.lx), right: repeat(shapeB, pair.ly) };

  const usedShapes = [shapeA, shapeB];
  const mixQuestion = rng.next() < 0.5;
  const questionLeft = mixQuestion
    ? findMixedLeft(rng, usedShapes, MAX_PAN)
    : repeat(rng.pick(usedShapes), rng.int(1, 4));
  const scaleQ: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = findCorrectOption(rng, usedShapes, weights, T, questionLeft, MAX_PAN);
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 3);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale1, scaleQ], options, answer, weights };
}

// d8 (mixed=false) / d9-10 (mixed=true): two balanced scales chained through a
// shared shape over 3 shapes total, then a question scale. When mixed, the
// question's left pan combines two of the three shapes instead of repeating
// just one — the old d7 / d8-10 design.
function buildTier34(rng: Rng, mixed: boolean): FigureWeightsItem {
  const [shapeA, shapeB, shapeC] = rng.shuffle(SHAPES).slice(0, 3);

  const pair1 = findBalancedPair(rng, MAX_PAN);
  const weights: WeightMap = { [shapeA]: pair1.wx, [shapeB]: pair1.wy };
  const scale1: Scale = { left: repeat(shapeA, pair1.lx), right: repeat(shapeB, pair1.ly) };

  const partner = findBalancedPartner(rng, pair1.wy, MAX_PAN, [pair1.wx, pair1.wy]);
  weights[shapeC] = partner.otherWeight;
  const scale2: Scale = { left: repeat(shapeB, partner.lenFixed), right: repeat(shapeC, partner.lenOther) };

  const usedShapes = [shapeA, shapeB, shapeC];
  let questionLeft: Shape[];
  if (mixed) {
    questionLeft = findMixedLeft(rng, usedShapes, MAX_PAN);
  } else {
    const chosen = rng.pick(usedShapes);
    const lenQ = rng.int(1, 3);
    questionLeft = repeat(chosen, lenQ);
  }
  const scaleQ: Scale = { left: questionLeft, right: null };

  const T = totalWeight(questionLeft, weights);
  const correct = findCorrectOption(rng, usedShapes, weights, T, questionLeft, MAX_PAN);
  const distractors = findDistractors(rng, usedShapes, weights, T, correct, MAX_PAN, 3);
  const { options, answer } = assembleOptions(rng, correct, distractors);

  return { scales: [scale1, scale2, scaleQ], options, answer, weights };
}

function buildItem(rng: Rng, d: Difficulty): FigureWeightsItem {
  if (d === 1) return buildD1(rng);
  if (d === 2) return buildD2(rng);
  if (d === 3) return buildD3(rng);
  if (d === 4) return buildD4(rng);
  if (d === 5) return buildD5(rng);
  if (d === 6) return buildD6(rng);
  if (d === 7) return buildD7(rng);
  if (d === 8) return buildTier34(rng, false);
  return buildTier34(rng, true); // d9, d10
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
  const weights: WeightMap = { circle: 2 };
  const scale: Scale = { left: ["circle"], right: null };
  const options: Shape[][] = [["circle"], ["circle", "circle"], ["circle", "circle", "circle"]];
  const item: FigureWeightsItem = { scales: [scale], options, answer: 0, weights };
  return {
    item,
    explanation:
      "One circle on one side needs one circle on the other side to balance. The same thing weighs the same.",
  };
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
  timing: { kind: "item", ms: itemMs([[5, 45000], [10, 30000]]) },
  mode: "staircase",
};
