// Pure helpers for the Matrix Reasoning ("What's Missing?") rule engine.
// Split out of matrix.ts so the genre glue file stays small; nothing here is
// React/DOM/I-O, and every function is deterministic given the Rng it is passed.
//
// Age-appropriateness rules baked into this module (2026-08-22, after her
// real d1 items showed the easiest ones were unfair — see AGENTS.md/spec):
//   - d1-2: 2x2 only, single varying attribute (shape XOR color), everything
//     else pinned to count:1 / rot:0 / dot:false; distractors differ from the
//     answer by shape or color only.
//   - d3-4: progressing attribute is count (contiguous run within 1-3, never
//     reaching 4) or size restricted to S/L (M never appears); a series, when
//     it appears, is a clean 2-value alternation (A B A B ?), never a 3-cycle;
//     distractor salience stays to exactly one of {shape, color, count}.
//   - Rotation is only ever applied to a triangle (the only shape whose
//     rotation reads unambiguously to a 5-year-old) and only from d>=5; dot
//     only from d>=6 (both enforced as hard floors on every code path,
//     including the "unruled attribute" defaults and the distractor mutator,
//     not just the rule-plan pool).
//   - Size distractors at d<=6 must jump a full 2 steps (S<->L), never land
//     adjacent to the answer (S/M or M/L) — the exact confusion the real
//     data flagged (rotated hexagon, size M vs L).
import type { Rng } from "../engine/rng";
import type { Difficulty } from "../engine/types";
import type { Figure } from "./shapes";
import { SHAPES, COLORS } from "./shapes";

export type AttrName = "shape" | "color" | "size" | "count" | "rot" | "dot";
export const ATTR_LIST: AttrName[] = ["shape", "color", "size", "count", "rot", "dot"];
export const DRAWABLE_ATTRS: AttrName[] = ["shape", "color", "size", "count", "rot"];

const SIZES: Figure["size"][] = ["S", "M", "L"];
const COUNTS: Figure["count"][] = [1, 2, 3, 4];
const ROTS: Figure["rot"][] = [0, 90, 180, 270];
const DOTS: boolean[] = [false, true];

export function attrLen(attr: AttrName): number {
  switch (attr) {
    case "shape": return SHAPES.length;
    case "color": return COLORS.length;
    case "size": return SIZES.length;
    case "count": return COUNTS.length;
    case "rot": return ROTS.length;
    case "dot": return DOTS.length;
  }
}

function indexOfAttr(attr: AttrName, f: Figure): number {
  switch (attr) {
    case "shape": return SHAPES.indexOf(f.shape);
    case "color": return COLORS.indexOf(f.color);
    case "size": return SIZES.indexOf(f.size);
    case "count": return COUNTS.indexOf(f.count);
    case "rot": return ROTS.indexOf(f.rot);
    case "dot": return DOTS.indexOf(f.dot);
  }
}

function withAttrIndex(f: Figure, attr: AttrName, idx: number): Figure {
  switch (attr) {
    case "shape": return { ...f, shape: SHAPES[idx] };
    case "color": return { ...f, color: COLORS[idx] };
    case "size": return { ...f, size: SIZES[idx] };
    case "count": return { ...f, count: COUNTS[idx] };
    case "rot": return { ...f, rot: ROTS[idx] };
    case "dot": return { ...f, dot: DOTS[idx] };
  }
}

export function figureFromIndices(idx: Record<AttrName, number>): Figure {
  return {
    shape: SHAPES[idx.shape],
    color: COLORS[idx.color],
    size: SIZES[idx.size],
    count: COUNTS[idx.count],
    rot: ROTS[idx.rot],
    dot: DOTS[idx.dot],
  };
}

