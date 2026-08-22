import { describe, it, expect } from "vitest";
import { computeProfile } from "./profile";
import { summarize } from "./types";
import type { SessionRecord, ItemRecord } from "./types";

function makeSession(): SessionRecord {
  const matrixItems: ItemRecord[] = [
    { idx: 0, seed: 1, d: 7, points: 1, max: 1, correct: true, ms: 4000, timedOut: false, response: "x" },
  ];
  const blockDesignItems: ItemRecord[] = [
    { idx: 0, seed: 2, d: 3, points: 1, max: 1, correct: true, ms: 3000, timedOut: false, response: "y" },
  ];
  const codingItems: ItemRecord[] = Array.from({ length: 30 }, (_, i) => ({
    idx: i, seed: i, d: 1 as const, points: 1, max: 1, correct: true, ms: 1000, timedOut: false, response: "z",
  }));

  return {
    id: "01FIXTURE",
    level: 1,
    part: "A",
    startedAt: "2026-08-20T10:00:00.000Z",
    endedAt: "2026-08-20T10:40:00.000Z",
    device: { ua: "test", w: 1024, h: 768 },
    complete: true,
    appVersion: "0.1.0",
    blocks: [
      {
        genre: "matrix", mode: "staircase",
        startedAt: "2026-08-20T10:00:00.000Z", endedAt: "2026-08-20T10:05:00.000Z",
        items: matrixItems, summary: summarize(matrixItems, "staircase"),
      },
      {
        genre: "blockDesign", mode: "staircase",
        startedAt: "2026-08-20T10:10:00.000Z", endedAt: "2026-08-20T10:15:00.000Z",
        items: blockDesignItems, summary: summarize(blockDesignItems, "staircase"),
      },
      {
        genre: "coding", mode: "speedBlock",
        startedAt: "2026-08-20T10:30:00.000Z", endedAt: "2026-08-20T10:32:00.000Z",
        items: codingItems, summary: summarize(codingItems, "speedBlock"),
      },
    ],
  };
}

describe("computeProfile", () => {
  const profile = computeProfile([makeSession()]);

  it("computes per-genre ceilings and speed rate", () => {
    expect(profile.genres.matrix?.ceiling).toBe(7);
    expect(profile.genres.blockDesign?.ceiling).toBe(3);
    expect(profile.genres.coding?.perMinute).toBe(15);
  });

  it("rolls genres up into domains present in this session", () => {
    expect(profile.domains.FR.value).toBe(0.7);
    expect(profile.domains.VS.value).toBe(0.3);
    expect(profile.domains.PS.value).toBeCloseTo(15 / 45, 10);
  });

  it("flags relative strengths/weaknesses only across present domains", () => {
    expect(profile.domains.FR.flag).toBe("strength");
    expect(["typical", "weakness"]).toContain(profile.domains.VS.flag);
    // absent domains: n/a and null
    expect(profile.domains.WM.value).toBe(null);
    expect(profile.domains.WM.flag).toBe("n/a");
    expect(profile.domains.VC.value).toBe(null);
    expect(profile.domains.VC.flag).toBe("n/a");
    // exactly the present domains are flagged (not n/a)
    for (const d of ["FR", "VS", "PS"] as const) {
      expect(profile.domains[d].flag).not.toBe("n/a");
      expect(profile.domains[d].value).not.toBe(null);
    }
  });

  it("computes EGAI and CPI bundles from present genres only", () => {
    expect(profile.bundles.egai).toBeCloseTo(0.5, 10);
    expect(profile.bundles.cpi).toBeCloseTo(15 / 45, 10);
  });

  it("records a trend entry per session for each genre", () => {
    expect(profile.genres.matrix?.trend).toEqual([
      { date: "2026-08-20T10:00:00.000Z", ceiling: 7, points: 1, max: 1 },
    ]);
  });
});
