import { describe, it, expect } from "vitest";
import { SHAPES, COLORS, shapePath } from "./shapes";

describe("shapes", () => {
  it("shapePath returns a non-empty string for every shape", () => {
    for (const s of SHAPES) {
      const d = shapePath(s, 40);
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    }
  });

  it("COLORS has 6 unique entries", () => {
    expect(COLORS.length).toBe(6);
    expect(new Set(COLORS).size).toBe(6);
  });
});
