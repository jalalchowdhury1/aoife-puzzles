// Pattern Train — a cousin of rule induction (Matrix Reasoning's FR muscle,
// original format per owner decision #16): a train of carriages shows a
// repeating/growing pattern of attribute-based Figures; the LAST carriage is
// always the "?"; pick the option that keeps the pattern going.
//
// Design contract (see docs comment above each buildDN):
//   - Categorical attributes (shape, colour) only ever REPEAT in a fixed
//     cycle — they have no natural order, so a "progression" on them would be
//     unguessable (same principle matrixRules.ts documents for Matrix
//     Reasoning). Cycling is fine to "wrap" — that's what a cycle means.
//   - Numeric attributes (count) only ever GROW by +1 per carriage and are
//     capped at the top of their range (never wrap back down, never exceed
//     the max representable value: count is 1-4 on a Figure).
//   - `rot` is never used (always 0) and `dot` is never used (always false):
//     this genre never needs rotation to disambiguate a rule, so the
//     "rotation only ever reads on a triangle" hazard never arises here.
//   - `size` is never an ACTIVE (pattern-driving) attribute — only ever a
//     possible distractor axis, and only from d7 up (never a size-only
//     distractor at d<=6, per the deliverable's fairness rule).
//
// d11-15 (2026-08-24, earned per AGENTS.md decision #17 — she solved a
// genuine level-10 item): one new idea per step, capstone combines them all.
// `size` stays distractor-only through d15 too (never promoted to an active
// attribute) — keeps the extended ramp's load on the genre's existing
// shape/colour/count vocabulary instead of adding a wholly new axis at the
// hardest levels. Options stay at 4 through d14; d15 (the capstone) widens
// to 5, matching how other genres add an option at their hardest tier.
//   - d11 introduces the one genuinely NEW primitive: "peak and mirror" on
//     count alone — it climbs 1,2,3,4 then mirrors back down one step at a
//     time (4,3,2,1). This is a legitimate single-rule pattern (a
//     palindrome, the same shape real progressive-matrices tests use) and is
//     NOT a "wrap": a wrap would jump straight from the max back to the
//     minimum in one step; a mirror only ever steps by exactly ±1.
//   - d12 combines d10's interleave (a colour chain on the odd cars) with
//     d11's mirror (a count peak-and-mirror chain on the even cars).
//   - d13 runs three attributes at once for the first time — colour 3-cycle
//     + shape 2-cycle + count growth — extending d8's dual combination.
//   - d14 is a genuine 3-way interleave (position mod 3): one independent
//     stream per attribute (colour cycle / shape cycle / count growth),
//     extending d10's 2-way interleave to three simultaneous streams.
//   - d15 (capstone) is a 3-way interleave like d14 where the "extra" stream
//     is itself a fully-shown peak-and-mirror count chain (added complexity/
//     camouflage to track) while the credited answer continues one of the
//     two cyclic (colour) chains, so the item stays strictly single-answer.
import type { Difficulty, Genre, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { SHAPES, COLORS, shapePath, type Shape, type Figure } from "./shapes";

export interface PatternTrainItem {
  cars: Figure[]; // shown carriages, in order, WITHOUT the missing (last) one
  options: Figure[]; // 4 option figures
  answer: number; // index into options
  rule: string; // audit/explanation only — never shown to the child in play
}

type Count = Figure["count"];
type Size = Figure["size"];

// Plain-English colour names for the (fixed) hex palette in shapes.ts, used
// only in the audit-facing `rule` string — never rendered to the child.
const COLOR_NAMES: Record<string, string> = {
  "#f06b7a": "red",
  "#2bb3a9": "teal",
  "#f5b63d": "yellow",
  "#8cc9ff": "blue",
  "#9b7bea": "purple",
  "#6fcf6f": "green",
};
function colorName(hex: string): string {
  return COLOR_NAMES[hex] ?? hex;
}

function base(): Figure {
  return { shape: "circle", color: COLORS[0], size: "M", count: 1, rot: 0, dot: false };
}
function withShape(f: Figure, shape: Shape): Figure {
  return { ...f, shape };
}
function withColor(f: Figure, color: string): Figure {
  return { ...f, color };
}
function withCount(f: Figure, count: Count): Figure {
  return { ...f, count };
}
function withSize(f: Figure, size: Size): Figure {
  return { ...f, size };
}

export function figuresEqual(a: Figure, b: Figure): boolean {
  return (
    a.shape === b.shape && a.color === b.color && a.size === b.size &&
    a.count === b.count && a.rot === b.rot && a.dot === b.dot
  );
}

function pickColors(rng: Rng, n: number): string[] {
  return rng.shuffle(COLORS).slice(0, n);
}
function pickShapes(rng: Rng, n: number): Shape[] {
  return rng.shuffle(SHAPES).slice(0, n);
}

// ---------------------------------------------------------------------------
// Bands d1-d10 — each returns the shown cars, the true "missing" figure, and
// a plain-English `rule` string for the audit page / parent explanation.
// ---------------------------------------------------------------------------
interface Built { cars: Figure[]; answer: Figure; rule: string }

/** d1: ABAB colour, 5 cars total (matches the fixed sample exactly). */
function buildD1(rng: Rng): Built {
  const shape = rng.pick(SHAPES);
  const [a, b] = pickColors(rng, 2);
  const n = 5;
  const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), shape), i % 2 === 0 ? a : b));
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `The colours take turns: ${colorName(a)}, ${colorName(b)}, ${colorName(a)}, ${colorName(b)}. So ${colorName(answer.color)} comes next.`,
  };
}

