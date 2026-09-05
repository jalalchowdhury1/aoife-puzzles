import { describe, expect, it } from "vitest";
import { startStair, stepStair } from "../engine/staircase";
import { GENRES } from "../genres";
import { genreMaxD } from "../engine/types";
import { LEVELS } from "./index";

// Level 10 "Pip's Big Party" (spec 2026-09-05): a flawless run of every
// block must end because it RAN OUT OF ITEMS (reason "maxItems", all
// progress dots filled), never on two misses, and must never serve the
// step that beat her. This drives the real staircase rather than
// re-deriving the formula, so a staircase change that alters the climb
// shows up here.
const level10 = LEVELS.find((l) => l.id === 10)!;

// Her live ceilings on 2026-09-05 (GET /api/profile) — what easeIn uses as
// the frontier base for each block.
const CEILING: Record<string, number> = { arithmetic: 15, information: 11, whichTwo: 10, fillTheGap: 9, whatWouldYouDo: 10, swapShop: 9 };
const WALL: Record<string, number> = { arithmetic: 15, information: 12, whichTwo: 5, fillTheGap: 10, whatWouldYouDo: 10, swapShop: 10 };

describe("Level 10 staircase shape (a clean run ends on a win, below her wall)", () => {
  for (const part of level10.parts) {
    for (const b of part.blocks) {
      it(`${part.id}/${b.genre}: start d${b.start}, ${b.maxItems} items`, () => {
        const stepUp = b.stepUp ?? level10.stepUp ?? 1;
        let s = startStair(b.start as number, b.maxItems!, b.teachingItems ?? level10.teachingItems ?? 0, stepUp, genreMaxD(GENRES[b.genre]), { knownCeiling: CEILING[b.genre] });
        const served: number[] = [];
        while (!s.done) { served.push(s.d); s = stepStair(s, true, false); }
        expect(s.reason).toBe("maxItems");
        expect(served.length).toBe(b.maxItems);
        expect(served[0]).toBe(b.start);
        expect(Math.max(...served)).toBeLessThan(WALL[b.genre]);
        expect(s.missed).toBe(false);
      });
    }
  }

  it("whichTwo: two opening misses are free teaching items and do not end the block", () => {
    const b = level10.parts.flatMap((p) => p.blocks).find((x) => x.genre === "whichTwo")!;
    let s = startStair(b.start as number, b.maxItems!, b.teachingItems!, 2, genreMaxD(GENRES.whichTwo), { knownCeiling: CEILING.whichTwo });
    s = stepStair(s, false); s = stepStair(s, false);
    expect(s.done).toBe(false);
    expect(s.d).toBe(2);
    expect(s.consecutiveWrong).toBe(0);
  });
});
