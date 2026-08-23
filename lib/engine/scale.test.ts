import { describe, it, expect } from "vitest";
import { remapCeiling, remapSession } from "./scale";
import type { SessionRecord } from "./types";
describe("difficulty scale history", () => {
  it("maps pre-cutover Piece Picker and Balance ceilings onto the new ramps", () => {
    expect(remapCeiling("visualPuzzles", "2026-08-22T18:15:00Z", 2)).toBe(6);
    expect(remapCeiling("visualPuzzles", "2026-08-23T12:51:00Z", 3)).toBe(7);
    expect(remapCeiling("figureWeights", "2026-08-22T18:19:00Z", 6)).toBe(7);
    expect(remapCeiling("figureWeights", "2026-08-22T17:09:00Z", 3)).toBe(3);
    expect(remapCeiling("visualPuzzles", "2026-08-22T18:15:00Z", null)).toBe(null);
  });
  it("leaves post-cutover sessions and other genres untouched", () => {
    expect(remapCeiling("visualPuzzles", "2026-08-24T10:00:00Z", 2)).toBe(2);
    expect(remapCeiling("matrix", "2026-08-22T18:15:00Z", 7)).toBe(7);
    const s: SessionRecord = { id: "x", level: 1, part: "A", startedAt: "2026-08-22T18:13:00Z", device: { ua: "", w: 1, h: 1 }, complete: true, appVersion: "t", blocks: [
      { genre: "visualPuzzles", mode: "staircase", startedAt: "", endedAt: "", items: [], summary: { attempted: 4, correct: 2, points: 2, max: 4, ceiling: 2, medianMs: 0, timeouts: 1 } },
      { genre: "matrix", mode: "staircase", startedAt: "", endedAt: "", items: [], summary: { attempted: 8, correct: 7, points: 7, max: 8, ceiling: 7, medianMs: 0, timeouts: 0 } } ] };
    const r = remapSession(s);
    expect(r.blocks[0].summary.ceiling).toBe(6);
    expect(r.blocks[1].summary.ceiling).toBe(7);
  });
});
