import type { GenreId, SessionRecord } from "./types";

/**
 * Every bankId served for `genre` across her stored sessions, unique, ordered
 * by the LAST time each was served, oldest first.
 *
 * Why (2026-09-12): Fill the Gap kept re-serving the same five items per tier
 * (fg-31, fg-33 and fg-38 four times each) because `excludeBankIds` resets
 * every block. GET /api/state hands this list to the play page as a SOFT avoid
 * list (see GenerateOpts.avoidBankIds). Practice replays count: she saw those
 * words too.
 */
export function servedBankIds(sessions: readonly SessionRecord[], genre: GenreId): string[] {
  const order = [...sessions].sort((a, b) => (a.startedAt < b.startedAt ? -1 : a.startedAt > b.startedAt ? 1 : 0));
  const last = new Map<string, number>();
  let tick = 0;
  for (const s of order) {
    for (const block of s.blocks ?? []) {
      if (block.genre !== genre) continue;
      for (const item of block.items ?? []) {
        if (item.bankId) last.set(item.bankId, tick++);
      }
    }
  }
  return [...last.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id);
}
