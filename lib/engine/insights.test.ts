import { describe, it, expect } from "vitest";
import { computeInsights } from "./insights";
import { summarize } from "./types";
import type { BlockRecord, GenreId, ItemRecord, SessionRecord } from "./types";
import type { QualityFlag } from "./quality";
import { GENRE_LIST } from "../genres";

// ---------------------------------------------------------------------------
// fixture helpers (mirrors lib/engine/rewards.test.ts's style)
// ---------------------------------------------------------------------------

function mkItem(p: {
  idx: number; d: number; correct: boolean; seed?: number; points?: number; max?: number;
  ms?: number; timedOut?: boolean; response?: unknown; bankId?: string; fast?: boolean;
  teaching?: boolean; bailed?: boolean; stars?: number;
}): ItemRecord {
  return {
    idx: p.idx,
    seed: p.seed ?? p.idx,
    d: p.d as ItemRecord["d"],
    points: p.points ?? (p.correct ? 1 : 0),
    max: p.max ?? 1,
    correct: p.correct,
    ms: p.ms ?? 3000,
    timedOut: p.timedOut ?? false,
    response: p.response ?? null,
    bankId: p.bankId,
    fast: p.fast,
    teaching: p.teaching,
    bailed: p.bailed,
    stars: p.stars,
  };
}

function mkBlock(
  genre: GenreId,
  mode: "staircase" | "speedBlock",
  items: ItemRecord[],
  overrides?: Partial<BlockRecord>,
): BlockRecord {
  return {
    genre,
    mode,
    startedAt: "2026-08-20T14:00:00.000Z",
    endedAt: "2026-08-20T14:05:00.000Z",
    items,
    summary: summarize(items, mode),
    flags: [],
    ...overrides,
  };
}

function mkSession(overrides: Partial<SessionRecord> & { id: string; blocks: BlockRecord[] }): SessionRecord {
  return {
    level: 1,
    part: "A",
    startedAt: "2026-08-20T14:00:00.000Z",
    endedAt: "2026-08-20T14:30:00.000Z",
    device: { ua: "test", w: 1024, h: 768 },
    complete: true,
    appVersion: "0.1.0",
    ...overrides,
  };
}

const NOT_UNDERSTOOD_FLAG: QualityFlag = {
  code: "format-not-understood",
  detail: "First two items missed at difficulty <= 2 - the format may not have been understood.",
};

// ---------------------------------------------------------------------------
// fixture sessions
// ---------------------------------------------------------------------------

// Session 1 (2026-08-20): swapShop mastered-d5/struggled-d6/bailed-d7,
// an excluded mosaic block, a translator speed run, one missed information
// item, one missed whichTwo item, and a fixPicture ceiling of 3 (for the
// deltas test below).
const swapShopBlock = mkBlock(
  "swapShop",
  "staircase",
  [
    mkItem({ idx: 0, d: 5, correct: true }),
    mkItem({ idx: 1, d: 5, correct: true }),
    mkItem({ idx: 2, d: 6, correct: false }),
    mkItem({ idx: 3, d: 6, correct: false }),
    mkItem({ idx: 4, d: 7, correct: false, bailed: true }),
  ],
  { startedAt: "2026-08-20T14:00:00.000Z", endedAt: "2026-08-20T14:03:00.000Z" },
);

// This block would score a ceiling of 3 if it counted — it must NOT, because
// it carries an excluding flag (format-not-understood).
const excludedMosaicBlock = mkBlock(
  "mosaic",
  "staircase",
  [
    mkItem({ idx: 0, d: 1, correct: false }),
    mkItem({ idx: 1, d: 1, correct: false }),
    mkItem({ idx: 2, d: 3, correct: true }),
  ],
  {
    startedAt: "2026-08-20T14:10:00.000Z",
    endedAt: "2026-08-20T14:13:00.000Z",
    flags: [NOT_UNDERSTOOD_FLAG],
  },
);

const translatorSpeedItems: ItemRecord[] = Array.from({ length: 20 }, (_, i) =>
  mkItem({ idx: i, d: 1, correct: i < 18 }),
);
const translatorBlock = mkBlock("translator", "speedBlock", translatorSpeedItems, {
  startedAt: "2026-08-20T14:20:00.000Z",
  endedAt: "2026-08-20T14:21:00.000Z", // exactly 60s -> 1.0 minute
});

