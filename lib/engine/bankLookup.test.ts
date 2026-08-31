import { describe, it, expect } from "vitest";
import { lookupBankItem } from "./bankLookup";

describe("lookupBankItem", () => {
  it("resolves a known information bank id", () => {
    const entry = lookupBankItem("in-01");
    expect(entry).not.toBeNull();
    expect(entry?.genre).toBe("information");
    expect(entry?.prompt).toBe("How many legs does a dog have?");
    expect(entry?.options.find((o) => o.text === "Four")?.points).toBe(1);
    expect(entry?.explanation).toBe("A dog has four legs.");
  });

  it("resolves a known fillTheGap bank id", () => {
    const entry = lookupBankItem("fg-01");
    expect(entry?.genre).toBe("fillTheGap");
    expect(entry?.prompt).toBe("The cat is ___ on the mat and has not opened her eyes since lunch.");
    expect(entry?.emoji).toBe("🐱");
    expect(entry?.options.find((o) => o.text === "sleeping")?.points).toBe(2);
  });

  it("resolves a known whatWouldYouDo bank id", () => {
    const entry = lookupBankItem("wd-01");
    expect(entry?.genre).toBe("whatWouldYouDo");
    expect(entry?.prompt).toContain("ice cream");
  });

  it("resolves a known (retired) similarities bank id", () => {
    const entry = lookupBankItem("si-01");
    expect(entry?.genre).toBe("similarities");
    expect(entry?.prompt).toBe("How are an apple and a banana alike?");
  });

  it("resolves a known (retired) vocabulary bank id", () => {
    const entry = lookupBankItem("vo-01");
    expect(entry?.genre).toBe("vocabulary");
    expect(entry?.prompt).toBe("What is this?");
  });

  it("resolves a known (retired) comprehension bank id", () => {
    const entry = lookupBankItem("co-01");
    expect(entry?.genre).toBe("comprehension");
    expect(entry?.prompt).toContain("wash our hands");
  });

  it("adapts a whichTwo bank id into a prompt built from the four items, and reasons as options", () => {
    const entry = lookupBankItem("wt-01");
    expect(entry).not.toBeNull();
    expect(entry?.genre).toBe("whichTwo");
    expect(entry?.prompt).toBe("Which two belong? apple, banana, car, dog");
    expect(entry?.options.map((o) => o.text)).toEqual(
      expect.arrayContaining(["They are both fruit", "They are both food", "They both grow under the ground"]),
    );
    expect(entry?.options.find((o) => o.text === "They are both fruit")?.points).toBe(2);
    expect(entry?.explanation).toBe("An apple and a banana are both fruit.");
  });

  it("returns null for an arithmetic bank id (templated, no fixed text)", () => {
    expect(lookupBankItem("ar-01")).toBeNull();
  });

  it("returns null for an unknown id", () => {
    expect(lookupBankItem("does-not-exist")).toBeNull();
  });
});