/** d2: ABAB shape, 5 cars total. */
function buildD2(rng: Rng): Built {
  const color = rng.pick(COLORS);
  const [a, b] = pickShapes(rng, 2);
  const n = 5;
  const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), i % 2 === 0 ? a : b), color));
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `The shapes take turns: ${a}, ${b}, ${a}, ${b}. So a ${answer.shape} comes next.`,
  };
}

/** d3: AAB AAB (colour or shape), 6 cars total. */
function buildD3(rng: Rng): Built {
  const activeIsColor = rng.next() < 0.5;
  const n = 6;
  if (activeIsColor) {
    const shape = rng.pick(SHAPES);
    const [a, b] = pickColors(rng, 2);
    const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), shape), i % 3 === 2 ? b : a));
    const answer = seq[n - 1];
    return {
      cars: seq.slice(0, -1),
      answer,
      rule: `Every 3 cars it goes ${colorName(a)}, ${colorName(a)}, ${colorName(b)}, then starts again. So ${colorName(answer.color)} comes next.`,
    };
  }
  const color = rng.pick(COLORS);
  const [a, b] = pickShapes(rng, 2);
  const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), i % 3 === 2 ? b : a), color));
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Every 3 cars it goes ${a}, ${a}, ${b}, then starts again. So a ${answer.shape} comes next.`,
  };
}

/** d4: ABC ABC (colour or shape), 6 cars total. */
function buildD4(rng: Rng): Built {
  const activeIsColor = rng.next() < 0.5;
  const n = 6;
  if (activeIsColor) {
    const shape = rng.pick(SHAPES);
    const [a, b, c] = pickColors(rng, 3);
    const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), shape), [a, b, c][i % 3]));
    const answer = seq[n - 1];
    return {
      cars: seq.slice(0, -1),
      answer,
      rule: `Every 3 cars it goes ${colorName(a)}, ${colorName(b)}, ${colorName(c)}, then starts again. So ${colorName(answer.color)} comes next.`,
    };
  }
  const color = rng.pick(COLORS);
  const [a, b, c] = pickShapes(rng, 3);
  const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), [a, b, c][i % 3]), color));
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Every 3 cars it goes ${a}, ${b}, ${c}, then starts again. So a ${answer.shape} comes next.`,
  };
}

/** d5: count grows 1,2,3,4 then holds — never exceeds 4, never wraps. 5 cars total. */
function buildD5(rng: Rng): Built {
  const shape = rng.pick(SHAPES);
  const color = rng.pick(COLORS);
  const n = 5;
  const seq = Array.from({ length: n }, (_, i) =>
    withCount(withColor(withShape(base(), shape), color), Math.min(i + 1, 4) as Count)
  );
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: "Each car has one more shape than the last: 1, 2, 3, 4. It can't get bigger than 4, so the next one has 4 too.",
  };
}

