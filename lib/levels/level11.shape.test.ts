import { describe, expect, it } from "vitest";
import { startStair, stepStair } from "../engine/staircase";
import { GENRES } from "../genres";
import { genreMaxD } from "../engine/types";
import { LEVELS } from "./index";

// Level 11 "Pip's Next Step" (spec 2026-09-09): a flawless run of every
// block must end because it RAN OUT OF ITEMS (reason "maxItems", all
// progress dots filled), never on two misses, and must never serve the
// step that beat her. This drives the real staircase rather than
// re-deriving the formula, so a staircase change that alters the climb
// shows up here.
const level11 = LEVELS.find((l) => l.id === 11)!;

// Her live ceilings on 2026-09-09 (GET /api/profile) — what easeIn uses as
// the frontier base for each block.
const CEILING: Record<string, number> = { arithmetic: 15, information: 11, whichTwo: 10, fillTheGap: 9, whatWouldYouDo: 10, swapShop: 9 };
const WALL: Record<string, number> = { arithmetic: 15, information: 12, whichTwo: 5, fillTheGap: 10, whatWouldYouDo: 10, swapShop: 10 };

describe("Level 11 staircase shape (a clean run ends on a win; only the Story Sums probe passes a wall)", () => {
  for (const part of level11.parts) {
    for (const b of part.blocks) {
      it(`${part.id}/${b.genre}: start d${b.start}, ${b.maxItems} items`, () => {
        const stepUp = b.stepUp ?? level11.stepUp ?? 1;
        let s = startStair(b.start as number, b.maxItems!, b.teachingItems ?? level11.teachingItems ?? 0, stepUp, genreMaxD(GENRES[b.genre]), { knownCeiling: CEILING[b.genre] });
        const served: number[] = [];
        while (!s.done) { served.push(s.d); s = stepStair(s, true, false); }
        expect(s.reason).toBe("maxItems");
        expect(served.length).toBe(b.maxItems);
        expect(served[0]).toBe(b.start);
        // Story Sums is the owner-ordered probe (decision #31): it may pass
        // the d15 wall by exactly one step; every other block stays under.
        if (b.genre === "arithmetic") expect(Math.max(...served)).toBe(16);
        else expect(Math.max(...served)).toBeLessThan(WALL[b.genre]);
        expect(s.missed).toBe(false);
      });
    }
  }

  it("whichTwo: one opening miss is a free teaching item and does not end the block", () => {
    const b = level11.parts.flatMap((p) => p.blocks).find((x) => x.genre === "whichTwo")!;
    let s = startStair(b.start as number, b.maxItems!, b.teachingItems!, 2, genreMaxD(GENRES.whichTwo), { knownCeiling: CEILING.whichTwo });
    s = stepStair(s, false);
    expect(s.done).toBe(false);
    expect(s.d).toBe(3);
    expect(s.consecutiveWrong).toBe(0);
  });

  it("arithmetic probe: d16 is above her d15 ceiling, so easeIn gives a free frontier miss there", () => {
    const b = level11.parts[0].blocks[0];
    let s = startStair(b.start as number, b.maxItems!, 0, 2, genreMaxD(GENRES.arithmetic), { knownCeiling: CEILING.arithmetic });
    for (let i = 0; i < 6; i++) s = stepStair(s, true, false);
    expect(s.d).toBe(16);
    s = stepStair(s, false, false);
    expect(s.done).toBe(false);
  });
});