export function figuresEqual(a: Figure, b: Figure): boolean {
  return (
    a.shape === b.shape && a.color === b.color && a.size === b.size &&
    a.count === b.count && a.rot === b.rot && a.dot === b.dot
  );
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function fillGrid(rows: number, cols: number, value: number): number[][] {
  return Array.from({ length: rows }, () => Array<number>(cols).fill(value));
}

/** `count` value-indices: distinct when the attribute has enough values, otherwise a cyclic rotation. */
export function distinctOrCyclic(rng: Rng, len: number, count: number): number[] {
  if (len >= count) return rng.shuffle(range(len)).slice(0, count);
  const start = rng.int(0, len - 1);
  return Array.from({ length: count }, (_, i) => (start + i) % len);
}

/** A contiguous ascending or descending run of `cols` indices within [0, n-1] — never skips a value. */
function contiguousProgression(rng: Rng, n: number, rows: number, cols: number): number[][] {
  const maxStart = Math.max(0, n - cols);
  return Array.from({ length: rows }, () => {
    const start = rng.int(0, maxStart);
    const descending = rng.next() < 0.5;
    return Array.from({ length: cols }, (_, c) => (descending ? start + (cols - 1 - c) : start + c));
  });
}

/** Alternates through a small fixed value set (e.g. just S/L) — a clean A,B,A,B,... run, never a third value. */
function alternateFromValueSet(rng: Rng, valueSet: number[], rows: number, cols: number): number[][] {
  const n = valueSet.length;
  return Array.from({ length: rows }, () => {
    const start = rng.int(0, n - 1);
    return Array.from({ length: cols }, (_, c) => valueSet[(start + c) % n]);
  });
}

// --- Rule kinds: each fills a rows x cols grid of value-indices for one attribute. ---
export type RuleKind = "const" | "constRow" | "constCol" | "progressRow" | "dist3" | "progressCount123" | "progressSizeSL";

export const RULE_FILLERS: Record<RuleKind, (rng: Rng, len: number, rows: number, cols: number) => number[][]> = {
  const: (rng, len, rows, cols) => fillGrid(rows, cols, rng.int(0, len - 1)),

  constRow: (rng, len, rows, cols) => {
    const chosen = distinctOrCyclic(rng, len, rows);
    return Array.from({ length: rows }, (_, r) => Array<number>(cols).fill(chosen[r]));
  },

  constCol: (rng, len, rows, cols) => {
    const chosen = distinctOrCyclic(rng, len, cols);
    return Array.from({ length: rows }, () => Array.from({ length: cols }, (_, c) => chosen[c]));
  },

  progressRow: (rng, len, rows, cols) =>
    Array.from({ length: rows }, () => {
      const start = rng.int(0, len - 1);
      return Array.from({ length: cols }, (_, c) => (start + c) % len);
    }),

  // A 3x3 Latin square over 3 chosen values: every row and every column holds each value once.
  dist3: (rng, len) => {
    const values = distinctOrCyclic(rng, len, 3);
    const rowPerm = rng.shuffle([0, 1, 2]);
    const colPerm = rng.shuffle([0, 1, 2]);
    return Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => values[(rowPerm[r] + colPerm[c]) % 3])
    );
  },

  // d3-4 only: count progresses through a contiguous run of 1-2-3 (never 4).
  progressCount123: (rng, _len, rows, cols) => contiguousProgression(rng, 3, rows, cols),

  // d3-4 only: size alternates between S and L only — M never appears, so it
  // can never sit "adjacent to the answer" the way it confused her at d1.
  progressSizeSL: (rng, _len, rows, cols) => alternateFromValueSet(rng, [0, 2], rows, cols),
};

// --- Difficulty -> rule plan, as data. ---
export interface AttrRule { attr: AttrName; kind: RuleKind }
interface PlanSpec { rows: 2 | 3; kinds: RuleKind[]; pool: AttrName[]; appendDotCol?: boolean }

