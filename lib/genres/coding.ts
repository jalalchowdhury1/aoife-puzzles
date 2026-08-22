import type { Genre } from "../engine/types";
import { makeRng } from "../engine/rng";
import { SPEED_BLOCK_MS } from "../engine/timing";
import type { Shape } from "./shapes";

export type Mark = "bar" | "dash" | "ring" | "hat" | "cross";

// Fixed key: star -> bar, circle -> dash, triangle -> ring, square -> hat, hexagon -> cross.
export const CODE_KEY: { shape: Shape; mark: Mark }[] = [
  { shape: "star", mark: "bar" },
  { shape: "circle", mark: "dash" },
  { shape: "triangle", mark: "ring" },
  { shape: "square", mark: "hat" },
  { shape: "hexagon", mark: "cross" },
];

const CODE_SHAPES: Shape[] = CODE_KEY.map(k => k.shape);

export interface CodingItem {
  shape: Shape;
  lookahead: Shape[]; // next 4 shapes from the same stream
}

function markFor(shape: Shape): Mark {
  return CODE_KEY.find(k => k.shape === shape)!.mark;
}

export const coding: Genre<CodingItem, Mark> = {
  id: "coding",
  subtest: "Coding",
  domain: "PS",
  kidTitle: "Secret Code",
  instructions:
    "Look at the key at the top. Every shape has its own mark. Look at the shape in the middle, then tap the mark that matches it. Go as fast as you can.",

  sample() {
    return {
      item: { shape: "star", lookahead: ["circle", "triangle", "square", "hexagon"] },
      explanation: "The key says a star gets a straight line. So you tap the straight line.",
    };
  },

  generate(seed) {
    const rng = makeRng(seed);
    const shapes: Shape[] = [];
    for (let i = 0; i < 5; i++) shapes.push(rng.pick(CODE_SHAPES));
    return { shape: shapes[0], lookahead: shapes.slice(1) };
  },

  score(item, response) {
    const correct = response !== null && response === markFor(item.shape);
    return { points: correct ? 1 : 0, max: 1, correct };
  },

  timing: { kind: "block", ms: SPEED_BLOCK_MS },
  mode: "speedBlock",
};
