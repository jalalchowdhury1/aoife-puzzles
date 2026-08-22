// Pure helpers for the Matrix Reasoning ("What's Missing?") rule engine.
// Split out of matrix.ts so the genre glue file stays small; nothing here is
// React/DOM/I-O, and every function is deterministic given the Rng it is passed.
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

// --- Rule kinds: each fills a rows x cols grid of value-indices for one attribute. ---
export type RuleKind = "const" | "constRow" | "constCol" | "progressRow" | "dist3";

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
};

// --- Difficulty -> rule plan, as data. ---
export interface AttrRule { attr: AttrName; kind: RuleKind }
interface PlanSpec { rows: 2 | 3; kinds: RuleKind[]; pool: AttrName[]; appendDotCol?: boolean }

const PLAN_BY_D: Record<Difficulty, PlanSpec> = {
  1: { rows: 2, kinds: ["constRow"], pool: DRAWABLE_ATTRS },
  2: { rows: 2, kinds: ["constRow"], pool: DRAWABLE_ATTRS },
  3: { rows: 2, kinds: ["progressRow"], pool: ["size", "count"] },
  4: { rows: 3, kinds: ["progressRow"], pool: ["size", "count"] },
  5: { rows: 3, kinds: ["constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  6: { rows: 3, kinds: ["constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  7: { rows: 3, kinds: ["dist3", "constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  8: { rows: 3, kinds: ["dist3", "constRow", "progressRow"], pool: DRAWABLE_ATTRS },
  9: { rows: 3, kinds: ["dist3", "dist3", "progressRow"], pool: DRAWABLE_ATTRS, appendDotCol: true },
  10: { rows: 3, kinds: ["dist3", "dist3", "progressRow"], pool: DRAWABLE_ATTRS, appendDotCol: true },
};

/** Turns a difficulty into a concrete set of attribute rules (data-driven; see PLAN_BY_D). */
export function buildRulePlan(rng: Rng, d: Difficulty): { rows: 2 | 3; rules: AttrRule[] } {
  const spec = PLAN_BY_D[d];
  const attrs = rng.shuffle(spec.pool).slice(0, spec.kinds.length);
  const rules: AttrRule[] = spec.kinds.map((kind, i) => ({ attr: attrs[i], kind }));
  if (spec.appendDotCol) rules.push({ attr: "dot", kind: "constCol" });
  return { rows: spec.rows, rules };
}

/** Builds the full rows x rows grid of Figures from a rule plan; unruled attributes are constant (dot defaults to false). */
export function buildGrid(rng: Rng, rows: 2 | 3, rules: AttrRule[]): Figure[][] {
  const cols = rows;
  const used = new Set(rules.map(r => r.attr));
  const indexGrids = {} as Record<AttrName, number[][]>;

  for (const rule of rules) {
    indexGrids[rule.attr] = RULE_FILLERS[rule.kind](rng, attrLen(rule.attr), rows, cols);
  }
  for (const attr of ATTR_LIST) {
    if (used.has(attr)) continue;
    indexGrids[attr] = attr === "dot" ? fillGrid(rows, cols, 0) : RULE_FILLERS.const(rng, attrLen(attr), rows, cols);
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

/** Builds a 1x5 series row: one attribute progresses across all 5 cells; a second alternates at d >= 5. */
export function buildSeriesFigures(rng: Rng, d: Difficulty): Figure[] {
  const progAttr = rng.pick(DRAWABLE_ATTRS);
  const altAttr = d >= 5 ? rng.pick(DRAWABLE_ATTRS.filter(a => a !== progAttr)) : null;

  const cols = {} as Record<AttrName, number[]>;
  cols[progAttr] = RULE_FILLERS.progressRow(rng, attrLen(progAttr), 1, 5)[0];
  if (altAttr) {
    const vals = distinctOrCyclic(rng, attrLen(altAttr), 2);
    cols[altAttr] = Array.from({ length: 5 }, (_, i) => vals[i % 2]);
  }
  for (const attr of ATTR_LIST) {
    if (attr === progAttr || attr === altAttr) continue;
    cols[attr] = attr === "dot" ? Array(5).fill(0) : Array(5).fill(rng.int(0, attrLen(attr) - 1));
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

/** A distractor: `answer` with 1..maxAttrs attributes changed to a different value. */
function mutateFigure(rng: Rng, answer: Figure, maxAttrs: number): Figure {
  const numAttrs = maxAttrs <= 1 ? 1 : rng.int(1, maxAttrs);
  const attrs = rng.shuffle(ATTR_LIST).slice(0, numAttrs);
  let next = answer;
  for (const attr of attrs) {
    const len = attrLen(attr);
    if (len <= 1) continue;
    const curIdx = indexOfAttr(attr, next);
    let idx = rng.int(0, len - 1);
    while (idx === curIdx) idx = rng.int(0, len - 1);
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
    const candidate = mutateFigure(rng, answer, maxAttrs);
    if (forbidden.some(f => figuresEqual(f, candidate))) continue;
    if (distractors.some(f => figuresEqual(f, candidate))) continue;
    distractors.push(candidate);
  }

  const shuffled = rng.shuffle([answer, ...distractors]);
  return { options: shuffled, answerIndex: shuffled.indexOf(answer) };
}
