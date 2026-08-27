import { describe, expect, it } from "vitest";
import { TALK_ITEMS, TALK_AREAS, pickTalkSession, type TalkArea } from "./items";

const DASH_CHARS = ["-", "–", "—"];

describe("Talk with Pip item bank (decision #22)", () => {
  it("has unique ids", () => {
    const ids = TALK_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every area with at least 10 items", () => {
    for (const area of Object.keys(TALK_AREAS) as TalkArea[]) {
      const n = TALK_ITEMS.filter((i) => i.area === area).length;
      expect(n, area).toBeGreaterThanOrEqual(10);
    }
  });

  it("every prompt is a spoken question and every model answer is non-empty and distinct", () => {
    for (const i of TALK_ITEMS) {
      expect(i.prompt.endsWith("?"), i.id).toBe(true);
      expect(i.prompt.length, i.id).toBeLessThanOrEqual(90); // TTS-friendly
      expect(i.model2.trim().length, i.id).toBeGreaterThan(0);
      expect(i.model1.trim().length, i.id).toBeGreaterThan(0);
      expect(i.model2, i.id).not.toBe(i.model1);
    }
  });

  it("never contains a dash character in any spoken or shown string (TTS house rule)", () => {
    for (const i of TALK_ITEMS) {
      for (const s of [i.prompt, i.model2, i.model1]) {
        for (const dash of DASH_CHARS) {
          expect(s.includes(dash), `${i.id}: "${s}"`).toBe(false);
        }
      }
    }
  });

  it("pickTalkSession: retries (best under 2) come first, then unseen, capped", () => {
    const best = { "alike-03": 1 as const, "words-02": 0 as const, "alike-01": 2 as const };
    const session = pickTalkSession(best, 5);
    expect(session).toHaveLength(5);
    expect(session[0].id).toBe("alike-03");
    expect(session[1].id).toBe("words-02");
    // fully-earned items never resurface, unseen fill the rest in bank order
    expect(session.map((i) => i.id)).not.toContain("alike-01");
    expect(session[2].id).toBe("alike-02");
  });

  it("pickTalkSession with no history is simply the first items of the bank", () => {
    const session = pickTalkSession({}, 8);
    expect(session).toHaveLength(8);
    expect(session[0].id).toBe("alike-01");
  });
});
