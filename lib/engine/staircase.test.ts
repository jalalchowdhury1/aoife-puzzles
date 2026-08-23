import { describe, it, expect } from "vitest";
import { startStair, stepStair } from "./staircase";
describe("staircase", () => {
  it("climbs on correct, holds on wrong, stops after two consecutive wrong", () => {
    let s = startStair(1, 8);
    s = stepStair(s, true);  expect(s.d).toBe(2);
    s = stepStair(s, true);  expect(s.d).toBe(3);
    s = stepStair(s, false); expect(s.d).toBe(3); expect(s.done).toBe(false);
    s = stepStair(s, false); expect(s.done).toBe(true); expect(s.reason).toBe("twoWrong");
    expect(s.ceiling).toBe(2); expect(s.items).toBe(4);
  });
  it("a correct answer resets the wrong counter", () => {
    let s = startStair(1, 8);
    s = stepStair(s, false); s = stepStair(s, true); s = stepStair(s, false);
    expect(s.done).toBe(false);
  });
  it("stops at maxItems and at the top", () => {
    let s = startStair(1, 3);
    s = stepStair(s, true); s = stepStair(s, true); s = stepStair(s, true);
    expect(s.done).toBe(true); expect(s.reason).toBe("maxItems");
    let t = startStair(10, 8); t = stepStair(t, true);
    expect(t.done).toBe(true); expect(t.reason).toBe("topReached"); expect(t.ceiling).toBe(10);
  });
  it("clamps start into 1..10 and fromProfile uses ceiling-1", () => {
    expect(startStair(0, 8).d).toBe(1); expect(startStair(14, 8).d).toBe(10);
    expect(startStair({ fromProfileCeiling: 5 }, 8).d).toBe(4);
    expect(startStair({ fromProfileCeiling: null }, 8).d).toBe(1);
  });

  describe("teachingItems", () => {
    it("wrong answers inside the teaching window don't count toward twoWrong; stops only after two consecutive wrong AFTER the window", () => {
      let s = startStair(1, 8, 2);
      s = stepStair(s, false); expect(s.done).toBe(false); expect(s.consecutiveWrong).toBe(0); expect(s.d).toBe(1);
      s = stepStair(s, false); expect(s.done).toBe(false); expect(s.consecutiveWrong).toBe(0); expect(s.d).toBe(1);
      s = stepStair(s, false); expect(s.done).toBe(false); expect(s.consecutiveWrong).toBe(1);
      s = stepStair(s, false); expect(s.done).toBe(true); expect(s.reason).toBe("twoWrong");
      expect(s.items).toBe(4);
    });

    it("a correct answer inside the teaching window still climbs normally", () => {
      let s = startStair(1, 8, 2);
      s = stepStair(s, false); expect(s.d).toBe(1); expect(s.done).toBe(false);
      s = stepStair(s, true); expect(s.d).toBe(2); expect(s.done).toBe(false); expect(s.consecutiveWrong).toBe(0);
    });

    it("teachingItems: 0 (default) is unchanged from prior behavior", () => {
      let s = startStair(1, 8);
      expect(s.teachingItems).toBe(0);
      s = stepStair(s, false); s = stepStair(s, false);
      expect(s.done).toBe(true); expect(s.reason).toBe("twoWrong");
    });
  });
});

describe("stepUp (slow progression)", () => {
  it("with stepUp 2, difficulty only rises after two correct in a row; a miss resets the streak", () => {
    let s = startStair(3, 10, 0, 2);
    s = stepStair(s, true);  expect(s.d).toBe(3);
    s = stepStair(s, true);  expect(s.d).toBe(4);
    s = stepStair(s, true);  expect(s.d).toBe(4);
    s = stepStair(s, false); expect(s.d).toBe(4); expect(s.done).toBe(false);
    s = stepStair(s, true);  expect(s.d).toBe(4);
    s = stepStair(s, true);  expect(s.d).toBe(5);
    expect(s.ceiling).toBe(4);
  });
  it("stepUp 1 is the old behaviour", () => {
    let s = startStair(1, 8, 0, 1);
    s = stepStair(s, true); expect(s.d).toBe(2);
  });
});

describe("fast lane (ceiling probing while flawless)", () => {
  it("climbs on every fast correct while no miss yet, then falls back to stepUp 2", () => {
    let s = startStair(3, 10, 0, 2);
    s = stepStair(s, true, true);  expect(s.d).toBe(4);   // fast + flawless: immediate climb
    s = stepStair(s, true, true);  expect(s.d).toBe(5);
    s = stepStair(s, true, false); expect(s.d).toBe(5);   // slow correct: fast lane needs fast answers
    s = stepStair(s, true, false); expect(s.d).toBe(6);   // two in a row
    s = stepStair(s, false);       expect(s.d).toBe(6);
    s = stepStair(s, true, true);  expect(s.d).toBe(6);   // after a miss the fast lane is closed
    s = stepStair(s, true, true);  expect(s.d).toBe(7);
  });
  it("fast lane is inactive when stepUp is 1 (diagnostic unchanged)", () => {
    let s = startStair(1, 8, 0, 1);
    s = stepStair(s, true, false); expect(s.d).toBe(2);
  });
});
