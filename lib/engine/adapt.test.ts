import { describe, expect, it } from "vitest";
import { computeProfile } from "./profile";
import { classifyGenres, adaptPart } from "./adapt";
import { summarize } from "./types";
import type { ItemRecord, SessionRecord, PartConfig, LevelConfig, Difficulty } from "./types";

function itemAt(d: Difficulty): ItemRecord {
  return { idx: 0, seed: 1, d, points: 1, max: 1, correct: true, ms: 1000, timedOut: false, response: 1 };
}

// A profile with WM (digitSpan/pictureSpan, ceiling 3) as the clearly weak
// domain and VS (blockDesign/visualPuzzles, ceiling 8) as the clearly strong
// domain. Only these two domains have data, so their z-scores are exactly
// +-1 (population SD over two points), giving unambiguous weakness/strength
// flags to build the rest of the tests on.
const weakStrongSession: SessionRecord = {
  id: "S1",
  level: 1,
  part: "A",
  startedAt: "2026-08-20T10:00:00.000Z",
  endedAt: "2026-08-20T10:30:00.000Z",
  device: { ua: "t", w: 1, h: 1 },
  complete: true,
  appVersion: "0.1.0",
  blocks: [
    { genre: "digitSpan", mode: "staircase", startedAt: "t", endedAt: "t", items: [itemAt(3)], summary: summarize([itemAt(3)], "staircase") },
    { genre: "pictureSpan", mode: "staircase", startedAt: "t", endedAt: "t", items: [itemAt(3)], summary: summarize([itemAt(3)], "staircase") },
    { genre: "blockDesign", mode: "staircase", startedAt: "t", endedAt: "t", items: [itemAt(8)], summary: summarize([itemAt(8)], "staircase") },
    { genre: "visualPuzzles", mode: "staircase", startedAt: "t", endedAt: "t", items: [itemAt(8)], summary: summarize([itemAt(8)], "staircase") },
  ],
};

const profile = computeProfile([weakStrongSession]);

describe("classifyGenres", () => {
  it("flags every genre in a weak domain as weak", () => {
    const strengths = classifyGenres(profile);
    expect(strengths.digitSpan).toBe("weak");
    expect(strengths.pictureSpan).toBe("weak");
  });

  it("flags every genre in a strong domain (at/above median) as strong", () => {
    const strengths = classifyGenres(profile);
    expect(strengths.blockDesign).toBe("strong");
    expect(strengths.visualPuzzles).toBe("strong");
  });

  it("flags genres with no recorded data as typical", () => {
    const strengths = classifyGenres(profile);
    expect(strengths.matrix).toBe("typical");
    expect(strengths.coding).toBe("typical");
    expect(strengths.similarities).toBe("typical");
  });
});

const remedialLevel: LevelConfig = { id: 2, title: "L2", feedback: "reveal", weighting: "remedial", parts: [] };
const noneLevel: LevelConfig = { id: 2, title: "L2", feedback: "reveal", weighting: "none", parts: [] };

