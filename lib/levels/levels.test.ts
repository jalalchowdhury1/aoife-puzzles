import { describe, expect, it } from "vitest";
import { GENRES, GENRE_LIST } from "../genres";
import type { GenreId } from "../engine/types";
import { LEVELS } from "./index";

describe("LEVELS registry", () => {
  it("has unique, ascending level ids", () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  for (const level of LEVELS) {
    describe(`Level ${level.id} (${level.title})`, () => {
      it("only references genre ids that exist in the registry", () => {
        for (const part of level.parts) {
          for (const block of part.blocks) {
            expect(Object.keys(GENRES)).toContain(block.genre);
          }
        }
      });

      it("has unique part ids", () => {
        const ids = level.parts.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});

function usesEveryGenreOnce(level: (typeof LEVELS)[number]) {
  const used: GenreId[] = level.parts.flatMap((p) => p.blocks.map((b) => b.genre));
  const counts = new Map<GenreId, number>();
  for (const g of used) counts.set(g, (counts.get(g) ?? 0) + 1);

  for (const g of GENRE_LIST) expect(counts.get(g)).toBe(1);
  expect(used.length).toBe(GENRE_LIST.length);
}

describe("Level 1", () => {
  const level1 = LEVELS.find((l) => l.id === 1)!;

  it("exists in the registry", () => {
    expect(level1).toBeDefined();
  });

  it("is the ungraded diagnostic: no feedback, no remedial weighting", () => {
    expect(level1.feedback).toBe("none");
    expect(level1.weighting).toBeUndefined();
  });

  it("used each of the 13 original (now retired) genres exactly once — kept as history (decision #16)", () => {
    const all = level1.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(all.length).toBe(13);
    expect(new Set(all).size).toBe(13);
  });
});

describe("Level 2 (Practice Round 1)", () => {
  const level2 = LEVELS.find((l) => l.id === 2)!;

  it("exists in the registry, unlocked only after Level 1", () => {
    expect(level2).toBeDefined();
  });

  it("opts into remedial weighting with reveal feedback", () => {
    expect(level2.weighting).toBe("remedial");
    expect(level2.feedback).toBe("reveal");
  });

  it("starts every block 'fromProfile' so adaptPart drives it from her Level 1 profile", () => {
    for (const part of level2.parts) {
      for (const block of part.blocks) {
        expect(block.start, `${part.id}/${block.genre}`).toBe("fromProfile");
      }
    }
  });

  it("covers every genre, and Part D (added 2026-08-23) repeats only the two rebuilt-ramp genres", () => {
    const all = level2.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(new Set(all).size).toBe(13);
    const partD = level2.parts.find((p) => p.id === "D")!;
    expect(partD.blocks.map((b) => b.genre)).toEqual(["visualPuzzles", "figureWeights"]);
    const dupes = all.filter((g, i) => all.indexOf(g) !== i);
    expect(new Set(dupes)).toEqual(new Set(["visualPuzzles", "figureWeights"]));
  });
});

describe("Level 99 (hidden QA level)", () => {
  const levelQa = LEVELS.find((l) => l.id === 99)!;

  it("exists in the registry but is hidden (released: false)", () => {
    expect(levelQa).toBeDefined();
    expect(levelQa.released).toBe(false);
  });

  it("has one part with every genre in GENRE_LIST exactly once", () => {
    expect(levelQa.parts.length).toBe(1);
    usesEveryGenreOnce(levelQa);
  });

  it("caps every block at maxItems: 2", () => {
    for (const block of levelQa.parts[0].blocks) {
      expect(block.maxItems).toBe(2);
    }
  });

  it("shortens only the two speed genres' block window via blockMs", () => {
    for (const block of levelQa.parts[0].blocks) {
      if (GENRES[block.genre].mode === "speedBlock") {
        expect(block.blockMs).toBe(4000);
      } else {
        expect(block.blockMs).toBeUndefined();
      }
    }
  });
});

import { RELEASED_LEVELS } from "./index";
describe("release gating", () => {
  it("levels 1, 3, 4, 7, 8, 9, 10, 11 and 12 are released; Level 2 (replica formats) and levels 5/6 (superseded by doors-only #21 before she played them) are hidden", () => {
    expect(RELEASED_LEVELS.map((l) => l.id)).toEqual([1, 3, 4, 7, 8, 9, 10, 11, 12]);
  });
  it("Level 3 uses every ACTIVE genre exactly once and only active genres", () => {
    const level3 = LEVELS.find((l) => l.id === 3)!;
    const all = level3.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(new Set(all)).toEqual(new Set(GENRE_LIST));
    expect(all.length).toBe(GENRE_LIST.length);
    for (const g of all) expect(GENRES[g].retired).toBeFalsy();
  });

  it("the hidden QA level (99) is never in RELEASED_LEVELS", () => {
    expect(RELEASED_LEVELS.map((l) => l.id)).not.toContain(99);
  });
});

describe("Level 4 (Pip's Power-Ups — owner decision #18)", () => {
  const level4 = LEVELS.find((l) => l.id === 4)!;

  it("exists, is released, and is a single short part", () => {
    expect(level4).toBeDefined();
    expect(level4.released).toBe(true);
    expect(level4.parts).toHaveLength(1);
    expect(level4.parts[0].blocks).toHaveLength(4);
  });

  it("covers exactly the four Level 3 pain points", () => {
    const genres = level4.parts[0].blocks.map((b) => b.genre);
    expect(genres).toEqual(["swapShop", "pictureSudoku", "fireflyBoxes", "arithmetic"]);
  });

  // Bug this prevents: a start above the "30% under the Not-fun peak" rule
  // silently recreating the frustration the level exists to undo.
  it("starts 30% under each Not-fun / timeout peak (rounded down), never above", () => {
    const peaks: Record<string, number> = { swapShop: 8, pictureSudoku: 4, fireflyBoxes: 6, arithmetic: 10 };
    for (const block of level4.parts[0].blocks) {
      const peak = peaks[block.genre];
      expect(typeof block.start).toBe("number");
      expect(block.start as number).toBeLessThanOrEqual(Math.floor(peak * 0.7));
      expect(block.start as number).toBeGreaterThanOrEqual(1);
    }
  });

  it("is win-heavy by construction: stepUp 2, fast lane OFF, ease-in ON, reveal feedback, no teaching items", () => {
    expect(level4.stepUp).toBe(2);
    expect(level4.fastLane).toBe(false);
    expect(level4.easeIn).toBe(true);
    expect(level4.feedback).toBe("reveal");
    expect(level4.teachingItems).toBe(0);
    expect(level4.weighting).toBe("none");
  });

  it("gives Story Sums the 1.5x clock (her d10 losses were timeouts, not maths)", () => {
    const arith = level4.parts[0].blocks.find((b) => b.genre === "arithmetic")!;
    expect(arith.timeScale).toBe(1.5);
  });
});

describe("Level 5 (Pip's Winning Streak — built 2026-08-26 from her Level 4 data)", () => {
  const level5 = LEVELS.find((l) => l.id === 5)!;

  it("exists (unreleased since #21 — she never played it; kept as the Level 7 pin source) with two parts: the promoted Level 4 four, then a victory lap", () => {
    expect(level5).toBeDefined();
    expect(level5.released).toBe(false);
    expect(level5.parts.map((p) => p.id)).toEqual(["A", "B"]);
    expect(level5.parts[0].blocks.map((b) => b.genre)).toEqual([
      "fireflyBoxes", "swapShop", "pictureSudoku", "arithmetic",
    ]);
    expect(level5.parts[1].blocks.map((b) => b.genre)).toEqual([
      "fixPicture", "animalParade", "spotIt", "translator",
    ]);
  });

  it("keeps the decision-#18 win-heavy template: stepUp 2, fast lane OFF, ease-in ON, reveal, no teaching items, hand-pinned weighting", () => {
    expect(level5.stepUp).toBe(2);
    expect(level5.fastLane).toBe(false);
    expect(level5.easeIn).toBe(true);
    expect(level5.feedback).toBe("reveal");
    expect(level5.teachingItems).toBe(0);
    expect(level5.weighting).toBe("none");
  });

  // Bug this prevents: a Part A start creeping up to or past her measured
  // ceiling and recreating the wall the level exists to dissolve. Ceilings
  // as of 2026-08-26 on the CURRENT ramps: fireflyBoxes 7, swapShop 8 (new
  // scale — and the wall band is new d7, so its start must sit below even
  // that), pictureSudoku 4, arithmetic 10. pictureSudoku starts ceiling − 1
  // by design (mid-rebuild: she opened at 2 today and cruised; re-spending
  // win-slots there would slow the build), the rest start 2+ below.
  it("pins every Part A start strictly below her measured ceiling (and Swap Shop below its wall band)", () => {
    const ceilings: Record<string, number> = { fireflyBoxes: 7, swapShop: 8, pictureSudoku: 4, arithmetic: 10 };
    const expected: Record<string, number> = { fireflyBoxes: 5, swapShop: 5, pictureSudoku: 3, arithmetic: 8 };
    for (const block of level5.parts[0].blocks) {
      expect(typeof block.start, block.genre).toBe("number");
      expect(block.start as number, block.genre).toBe(expected[block.genre]);
      expect(block.start as number).toBeLessThan(ceilings[block.genre]);
    }
    // the Swap Shop wall is the first mixed-answer band (new d7): start below the half-step too
    const swap = level5.parts[0].blocks.find((b) => b.genre === "swapShop")!;
    expect(swap.start as number).toBeLessThan(6);
  });

  it("gives Swap Shop and Story Sums the 1.5x clock (both failed on time, not ability — the proven fix)", () => {
    for (const genre of ["swapShop", "arithmetic"]) {
      const block = level5.parts[0].blocks.find((b) => b.genre === genre)!;
      expect(block.timeScale, genre).toBe(1.5);
    }
  });

  it("resolves every Part B start from her live profile (no hand-tuned numbers to go stale)", () => {
    for (const block of level5.parts[1].blocks) {
      expect(block.start, block.genre).toBe("fromProfile");
    }
  });
});

describe("Level 6 (Pip's Explorer Day — the measurement level, 2026-08-26)", () => {
  const level6 = LEVELS.find((l) => l.id === 6)!;

  it("covers exactly the six still-winning (censored-ceiling) genres Level 5 does not touch", () => {
    const genres = level6.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(genres).toEqual([
      "mosaic", "patternTrain",
      "whichTwo", "fillTheGap", "information", "whatWouldYouDo",
    ]);
    // Bug this prevents: re-measuring a genre Level 5 already measures, which
    // would double her reps and stale one of the two measurements.
    const level5 = LEVELS.find((l) => l.id === 5)!;
    const l5genres = new Set(level5.parts.flatMap((p) => p.blocks.map((b) => b.genre)));
    for (const g of genres) expect(l5genres.has(g), g).toBe(false);
  });

  it("every start resolves from her profile so the level cannot go stale before she reaches it", () => {
    for (const part of level6.parts) {
      for (const block of part.blocks) expect(block.start, block.genre).toBe("fromProfile");
    }
  });

  it("is a prober, gently: fast lane ON (default), easeIn ON, stepUp 2, reveal, no teaching items", () => {
    expect(level6.fastLane).toBeUndefined(); // default = on — this level's job is finding ceilings
    expect(level6.easeIn).toBe(true);        // ...made safe by decision #19's free frontier misses
    expect(level6.stepUp).toBe(2);
    expect(level6.feedback).toBe("reveal");
    expect(level6.teachingItems).toBe(0);
    expect(level6.weighting).toBe("none");
    expect(level6.released).toBe(false); // unreleased by #21 before she played it; Level 7B absorbs its verbal probe
  });
});

import { DOOR_GENRES } from "./doors";
describe("Doors-only era (owner decision #21, 2026-08-27)", () => {
  it("DOOR_GENRES is exactly the six Davidson-door genres", () => {
    expect(DOOR_GENRES).toEqual([
      "whichTwo", "fillTheGap", "information", "whatWouldYouDo",
      "arithmetic", "swapShop",
    ]);
  });

  // Bug this prevents: a future level quietly reintroducing a non-door genre
  // and re-spending her sittings on subtests outside the two target doors.
  it("every released level with id >= 7 uses ONLY door genres", () => {
    for (const level of LEVELS) {
      if (level.id < 7 || level.id === 99 || level.released === false) continue;
      for (const part of level.parts) {
        for (const block of part.blocks) {
          expect(DOOR_GENRES, `Level ${level.id} ${part.id}/${block.genre}`).toContain(block.genre);
        }
      }
    }
  });
});

describe("Level 7 (Pip's Dream Team — first doors-only level, decision #21)", () => {
  const level7 = LEVELS.find((l) => l.id === 7)!;

  it("exists, is released, and covers all six door genres exactly once", () => {
    expect(level7).toBeDefined();
    expect(level7.released).toBe(true);
    const all = level7.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(new Set(all)).toEqual(new Set(DOOR_GENRES));
    expect(all.length).toBe(DOOR_GENRES.length);
  });

  it("Part A keeps Level 5A's win-ramp pins and clocks for the two QRI genres", () => {
    const partA = level7.parts[0];
    expect(partA.blocks.map((b) => b.genre)).toEqual(["swapShop", "arithmetic"]);
    const swap = partA.blocks[0];
    const arith = partA.blocks[1];
    expect(swap.start).toBe(5);       // below the new-d7 mixed-answer wall band
    expect(swap.timeScale).toBe(1.5); // her losses there were time, not ability
    expect(arith.start).toBe(8);      // she owns d10 on the longer clock
    expect(arith.timeScale).toBe(1.5);
  });

  it("Part B probes the verbal four fromProfile (absorbing Level 6B)", () => {
    const partB = level7.parts[1];
    expect(partB.blocks.map((b) => b.genre)).toEqual([
      "whichTwo", "fillTheGap", "information", "whatWouldYouDo",
    ]);
    for (const block of partB.blocks) expect(block.start, block.genre).toBe("fromProfile");
  });

  it("keeps the win-heavy template: stepUp 2, fast lane OFF, easeIn ON, reveal, no teaching items, fun on", () => {
    expect(level7.stepUp).toBe(2);
    expect(level7.fastLane).toBe(false);
    expect(level7.easeIn).toBe(true);
    expect(level7.feedback).toBe("reveal");
    expect(level7.teachingItems).toBe(0);
    expect(level7.weighting).toBe("none");
    expect(level7.fun).toBe(true);
  });
});

describe("Level 8 (Pip's Sky Climb — the ceiling-probe level, decision #24)", () => {
  const level8 = LEVELS.find((l) => l.id === 8)!;

  it("exists, is released, and covers all six door genres exactly once", () => {
    expect(level8).toBeDefined();
    expect(level8.released).toBe(true);
    const all = level8.parts.flatMap((p) => p.blocks.map((b) => b.genre));
    expect(new Set(all)).toEqual(new Set(DOOR_GENRES));
    expect(all.length).toBe(DOOR_GENRES.length);
  });

  // Bug this prevents: a probe block quietly reverting to ceiling − 1
  // starts or short blocks, silently re-censoring the very ceilings this
  // level exists to measure.
  it("probes the three censored/capped genres AT her ceiling with long blocks", () => {
    const probes = level8.parts.flatMap((p) => p.blocks).filter((b) => b.start === "fromProfileTop");
    expect(probes.map((b) => b.genre).sort()).toEqual(["arithmetic", "information", "whichTwo"]);
    for (const b of probes) expect(b.maxItems, b.genre).toBe(14);
  });

  // Decision #24 verbatim: "Fast lane for information and fill the gap.
  // The other 2 let it be on the normal way." Bug this prevents: the lane
  // leaking onto a genre the owner explicitly excluded, or the tightened
  // fast bar being dropped so a typical-pace answer counts as "super fast".
  it("fast lane is ON for exactly information and fillTheGap, with a bar below her medians", () => {
    expect(level8.fastLane).toBe(false); // level default OFF; blocks opt in
    const blocks = level8.parts.flatMap((p) => p.blocks);
    for (const b of blocks) {
      if (b.genre === "information") {
        expect(b.fastLane).toBe(true);
        expect(b.fastMs).toBeLessThan(8_600); // her median (2026-08-27)
      } else if (b.genre === "fillTheGap") {
        expect(b.fastLane).toBe(true);
        expect(b.fastMs).toBeLessThan(12_500); // her median (2026-08-27)
      } else {
        expect(b.fastLane, b.genre).toBeUndefined();
        expect(b.fastMs, b.genre).toBeUndefined();
      }
    }
  });

  it("swapShop is a short confirmation block (well characterised at ceiling 8)", () => {
    const swap = level8.parts.flatMap((p) => p.blocks).find((b) => b.genre === "swapShop")!;
    expect(swap.start).toBe("fromProfile");
    expect(swap.maxItems).toBe(6);
    expect(swap.timeScale).toBe(1.5);
  });

  it("keeps the QRI clock: arithmetic on 1.5x (her d10 losses were time, not maths)", () => {
    const arith = level8.parts.flatMap((p) => p.blocks).find((b) => b.genre === "arithmetic")!;
    expect(arith.timeScale).toBe(1.5);
  });

  it("keeps the gentle template: stepUp 2, easeIn ON, reveal, no teaching items, fun on", () => {
    expect(level8.stepUp).toBe(2);
    expect(level8.easeIn).toBe(true);
    expect(level8.feedback).toBe("reveal");
    expect(level8.teachingItems).toBe(0);
    expect(level8.weighting).toBe("none");
    expect(level8.fun).toBe(true);
  });

  it("every part opens easier and closes on the probe (the Level 7 strong-close pattern)", () => {
    for (const part of level8.parts) {
      const last = part.blocks[part.blocks.length - 1];
      expect(["fromProfileTop"]).toContain(last.start);
    }
  });
});

describe("Level 9 (Pip's Record Breakers — built from her completed Level 8)", () => {
  const level9 = LEVELS.find((l) => l.id === 9)!;
  const blocks = () => level9.parts.flatMap((p) => p.blocks);

  it("exists, is released, and covers all six door genres exactly once", () => {
    expect(level9).toBeDefined();
    expect(level9.released).toBe(true);
    const all = blocks().map((b) => b.genre);
    expect(new Set(all)).toEqual(new Set(DOOR_GENRES));
    expect(all.length).toBe(DOOR_GENRES.length);
  });

  // Bug this prevents: shipping the widened d16-20 / d11-15 banks but still
  // starting her UNDER the cap she already cleared, which would spend the
  // whole block re-proving old ground and re-censor the ceiling again — the
  // exact failure Level 8 existed to stop.
  // Part C was re-pointed on 2026-08-30 (decision #29): whichTwo and
  // whatWouldYouDo were re-authored after audits found answer cues, so their
  // recorded ceilings are upper bounds and are re-measured from a low start
  // instead of probed at the top. Arithmetic and fillTheGap keep the probe.
  it("probes the two genres whose ceilings are real AT her ceiling, never under it", () => {
    const probes = blocks().filter((b) => b.start === "fromProfileTop");
    expect(probes.map((b) => b.genre).sort()).toEqual(["arithmetic", "fillTheGap"]);
  });

  it("gives the topped-out arithmetic ladder enough items to reach its NEW top", () => {
    const arith = blocks().find((b) => b.genre === "arithmetic")!;
    // She sits at d15; stepUp 2 needs two items per rung.
    expect(arith.maxItems!).toBeGreaterThanOrEqual((20 - 15) * 2);
  });

  // Bug this prevents: starting a re-authored verbal genre AT a ceiling that
  // was measured on cued items — a wall on item one, block over in two misses,
  // and a false "measured" ceiling written from a bank she never really met.
  it("re-measures whichTwo and whatWouldYouDo from a low hard-pinned start, one rung per win, with room to pass the old ceiling", () => {
    const which = blocks().find((b) => b.genre === "whichTwo")!;
    const wwyd = blocks().find((b) => b.genre === "whatWouldYouDo")!;
    for (const [b, oldCeiling, cap] of [[which, 10, 15], [wwyd, 7, 10]] as const) {
      expect(typeof b.start, b.genre).toBe("number");
      expect(b.start as number, b.genre).toBeLessThanOrEqual(oldCeiling - 3);
      expect(b.stepUp, b.genre).toBe(1);
      // A clean run must be able to climb past the old (cued) ceiling.
      expect((b.start as number) + b.maxItems! - 1, b.genre).toBeGreaterThan(oldCeiling);
      expect(cap).toBeGreaterThanOrEqual(oldCeiling);
    }
  });

  // Decision #18, reinforced by the owner watching her play: "step 12 was
  // too hard". Bug this prevents: leaving Do You Know on the probe treatment
  // it had in Level 8, which would walk her straight back into the item she
  // bailed on.
  it("winds Do You Know down to a win-heavy remedial block that cannot reach d12", () => {
    const info = blocks().find((b) => b.genre === "information")!;
    expect(typeof info.start).toBe("number");
    const start = info.start as number;
    // Roughly 30% below the d12 bail peak, per the decision #18 recipe.
    expect(start).toBeLessThanOrEqual(9);
    expect(start).toBeGreaterThanOrEqual(7);
    // A flawless run at stepUp 2 must land ON her proven d11, not past it.
    const stepUp = info.stepUp ?? level9.stepUp!;
    const topReached = start + Math.floor(info.maxItems! / stepUp) - 1;
    expect(topReached).toBeLessThanOrEqual(11);
    // And the lane it carried in Level 8 is explicitly off here: a remedial
    // block must never sprint her back to the wall she just hit.
    expect(info.fastLane).toBe(false);
  });

  it("keeps the fast lane ON for fillTheGap only, still below her median pace", () => {
    expect(level9.fastLane).toBe(false);
    for (const b of blocks()) {
      if (b.genre === "fillTheGap") {
        expect(b.fastLane).toBe(true);
        expect(b.fastMs).toBeLessThan(12_500); // her median
      } else if (b.genre === "information") {
        expect(b.fastLane).toBe(false); // deliberate, see above
      } else {
        expect(b.fastLane, b.genre).toBeUndefined();
      }
    }
  });

  it("leaves swapShop as a short warm block — it is the one genre with a real measured frontier", () => {
    const swap = blocks().find((b) => b.genre === "swapShop")!;
    expect(swap.start).toBe("fromProfile");
    expect(swap.maxItems).toBe(6);
    expect(swap.timeScale).toBe(1.5);
  });

  it("keeps the QRI clock on Story Sums", () => {
    expect(blocks().find((b) => b.genre === "arithmetic")!.timeScale).toBe(1.5);
  });

  it("keeps the gentle template: stepUp 2, easeIn ON, reveal, no teaching items, fun on", () => {
    expect(level9.stepUp).toBe(2);
    expect(level9.easeIn).toBe(true);
    expect(level9.feedback).toBe("reveal");
    expect(level9.teachingItems).toBe(0);
    expect(level9.weighting).toBe("none");
    expect(level9.fun).toBe(true);
  });
});

describe("Level 10 (Pip's Big Party — win-heavy after three Level 9 Not-fun bails)", () => {
  const level10 = LEVELS.find((l) => l.id === 10)!;
  const blocks = () => level10.parts.flatMap((p) => p.blocks);

  // The step that beat her, per genre, with the session it came from. A
  // bail or a timeout at this step is on record; this level must never be
  // able to serve it. Update ONLY from her real data, never to make a
  // level fit.
  const WALL: Record<string, number> = {
    arithmetic: 15,     // L9A 2026-08-30: miss in 5s, Not fun on item 2
    information: 12,    // L8B 2026-08-28: Not fun at d12 (Jalal: "step 12 was too hard")
    whichTwo: 5,        // L9C 2026-09-02: one item, 76s, Not fun (re-authored bank)
    fillTheGap: 10,     // L9B 2026-08-30: Not fun at d10
    whatWouldYouDo: 10, // L9C 2026-09-02: won d10 but 23-45s per item (its cap)
    swapShop: 10,       // L9A 2026-08-30: 67s timeout at d10
  };

  it("exists, is released, and covers all six door genres exactly once", () => {
    expect(level10).toBeDefined();
    expect(level10.released).toBe(true);
    const all = blocks().map((b) => b.genre);
    expect(new Set(all)).toEqual(new Set(DOOR_GENRES));
    expect(all.length).toBe(DOOR_GENRES.length);
  });

  // Bug this prevents: a block that can climb to the step she bailed at
  // — the exact shape of Level 9, where 5 of 6 blocks ended on a loss.
  // With stepUp s and no fast lane, a flawless N-item block answers its
  // last item at start + floor((N - 1) / s).
  it("no block can reach the step that beat her (the load-bearing rule)", () => {
    for (const b of blocks()) {
      expect(typeof b.start, `${b.genre} start must be hand-pinned`).toBe("number");
      expect(b.maxItems, `${b.genre} maxItems`).toBeDefined();
      const stepUp = b.stepUp ?? level10.stepUp ?? 1;
      const reach = (b.start as number) + Math.floor((b.maxItems! - 1) / stepUp);
      expect(reach, `${b.genre}: start ${b.start} + ${b.maxItems} items reaches d${reach}, wall d${WALL[b.genre]}`).toBeLessThan(WALL[b.genre]);
    }
  });

  // Decision #18 verbatim: "the fast lane is what rushes her to the wall".
  it("fast lane is OFF level-wide and no block turns it on", () => {
    expect(level10.fastLane).toBe(false);
    for (const b of blocks()) {
      expect(b.fastLane, b.genre).not.toBe(true);
      expect(b.fastMs, b.genre).toBeUndefined();
    }
  });

  it("keeps the gentle template: stepUp 2, easeIn ON, reveal, hand-pinned, fun on", () => {
    expect(level10.stepUp).toBe(2);
    expect(level10.easeIn).toBe(true);
    expect(level10.feedback).toBe("reveal");
    expect(level10.teachingItems).toBe(0);
    expect(level10.weighting).toBe("none");
    expect(level10.fun).toBe(true);
    for (const b of blocks()) expect(b.stepUp, b.genre).toBeUndefined();
  });

  it("both timed door genres run the 1.5x clock (her losses there were time, not ability)", () => {
    for (const b of blocks()) {
      if (b.genre === "arithmetic" || b.genre === "swapShop") expect(b.timeScale, b.genre).toBe(1.5);
      else expect(b.timeScale, b.genre).toBeUndefined();
    }
  });

  it("only whichTwo gets teaching items (the bank changed under her, decision #29)", () => {
    for (const b of blocks()) {
      if (b.genre === "whichTwo") expect(b.teachingItems).toBe(2);
      else expect(b.teachingItems, b.genre).toBeUndefined();
    }
  });

  it("each part opens on a genre she bailed on and closes on a confident one", () => {
    const openers = level10.parts.map((p) => p.blocks[0].genre).sort();
    const closers = level10.parts.map((p) => p.blocks[p.blocks.length - 1].genre).sort();
    expect(openers).toEqual(["arithmetic", "swapShop", "whichTwo"]);
    expect(closers).toEqual(["fillTheGap", "information", "whatWouldYouDo"]);
  });
});

describe("Level 11 (Pip's Next Step — climb where flawless, hold where missed; Story Sums probes)", () => {
  const level11 = LEVELS.find((l) => l.id === 11)!;
  const blocks = () => level11.parts.flatMap((p) => p.blocks);

  // Same wall table as Level 10 — Level 10 (2026-09-09, 33/36, zero bails)
  // never reached any wall, so no wall moved. Update ONLY from her data.
  const WALL: Record<string, number> = {
    arithmetic: 15, information: 12, whichTwo: 5, fillTheGap: 10, whatWouldYouDo: 10, swapShop: 10,
  };

  it("exists, is released, and covers all six door genres exactly once", () => {
    expect(level11).toBeDefined();
    expect(level11.released).toBe(true);
    const all = blocks().map((b) => b.genre);
    expect(new Set(all)).toEqual(new Set(DOOR_GENRES));
    expect(all.length).toBe(DOOR_GENRES.length);
  });

  // Decision #31: only Story Sums may pass its wall (owner: "test her
  // limits"), and by exactly one step; every other block stays under.
  it("only the Story Sums probe can pass the step that beat her, and only by one step", () => {
    for (const b of blocks()) {
      expect(typeof b.start, `${b.genre} start must be hand-pinned`).toBe("number");
      const stepUp = b.stepUp ?? level11.stepUp ?? 1;
      const reach = (b.start as number) + Math.floor((b.maxItems! - 1) / stepUp);
      if (b.genre === "arithmetic") expect(reach).toBe(WALL.arithmetic + 1);
      else expect(reach, `${b.genre}: reaches d${reach}, wall d${WALL[b.genre]}`).toBeLessThan(WALL[b.genre]);
    }
  });

  it("climbs only where Level 10 was flawless (arithmetic, whichTwo); every other start equals Level 10's", () => {
    const l10 = LEVELS.find((l) => l.id === 10)!;
    const startOf = (lvl: typeof l10, g: string) => lvl.parts.flatMap((p) => p.blocks).find((b) => b.genre === g)!.start;
    expect(startOf(level11, "arithmetic")).toBe(13);
    expect(startOf(level11, "whichTwo")).toBe(3);
    for (const g of ["information", "fillTheGap", "whatWouldYouDo", "swapShop"]) expect(startOf(level11, g), g).toBe(startOf(l10, g));
  });

  it("keeps the Level 10 machinery: stepUp 2, no fast lane, easeIn, reveal, fun, 1.5x on the timed genres", () => {
    expect(level11.stepUp).toBe(2);
    expect(level11.fastLane).toBe(false);
    expect(level11.easeIn).toBe(true);
    expect(level11.feedback).toBe("reveal");
    expect(level11.fun).toBe(true);
    for (const b of blocks()) {
      if (b.genre === "arithmetic" || b.genre === "swapShop") expect(b.timeScale, b.genre).toBe(1.5);
      else expect(b.timeScale, b.genre).toBeUndefined();
    }
  });

  it("only whichTwo gets a teaching item (one cushion on its first climb)", () => {
    for (const b of blocks()) {
      if (b.genre === "whichTwo") expect(b.teachingItems).toBe(1);
      else expect(b.teachingItems, b.genre).toBeUndefined();
    }
  });
});

describe("Level 12 (Pip's Sky Picnic — stepped back where beaten; climb where flawless; every block under wall)", () => {
  const level12 = LEVELS.find((l) => l.id === 12)!;
  const blocks = () => level12.parts.flatMap((p) => p.blocks);

  const WALL: Record<string, number> = {
    arithmetic: 15, information: 12, whichTwo: 5, fillTheGap: 10, whatWouldYouDo: 10, swapShop: 10,
  };

  it("exists, is released, and covers all six door genres exactly once", () => {
    expect(level12).toBeDefined();
    expect(level12.released).toBe(true);
    const all = blocks().map((b) => b.genre);
    expect(new Set(all)).toEqual(new Set(DOOR_GENRES));
    expect(all.length).toBe(DOOR_GENRES.length);
  });

  it("every block's reach is strictly less than its wall (no probes pass)", () => {
    for (const b of blocks()) {
      expect(typeof b.start, `${b.genre} start must be hand-pinned`).toBe("number");
      const stepUp = b.stepUp ?? level12.stepUp ?? 1;
      const reach = (b.start as number) + Math.floor((b.maxItems! - 1) / stepUp);
      expect(reach, `${b.genre}: reaches d${reach}, wall d${WALL[b.genre]}`).toBeLessThan(WALL[b.genre]);
    }
  });

  it("arithmetic start 11 (stepped back from Level 11's 13); whatWouldYouDo start 8 (climb from Level 11's 7); every other start equals Level 11's", () => {
    const l11 = LEVELS.find((l) => l.id === 11)!;
    const startOf = (lvl: typeof l11, g: string) => lvl.parts.flatMap((p) => p.blocks).find((b) => b.genre === g)!.start;
    expect(startOf(level12, "arithmetic")).toBe(11);
    expect(startOf(level12, "whatWouldYouDo")).toBe(8);
    for (const g of ["information", "whichTwo", "fillTheGap", "swapShop"]) expect(startOf(level12, g), g).toBe(startOf(l11, g));
  });

  it("keeps the Level 11 machinery: stepUp 2, no fast lane, easeIn, reveal, fun, 1.5x on the timed genres", () => {
    expect(level12.stepUp).toBe(2);
    expect(level12.fastLane).toBe(false);
    expect(level12.easeIn).toBe(true);
    expect(level12.feedback).toBe("reveal");
    expect(level12.fun).toBe(true);
    for (const b of blocks()) {
      if (b.genre === "arithmetic" || b.genre === "swapShop") expect(b.timeScale, b.genre).toBe(1.5);
      else expect(b.timeScale, b.genre).toBeUndefined();
    }
  });

  it("only whichTwo gets a teaching item (one cushion on its hold)", () => {
    for (const b of blocks()) {
      if (b.genre === "whichTwo") expect(b.teachingItems).toBe(1);
      else expect(b.teachingItems, b.genre).toBeUndefined();
    }
  });
});
