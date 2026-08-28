import { describe, it, expect } from "vitest";
import {
  BENCHMARKS, benchmarkAt, cumulativeBenchmark, ageYearsAt, measureStatus, ageVerdict, yearsAheadLabel,
} from "./benchmarks";
import { GENRES, GENRE_LIST } from "../genres";
import { genreMaxD } from "./types";
import type { GenreId } from "./types";
import { computeInsights } from "./insights";
import type { SessionRecord, BlockRecord } from "./types";

const SPEED: GenreId[] = ["translator", "spotIt"];

describe("BENCHMARKS coverage", () => {
  it("covers every ACTIVE staircase genre plus retired digitSpan (her strongest WM evidence)", () => {
    for (const g of GENRE_LIST) {
      expect(BENCHMARKS[g], g).toBeDefined();
    }
    expect(BENCHMARKS.digitSpan).toBeDefined();
  });

  it("staircase genres' bands are contiguous from d1 to the genre's own maxD (prevents an unbanded difficulty silently showing nothing)", () => {
    for (const [g, gb] of Object.entries(BENCHMARKS)) {
      if (SPEED.includes(g as GenreId)) continue;
      const maxD = genreMaxD(GENRES[g as GenreId]);
      let next = 1;
      for (const b of gb.bands) {
        expect(b.dMin, `${g} band start`).toBe(next);
        expect(b.dMax).toBeGreaterThanOrEqual(b.dMin);
        next = b.dMax + 1;
      }
      expect(next - 1, `${g} top band must reach maxD`).toBe(maxD);
    }
  });

  it("speed genres carry NO age bands but do carry the no-norm caveat (a fake speed norm would be a false comparison)", () => {
    for (const g of SPEED) {
      expect(BENCHMARKS[g]!.bands).toEqual([]);
      expect(BENCHMARKS[g]!.caveat).toMatch(/No published/);
    }
  });

  it("every band has a concrete skill and a research basis string", () => {
    for (const gb of Object.values(BENCHMARKS)) {
      for (const b of gb.bands) {
        expect(b.skill.length).toBeGreaterThan(5);
        expect(b.basis.length).toBeGreaterThan(5);
      }
    }
  });

  it("age bands are sane: lo >= 2, hi > lo when present", () => {
    for (const gb of Object.values(BENCHMARKS)) {
      for (const b of gb.bands) {
        if (!b.typicalAge) continue;
        expect(b.typicalAge.lo).toBeGreaterThanOrEqual(2);
        if (b.typicalAge.hi !== null) expect(b.typicalAge.hi).toBeGreaterThan(b.typicalAge.lo);
      }
    }
  });
});

describe("lookups", () => {
  it("benchmarkAt finds the band containing d", () => {
    expect(benchmarkAt("pictureSudoku", 1)!.skill).toMatch(/2x2/);
    expect(benchmarkAt("pictureSudoku", 5)!.skill).toMatch(/3x3/);
    expect(benchmarkAt("pictureSudoku", 7)!.skill).toMatch(/4x4/);
    expect(benchmarkAt("translator", 3)).toBeNull();
  });

  it("cumulativeBenchmark returns the strongest band at/below the ceiling, not merely the band at it — fireflyBoxes ceiling 7 (backward-2) must still credit the forward-6 from d6", () => {
    const b = cumulativeBenchmark("fireflyBoxes", 7)!;
    expect(b.skill).toMatch(/6 boxes/);
    expect(b.typicalAge!.lo).toBe(10);
  });

  it("cumulativeBenchmark of a null ceiling is null", () => {
    expect(cumulativeBenchmark("mosaic", null)).toBeNull();
  });
});

describe("ageYearsAt", () => {
  it("computes her age from the 2021-01-11 DOB", () => {
    expect(ageYearsAt("2026-07-11T00:00:00Z")).toBeCloseTo(5.5, 1);
    expect(ageYearsAt("2026-01-11T00:00:00Z")).toBeCloseTo(5.0, 1);
  });
});

describe("ageVerdict", () => {
  it("ahead when her age sits clearly under the band floor (she is doing older kids' material)", () => {
    expect(ageVerdict({ lo: 8, hi: 10 }, 5.6)).toBe("ahead");
  });
  it("age-typical inside the band (with a small grace margin)", () => {
    expect(ageVerdict({ lo: 5, hi: 7 }, 5.6)).toBe("age-typical");
    expect(ageVerdict({ lo: 6, hi: 8 }, 5.8)).toBe("age-typical");
  });
  it("below-band only when she is clearly older than the band's ceiling", () => {
    expect(ageVerdict({ lo: 3, hi: 4 }, 5.6)).toBe("below-band");
    expect(ageVerdict({ lo: 3, hi: null }, 5.6)).toBe("age-typical");
  });
  it("no-anchor for null bands", () => {
    expect(ageVerdict(null, 5.6)).toBe("no-anchor");
  });
});

