import { describe, expect, it } from "vitest";
import { practiceQueue } from "./practice";
import type { BlockRecord, ItemRecord, SessionRecord } from "./types";

function item(over: Partial<ItemRecord>): ItemRecord {
  return {
    idx: 0, seed: 1, d: 3, points: 0, max: 1, correct: false,
    ms: 1000, timedOut: false, response: null, ...over,
  };
}

function block(genre: BlockRecord["genre"], items: ItemRecord[]): BlockRecord {
  return {
    genre, mode: "staircase", startedAt: "2026-08-26T10:00:00Z", endedAt: "2026-08-26T10:05:00Z",
    items, summary: { attempted: items.length, correct: 0, points: 0, max: 0, ceiling: null, medianMs: 0, timeouts: 0 },
  };
}

function session(over: Partial<SessionRecord> & { blocks: BlockRecord[] }): SessionRecord {
  return {
    id: "S", level: 7, part: "A", startedAt: "2026-08-26T10:00:00Z",
    device: { ua: "t", w: 0, h: 0 }, complete: true, appVersion: "t", ...over,
  };
}

describe("practiceQueue (decision #23)", () => {
  it("queues a counted miss and a timeout, replayable by (genre, seed, d)", () => {
    const s = session({ blocks: [block("swapShop", [
      item({ seed: 11, d: 4, correct: false }),
      item({ idx: 1, seed: 12, d: 5, correct: false, timedOut: true }),
      item({ idx: 2, seed: 13, d: 4, correct: true, points: 1, max: 1 }),
    ])] });
    const q = practiceQueue([s]);
    expect(q).toEqual([
      { genre: "swapShop", seed: 11, d: 4 },
      { genre: "swapShop", seed: 12, d: 5 },
    ]);
  });

  it("excludes bailed and teaching/frontier items (agency and already-revealed misses)", () => {
    const s = session({ blocks: [block("arithmetic", [
      item({ seed: 1, bailed: true }),
      item({ idx: 1, seed: 2, teaching: true }),
      item({ idx: 2, seed: 3, teaching: true, frontier: true }),
      item({ idx: 3, seed: 4 }),
    ])] });
    expect(practiceQueue([s])).toEqual([{ genre: "arithmetic", seed: 4, d: 3 }]);
  });

  it("excludes speed-block genres and retired replica genres", () => {
    const s = session({ blocks: [
      block("translator", [item({ seed: 1 })]),   // speedBlock mode
      block("figureWeights", [item({ seed: 2 })]), // retired replica
      block("whichTwo", [item({ seed: 3 })]),
    ] });
    expect(practiceQueue([s])).toEqual([{ genre: "whichTwo", seed: 3, d: 3 }]);
  });

  it("clears an item once she answers it correctly in a later practice session", () => {
    const real = session({ blocks: [block("fillTheGap", [item({ seed: 9, d: 6 })])] });
    const practice = session({
      id: "P1", level: 0, part: "P", practice: true, startedAt: "2026-08-27T09:00:00Z",
      blocks: [block("fillTheGap", [item({ seed: 9, d: 6, correct: true, points: 2, max: 2 })])],
    });
    expect(practiceQueue([real])).toHaveLength(1);
    expect(practiceQueue([real, practice])).toHaveLength(0);
  });

  it("a MISS during practice never adds to the queue (only real sessions seed it)", () => {
    const practice = session({
      id: "P1", level: 0, part: "P", practice: true,
      blocks: [block("information", [item({ seed: 42, d: 7 })])],
    });
    expect(practiceQueue([practice])).toHaveLength(0);
  });

  it("dedupes the same missed item across sessions and orders newest-first", () => {
    const older = session({ id: "S1", startedAt: "2026-08-20T10:00:00Z", blocks: [block("whichTwo", [item({ seed: 5, d: 2 })])] });
    const newer = session({ id: "S2", startedAt: "2026-08-26T10:00:00Z", blocks: [
      block("whichTwo", [item({ seed: 5, d: 2 })]),
      block("swapShop", [item({ seed: 6, d: 4 })]),
    ] });
    const q = practiceQueue([older, newer]);
    expect(q).toEqual([
      { genre: "whichTwo", seed: 5, d: 2 },
      { genre: "swapShop", seed: 6, d: 4 },
    ]);
  });

  it("caps the queue", () => {
    const items = Array.from({ length: 40 }, (_, i) => item({ idx: i, seed: 100 + i, d: 3 }));
    const s = session({ blocks: [block("arithmetic", items)] });
    expect(practiceQueue([s])).toHaveLength(30);
    expect(practiceQueue([s], 5)).toHaveLength(5);
  });
});
