import { describe, it, expect } from "vitest";
import type { SessionRecord } from "./types";
import { servedBankIds } from "./servedBankIds";

function session(startedAt: string, blocks: { genre: string; ids: (string | undefined)[] }[]): SessionRecord {
  return {
    startedAt,
    blocks: blocks.map((b) => ({ genre: b.genre, items: b.ids.map((bankId) => (bankId ? { bankId } : {})) })),
  } as unknown as SessionRecord;
}

describe("servedBankIds", () => {
  it("returns [] for no sessions", () => {
    expect(servedBankIds([], "fillTheGap")).toEqual([]);
  });

  it("orders ids by LAST serve, oldest first, even when sessions arrive unsorted", () => {
    const s2 = session("2026-09-02T10:00:00.000Z", [{ genre: "fillTheGap", ids: ["fg-2", "fg-1"] }]);
    const s1 = session("2026-09-01T10:00:00.000Z", [{ genre: "fillTheGap", ids: ["fg-1", "fg-3"] }]);
    // fg-3 last seen day 1; fg-2 then fg-1 on day 2.
    expect(servedBankIds([s2, s1], "fillTheGap")).toEqual(["fg-3", "fg-2", "fg-1"]);
  });

  it("ignores other genres and items without a bankId", () => {
    const s = session("2026-09-01T10:00:00.000Z", [
      { genre: "vocabulary", ids: ["vo-1"] },
      { genre: "fillTheGap", ids: [undefined, "fg-9"] },
    ]);
    expect(servedBankIds([s], "fillTheGap")).toEqual(["fg-9"]);
  });

  it("tolerates sessions with no blocks and blocks with no items", () => {
    const bare = { startedAt: "2026-09-01T10:00:00.000Z" } as unknown as SessionRecord;
    const empty = { startedAt: "2026-09-02T10:00:00.000Z", blocks: [{ genre: "fillTheGap" }] } as unknown as SessionRecord;
    expect(servedBankIds([bare, empty], "fillTheGap")).toEqual([]);
  });
});