describe("adaptPart", () => {
  const part: PartConfig = {
    id: "A",
    title: "A",
    sticker: "x",
    blocks: [{ genre: "digitSpan" }, { genre: "pictureSpan" }, { genre: "blockDesign" }, { genre: "matrix" }],
  };

  it("remedial: weak genres start lower with more reps, strong genres start near ceiling with fewer reps", () => {
    const resolved = adaptPart(part, remedialLevel, profile);

    const digitSpan = resolved.find((b) => b.genre === "digitSpan" && !b.repeat)!;
    expect(digitSpan.start).toBe(1); // weak: always 1
    expect(digitSpan.maxItems).toBe(10);
    expect(digitSpan.strength).toBe("weak");

    const blockDesign = resolved.find((b) => b.genre === "blockDesign")!;
    expect(blockDesign.start).toBe(6); // strong: ceiling 8 - 2 (practice starts well below her best)
    expect(blockDesign.maxItems).toBe(6);
    expect(blockDesign.strength).toBe("strong");

    const matrix = resolved.find((b) => b.genre === "matrix")!;
    expect(matrix.start).toBe(1); // no ceiling -> 1 regardless of strength
    expect(matrix.maxItems).toBe(8);
    expect(matrix.strength).toBe("typical");
  });

  it("appends one repeat block per weak genre at the end, preserving original order", () => {
    const resolved = adaptPart(part, remedialLevel, profile);

    expect(resolved).toHaveLength(6); // 4 originals + repeats for digitSpan, pictureSpan
    expect(resolved.slice(0, 4).map((b) => b.genre)).toEqual(["digitSpan", "pictureSpan", "blockDesign", "matrix"]);

    const repeats = resolved.slice(4);
    expect(repeats.map((b) => b.genre)).toEqual(["digitSpan", "pictureSpan"]);
    expect(repeats.every((b) => b.repeat)).toBe(true);
    expect(resolved.slice(0, 4).every((b) => !b.repeat)).toBe(true);

    // A repeat carries the same start but is capped at 6 items (keeps a part ~15 min).
    expect(repeats[0].start).toBe(resolved[0].start);
    expect(repeats[0].maxItems).toBe(Math.min(resolved[0].maxItems, 6));
  });

  it("respects an explicit maxItems only as an upper bound in remedial mode", () => {
    const cappedPart: PartConfig = { id: "B", title: "B", sticker: "x", blocks: [{ genre: "digitSpan", maxItems: 5 }] };
    const resolved = adaptPart(cappedPart, remedialLevel, profile);
    expect(resolved[0].maxItems).toBe(5); // min(baseMax 10, explicit 5)
  });

  it("keeps speed genres at start 1 / maxItems 8 in remedial mode, but still repeats when weak", () => {
    // Build a profile where PS (coding/symbolSearch) is the weak domain and
    // VC (similarities/vocabulary) is the strong domain.
    const codingItems: ItemRecord[] = Array.from({ length: 12 }, (_, i) => ({
      idx: i, seed: i, d: 1 as Difficulty, points: 1, max: 1, correct: true, ms: 1000, timedOut: false, response: true,
    }));
    const symbolItems: ItemRecord[] = Array.from({ length: 8 }, (_, i) => ({
      idx: i, seed: i, d: 1 as Difficulty, points: 1, max: 1, correct: true, ms: 1000, timedOut: false, response: true,
    }));
    const simItems: ItemRecord[] = [{ idx: 0, seed: 1, d: 5 as Difficulty, points: 2, max: 2, correct: true, ms: 500, timedOut: false, response: 0 }];
    const vocItems: ItemRecord[] = [{ idx: 0, seed: 1, d: 5 as Difficulty, points: 2, max: 2, correct: true, ms: 500, timedOut: false, response: 0 }];

    const psSession: SessionRecord = {
      id: "S2",
      level: 1,
      part: "B",
      startedAt: "2026-08-20T10:00:00.000Z",
      endedAt: "2026-08-20T10:01:00.000Z",
      device: { ua: "t", w: 1, h: 1 },
      complete: true,
      appVersion: "0.1.0",
      blocks: [
        { genre: "coding", mode: "speedBlock", startedAt: "2026-08-20T10:00:00.000Z", endedAt: "2026-08-20T10:01:00.000Z", items: codingItems, summary: summarize(codingItems, "speedBlock") },
        { genre: "symbolSearch", mode: "speedBlock", startedAt: "2026-08-20T10:00:00.000Z", endedAt: "2026-08-20T10:01:00.000Z", items: symbolItems, summary: summarize(symbolItems, "speedBlock") },
        { genre: "similarities", mode: "staircase", startedAt: "t", endedAt: "t", items: simItems, summary: summarize(simItems, "staircase") },
        { genre: "vocabulary", mode: "staircase", startedAt: "t", endedAt: "t", items: vocItems, summary: summarize(vocItems, "staircase") },
      ],
    };
    const psProfile = computeProfile([psSession]);
    const psPart: PartConfig = { id: "C", title: "C", sticker: "x", blocks: [{ genre: "coding" }, { genre: "symbolSearch" }] };
    const resolved = adaptPart(psPart, remedialLevel, psProfile);

    const originals = resolved.filter((b) => !b.repeat);
    expect(originals).toHaveLength(2);
    for (const b of originals) {
      expect(b.start).toBe(1);
      expect(b.maxItems).toBe(b.repeat ? 6 : 8);
      expect(b.strength).toBe("weak");
    }

    const repeats = resolved.filter((b) => b.repeat);
    expect(repeats.map((b) => b.genre)).toEqual(["coding", "symbolSearch"]);
    for (const b of repeats) {
      expect(b.start).toBe(1);
      expect(b.maxItems).toBe(b.repeat ? 6 : 8);
    }
  });

  it("weighting 'none' resolves start/maxItems without remedial adaptation and adds no repeats", () => {
    const resolved = adaptPart(part, noneLevel, profile);

    expect(resolved).toHaveLength(4); // no repeats appended
    expect(resolved.every((b) => !b.repeat)).toBe(true);

    const digitSpan = resolved.find((b) => b.genre === "digitSpan")!;
    expect(digitSpan.start).toBe(1); // undefined start -> 1
    expect(digitSpan.maxItems).toBe(8); // undefined maxItems -> 8
    expect(digitSpan.strength).toBe("weak"); // classification is still computed
  });

  it("resolves 'fromProfile' and an explicit number the same way in any non-remedial level", () => {
    const fpPart: PartConfig = {
      id: "D",
      title: "D",
      sticker: "x",
      blocks: [{ genre: "blockDesign", start: "fromProfile" }, { genre: "matrix", start: 4 }],
    };
    const resolved = adaptPart(fpPart, noneLevel, profile);
    expect(resolved[0].start).toBe(7); // max(1, ceiling 8 - 1)
    expect(resolved[1].start).toBe(4); // number as given
  });
});