// ---- measureStatus fixtures -----------------------------------------------

function mkSession(blocks: BlockRecord[]): SessionRecord {
  return {
    id: "s1", level: 5, part: "A", startedAt: "2026-08-26T15:00:00Z",
    device: { ua: "t", w: 1, h: 1 }, complete: true, appVersion: "t", blocks,
  };
}

function mkBlock(genre: GenreId, over: Partial<BlockRecord["summary"]>, items: BlockRecord["items"] = []): BlockRecord {
  return {
    genre, mode: "staircase", startedAt: "2026-08-26T15:01:00Z", endedAt: "2026-08-26T15:05:00Z",
    items, flags: [],
    summary: { attempted: 8, correct: 8, points: 8, max: 8, ceiling: 6, medianMs: 5000, timeouts: 0, ...over },
  };
}

const mkItem = (bailed: boolean) => ({
  idx: 0, seed: 1, d: 5 as const, response: null, points: 0, max: 1, correct: false,
  ms: 1000, timedOut: false, bailed,
});

describe("measureStatus", () => {
  it("still-winning when the last block ran out of items while she kept winning (the recorded ceiling is a FLOOR, not a wall)", () => {
    const ins = computeInsights([mkSession([mkBlock("patternTrain", { attempted: 8, correct: 8, ceiling: 6 })])]);
    expect(measureStatus(ins, "patternTrain")).toBe("still-winning");
  });

  it("measured when real misses ended the block", () => {
    const ins = computeInsights([mkSession([mkBlock("patternTrain", { attempted: 8, correct: 5, ceiling: 4 })])]);
    expect(measureStatus(ins, "patternTrain")).toBe("measured");
  });

  it("bailed when she tapped Not fun — a self-chosen stop, not a measured wall", () => {
    const ins = computeInsights([mkSession([
      mkBlock("fireflyBoxes", { attempted: 6, correct: 5, ceiling: 5 }, [mkItem(true)]),
    ])]);
    expect(measureStatus(ins, "fireflyBoxes")).toBe("bailed");
  });

  it("at-top when the ceiling equals the genre's own maxD — the game ran out of ladder, not her", () => {
    // arithmetic's maxD is 15 since the 2026-08-28 widening (decision #17).
    const ins = computeInsights([mkSession([mkBlock("arithmetic", { attempted: 6, correct: 6, ceiling: 15 })])]);
    expect(measureStatus(ins, "arithmetic")).toBe("at-top");
  });

  it("null with no data for the genre", () => {
    const ins = computeInsights([]);
    expect(measureStatus(ins, "mosaic")).toBeNull();
  });
});

describe("yearsAheadLabel (Davidson tracker)", () => {
  it("no band at all", () => {
    expect(yearsAheadLabel(null, 5.6, "measured")).toBe("—");
  });

  it("clearly ahead, measured: tilde-prefixed whole-year range", () => {
    expect(yearsAheadLabel({ lo: 13, hi: 14 }, 5.6, "measured")).toBe("~7–8 yrs");
  });

  it("clearly ahead but still-winning/at-top: >= prefix since her true ceiling is unmeasured upward", () => {
    expect(yearsAheadLabel({ lo: 8, hi: 10 }, 5.6, "still-winning")).toBe("≥ 2–4 yrs");
    expect(yearsAheadLabel({ lo: 12, hi: null }, 5.6, "at-top")).toBe("≥ 6+ yrs");
  });

  it("gap under a year, even if technically ahead, reads as on-pace rather than a misleading '0 yrs'", () => {
    expect(yearsAheadLabel({ lo: 6, hi: 8 }, 5.6, "measured")).toBe("on pace for her age");
  });

  it("age-typical: on pace, no number", () => {
    expect(yearsAheadLabel({ lo: 5, hi: 7 }, 5.6, "measured")).toBe("on pace for her age");
  });

  it("below-band with a real measured miss: band only, never a 'years behind' framing", () => {
    expect(yearsAheadLabel({ lo: 3, hi: 4 }, 5.6, "measured")).toBe("typical ages 3–4");
    expect(yearsAheadLabel({ lo: 6, hi: 7 }, 9, "measured")).toBe("typical ages 6–7");
  });

  it("below-band but NOT a real measured miss (e.g. bailed) never reads as behind — softens to on-pace", () => {
    expect(yearsAheadLabel({ lo: 3, hi: 4 }, 5.6, "bailed")).toBe("on pace for her age");
  });
});
