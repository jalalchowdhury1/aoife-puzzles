import { describe, it, expect } from "vitest";
import { BADGE_DEFS, computeBadges, newBadges } from "./badges";
import { summarize } from "./types";
import type { BlockRecord, GenreId, ItemRecord, SessionRecord } from "./types";

let uid = 0;
function item(overrides: Partial<ItemRecord> = {}): ItemRecord {
  const idx = overrides.idx ?? uid++;
  return {
    idx, seed: idx, d: 3, points: 1, max: 1, correct: true,
    ms: 2000, timedOut: false, response: "a",
    ...overrides,
  };
}

function block(genre: GenreId, mode: BlockRecord["mode"], items: ItemRecord[], overrides?: Partial<BlockRecord>): BlockRecord {
  return {
    genre, mode,
    startedAt: "2026-08-24T10:00:00.000Z",
    endedAt: "2026-08-24T10:05:00.000Z",
    items,
    summary: summarize(items, mode),
    ...overrides,
  };
}

function session(overrides: Partial<SessionRecord> & { id: string; blocks: BlockRecord[] }): SessionRecord {
  return {
    level: 1, part: "A", startedAt: "2026-08-24T10:00:00.000Z",
    device: { ua: "test", w: 1, h: 1 }, complete: true, appVersion: "0.1.0",
    ...overrides,
  };
}

/** A staircase block whose single item lands at difficulty `d` (correct), giving that block a ceiling of `d`. */
function ceilingBlock(genre: GenreId, d: ItemRecord["d"], overrides?: Partial<BlockRecord>): BlockRecord {
  return block(genre, "staircase", [item({ d, correct: true, points: 1 })], overrides);
}

describe("BADGE_DEFS", () => {
  it("has at least 16 badges, each with a unique id", () => {
    expect(BADGE_DEFS.length).toBeGreaterThanOrEqual(16);
    const ids = BADGE_DEFS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every badge has a non-empty name, emoji, and blurb", () => {
    for (const b of BADGE_DEFS) {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.emoji.length).toBeGreaterThan(0);
      expect(b.blurb.length).toBeGreaterThan(0);
    }
  });

  it("no blurb uses a dash character or a banned word", () => {
    const banned = /\b(wrong|bad|fail|oops|sorry|mistake|incorrect)\b/i;
    for (const b of BADGE_DEFS) {
      expect(b.blurb.includes("-") || b.blurb.includes("–") || b.blurb.includes("—")).toBe(false);
      expect(banned.test(b.blurb)).toBe(false);
    }
  });
});

