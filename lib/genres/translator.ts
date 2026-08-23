import type { Difficulty, Genre } from "../engine/types";
import { makeRng } from "../engine/rng";
import { SPEED_BLOCK_MS } from "../engine/timing";

export interface TranslatorPair { animal: string; food: string }
export interface TranslatorItem {
  key: TranslatorPair[];
  animal: string;
  lookahead: string[]; // upcoming animals, always drawn from `key`
}

// Fixed global animal -> food map (mirrors coding.ts's fixed CODE_KEY). A
// difficulty band always uses a PREFIX of this list as its key, so the same
// animal never maps to a different food across items or difficulties.
export const TRANSLATOR_KEY: TranslatorPair[] = [
  { animal: "\u{1F436}", food: "\u{1F356}" }, // dog -> meat
  { animal: "\u{1F431}", food: "\u{1F41F}" }, // cat -> fish
  { animal: "\u{1F430}", food: "\u{1F955}" }, // rabbit -> carrot
  { animal: "\u{1F435}", food: "\u{1F34C}" }, // monkey -> banana
  { animal: "\u{1F43C}", food: "\u{1F38B}" }, // panda -> bamboo
];

const LOOKAHEAD_LEN = 4;

function keySizeFor(d: Difficulty): number {
  return d <= 3 ? 3 : d <= 6 ? 4 : 5;
}

function foodFor(key: TranslatorPair[], animal: string): string {
  return key.find(k => k.animal === animal)!.food;
}

export const translator: Genre<TranslatorItem, string> & {
  // Forward-looking e2e hook (see components/genres/TranslatorView.tsx and
  // the new-genre common brief): a tap-only speed genre needs no submit step.
  e2e: { kind: "tapOnly" };
} = {
  id: "translator",
  subtest: "Coding",
  domain: "PS",
  kidTitle: "Translator",
  instructions:
    "Look at the key. Every animal has its own food. Look at the big animal, then tap the food it gets. Go as fast as you can.",

  sample() {
    const key = TRANSLATOR_KEY.slice(0, 3);
    return {
      item: { key, animal: TRANSLATOR_KEY[0].animal, lookahead: [key[1].animal, key[2].animal, key[0].animal, key[1].animal] },
      explanation: "The key says the dog gets the meat. So you tap the meat.",
    };
  },

  generate(seed, d) {
    const rng = makeRng(seed * 1000 + d);
    const key = TRANSLATOR_KEY.slice(0, keySizeFor(d));
    const animals = key.map(k => k.animal);
    const animal = rng.pick(animals);
    const lookahead = Array.from({ length: LOOKAHEAD_LEN }, () => rng.pick(animals));
    return { key, animal, lookahead };
  },

  score(item, response) {
    const correct = response !== null && response === foodFor(item.key, item.animal);
    return { points: correct ? 1 : 0, max: 1, correct };
  },

  timing: { kind: "block", ms: SPEED_BLOCK_MS },
  mode: "speedBlock",
  e2e: { kind: "tapOnly" },
};

/** Self-contained HTML/SVG audit card: the key strip, the animal, and the
 * matching food outlined in green (owner decision #14). No React/DOM. */
export function audit(item: TranslatorItem): string {
  const correctFood = foodFor(item.key, item.animal);
  const keyHtml = item.key
    .map(
      k =>
        `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;">` +
        `<span style="font-size:22px;">${k.animal}</span><span style="font-size:22px;">${k.food}</span></div>`
    )
    .join("");
  const lookaheadHtml = item.lookahead
    .map(a => `<span style="font-size:22px;opacity:.4;">${a}</span>`)
    .join("");
  return (
    `<div style="font-family:sans-serif;">` +
    `<div style="display:flex;gap:6px;background:#eef7f6;border-radius:8px;padding:4px 6px;margin-bottom:8px;">${keyHtml}</div>` +
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">` +
    `<span style="font-size:48px;">${item.animal}</span>` +
    `<span style="color:#999;">&rarr;</span>` +
    `<span style="font-size:36px;border:3px solid #6fcf6f;border-radius:8px;padding:2px 6px;">${correctFood}</span>` +
    `</div>` +
    `<div style="font-size:11px;color:#888;margin-bottom:2px;">lookahead:</div>` +
    `<div style="display:flex;gap:4px;">${lookaheadHtml}</div>` +
    `</div>`
  );
}
