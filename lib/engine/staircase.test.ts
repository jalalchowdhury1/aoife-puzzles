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
});
