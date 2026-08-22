import type { Genre } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { SPEED_BLOCK_MS } from "../engine/timing";
import { GLYPHS } from "./glyphs";

export interface SymbolSearchItem {
  target: string;
  group: string[]; // 3 distinct glyph ids
  present: boolean;
}

const ALL_IDS = GLYPHS.map(g => g.id);

function twinOf(id: string): string {
  return id.endsWith("1") ? `${id[0]}2` : `${id[0]}1`;
}

function fillDistinct(rng: Rng, group: string[], exclude: Set<string>): string[] {
  const pool = rng.shuffle(ALL_IDS.filter(id => !exclude.has(id)));
  const out = [...group];
  while (out.length < 3) out.push(pool.shift()!);
  return out;
}

export const symbolSearch: Genre<SymbolSearchItem, boolean> = {
  id: "symbolSearch",
  subtest: "Symbol Search",
  domain: "PS",
  kidTitle: "Symbol Hunt",
  instructions:
    "Look at the shape on the left. Is it hiding in the row on the right? Tap yes if it is there, tap no if it is not. Go as fast as you can.",

  sample() {
    return {
      item: { target: "a1", group: ["a1", "e1", "h2"], present: true },
      explanation: "The first shape is also in the row, so the answer is YES.",
    };
  },

  generate(seed) {
    const rng = makeRng(seed);
    const target = rng.pick(ALL_IDS);
    const present = rng.next() < 0.5;
    const twin = twinOf(target);

    let group: string[] = [];
    const exclude = new Set<string>([target]);

    if (present) {
      group = [target];
    } else if (rng.next() < 0.7) {
      group = [twin];
      exclude.add(twin);
    }

    group = fillDistinct(rng, group, exclude);
    group = rng.shuffle(group);

    return { target, group, present };
  },

  score(item, response) {
    const correct = response !== null && response === item.present;
    return { points: correct ? 1 : 0, max: 1, correct };
  },

  timing: { kind: "block", ms: SPEED_BLOCK_MS },
  mode: "speedBlock",
};
