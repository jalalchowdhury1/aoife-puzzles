import type { Difficulty, Genre } from "../engine/types";
import { makeRng } from "../engine/rng";

export type FireflyTask = "same" | "backward";

export interface FireflyBoxesItem {
  sequence: number[]; // the order the fireflies lit up, cell indices 0-8 (3x3 grid, row-major)
  task: FireflyTask;
  expected: number[]; // the tap order that scores full credit
  exposureOnMs: number; // how long each cell glows (the off-gap between cells is EXPOSURE_OFF_MS)
}

// 3x3 grid: cells 0-8, row-major (0 1 2 / 3 4 5 / 6 7 8).
export const GRID_SIZE = 9;
export const EXPOSURE_ON_MS = 600;
export const EXPOSURE_OFF_MS = 300;

const ALL_CELLS = Array.from({ length: GRID_SIZE }, (_, i) => i);

// Slow, one-step-at-a-time ramp (owner decision #15): the "same order" task
// grows one box at a time from d1 to d6, then "backward" is introduced as its
// own new idea and grows the same way from d7 to d10.
const PLAN: Record<Difficulty, { task: FireflyTask; len: number }> = {
  1: { task: "same", len: 1 },
  2: { task: "same", len: 2 },
  3: { task: "same", len: 3 },
  4: { task: "same", len: 4 },
  5: { task: "same", len: 5 },
  6: { task: "same", len: 6 },
  7: { task: "backward", len: 2 },
  8: { task: "backward", len: 3 },
  9: { task: "backward", len: 4 },
  10: { task: "backward", len: 5 },
};

function expectedFor(sequence: number[], task: FireflyTask): number[] {
  return task === "same" ? [...sequence] : [...sequence].reverse();
}

function sameMultiset(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

export const fireflyBoxes: Genre<FireflyBoxesItem, number[]> & {
  // Forward-looking e2e hook (see components/genres/FireflyBoxesView.tsx and
  // the new-genre common brief): the play-through only needs to know this is
  // a sequence-tap genre and how many taps to make before it can submit.
  e2e: { kind: "sequence"; taps: number };
} = {
  id: "fireflyBoxes",
  subtest: "Spatial Span",
  domain: "WM",
  kidTitle: "Firefly Boxes",
  instructions:
    "Watch the fireflies light up the boxes, one at a time. When they are done, tap the boxes back in the same order you saw them glow.",

  sample() {
    const item: FireflyBoxesItem = {
      sequence: [1, 7],
      task: "same",
      expected: [1, 7],
      exposureOnMs: EXPOSURE_ON_MS,
    };
    return {
      item,
      explanation: "The firefly went here, then here. Tap them in the same order.",
    };
  },

  generate(seed, d) {
    // Decorrelated per (seed, d) so neighbouring difficulties for the same
    // seed don't share a random-stream prefix (unlike e.g. pictureSpan, which
    // wants that nesting; here it would just be a coincidence to avoid).
    const rng = makeRng(seed * 1000 + d);
    const { task, len } = PLAN[d];
    // Distinct cells only (a stronger guarantee than "no immediate repeats"):
    // a box relighting later in the sequence is a legitimate Corsi-style
    // design, but for a 5-year-old it reads as "wait, didn't I already see
    // that one?" — so every item in this game uses each box at most once.
    const sequence = rng.shuffle(ALL_CELLS).slice(0, len);
    return { sequence, task, expected: expectedFor(sequence, task), exposureOnMs: EXPOSURE_ON_MS };
  },

  score(item, response) {
    const max = 2;
    if (!response || response.length === 0) return { points: 0, max, correct: false };
    if (!sameMultiset(item.expected, response)) return { points: 0, max, correct: false };
    const exact = item.expected.length === response.length && item.expected.every((cell, i) => cell === response[i]);
    const points = exact ? 2 : 1;
    return { points, max, correct: points > 0 };
  },

  timing: { kind: "none" },
  mode: "staircase",
  e2e: { kind: "sequence", taps: 1 },
};

/** Self-contained HTML/SVG audit card: the 3x3 grid with the correct tap
 * order badged in green (owner decision #14). No React/DOM. */
export function audit(item: FireflyBoxesItem): string {
  const cells = ALL_CELLS.map(i => {
    const orderIdx = item.expected.indexOf(i);
    const lit = orderIdx >= 0;
    const bg = lit ? "#6fcf6f" : "#e2e2e2";
    const badge = lit
      ? `<span style="font:bold 14px sans-serif;color:#fff;">${orderIdx + 1}</span>`
      : "";
    return (
      `<div style="width:40px;height:40px;border-radius:8px;background:${bg};` +
      `display:flex;align-items:center;justify-content:center;">${badge}</div>`
    );
  }).join("");
  return (
    `<div style="font-family:sans-serif;">` +
    `<div style="display:grid;grid-template-columns:repeat(3,40px);gap:4px;">${cells}</div>` +
    `<div style="margin-top:6px;font-size:11px;color:#888;">` +
    `task: ${item.task} &middot; lit in this order: ${item.sequence.join(", ")}` +
    `</div></div>`
  );
}
