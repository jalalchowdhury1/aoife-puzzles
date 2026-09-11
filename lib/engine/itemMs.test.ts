// Pinned after 2026-09-11: the parent dashboard showed a question answered in
// "1789129072.9s" and a lifetime total of "59637731 min". That number is the
// unix epoch in milliseconds — an item clock that never started, recorded as
// `Date.now() - 0`. Both writers are fixed (app/practice/page.tsx starts its
// clock at item mount, app/play/page.tsx pre-seeds startedAtMs), but the
// sessions already stored still carry the bad numbers and are never rewritten.
// So every reader goes through sanitizeMs, and an impossible time reads as
// UNKNOWN — null — not as a number and never as a fabricated 0.
import { describe, it, expect } from "vitest";
import { sanitizeMs, sanitizeSeconds, SANE_MAX_MS } from "./itemMs";

describe("sanitizeMs", () => {
  it("keeps ordinary answer times untouched", () => {
    expect(sanitizeMs(12_345)).toBe(12_345);
    expect(sanitizeMs(1)).toBe(1);
    expect(sanitizeMs(SANE_MAX_MS)).toBe(SANE_MAX_MS);
  });

  it("rejects an epoch timestamp — the exact bug the dashboard showed", () => {
    expect(sanitizeMs(1_789_129_072_900)).toBeNull();
    expect(sanitizeMs(Date.now())).toBeNull();
  });

  it("rejects 0 — the play page's never-started sentinel, not a real answer", () => {
    // A fake 0 is the quiet half of this bug: it reads as the fastest possible
    // answer, so it would set `fast`, trip the rapid-wrong quality flag, and
    // drag the per-genre median that picks her next difficulty.
    expect(sanitizeMs(0)).toBeNull();
  });

  it("rejects negatives, NaN, Infinity and non-numbers", () => {
    expect(sanitizeMs(-5)).toBeNull();
    expect(sanitizeMs(NaN)).toBeNull();
    expect(sanitizeMs(Infinity)).toBeNull();
    expect(sanitizeMs(-Infinity)).toBeNull();
    expect(sanitizeMs(undefined)).toBeNull();
    expect(sanitizeMs(null)).toBeNull();
  });

  it("draws the line exactly at SANE_MAX_MS", () => {
    expect(sanitizeMs(SANE_MAX_MS)).toBe(SANE_MAX_MS);
    expect(sanitizeMs(SANE_MAX_MS + 1)).toBeNull();
  });

  it("keeps the longest real per-item cap (120s) well inside the range", () => {
    expect(sanitizeMs(120_000)).toBe(120_000);
    // The untimed rematch page has no clock; a few minutes is still a real answer.
    expect(sanitizeMs(5 * 60_000)).toBe(5 * 60_000);
  });
});

describe("sanitizeSeconds", () => {
  it("converts believable times to seconds", () => {
    expect(sanitizeSeconds(12_000)).toBe(12);
  });

  it("passes unknown times through as null, never 0", () => {
    expect(sanitizeSeconds(1_789_129_072_900)).toBeNull();
    expect(sanitizeSeconds(0)).toBeNull();
  });
});