describe("individual badge tests", () => {
  function defOf(id: string) {
    const def = BADGE_DEFS.find((b) => b.id === id);
    if (!def) throw new Error(`missing badge def: ${id}`);
    return def;
  }

  it("firstSteps: earned at the first complete session", () => {
    const s1 = session({ id: "s1", startedAt: "2026-08-24T10:00:00.000Z", blocks: [ceilingBlock("matrix", 3)] });
    expect(defOf("firstSteps").test([s1])).toBe("2026-08-24T10:00:00.000Z");
    expect(defOf("firstSteps").test([])).toBeNull();
    const incomplete = { ...s1, complete: false };
    expect(defOf("firstSteps").test([incomplete])).toBeNull();
  });

  it("patternDetective / patternMaster: matrix ceiling thresholds", () => {
    const low = session({ id: "s1", blocks: [ceilingBlock("matrix", 5)] });
    const mid = session({ id: "s2", startedAt: "2026-08-25T10:00:00.000Z", blocks: [ceilingBlock("matrix", 6)] });
    const high = session({ id: "s3", startedAt: "2026-08-26T10:00:00.000Z", blocks: [ceilingBlock("matrix", 9)] });

    expect(defOf("patternDetective").test([low])).toBeNull();
    expect(defOf("patternDetective").test([low, mid])).toBe(mid.startedAt);
    expect(defOf("patternMaster").test([low, mid])).toBeNull();
    expect(defOf("patternMaster").test([low, mid, high])).toBe(high.startedAt);
  });

  it("blockBuilder / blockMaster: blockDesign ceiling thresholds", () => {
    const s = session({ id: "s1", blocks: [ceilingBlock("blockDesign", 5)] });
    expect(defOf("blockBuilder").test([s])).toBe(s.startedAt);
    expect(defOf("blockMaster").test([s])).toBeNull();
    const s2 = session({ id: "s2", startedAt: "2026-08-25T10:00:00.000Z", blocks: [ceilingBlock("blockDesign", 8)] });
    expect(defOf("blockMaster").test([s, s2])).toBe(s2.startedAt);
  });

  it("piecePro / pieceWizard: visualPuzzles ceiling thresholds", () => {
    const s = session({ id: "s1", blocks: [ceilingBlock("visualPuzzles", 5)] });
    expect(defOf("piecePro").test([s])).toBe(s.startedAt);
    const s2 = session({ id: "s2", startedAt: "2026-08-25T10:00:00.000Z", blocks: [ceilingBlock("visualPuzzles", 8)] });
    expect(defOf("pieceWizard").test([s, s2])).toBe(s2.startedAt);
  });

  it("balanceBrain: figureWeights ceiling >= 6", () => {
    const s = session({ id: "s1", blocks: [ceilingBlock("figureWeights", 6)] });
    expect(defOf("balanceBrain").test([s])).toBe(s.startedAt);
    const low = session({ id: "s2", blocks: [ceilingBlock("figureWeights", 5)] });
    expect(defOf("balanceBrain").test([low])).toBeNull();
  });

  it("memoryChampion: digitSpan >= 5 OR pictureSpan >= 6", () => {
    const viaDigit = session({ id: "s1", blocks: [ceilingBlock("digitSpan", 5)] });
    expect(defOf("memoryChampion").test([viaDigit])).toBe(viaDigit.startedAt);
    const viaPicture = session({ id: "s2", blocks: [ceilingBlock("pictureSpan", 6)] });
    expect(defOf("memoryChampion").test([viaPicture])).toBe(viaPicture.startedAt);
    const neither = session({ id: "s3", blocks: [ceilingBlock("digitSpan", 4), ceilingBlock("pictureSpan", 5)] });
    expect(defOf("memoryChampion").test([neither])).toBeNull();
  });

  it("speedStar: coding or symbolSearch >= 30 correct per minute", () => {
    // 20 correct in a 40s block (clamped to a 60s minimum) = 20/min, not enough.
    const slowItems = Array.from({ length: 20 }, () => item({ correct: true }));
    const slow = session({
      id: "s1",
      blocks: [block("coding", "speedBlock", slowItems, { startedAt: "2026-08-24T10:00:00.000Z", endedAt: "2026-08-24T10:00:40.000Z" })],
    });
    expect(defOf("speedStar").test([slow])).toBeNull();

    // 30 correct in a 60s block = 30/min, meets the bar.
    const fastItems = Array.from({ length: 30 }, () => item({ correct: true }));
    const fast = session({
      id: "s2",
      startedAt: "2026-08-25T10:00:00.000Z",
      blocks: [block("symbolSearch", "speedBlock", fastItems, { startedAt: "2026-08-25T10:00:00.000Z", endedAt: "2026-08-25T10:01:00.000Z" })],
    });
    expect(defOf("speedStar").test([slow, fast])).toBe(fast.startedAt);
  });

  it("wordWizard: vocabulary ceiling >= 6", () => {
    const s = session({ id: "s1", blocks: [ceilingBlock("vocabulary", 6)] });
    expect(defOf("wordWizard").test([s])).toBe(s.startedAt);
  });

  it("numberNinja: arithmetic ceiling >= 6", () => {
    const s = session({ id: "s1", blocks: [ceilingBlock("arithmetic", 6)] });
    expect(defOf("numberNinja").test([s])).toBe(s.startedAt);
  });

  it("bigThinker: comprehension ceiling >= 8 AND full points in that block", () => {
    const partial = item({ d: 8, correct: true, points: 1, max: 2 });
    const notFull = session({ id: "s1", blocks: [block("comprehension", "staircase", [partial])] });
    expect(defOf("bigThinker").test([notFull])).toBeNull();

    const full = item({ d: 8, correct: true, points: 2, max: 2 });
    const yes = session({ id: "s2", startedAt: "2026-08-25T10:00:00.000Z", blocks: [block("comprehension", "staircase", [full])] });
    expect(defOf("bigThinker").test([notFull, yes])).toBe(yes.startedAt);
  });

  it("threeDaysRunning: dayStreak >= 3 as of that session's own date", () => {
    const s1 = session({ id: "s1", startedAt: "2026-08-20T15:00:00.000Z", blocks: [ceilingBlock("matrix", 1)] });
    const s2 = session({ id: "s2", startedAt: "2026-08-21T15:00:00.000Z", blocks: [ceilingBlock("matrix", 1)] });
    const s3 = session({ id: "s3", startedAt: "2026-08-22T15:00:00.000Z", blocks: [ceilingBlock("matrix", 1)] });
    expect(defOf("threeDaysRunning").test([s1, s2])).toBeNull();
    expect(defOf("threeDaysRunning").test([s1, s2, s3])).toBe(s3.startedAt);
  });

  it("starCollector / starHoarder: cumulative totalStars thresholds", () => {
    const items1 = Array.from({ length: 60 }, () => item({ correct: true, stars: 1 })); // 60 stars
    const s1 = session({ id: "s1", startedAt: "2026-08-20T10:00:00.000Z", blocks: [block("matrix", "staircase", items1)] });
    expect(defOf("starCollector").test([s1])).toBeNull();

    const items2 = Array.from({ length: 50 }, () => item({ correct: true, stars: 1 })); // +50 -> 110 total
    const s2 = session({ id: "s2", startedAt: "2026-08-21T10:00:00.000Z", blocks: [block("matrix", "staircase", items2)] });
    expect(defOf("starCollector").test([s1, s2])).toBe(s2.startedAt);
    expect(defOf("starHoarder").test([s1, s2])).toBeNull();

    const items3 = Array.from({ length: 200 }, () => item({ correct: true, stars: 1 })); // +200 -> 310 total
    const s3 = session({ id: "s3", startedAt: "2026-08-22T10:00:00.000Z", blocks: [block("matrix", "staircase", items3)] });
    expect(defOf("starHoarder").test([s1, s2, s3])).toBe(s3.startedAt);
  });

  it("level1Done: earned once every Level 1 part (A, B, C) has a complete session", () => {
    const a = session({ id: "a", level: 1, part: "A", startedAt: "2026-08-20T10:00:00.000Z", blocks: [ceilingBlock("matrix", 1)] });
    const b = session({ id: "b", level: 1, part: "B", startedAt: "2026-08-21T10:00:00.000Z", blocks: [ceilingBlock("matrix", 1)] });
    const c = session({ id: "c", level: 1, part: "C", startedAt: "2026-08-22T10:00:00.000Z", blocks: [ceilingBlock("matrix", 1)] });
    expect(defOf("level1Done").test([a, b])).toBeNull();
    expect(defOf("level1Done").test([a, b, c])).toBe(c.startedAt);
  });

  it("practiceRoundDone: earned once every Level 2 part (A, B, C, D) has a complete session", () => {
    const parts = ["A", "B", "C", "D"];
    const sessions = parts.map((part, i) =>
      session({ id: `l2-${part}`, level: 2, part, startedAt: `2026-08-2${i + 1}T10:00:00.000Z`, blocks: [ceilingBlock("matrix", 1)] }),
    );
    expect(defOf("practiceRoundDone").test(sessions.slice(0, 3))).toBeNull();
    expect(defOf("practiceRoundDone").test(sessions)).toBe(sessions[3].startedAt);
  });

  it("ceiling-based badges skip blocks excluded by a measurement-quality flag", () => {
    const flagged = ceilingBlock("matrix", 9, { flags: [{ code: "format-not-understood", detail: "test" }] });
    const s = session({ id: "s1", blocks: [flagged] });
    expect(defOf("patternMaster").test([s])).toBeNull();
  });
});

