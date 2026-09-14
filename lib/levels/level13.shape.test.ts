import { describe, expect, it } from "vitest";
import { startStair, stepStair } from "../engine/staircase";
import { GENRES } from "../genres";
import { genreMaxD } from "../engine/types";
import { LEVELS } from "./index";

// Level 13 "Pip's Treasure Map" (2026-09-14): a flawless run of every block
// must end because it RAN OUT OF ITEMS (reason "maxItems", all progress dots
// filled), never on two misses, and must never serve the step that beat her.
// Drives the real staircase, same as level12.shape.test.ts.
const level13 = LEVELS.find((l) => l.id === 13)!;

// Her live ceilings on 2026-09-14 (GET /api/profile) — easeIn's frontier base.
const CEILING: Record<string, number> = { arithmetic: 15, information: 11, whichTwo: 10, fillTheGap: 9, whatWouldYouDo: 10, swapShop: 9 };
const WALL: Record<string, number> = { arithmetic: 15, information: 12, whichTwo: 5, fillTheGap: 10, whatWouldYouDo: 10, swapShop: 10 };

describe("Level 13 staircase shape (a clean run ends on a win; every block stays below its wall)", () => {
  for (const part of level13.parts) {
    for (const b of part.blocks) {
      it(`${part.id}/${b.genre}: start d${b.start}, ${b.maxItems} items`, () => {
        const stepUp = b.stepUp ?? level13.stepUp ?? 1;
        let s = startStair(b.start as number, b.maxItems!, b.teachingItems ?? level13.teachingItems ?? 0, stepUp, genreMaxD(GENRES[b.genre]), { knownCeiling: CEILING[b.genre] });
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

  it("arithmetic never serves d12, the step that beat her twice in Level 12", () => {
    const b = level13.parts.flatMap((p) => p.blocks).find((x) => x.genre === "arithmetic")!;
    let s = startStair(b.start as number, b.maxItems!, 0, 2, genreMaxD(GENRES.arithmetic), { knownCeiling: CEILING.arithmetic });
    const served: number[] = [];
    while (!s.done) { served.push(s.d); s = stepStair(s, true, false); }
    expect(Math.max(...served)).toBeLessThan(12);
  });

  it("whichTwo: one opening miss is a free teaching item and does not end the block", () => {
    const b = level13.parts.flatMap((p) => p.blocks).find((x) => x.genre === "whichTwo")!;
    let s = startStair(b.start as number, b.maxItems!, b.teachingItems!, 2, genreMaxD(GENRES.whichTwo), { knownCeiling: CEILING.whichTwo });
    s = stepStair(s, false);
    expect(s.done).toBe(false);
    expect(s.d).toBe(3);
    expect(s.consecutiveWrong).toBe(0);
  });
});
