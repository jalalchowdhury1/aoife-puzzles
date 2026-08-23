import { clampToBase } from "../engine/types";
import type { BaseDifficulty, Genre } from "../engine/types";
import { makeRng } from "../engine/rng";

export interface PictureSpanItem { shown: string[]; choices: string[]; exposureMs: number }

// Fixed 24-icon bank (original emoji pictures, no image assets).
const ICONS = [
  "🍎", "🐶", "🚗", "⭐", "🌸", "🐟", "🎈", "🏠",
  "🍌", "🐱", "✈️", "🌙", "🍪", "🐸", "⚽", "🎁",
  "🍓", "🐘", "🚲", "☂️", "🧸", "🐢", "🎺", "🔑",
];

const K_BY_D: Record<BaseDifficulty, number> = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 7 };

function sameMultiset(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export const pictureSpan: Genre<PictureSpanItem, string[]> = {
  id: "pictureSpan",
  subtest: "Picture Span",
  domain: "WM",
  kidTitle: "Picture Memory",
  instructions:
    "Watch the pictures. Try to remember them in order. When they disappear, tap the same pictures in the same order you saw them.",

  sample() {
    const item: PictureSpanItem = {
      shown: ["🐶", "⭐"],
      choices: ["🍎", "⭐", "🚗", "🐶", "🌸", "🐟"],
      exposureMs: 3000,
    };
    return {
      item,
      explanation: "You saw the 🐶, then the ⭐. So you tap the 🐶 first, then the ⭐.",
    };
  },

  generate(seed, d) {
    const d0 = clampToBase(d);   // this genre's own ramp is 1-10 only
    const rng = makeRng(seed);
    const k = K_BY_D[d0];
    const distractorCount = d0 <= 5 ? 4 : 6;

    const order = rng.shuffle(ICONS);
    const shown = order.slice(0, k);
    const pool = order.slice(0, k + distractorCount);
    const choices = rng.shuffle(pool);
    const exposureMs = k <= 2 ? 3000 : 5000;

    return { shown, choices, exposureMs };
  },

  score(item, response) {
    const max = 2;
    if (!response || response.length === 0) return { points: 0, max, correct: false };
    if (!sameMultiset(item.shown, response)) return { points: 0, max, correct: false };
    const exact = item.shown.every((icon, i) => icon === response[i]);
    const points = exact ? 2 : 1;
    return { points, max, correct: points > 0 };
  },

  timing: { kind: "none" },
  mode: "staircase",
};