// seed=100/d=1 regenerates information's "in-01" ("How many legs does a dog
// have?") with shuffled options [Four(1), Six(0), Eight(0), Two(0)] — index 1
// ("Six") is the wrong pick recorded below. Verified against the real
// information.generate(100, 1) output.
const informationBlock = mkBlock(
  "information",
  "staircase",
  [mkItem({ idx: 0, seed: 100, d: 1, correct: false, points: 0, max: 1, response: 1, bankId: "in-01" })],
  { startedAt: "2026-08-20T14:30:00.000Z", endedAt: "2026-08-20T14:31:00.000Z" },
);

// seed=200/d=1 regenerates whichTwo's "wt-02" with shuffled items
// [sock, tree, shoe, spoon] and the true pair [0,2] (sock+shoe). The
// recorded wrong pick below is [1,3] (tree+spoon). Verified against the real
// whichTwo.generate(200, 1) output.
const whichTwoBlock = mkBlock(
  "whichTwo",
  "staircase",
  [
    mkItem({
      idx: 0, seed: 200, d: 1, correct: false, points: 0, max: 2,
      response: { pair: [1, 3], reason: 0 }, bankId: "wt-02",
    }),
  ],
  { startedAt: "2026-08-20T14:40:00.000Z", endedAt: "2026-08-20T14:41:00.000Z" },
);

const fixPictureBlockD3 = mkBlock("fixPicture", "staircase", [mkItem({ idx: 0, d: 3, correct: true })], {
  startedAt: "2026-08-20T14:50:00.000Z",
  endedAt: "2026-08-20T14:51:00.000Z",
});

// A retired genre (decision #16) she actually played once, back in her
// Level 1 diagnostic — should still surface in skills/matrix, after every
// active genre.
const digitSpanBlock = mkBlock("digitSpan", "staircase", [mkItem({ idx: 0, d: 1, correct: true })], {
  startedAt: "2026-08-20T15:00:00.000Z",
  endedAt: "2026-08-20T15:01:00.000Z",
});

const session1 = mkSession({
  id: "S1",
  startedAt: "2026-08-20T14:00:00.000Z",
  endedAt: "2026-08-20T15:02:00.000Z",
  blocks: [
    swapShopBlock, excludedMosaicBlock, translatorBlock, informationBlock, whichTwoBlock,
    fixPictureBlockD3, digitSpanBlock,
  ],
});

// Session 2 (2026-08-21): swapShop ceiling improves 5 -> 8.
const session2 = mkSession({
  id: "S2",
  startedAt: "2026-08-21T14:00:00.000Z",
  endedAt: "2026-08-21T14:05:00.000Z",
  blocks: [
    mkBlock("swapShop", "staircase", [mkItem({ idx: 0, d: 8, correct: true })], {
      startedAt: "2026-08-21T14:00:00.000Z",
      endedAt: "2026-08-21T14:02:00.000Z",
    }),
  ],
});

// Session 3 (2026-08-22): fixPicture ceiling improves 3 -> 6 (most recent).
const session3 = mkSession({
  id: "S3",
  startedAt: "2026-08-22T14:00:00.000Z",
  endedAt: "2026-08-22T14:05:00.000Z",
  blocks: [
    mkBlock("fixPicture", "staircase", [mkItem({ idx: 0, d: 6, correct: true })], {
      startedAt: "2026-08-22T14:00:00.000Z",
      endedAt: "2026-08-22T14:02:00.000Z",
    }),
  ],
});

// Session 4 (2026-08-19T02:30Z == 2026-08-18 22:30 EDT): the UTC-midnight
// engagement bucketing case — this block's UTC calendar date is 08-19 but
// its America/New_York calendar date is 08-18.
const session4 = mkSession({
  id: "S4",
  startedAt: "2026-08-19T02:30:00.000Z",
  endedAt: "2026-08-19T02:36:00.000Z",
  blocks: [
    // A different genre than the deltas fixtures (swapShop/fixPicture) so
    // this doesn't add an extra ceiling-change event to that test.
    mkBlock("arithmetic", "staircase", [mkItem({ idx: 0, d: 1, correct: true })], {
      startedAt: "2026-08-19T02:30:00.000Z",
      endedAt: "2026-08-19T02:35:00.000Z", // 5 minutes
    }),
  ],
});