/** d6: two attributes at once — colour ABAB + count growing (capped at 4). 5 cars total. */
function buildD6(rng: Rng): Built {
  const shape = rng.pick(SHAPES);
  const [a, b] = pickColors(rng, 2);
  const n = 5;
  const seq = Array.from({ length: n }, (_, i) =>
    withCount(withColor(withShape(base(), shape), i % 2 === 0 ? a : b), Math.min(i + 1, 4) as Count)
  );
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Two things change together: the colour takes turns (${colorName(a)}, ${colorName(b)}...) and the count grows by one each time. So the next car is ${colorName(answer.color)} with ${answer.count}.`,
  };
}

/** d7: ABCD ABCD (colour or shape), 7 cars total. */
function buildD7(rng: Rng): Built {
  const activeIsColor = rng.next() < 0.5;
  const n = 7;
  if (activeIsColor) {
    const shape = rng.pick(SHAPES);
    const pool = pickColors(rng, 4);
    const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), shape), pool[i % 4]));
    const answer = seq[n - 1];
    return {
      cars: seq.slice(0, -1),
      answer,
      rule: `Every 4 cars it goes ${pool.map(colorName).join(", ")}, then starts again. So ${colorName(answer.color)} comes next.`,
    };
  }
  const color = rng.pick(COLORS);
  const pool = pickShapes(rng, 4);
  const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), pool[i % 4]), color));
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Every 4 cars it goes ${pool.join(", ")}, then starts again. So a ${answer.shape} comes next.`,
  };
}

/** d8: colour cycle (ABC) + shape alternation (AB) combined. 6 cars total. */
function buildD8(rng: Rng): Built {
  const colorPool = pickColors(rng, 3);
  const shapePool = pickShapes(rng, 2);
  const n = 6;
  const seq = Array.from({ length: n }, (_, i) => withColor(withShape(base(), shapePool[i % 2]), colorPool[i % 3]));
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `The colour cycles through ${colorPool.map(colorName).join(", ")} while the shape takes turns between ${shapePool.join(" and ")}. So the next car is a ${colorName(answer.color)} ${answer.shape}.`,
  };
}

/** d9: "growing gap" — count sequence 1,1,2,2,3,3,? (never exceeds 4). 7 cars total. */
function buildD9(rng: Rng): Built {
  const shape = rng.pick(SHAPES);
  const color = rng.pick(COLORS);
  const n = 7;
  const seq = Array.from({ length: n }, (_, i) =>
    withCount(withColor(withShape(base(), shape), color), Math.min(Math.floor(i / 2) + 1, 4) as Count)
  );
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `The count grows in pairs: 1, 1, 2, 2, 3, 3. So the next one is ${answer.count}.`,
  };
}

/** d10: two interleaved trains — odd cars (1st, 3rd, 5th, 7th) cycle colour;
 * even cars (2nd, 4th, 6th) cycle shape. 7 cars total; car 7 is odd, so the
 * answer is read off the colour chain. */
function buildD10(rng: Rng): Built {
  const [a, b, fillerColor] = pickColors(rng, 3);
  const [sa, sb, fillerShape] = pickShapes(rng, 3);
  const n = 7;
  const seq: Figure[] = [];
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      const subIdx = i / 2; // 1st, 3rd, 5th, 7th car (0-indexed even positions)
      seq.push(withColor(withShape(base(), fillerShape), subIdx % 2 === 0 ? a : b));
    } else {
      const subIdx = (i - 1) / 2; // 2nd, 4th, 6th car
      seq.push(withColor(withShape(base(), subIdx % 2 === 0 ? sa : sb), fillerColor));
    }
  }
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Every other car has its own pattern. The 1st, 3rd, 5th, 7th cars take turns between ${colorName(a)} and ${colorName(b)}. The 2nd, 4th, 6th cars take turns between ${sa} and ${sb}. Car 7 is one of the colour cars, so it's ${colorName(answer.color)}.`,
  };
}

