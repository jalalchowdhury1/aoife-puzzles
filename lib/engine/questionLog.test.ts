// Tests for the All questions archive (2026-08-29). The rules that matter
// here are about what may shape a BASELINE: practice rematches, free frontier
// tries, bails and quality-flagged blocks are all shown, but none of them may
// move her medians or her accuracy (decisions #14 and #23).
import { describe, it, expect } from "vitest";
import { buildQuestionLog, summarize, genreFacets, countsTowardBaseline } from "./questionLog";
import { computeInsights } from "./insights";
import type { SessionRecord, BlockRecord, ItemRecord, GenreId } from "./types";

let seq = 0;
function mkItem(over: Partial<ItemRecord> = {}): ItemRecord {
  seq++;
  return {
    idx: seq, seed: 1000 + seq, d: 5, points: 1, max: 1, correct: true,
    ms: 10_000, timedOut: false, response: 0, ...over,
  };
}
function mkBlock(genre: GenreId, items: ItemRecord[], over: Partial<BlockRecord> = {}): BlockRecord {
  const correct = items.filter(i => i.correct).length;
  return {
    genre, mode: "staircase",
    startedAt: "2026-08-28T12:00:00.000Z", endedAt: "2026-08-28T12:05:00.000Z",
    items,
    summary: {
      attempted: items.length, correct, points: correct, max: items.length,
      ceiling: 5, medianMs: 10_000, timeouts: 0,
    },
    ...over,
  };
}
// A block's OWN startedAt is what ItemDetail.date carries (a part can straddle
// midnight or a scale cutover, so the block time is the precise one). The
// helper therefore stamps blocks with the session's time unless a test says
// otherwise — a session dated the 29th whose blocks claim the 28th is not a
// thing the app can produce, and testing against it would test a fiction.
function mkSession(blocks: BlockRecord[], over: Partial<SessionRecord> = {}): SessionRecord {
  const startedAt = over.startedAt ?? "2026-08-28T12:00:00.000Z";
  return {
    id: `S${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    level: 8, part: "A", endedAt: "2026-08-28T12:10:00.000Z",
    device: { ua: "test", w: 1180, h: 713 }, complete: true, appVersion: "test",
    ...over,
    startedAt,
    blocks: blocks.map(b => ({ ...b, startedAt, endedAt: b.endedAt })),
  };
}

describe("buildQuestionLog", () => {
  it("returns one row per item across every session and block", () => {
    const ins = computeInsights([
      mkSession([mkBlock("information", [mkItem(), mkItem()]), mkBlock("fillTheGap", [mkItem()])]),
      mkSession([mkBlock("whichTwo", [mkItem()])], { part: "B", startedAt: "2026-08-29T12:00:00.000Z" }),
    ]);
    expect(buildQuestionLog(ins)).toHaveLength(4);
  });

  it("orders newest first — what a parent opening the tab wants", () => {
    const ins = computeInsights([
      mkSession([mkBlock("information", [mkItem()])], { startedAt: "2026-08-20T12:00:00.000Z" }),
      mkSession([mkBlock("fillTheGap", [mkItem()])], { part: "B", startedAt: "2026-08-29T12:00:00.000Z" }),
    ]);
    const rows = buildQuestionLog(ins);
    expect(rows[0].genre).toBe("fillTheGap");
    expect(rows[1].genre).toBe("information");
  });

  // Bug this prevents: a flat archive losing block context, so every expanded
  // question past the first in its block replays the WRONG bank entry and
  // silently shows nothing (itemView guard 2). See itemView.test.ts.
  it("carries each item's in-block priorBankIds, and only from its own block", () => {
    const ins = computeInsights([mkSession([
      mkBlock("information", [
        mkItem({ bankId: "in-01" }), mkItem({ bankId: "in-02" }), mkItem({ bankId: "in-03" }),
      ]),
      mkBlock("fillTheGap", [mkItem({ bankId: "ftg-01" })]),
    ])]);
    const rows = buildQuestionLog(ins);
    const info = rows.filter(r => r.genre === "information").sort((a, b) => a.n - b.n);
    expect(info[0].priorBankIds).toEqual([]);
    expect(info[1].priorBankIds).toEqual(["in-01"]);
    expect(info[2].priorBankIds).toEqual(["in-01", "in-02"]);
    // A new block resets it — the exclusion list is per block, not per session.
    expect(rows.find(r => r.genre === "fillTheGap")!.priorBankIds).toEqual([]);
  });

  it("numbers each question by its position in its own block", () => {
    const ins = computeInsights([mkSession([mkBlock("information", [mkItem(), mkItem(), mkItem()])])]);
    expect(buildQuestionLog(ins).map(r => r.n).sort()).toEqual([1, 2, 3]);
  });
});

describe("medians — what may define the baseline", () => {
  it("computes a per-genre-per-difficulty median from counted items", () => {
    const ins = computeInsights([mkSession([mkBlock("information", [
      mkItem({ d: 5, ms: 4_000 }), mkItem({ d: 5, ms: 6_000 }), mkItem({ d: 5, ms: 20_000 }),
    ])])]);
    // median of 4, 6, 20 seconds
    expect(buildQuestionLog(ins)[0].medianSecondsAtD).toBe(6);
  });

  // Decision #23: a rematch of a question she has already seen is faster for
  // a reason that is not ability. It is shown, but it must not drag the
  // baseline it is being compared against.
  it("excludes practice rematches from the median but still shows them, with the real median attached", () => {
    const ins = computeInsights([
      mkSession([mkBlock("information", [mkItem({ d: 5, ms: 20_000 }), mkItem({ d: 5, ms: 20_000 })])]),
      mkSession([mkBlock("information", [mkItem({ d: 5, ms: 1_000 })])],
        { level: 0, part: "P", practice: true, startedAt: "2026-08-29T12:00:00.000Z" }),
    ]);
    const rows = buildQuestionLog(ins);
    const rematch = rows.find(r => r.practice)!;
    expect(rematch.seconds).toBe(1);
    expect(rematch.medianSecondsAtD).toBe(20); // her REAL median, not dragged to 20/1
  });

  it("excludes teaching (free frontier) items and bails from the median", () => {
    const ins = computeInsights([mkSession([mkBlock("information", [
      mkItem({ d: 5, ms: 10_000 }),
      mkItem({ d: 5, ms: 90_000, teaching: true, frontier: true, correct: false, points: 0 }),
      mkItem({ d: 5, ms: 90_000, bailed: true, correct: false, points: 0 }),
    ])])]);
    expect(buildQuestionLog(ins)[0].medianSecondsAtD).toBe(10);
  });

  it("excludes a quality-flagged block from the median", () => {
    const ins = computeInsights([mkSession([
      mkBlock("information", [mkItem({ d: 5, ms: 8_000 })]),
      mkBlock("information", [mkItem({ d: 5, ms: 60_000, timedOut: true, correct: false, points: 0 })],
        { flags: [{ code: "mass-timeouts", detail: "test" }] }),
    ])]);
    const rows = buildQuestionLog(ins);
    const good = rows.find(r => !r.excludedBlock)!;
    expect(good.medianSecondsAtD).toBe(8);
  });

  it("countsTowardBaseline names exactly the four exclusions", () => {
    const base = { practice: false, teaching: false, bailed: false, excludedBlock: false };
    expect(countsTowardBaseline(base)).toBe(true);
    expect(countsTowardBaseline({ ...base, practice: true })).toBe(false);
    expect(countsTowardBaseline({ ...base, teaching: true })).toBe(false);
    expect(countsTowardBaseline({ ...base, bailed: true })).toBe(false);
    expect(countsTowardBaseline({ ...base, excludedBlock: true })).toBe(false);
  });
});

describe("summarize", () => {
  it("reports accuracy over counted questions only, while total counts everything shown", () => {
    const ins = computeInsights([
      mkSession([mkBlock("information", [mkItem({ correct: true }), mkItem({ correct: false, points: 0 })])]),
      mkSession([mkBlock("information", [mkItem({ correct: true })])],
        { level: 0, part: "P", practice: true, startedAt: "2026-08-29T12:00:00.000Z" }),
    ]);
    const s = summarize(buildQuestionLog(ins));
    expect(s.total).toBe(3);        // everything is shown
    expect(s.countedTotal).toBe(2); // the rematch does not count
    expect(s.accuracyPct).toBe(50); // 1 of 2, NOT 2 of 3
    expect(s.practice).toBe(1);
  });

  it("separates wrong, timed out and bailed rather than lumping them", () => {
    const ins = computeInsights([mkSession([mkBlock("information", [
      mkItem({ correct: false, points: 0 }),
      mkItem({ correct: false, points: 0, timedOut: true }),
      mkItem({ correct: false, points: 0, bailed: true }),
    ])])]);
    const s = summarize(buildQuestionLog(ins));
    expect(s.wrong).toBe(1);
    expect(s.timeouts).toBe(1);
    expect(s.bails).toBe(1);
  });

  it("reports the hardest difficulty she actually WON, not merely reached", () => {
    const ins = computeInsights([mkSession([mkBlock("information", [
      mkItem({ d: 7, correct: true }), mkItem({ d: 9, correct: false, points: 0 }),
    ])])]);
    expect(summarize(buildQuestionLog(ins)).topDifficulty).toBe(7);
  });

  it("counts distinct sittings and calendar days", () => {
    const ins = computeInsights([
      mkSession([mkBlock("information", [mkItem()])], { startedAt: "2026-08-28T12:00:00.000Z" }),
      mkSession([mkBlock("information", [mkItem()])], { part: "B", startedAt: "2026-08-28T18:00:00.000Z" }),
      mkSession([mkBlock("information", [mkItem()])], { part: "C", startedAt: "2026-08-29T12:00:00.000Z" }),
    ]);
    const s = summarize(buildQuestionLog(ins));
    expect(s.sessions).toBe(3);
    expect(s.days).toBe(2);
  });

  it("is empty-safe", () => {
    const s = summarize([]);
    expect(s.total).toBe(0);
    expect(s.accuracyPct).toBeNull();
    expect(s.medianSeconds).toBeNull();
    expect(s.topDifficulty).toBeNull();
  });
});

describe("genreFacets", () => {
  it("counts questions per game, biggest first, with the child-facing title", () => {
    const ins = computeInsights([mkSession([
      mkBlock("information", [mkItem(), mkItem(), mkItem()]),
      mkBlock("fillTheGap", [mkItem()]),
    ])]);
    const facets = genreFacets(buildQuestionLog(ins));
    expect(facets[0]).toMatchObject({ genre: "information", count: 3 });
    expect(facets[0].kidTitle).toBeTruthy();
    expect(facets[1]).toMatchObject({ genre: "fillTheGap", count: 1 });
  });
});

describe("correctCounted vs correct — two different populations", () => {
  // Bug this prevents: reporting "725 of 743 counted" where 725 included
  // practice rematches and 743 did not, quietly overstating her accuracy.
  it("never reports all-correct over the counted denominator", () => {
    const ins = computeInsights([
      mkSession([mkBlock("information", [mkItem({ correct: true }), mkItem({ correct: false, points: 0 })])]),
      mkSession([mkBlock("information", [mkItem({ correct: true }), mkItem({ correct: true })])],
        { level: 0, part: "P", practice: true, startedAt: "2026-08-29T12:00:00.000Z" }),
    ]);
    const s = summarize(buildQuestionLog(ins));
    expect(s.correct).toBe(3);         // everything correct that is shown
    expect(s.correctCounted).toBe(1);  // only the non-practice one
    expect(s.countedTotal).toBe(2);
    // The pair the UI actually prints must be internally consistent.
    expect(s.correctCounted).toBeLessThanOrEqual(s.countedTotal);
    expect(s.accuracyPct).toBe((s.correctCounted / s.countedTotal) * 100);
  });

  it("counts the distinct games present so the UI can caveat a mixed median", () => {
    const ins = computeInsights([mkSession([
      mkBlock("information", [mkItem()]), mkBlock("fillTheGap", [mkItem()]), mkBlock("whichTwo", [mkItem()]),
    ])]);
    expect(summarize(buildQuestionLog(ins)).genres).toBe(3);
  });
});