const PLAN_BY_D: Record<Difficulty, PlanSpec> = {
  // d1-2: exactly one of {shape, color} varies row to row; everything else
  // (including count/rot/dot) is pinned by buildGrid regardless of this pool.
  1: { rows: 2, kinds: ["constRow"], pool: ["shape", "color"] },
  2: { rows: 2, kinds: ["constRow"], pool: ["shape", "color"] },
  // d3-4: "progressRow" is remapped below to progressCount123 / progressSizeSL.
  3: { rows: 2, kinds: ["progressRow"], pool: ["size", "count"] },
  4: { rows: 3, kinds: ["progressRow"], pool: ["size", "count"] },
  5: { rows: 3, kinds: ["constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  6: { rows: 3, kinds: ["constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  7: { rows: 3, kinds: ["dist3", "constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  8: { rows: 3, kinds: ["dist3", "constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  9: { rows: 3, kinds: ["dist3", "dist3", "progressRow"], pool: DRAWABLE_ATTRS, appendDotCol: true },
  10: { rows: 3, kinds: ["dist3", "dist3", "progressRow"], pool: DRAWABLE_ATTRS, appendDotCol: true },
};

/**
 * Picks `n` distinct attrs from `pool`, never returning both "shape" and
 * "rot" together — rotation is only ever meaningfully distinct on a
 * triangle, so a rule plan can't simultaneously vary shape independently.
 */
function pickPlanAttrs(rng: Rng, pool: AttrName[], n: number): AttrName[] {
  const shuffled = rng.shuffle(pool);
  const chosen: AttrName[] = [];
  for (const attr of shuffled) {
    if (chosen.length >= n) break;
    if (attr === "shape" && chosen.includes("rot")) continue;
    if (attr === "rot" && chosen.includes("shape")) continue;
    chosen.push(attr);
  }
  return chosen;
}

/** Turns a difficulty into a concrete set of attribute rules (data-driven; see PLAN_BY_D). */
export function buildRulePlan(rng: Rng, d: Difficulty): { rows: 2 | 3; rules: AttrRule[] } {
  const spec = PLAN_BY_D[d];
  const attrs = pickPlanAttrs(rng, spec.pool, spec.kinds.length);
  let rules: AttrRule[] = spec.kinds.map((kind, i) => ({ attr: attrs[i], kind }));

  if (d === 3 || d === 4) {
    rules = rules.map(r =>
      r.kind === "progressRow"
        ? { attr: r.attr, kind: (r.attr === "count" ? "progressCount123" : "progressSizeSL") as RuleKind }
        : r
    );
  }

  if (spec.appendDotCol) rules.push({ attr: "dot", kind: "constCol" });
  return { rows: spec.rows, rules };
}

/** Builds the full rows x rows grid of Figures from a rule plan; unruled attributes are constant (dot/rot default to their "off" value). */
export function buildGrid(rng: Rng, rows: 2 | 3, rules: AttrRule[], d: Difficulty): Figure[][] {
  const cols = rows;
  const used = new Set(rules.map(r => r.attr));
  const indexGrids = {} as Record<AttrName, number[][]>;

  for (const rule of rules) {
    indexGrids[rule.attr] = RULE_FILLERS[rule.kind](rng, attrLen(rule.attr), rows, cols);
  }
  for (const attr of ATTR_LIST) {
    if (used.has(attr)) continue;
    if (attr === "dot" || attr === "rot") {
      // Rotation only ever appears from d>=5 (as a rule attribute, handled
      // above); dot only from d9-10 (appendDotCol). Unruled, both default to
      // their "off" value rather than a random-but-constant one, so a plain
      // d1-4 item never shows a uniformly-rotated or dotted figure.
      indexGrids[attr] = fillGrid(rows, cols, 0);
    } else if (attr === "count" && d <= 2) {
      // d1-2: every figure has count:1 — not just "a constant count".
      indexGrids[attr] = fillGrid(rows, cols, 0);
    } else {
      indexGrids[attr] = RULE_FILLERS.const(rng, attrLen(attr), rows, cols);
    }
  }

  // Rotation only reads unambiguously on a triangle: whenever rot is a rule
  // attribute, pin every figure's shape to triangle (pickPlanAttrs already
  // guarantees "shape" itself isn't also a separate rule attribute here).
  if (rules.some(r => r.attr === "rot")) {
    indexGrids.shape = fillGrid(rows, cols, SHAPES.indexOf("triangle"));
  }

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      figureFromIndices({
        shape: indexGrids.shape[r][c],
        color: indexGrids.color[r][c],
        size: indexGrids.size[r][c],
        count: indexGrids.count[r][c],
        rot: indexGrids.rot[r][c],
        dot: indexGrids.dot[r][c],
      })
    )
  );
}

/** 2 distinct value-indices for a series' progressing/alternating attribute, honoring the d3-4 S/L-only and 1-2-3-only limits. */
function twoValueSet(rng: Rng, attr: AttrName): number[] {
  if (attr === "size") return distinctOrCyclic(rng, 2, 2).map(i => (i === 0 ? 0 : 2)); // S/L only, never M
  if (attr === "count") return distinctOrCyclic(rng, 3, 2); // 1/2/3 only, never 4
  return distinctOrCyclic(rng, attrLen(attr), 2);
}

/**
 * Builds a 1x5 series row.
 *   - d3-4 ("narrow"): a single attribute (never rotation) makes a clean
 *     2-value alternation across all 5 cells (A B A B ?) — never a 3-cycle.
 *   - d5-6: one attribute progresses across the full cell range; a second
 *     may alternate on top of it. Rotation, if chosen, forces every shape to
 *     triangle (same rule as the matrix form).
 */
export function buildSeriesFigures(rng: Rng, d: Difficulty): Figure[] {
  const narrow = d <= 4;
  const progPool = narrow ? DRAWABLE_ATTRS.filter(a => a !== "rot") : DRAWABLE_ATTRS;
  const progAttr = rng.pick(progPool);

  const cols = {} as Record<AttrName, number[]>;

  if (narrow) {
    const values = twoValueSet(rng, progAttr);
    cols[progAttr] = Array.from({ length: 5 }, (_, i) => values[i % 2]);
  } else {
    cols[progAttr] = RULE_FILLERS.progressRow(rng, attrLen(progAttr), 1, 5)[0];
  }

  const altPool = !narrow && d >= 5
    ? DRAWABLE_ATTRS.filter(a =>
        a !== progAttr &&
        !(progAttr === "rot" && a === "shape") &&
        !(progAttr === "shape" && a === "rot")
      )
    : [];
  const altAttr = altPool.length > 0 ? rng.pick(altPool) : null;
  if (altAttr) {
    const vals = altAttr === "size" ? [0, 2] : distinctOrCyclic(rng, attrLen(altAttr), 2);
    cols[altAttr] = Array.from({ length: 5 }, (_, i) => vals[i % 2]);
  }

  const forceTriangle = progAttr === "rot" || altAttr === "rot";
  for (const attr of ATTR_LIST) {
    if (attr === progAttr || attr === altAttr) continue;
    if (attr === "dot" || attr === "rot") {
      cols[attr] = Array(5).fill(0);
    } else if (attr === "shape" && forceTriangle) {
      cols[attr] = Array(5).fill(SHAPES.indexOf("triangle"));
    } else {
      cols[attr] = Array(5).fill(rng.int(0, attrLen(attr) - 1));
    }
  }

  return Array.from({ length: 5 }, (_, i) =>
    figureFromIndices({
      shape: cols.shape[i],
      color: cols.color[i],
      size: cols.size[i],
      count: cols.count[i],
      rot: cols.rot[i],
      dot: cols.dot[i],
    })
  );
}

/** Which attributes a distractor is allowed to differ on, given the difficulty and the answer figure. */
function eligibleDistractorAttrs(d: Difficulty, answer: Figure): AttrName[] {
  if (d <= 2) return ["shape", "color"];
  if (d <= 4) return ["shape", "color", "count"];

  const attrs: AttrName[] = ["color", "count"];
  // If the answer is already rotated (only ever true for a triangle),
  // mutating shape away would silently produce a rotated non-triangle —
  // exactly the ambiguous case rotation is pinned away from. Leave rot
  // itself as the only way to vary a rotated figure's orientation further.
  if (answer.rot === 0) attrs.push("shape");
  // Size distractors at d<=6 must jump a full S<->L step; if the answer is
  // M there is no valid 2-step target, so size just isn't eligible there.
  if (d > 6 || answer.size !== "M") attrs.push("size");
  if (d >= 6) attrs.push("dot");
  // Rotation only ever varies a triangle (and only from d>=5, guaranteed by
  // reaching this branch at all).
  if (answer.shape === "triangle") attrs.push("rot");
  return attrs;
}

/**
 * Picks `n` distinct attrs from `eligible`, never both "shape" and "rot" —
 * mutating both at once on a d>=7 (maxAttrs 2) distractor could otherwise
 * rotate a *non*-triangle shape, exactly the ambiguous case rotation is
 * supposed to be pinned away from.
 */
function pickMutateAttrs(rng: Rng, eligible: AttrName[], n: number): AttrName[] {
  const shuffled = rng.shuffle(eligible);
  const chosen: AttrName[] = [];
  for (const attr of shuffled) {
    if (chosen.length >= n) break;
    if (attr === "shape" && chosen.includes("rot")) continue;
    if (attr === "rot" && chosen.includes("shape")) continue;
    chosen.push(attr);
  }
  return chosen;
}

/** A distractor: `answer` with 1..maxAttrs eligible attributes changed to a different value. */
function mutateFigure(rng: Rng, answer: Figure, d: Difficulty, maxAttrs: number): Figure {
  const eligible = eligibleDistractorAttrs(d, answer);
  const numAttrs = Math.min(maxAttrs <= 1 ? 1 : rng.int(1, maxAttrs), eligible.length);
  const attrs = pickMutateAttrs(rng, eligible, numAttrs);

  let next = answer;
  for (const attr of attrs) {
    const len = attrLen(attr);
    if (len <= 1) continue;
    const curIdx = indexOfAttr(attr, next);
    let idx: number;
    if (attr === "size" && d <= 6) {
      // Enforced 2-step jump: S<->L only, M is never used as a distractor size at d<=6.
      idx = curIdx === 0 ? 2 : 0;
    } else {
      idx = rng.int(0, len - 1);
      while (idx === curIdx) idx = rng.int(0, len - 1);
    }
    next = withAttrIndex(next, attr, idx);
  }
  return next;
}

/** 5 shuffled options (the answer + 4 distractors), none equal to each other or to a visible cell. */
export function buildOptions(
  rng: Rng,
  answer: Figure,
  visible: Figure[],
  d: Difficulty
): { options: Figure[]; answerIndex: number } {
  const maxAttrs = d <= 6 ? 1 : 2;
  const forbidden = [answer, ...visible];
  const distractors: Figure[] = [];

  let guard = 0;
  while (distractors.length < 4 && guard < 5000) {
    guard++;
    const candidate = mutateFigure(rng, answer, d, maxAttrs);
    if (forbidden.some(f => figuresEqual(f, candidate))) continue;
    if (distractors.some(f => figuresEqual(f, candidate))) continue;
    distractors.push(candidate);
  }

  const shuffled = rng.shuffle([answer, ...distractors]);
  return { options: shuffled, answerIndex: shuffled.indexOf(answer) };
}