/** d11 (the one NEW primitive this ramp adds): count climbs 1,2,3,4 then
 * mirrors back down one step at a time — 1,2,3,4,3,2,? — colour and shape
 * held constant throughout. A legitimate single-rule "peak and mirror"
 * pattern (a palindrome); NOT a wrap, since every step is exactly ±1 and it
 * never jumps straight from the max back to the minimum. 7 cars total. */
function buildD11(rng: Rng): Built {
  const shape = rng.pick(SHAPES);
  const color = rng.pick(COLORS);
  const counts: Count[] = [1, 2, 3, 4, 3, 2, 1];
  const seq = counts.map(c => withCount(withColor(withShape(base(), shape), color), c));
  const answer = seq[seq.length - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: "The count climbs to the top and then mirrors back down: 1, 2, 3, 4, 3, 2, then 1 again. So the next one is 1.",
  };
}

/** d12: combines d10's interleave (a colour chain on the odd cars) with
 * d11's mirror idea (a count peak-and-mirror chain on the even cars). Shape
 * is a single constant value throughout — not an active attribute here. 9
 * cars total; car 9 is an odd car, so the answer continues the colour
 * chain. */
function buildD12(rng: Rng): Built {
  const shape = rng.pick(SHAPES);
  const [a, b, fillerColor] = pickColors(rng, 3);
  const n = 9;
  const mirrorCounts: Count[] = [1, 2, 2, 1]; // the even cars' peak-and-mirror: up then back down
  const seq: Figure[] = [];
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      const subIdx = i / 2; // 1st, 3rd, 5th, 7th, 9th car
      seq.push(withCount(withColor(withShape(base(), shape), subIdx % 2 === 0 ? a : b), 1));
    } else {
      const subIdx = (i - 1) / 2; // 2nd, 4th, 6th, 8th car
      seq.push(withCount(withColor(withShape(base(), shape), fillerColor), mirrorCounts[subIdx]));
    }
  }
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Two patterns run together. The 1st, 3rd, 5th, 7th, 9th cars take turns between ${colorName(a)} and ${colorName(b)}. The 2nd, 4th, 6th, 8th cars' count climbs then mirrors back down: 1, 2, 2, 1. Car 9 is one of the colour cars, so it's ${colorName(answer.color)}.`,
  };
}

/** d13: three attributes change simultaneously for the first time — colour
 * cycles ABC, shape alternates AB, and count grows by one each car (capped
 * at 4) — extending d8's dual combination (colour+shape) to a genuine
 * triple. 8 cars total. */
function buildD13(rng: Rng): Built {
  const colorPool = pickColors(rng, 3);
  const shapePool = pickShapes(rng, 2);
  const n = 8;
  const seq = Array.from({ length: n }, (_, i) =>
    withCount(withColor(withShape(base(), shapePool[i % 2]), colorPool[i % 3]), Math.min(i + 1, 4) as Count)
  );
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Three things change together: the colour cycles through ${colorPool.map(colorName).join(", ")}, the shape takes turns between ${shapePool.join(" and ")}, and the count grows by one each car (up to 4). So the next car is a ${colorName(answer.color)} ${answer.shape} with ${answer.count}.`,
  };
}

/** d14: a genuine 3-way interleave (position mod 3) — extending d10's 2-way
 * interleave to three simultaneous, independent streams: cars 1,4,7 cycle
 * colour (period 2), cars 2,5,8 cycle shape (period 2), and cars 3,6,9 grow
 * count by one each time (capped at 4). 9 cars total; car 9 is a
 * count-chain car, so the answer continues the count-growth chain. */