import { SCALE_CHANGES as SC } from "./scale";
describe("rebuilt ramps start from level 1", () => {
  it("a genre measured before its ramp cutover starts at 1 even with a high old ceiling", () => {
    const cut = SC.find(c => c.genre === "visualPuzzles")!.cutover;
    const before = new Date(new Date(cut).getTime() - 3600_000).toISOString();
    const after = new Date(new Date(cut).getTime() + 3600_000).toISOString();
    const mk = (date: string): SessionRecord => ({ id: "01TESTFAKE0000000000000AAA", level: 1, part: "A", startedAt: date, device: { ua: "", w: 1, h: 1 }, complete: true, appVersion: "t", blocks: [
      { genre: "visualPuzzles", mode: "staircase", startedAt: date, endedAt: date, items: [], summary: { attempted: 8, correct: 7, points: 7, max: 8, ceiling: 7, medianMs: 1000, timeouts: 0 } } ] });
    const level: LevelConfig = { id: 2, title: "t", feedback: "reveal", weighting: "remedial", parts: [{ id: "A", title: "A", sticker: "x", blocks: [{ genre: "visualPuzzles", start: "fromProfile" }] }] };
    const startBefore = adaptPart(level.parts[0], level, computeProfile([mk(before)]))[0].start;
    const startAfter = adaptPart(level.parts[0], level, computeProfile([mk(after)]))[0].start;
    expect(startBefore).toBe(1);
    expect(startAfter).toBeGreaterThan(1);
  });
});

describe("BlockConfig.timeScale override (Level 4 time relief)", () => {
  // Bug this prevents: a hand-set block timeScale being ignored on a
  // non-remedial level, so the child still loses top items to the clock.
  it("passes an explicit block timeScale through on a weighting:none level", () => {
    const level = {
      id: 98, title: "t", feedback: "reveal", weighting: "none", stepUp: 2,
      parts: [{ id: "A", title: "t", sticker: "x", blocks: [
        { genre: "arithmetic", start: 7, timeScale: 1.5 },
        { genre: "swapShop", start: 5 },
      ] }],
    } as const;
    const resolved = adaptPart(level.parts[0] as never, level as never, computeProfile([]));
    expect(resolved[0].timeScale).toBe(1.5);
    expect(resolved[1].timeScale).toBe(1);
    expect(resolved[0].start).toBe(7);
    expect(resolved[1].start).toBe(5);
  });
});

describe("ResolvedBlock.knownCeiling (ease-in frontier input, decision #19)", () => {
  // Bug this prevents: the runner's frontier features silently running off a
  // missing/undefined ceiling and treating her whole comfortable range as
  // "record territory" (free misses everywhere).
  it("attaches the measured ceiling on a weighting:none level, null when never played", () => {
    const level = {
      id: 97, title: "t", feedback: "reveal", weighting: "none", stepUp: 2,
      parts: [{ id: "A", title: "t", sticker: "x", blocks: [
        { genre: "swapShop", start: 5 },
      ] }],
    } as const;
    const resolved = adaptPart(level.parts[0] as never, level as never, computeProfile([]));
    expect(resolved[0].knownCeiling).toBeNull();
  });
});
