import { describe, it, expect } from "vitest";
import { GLYPHS } from "./glyphs";

describe("GLYPHS", () => {
  it("has 20 unique ids and 20 unique path strings", () => {
    expect(GLYPHS.length).toBe(20);
    expect(new Set(GLYPHS.map(g => g.id)).size).toBe(20);
    expect(new Set(GLYPHS.map(g => g.d)).size).toBe(20);
  });

  it("every path is a non-empty string", () => {
    for (const g of GLYPHS) {
      expect(typeof g.d).toBe("string");
      expect(g.d.length).toBeGreaterThan(0);
    }
  });

  it("ids come in twin pairs like a1/a2", () => {
    const byLetter = new Map<string, string[]>();
    for (const { id } of GLYPHS) {
      expect(id).toMatch(/^[a-z][12]$/);
      const letter = id[0];
      const list = byLetter.get(letter) ?? [];
      list.push(id);
      byLetter.set(letter, list);
    }
    expect(byLetter.size).toBe(10);
    for (const [letter, ids] of byLetter) {
      expect(ids.slice().sort()).toEqual([`${letter}1`, `${letter}2`]);
    }
  });
});