function buildD14(rng: Rng): Built {
  const [a, b, fillerColorShapeChain, fillerColorCountChain] = pickColors(rng, 4);
  const [sa, sb, fillerShapeColorChain, fillerShapeCountChain] = pickShapes(rng, 4);
  const n = 9;
  const seq: Figure[] = [];
  for (let i = 0; i < n; i++) {
    const m = i % 3;
    if (m === 0) {
      const subIdx = i / 3; // 1st, 4th, 7th car
      seq.push(withCount(withColor(withShape(base(), fillerShapeColorChain), subIdx % 2 === 0 ? a : b), 1));
    } else if (m === 1) {
      const subIdx = (i - 1) / 3; // 2nd, 5th, 8th car
      seq.push(withCount(withColor(withShape(base(), subIdx % 2 === 0 ? sa : sb), fillerColorShapeChain), 1));
    } else {
      const subIdx = (i - 2) / 3; // 3rd, 6th, 9th car
      seq.push(
        withCount(withColor(withShape(base(), fillerShapeCountChain), fillerColorCountChain), Math.min(subIdx + 1, 4) as Count)
      );
    }
  }
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Three patterns run side by side, one every third car. The 1st, 4th, 7th cars take turns between ${colorName(a)} and ${colorName(b)}. The 2nd, 5th, 8th cars take turns between ${sa} and ${sb}. The 3rd, 6th, 9th cars grow their count by one each time: 1, 2, then 3. So the next car has ${answer.count}.`,
  };
}

/** d15 (capstone, 5 options): a 3-way interleave like d14, but the "extra"
 * stream is itself a peak-and-mirror count chain (shown in full, for
 * complexity/camouflage) while the credited answer continues the colour
 * chain — the hardest combination in the ramp. 10 cars total. Widens to 5
 * options (rather than 4), matching how other genres add an option at their
 * hardest tier. */
function buildD15(rng: Rng): Built {
  const [a, b, fillerColorShapeChain, fillerColorMirrorChain] = pickColors(rng, 4);
  const [sa, sb, fillerShapeColorChain, fillerShapeMirrorChain] = pickShapes(rng, 4);
  const n = 10;
  const mirrorCounts: Count[] = [1, 2, 1]; // fully shown peak-and-mirror: up then back down
  const seq: Figure[] = [];
  for (let i = 0; i < n; i++) {
    const m = i % 3;
    if (m === 0) {
      const subIdx = i / 3; // 1st, 4th, 7th, 10th car
      seq.push(withCount(withColor(withShape(base(), fillerShapeColorChain), subIdx % 2 === 0 ? a : b), 1));
    } else if (m === 1) {
      const subIdx = (i - 1) / 3; // 2nd, 5th, 8th car
      seq.push(withCount(withColor(withShape(base(), subIdx % 2 === 0 ? sa : sb), fillerColorShapeChain), 1));
    } else {
      const subIdx = (i - 2) / 3; // 3rd, 6th, 9th car
      seq.push(
        withCount(withColor(withShape(base(), fillerShapeMirrorChain), fillerColorMirrorChain), mirrorCounts[subIdx])
      );
    }
  }
  const answer = seq[n - 1];
  return {
    cars: seq.slice(0, -1),
    answer,
    rule: `Three patterns run side by side, one every third car. The 1st, 4th, 7th, 10th cars take turns between ${colorName(a)} and ${colorName(b)}. The 2nd, 5th, 8th cars take turns between ${sa} and ${sb}. The 3rd, 6th, 9th cars' count climbs then mirrors back down: 1, 2, 1 (it's fully shown, just extra camouflage). Car 10 is one of the colour cars, so it's ${colorName(answer.color)}.`,
  };
}

function buildSequence(rng: Rng, d: Difficulty): Built {
  switch (d) {
    case 1: return buildD1(rng);
    case 2: return buildD2(rng);
    case 3: return buildD3(rng);
    case 4: return buildD4(rng);
    case 5: return buildD5(rng);
    case 6: return buildD6(rng);
    case 7: return buildD7(rng);
    case 8: return buildD8(rng);
    case 9: return buildD9(rng);
    case 10: return buildD10(rng);
    case 11: return buildD11(rng);
    case 12: return buildD12(rng);
    case 13: return buildD13(rng);
    case 14: return buildD14(rng);
    case 15: return buildD15(rng);
    // Difficulty runs to 20 app-wide (decision #26) but Pattern Train is
    // authored to 15 (`maxDifficulty` below), so 16-20 can only arrive from a
    // config bug — fail loudly rather than silently serve a d15 item.
    default: throw new Error(`patternTrain: no build for difficulty ${d} (authored 1-15)`);
  }
}