const allSessions = [session1, session2, session3, session4];

// ---------------------------------------------------------------------------

describe("computeInsights", () => {
  const insights = computeInsights(allSessions);
  const swapShop = insights.skills.find((s) => s.genre === "swapShop")!;
  const mosaic = insights.skills.find((s) => s.genre === "mosaic")!;
  const translator = insights.skills.find((s) => s.genre === "translator")!;
  const information = insights.skills.find((s) => s.genre === "information")!;
  const whichTwo = insights.skills.find((s) => s.genre === "whichTwo")!;
  const fixPicture = insights.skills.find((s) => s.genre === "fixPicture")!;

  it("marks a difficulty mastered at >=2 non-teaching correct", () => {
    const d5 = swapShop.perDifficulty.find((p) => p.d === 5)!;
    expect(d5.attempts).toBe(2);
    expect(d5.correct).toBe(2);
    expect(d5.mastered).toBe(true);
    const matrixSwapShop = insights.matrix.find((m) => m.genre === "swapShop")!;
    expect(matrixSwapShop.cells[4]).toEqual({ status: "mastered", attempts: 2, correct: 2 });
  });

  it("marks a difficulty struggled at 0 correct across >=2 attempts", () => {
    const d6 = swapShop.perDifficulty.find((p) => p.d === 6)!;
    expect(d6.attempts).toBe(2);
    expect(d6.correct).toBe(0);
    expect(d6.mastered).toBe(false);
    const matrixSwapShop = insights.matrix.find((m) => m.genre === "swapShop")!;
    expect(matrixSwapShop.cells[5]).toEqual({ status: "struggled", attempts: 2, correct: 0 });
  });

  it("counts a bailed item in bails but never as a struggled attempt", () => {
    expect(swapShop.bails).toBe(1);
    const d7 = swapShop.perDifficulty.find((p) => p.d === 7)!;
    expect(d7.attempts).toBe(0); // the bailed item is skipped entirely here
    const matrixSwapShop = insights.matrix.find((m) => m.genre === "swapShop")!;
    expect(matrixSwapShop.cells[6]).toEqual({ status: "unreached", attempts: 0, correct: 0 });
    // but it still shows up in the full chronological item log
    expect(swapShop.items.some((i) => i.d === 7 && i.bailed)).toBe(true);
  });

  it("excludes a flagged block from ceiling/matrix without dropping its items", () => {
    expect(mosaic.ceiling).toBeNull(); // the only mosaic block ever played is excluded
    expect(mosaic.excludedBlocks).toBe(1);
    expect(mosaic.ceilingDates).toEqual([{ date: "2026-08-20T14:10:00.000Z", ceiling: 3, excluded: true }]);
    expect(mosaic.flags).toEqual([
      { date: "2026-08-20T14:10:00.000Z", code: "format-not-understood", detail: NOT_UNDERSTOOD_FLAG.detail },
    ]);
    const matrixMosaic = insights.matrix.find((m) => m.genre === "mosaic")!;
    expect(matrixMosaic.cells[2]).toEqual({ status: "unreached", attempts: 0, correct: 0 }); // d3's correct item is excluded
    expect(mosaic.items).toHaveLength(3);
    expect(mosaic.items.every((i) => i.excludedBlock)).toBe(true);
  });

  it("computes a speed run's perMinute/accuracy and bestPerMinute", () => {
    expect(translator.speed).toBeDefined();
    expect(translator.speed!.runs).toEqual([{ date: "2026-08-20T14:20:00.000Z", perMinute: 18, accuracy: 0.9 }]);
    expect(translator.speed!.bestPerMinute).toBe(18);
    expect(translator.fastRate).toBeNull(); // fastRate is staircase-only
  });

  it("resolves a missed choice-genre bank item's herPick via a real generate", () => {
    expect(information.missedBankItems).toEqual([
      { date: "2026-08-20T14:30:00.000Z", bankId: "in-01", herPick: "Six", d: 1 },
    ]);
  });

  it("resolves a missed Which Two Belong pick as 'picked <a> + <b>' via a real generate", () => {
    expect(whichTwo.missedBankItems).toEqual([
      { date: "2026-08-20T14:40:00.000Z", bankId: "wt-02", herPick: "picked tree + spoon", d: 1 },
    ]);
  });

  it("orders ceiling-change deltas most-recent-first across genres", () => {
    const relevant = insights.deltas.filter((d) => d.genre === "swapShop" || d.genre === "fixPicture");
    expect(relevant).toEqual([
      { genre: "fixPicture", kidTitle: fixPicture.kidTitle, from: 3, to: 6, when: "2026-08-22T14:00:00.000Z" },
      { genre: "swapShop", kidTitle: swapShop.kidTitle, from: 5, to: 8, when: "2026-08-21T14:00:00.000Z" },
      { genre: "fixPicture", kidTitle: fixPicture.kidTitle, from: null, to: 3, when: "2026-08-20T14:50:00.000Z" },
      { genre: "swapShop", kidTitle: swapShop.kidTitle, from: null, to: 5, when: "2026-08-20T14:00:00.000Z" },
    ]);
    // strictly descending by `when`
    for (let i = 1; i < insights.deltas.length; i++) {
      expect(insights.deltas[i - 1].when >= insights.deltas[i].when).toBe(true);
    }
  });

  it("buckets engagement by her America/New_York calendar date, not UTC", () => {
    // session4's block is 2026-08-19T02:30Z..02:36Z UTC == 2026-08-18 22:30..22:36 EDT.
    const aug18 = insights.engagement.byDate.find((d) => d.date === "2026-08-18");
    expect(aug18).toEqual({ date: "2026-08-18", minutes: 5, items: 1, bails: 0, stars: expect.any(Number) });
    expect(insights.engagement.byDate.find((d) => d.date === "2026-08-19")).toBeUndefined();
  });

  it("derives dayStreakEnd from the data, ending the day of the latest session, skipping a real gap", () => {
    // generatedAt = session3's endedAt (2026-08-22T14:05Z, NY date 2026-08-22).
    // Complete NY dates: 08-20, 08-21, 08-22 (consecutive) and 08-18 (a gap
    // before 08-19, which was never played) — the streak must stop at 08-20,
    // never wrap through the gap, but the reported end is simply the latest day.
    expect(insights.generatedAt).toBe("2026-08-22T14:05:00.000Z");
    expect(insights.totals.dayStreakEnd).toBe("2026-08-22");
  });

  it("is deterministic (no Date.now, no wall-clock dependence)", () => {
    const again = computeInsights(allSessions);
    expect(JSON.stringify(again)).toBe(JSON.stringify(insights));
  });

  it("lists every active genre (GENRE_LIST order) before any retired genre, and only retired genres with data", () => {
    const ids = insights.skills.map((s) => s.genre);
    const firstRetiredIdx = insights.skills.findIndex((s) => s.retired);
    // every active genre appears, in GENRE_LIST order, before the first retired entry.
    expect(ids.slice(0, firstRetiredIdx)).toEqual(GENRE_LIST);
    // digitSpan (retired) was played once in the fixtures, so it appears...
    expect(ids).toContain("digitSpan");
    expect(insights.skills.find((s) => s.genre === "digitSpan")!.retired).toBe(true);
    // ...but a retired genre never played at all (e.g. coding) does not.
    expect(ids).not.toContain("coding");
  });

  it("rolls domains and bundles up via computeProfile", () => {
    expect(insights.domains.map((d) => d.domain)).toEqual(["VS", "FR", "WM", "PS", "VC"]);
    expect(insights.domains.find((d) => d.domain === "FR")!.label).toBe("Fluid Reasoning");
    expect(insights.bundles).toEqual(expect.objectContaining({ egai: expect.anything(), cpi: expect.anything() }));
  });

  it("produces one timeline entry per session in chronological order", () => {
    expect(insights.timeline.map((t) => t.sessionId)).toEqual(["S4", "S1", "S2", "S3"]);
    const s1 = insights.timeline.find((t) => t.sessionId === "S1")!;
    expect(s1.blocks.find((b) => b.genre === "mosaic")!.excluded).toBe(true);
  });
});
