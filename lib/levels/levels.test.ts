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
  it("levels 1, 3, 4 and 7 are released; Level 2 (replica formats) and levels 5/6 (superseded by doors-only #21 before she played them) are hidden", () => {
    expect(RELEASED_LEVELS.map((l) => l.id)).toEqual([1, 3, 4, 7]);
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