// ---------------------------------------------------------------------------
// Distractors: always exactly ONE attribute changed from the true answer.
// Eligible attributes widen with difficulty; size never drives a distractor
// before d7; rotation is never used at all (see file header).
// ---------------------------------------------------------------------------
type MutableAttr = "shape" | "color" | "count" | "size";

function eligibleAttrs(d: Difficulty): MutableAttr[] {
  if (d <= 4) return ["shape", "color"];
  if (d <= 6) return ["shape", "color", "count"];
  return ["shape", "color", "count", "size"];
}

function otherOf<T>(rng: Rng, pool: readonly T[], cur: T): T {
  let v = rng.pick(pool);
  while (v === cur) v = rng.pick(pool);
  return v;
}

const COUNTS: Count[] = [1, 2, 3, 4];
const SIZES: Size[] = ["S", "M", "L"];

function mutateOneAttr(rng: Rng, f: Figure, attr: MutableAttr): Figure {
  switch (attr) {
    case "shape": return withShape(f, otherOf(rng, SHAPES, f.shape));
    case "color": return withColor(f, otherOf(rng, COLORS, f.color));
    case "count": return withCount(f, otherOf(rng, COUNTS, f.count));
    case "size": return withSize(f, otherOf(rng, SIZES, f.size));
  }
}

class GenFail extends Error {}
const MAX_TRIES = 200;
const MAX_ATTEMPTS = 200;
const RESEED_STEP = 1_000_003;

function buildDistractors(rng: Rng, answer: Figure, forbidden: Figure[], d: Difficulty, count: number): Figure[] {
  const attrs = eligibleAttrs(d);
  const used = [...forbidden];
  const result: Figure[] = [];
  for (let n = 0; n < count; n++) {
    let found: Figure | null = null;
    for (let i = 0; i < MAX_TRIES; i++) {
      const attr = rng.pick(attrs);
      const candidate = mutateOneAttr(rng, answer, attr);
      if (used.some(f => figuresEqual(f, candidate))) continue;
      found = candidate;
      break;
    }
    if (!found) throw new GenFail("patternTrain: no distractor found");
    used.push(found);
    result.push(found);
  }
  return result;
}

function assembleOptions(rng: Rng, answer: Figure, distractors: Figure[]): { options: Figure[]; answer: number } {
  const entries = [
    { f: answer, correct: true },
    ...distractors.map(f => ({ f, correct: false })),
  ];
  const shuffled = rng.shuffle(entries);
  return { options: shuffled.map(e => e.f), answer: shuffled.findIndex(e => e.correct) };
}

// 4 options through d14; d15 (the capstone) widens to 5, matching how other
// genres add an option at their hardest tier.
function optionCount(d: Difficulty): number {
  return d === 15 ? 5 : 4;
}

function generate(seed: number, d: Difficulty): PatternTrainItem {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed + attempt * RESEED_STEP);
    try {
      const { cars, answer, rule } = buildSequence(rng, d);
      const distractors = buildDistractors(rng, answer, [answer, ...cars], d, optionCount(d) - 1);
      const { options, answer: answerIndex } = assembleOptions(rng, answer, distractors);
      return { cars, options, answer: answerIndex, rule };
    } catch (e) {
      if (e instanceof GenFail) continue;
      throw e;
    }
  }
  throw new Error("patternTrain: failed to generate a solvable item after many attempts");
}

function score(item: PatternTrainItem, response: number | null): ScoreResult {
  const correct = response !== null && response === item.answer;
  return { points: correct ? 1 : 0, max: 1, correct };
}