describe("computeBadges", () => {
  it("returns only earned badges, sorted by earnedAt", () => {
    const early = session({ id: "s1", startedAt: "2026-08-20T10:00:00.000Z", blocks: [ceilingBlock("blockDesign", 5)] });
    const late = session({ id: "s2", startedAt: "2026-08-21T10:00:00.000Z", blocks: [ceilingBlock("matrix", 6)] });
    const badges = computeBadges([late, early]); // deliberately out of order
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("firstSteps");
    expect(ids).toContain("blockBuilder");
    expect(ids).toContain("patternDetective");
    const dates = badges.map((b) => b.earnedAt);
    expect(dates).toEqual([...dates].sort());
  });

  it("returns an empty array for no sessions", () => {
    expect(computeBadges([])).toEqual([]);
  });

  it("computeBadges on a realistic mixed session history", () => {
    const sessions: SessionRecord[] = [
      session({ id: "p1a", level: 1, part: "A", startedAt: "2026-08-20T10:00:00.000Z", blocks: [ceilingBlock("blockDesign", 6), ceilingBlock("visualPuzzles", 5), ceilingBlock("matrix", 7), ceilingBlock("figureWeights", 6)] }),
      session({ id: "p1b", level: 1, part: "B", startedAt: "2026-08-20T11:00:00.000Z", blocks: [ceilingBlock("digitSpan", 5), ceilingBlock("pictureSpan", 4), ceilingBlock("arithmetic", 6)] }),
      session({ id: "p1c", level: 1, part: "C", startedAt: "2026-08-20T12:00:00.000Z", blocks: [ceilingBlock("vocabulary", 6), ceilingBlock("similarities", 5), ceilingBlock("information", 5), block("comprehension", "staircase", [item({ d: 8, correct: true, points: 2, max: 2 })])] }),
    ];
    const badges = computeBadges(sessions);
    const ids = badges.map((b) => b.id);
    expect(ids).toContain("firstSteps");
    expect(ids).toContain("level1Done");
    expect(ids).toContain("blockBuilder");
    expect(ids).toContain("patternDetective");
    expect(ids).toContain("piecePro");
    expect(ids).toContain("balanceBrain");
    expect(ids).toContain("memoryChampion");
    expect(ids).toContain("numberNinja");
    expect(ids).toContain("wordWizard");
    expect(ids).toContain("bigThinker");
  });
});

describe("newBadges", () => {
  it("returns badges present after but not before", () => {
    const before = [session({ id: "s1", startedAt: "2026-08-20T10:00:00.000Z", blocks: [ceilingBlock("blockDesign", 5)] })];
    const after = [
      ...before,
      session({ id: "s2", startedAt: "2026-08-21T10:00:00.000Z", blocks: [ceilingBlock("matrix", 6)] }),
    ];
    const diff = newBadges(before, after);
    const ids = diff.map((b) => b.id);
    expect(ids).toContain("patternDetective");
    expect(ids).not.toContain("firstSteps"); // already earned before
    expect(ids).not.toContain("blockBuilder"); // already earned before
  });

  it("returns an empty array when nothing new was earned", () => {
    const sessions = [session({ id: "s1", startedAt: "2026-08-20T10:00:00.000Z", blocks: [ceilingBlock("blockDesign", 5)] })];
    expect(newBadges(sessions, sessions)).toEqual([]);
  });

  it("returns everything as new when going from no history to some history", () => {
    const after = [session({ id: "s1", blocks: [ceilingBlock("blockDesign", 5)] })];
    const diff = newBadges([], after);
    expect(diff.map((b) => b.id)).toEqual(computeBadges(after).map((b) => b.id));
  });
});