function sample(): { item: PatternTrainItem; explanation: string } {
  const red = "#f06b7a";
  const blue = "#8cc9ff";
  const shape: Shape = "circle";
  const seq = [0, 1, 2, 3, 4].map(i => withColor(withShape(base(), shape), i % 2 === 0 ? red : blue));
  const cars = seq.slice(0, -1); // red, blue, red, blue
  const answer = seq[4]; // red

  // 3 distractors, each differing from the answer by exactly one attribute —
  // the "salient at d<=4" rule the sample stands in for.
  const d1 = withShape(answer, "square"); // shape differs
  const d2 = withColor(answer, blue); // colour differs (the classic "off by one" trap)
  const d3 = withShape(answer, "triangle"); // shape differs (a second, different shape)

  const item: PatternTrainItem = {
    cars,
    options: [d1, answer, d2, d3],
    answer: 1,
    rule: "The colours take turns: red, blue, red, blue. So red comes next.",
  };
  return {
    item,
    explanation: "The colours take turns. Red, blue, red, blue. So red comes next.",
  };
}

// ---------------------------------------------------------------------------
// Audit: self-contained HTML/SVG (no React) — reuses shapePath directly,
// mirroring the drawing primitives scripts/audit-items.ts already uses for
// every other genre, so the train renders exactly as she'd see it.
// ---------------------------------------------------------------------------
const SIZE_PCT: Record<Size, number> = { S: 0.4, M: 0.6, L: 0.8 };

function figureSvg(f: Figure, box = 48): string {
  const cols = f.count <= 2 ? f.count : 2;
  const rows = f.count <= 2 ? 1 : 2;
  const cellW = box / cols;
  const cellH = box / rows;
  const shapeSize = Math.min(cellW, cellH) * SIZE_PCT[f.size];
  let cells = "";
  for (let i = 0; i < f.count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;
    const offsetX = cx - shapeSize / 2;
    const offsetY = cy - shapeSize / 2;
    const d = shapePath(f.shape, shapeSize);
    cells += `<g transform="translate(${offsetX}, ${offsetY}) rotate(${f.rot}, ${shapeSize / 2}, ${shapeSize / 2})"><path d="${d}" fill="${f.color}" /></g>`;
  }
  return `<svg viewBox="0 0 ${box} ${box}" width="${box}" height="${box}">${cells}</svg>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Self-contained HTML/SVG for one item: the train, the "?" carriage, the 4
 * options with the correct one outlined green. No React/DOM. */
export function audit(item: PatternTrainItem): string {
  const carsHtml = item.cars.map(c => `<div class="pt-car">${figureSvg(c, 44)}</div>`).join("");
  const optionsHtml = item.options
    .map((o, i) => `<div class="pt-option${i === item.answer ? " correct" : ""}">${figureSvg(o, 36)}</div>`)
    .join("");
  return (
    `<div class="pt-audit">` +
    `<div class="pt-train"><span class="pt-engine">&#128654;</span>${carsHtml}<div class="pt-car pt-missing">?</div></div>` +
    `<div class="pt-options">${optionsHtml}</div>` +
    `<div class="pt-rule">${esc(item.rule)}</div>` +
    `</div>` +
    `<style>` +
    `.pt-audit{font-family:sans-serif;font-size:12px}` +
    `.pt-train{display:flex;align-items:center;gap:4px}` +
    `.pt-engine{font-size:28px}` +
    `.pt-car{width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:#f4f4f4;border-radius:8px}` +
    `.pt-missing{border:2px dashed #2bb3a9;color:#2bb3a9;font-weight:bold;font-size:16px}` +
    `.pt-options{display:flex;gap:6px;margin-top:8px}` +
    `.pt-option{border:2px solid #e2e2e2;border-radius:6px;padding:4px;background:#fff}` +
    `.pt-option.correct{border-color:#2ecc71;background:#eafaf0}` +
    `.pt-rule{color:#888;margin-top:6px;max-width:60ch}` +
    `</style>`
  );
}

export const patternTrain: Genre<PatternTrainItem, number> = {
  id: "patternTrain",
  subtest: "Rule Induction",
  domain: "FR",
  kidTitle: "Pattern Train",
  instructions:
    "A train of pictures is coming down the track. The last car is empty. Find the picture that keeps the pattern going, then tap Done.",
  sample,
  generate,
  score,
  timing: { kind: "none" },
  mode: "staircase",
  maxDifficulty: 15,
};
