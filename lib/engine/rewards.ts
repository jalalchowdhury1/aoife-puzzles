// STUB — a real engine worker is building this module in a parallel worktree
// (see the "fun layer" brief, 2026-08-23) and will replace this file at
// merge time. Sane, deterministic behavior so the UI layer has real numbers
// to show while both worktrees are developed side by side. Keep the exported
// names/signatures exactly as agreed.
import type { GenreId, ItemRecord, SessionRecord } from "./types";
import { makeRng } from "./rng";

/** Stars a single answered item is worth. Never depends on wrong answers looking bad — 0 just means "no star this time", never shown as a miss. */
export function starsForItem(item: ItemRecord, mode: "staircase" | "speedBlock"): number {
  if (mode === "speedBlock") return item.correct ? 1 : 0;
  if (item.max <= 0) return 0;
  const ratio = item.points / item.max;
  if (ratio <= 0) return 0;
  let stars = ratio >= 1 ? 2 : 1;
  if (ratio >= 1 && item.d >= 7) stars += 1; // hard-item bonus
  if (ratio >= 1 && item.fast) stars += 1; // fast-answer bonus
  return Math.min(3, stars);
}

/** Deterministic per-item "surprise" bonus star, given the item's own seed and its index in the block. */
export function bonusStar(seed: number, idx: number): boolean {
  const rng = makeRng((seed ^ ((idx + 1) * 0x9e3779b1)) >>> 0);
  return rng.next() < 0.12;
}

export function sessionStars(s: SessionRecord): number {
  let total = 0;
  for (const b of s.blocks) for (const it of b.items) total += it.stars ?? 0;
  return total;
}

export function totalStars(sessions: SessionRecord[]): number {
  return sessions.reduce((sum, s) => sum + sessionStars(s), 0);
}

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Consecutive local-calendar days (ending today, or yesterday if she hasn't played yet today) with at least one completed session. */
export function dayStreak(sessions: SessionRecord[], today: string): number {
  const days = new Set<string>();
  for (const s of sessions) {
    if (!s.complete) continue;
    days.add(localDayKey(new Date(s.endedAt ?? s.startedAt)));
  }

  const cursor = new Date(`${today}T00:00:00`);
  if (!days.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(localDayKey(cursor))) return 0;
  }

  let streak = 0;
  for (;;) {
    if (!days.has(localDayKey(cursor))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** For a just-finished session, which genres' ceiling beat everything seen in `earlier` sessions. */
export function newBests(
  session: SessionRecord,
  earlier: SessionRecord[]
): { genre: GenreId; ceiling: number; previous: number | null }[] {
  const prevBest: Partial<Record<GenreId, number>> = {};
  for (const s of earlier) {
    for (const b of s.blocks) {
      if (b.summary.ceiling === null) continue;
      const cur = prevBest[b.genre];
      prevBest[b.genre] = cur === undefined ? b.summary.ceiling : Math.max(cur, b.summary.ceiling);
    }
  }

  const bestThisSession: Partial<Record<GenreId, number>> = {};
  for (const b of session.blocks) {
    if (b.summary.ceiling === null) continue;
    const cur = bestThisSession[b.genre];
    bestThisSession[b.genre] = cur === undefined ? b.summary.ceiling : Math.max(cur, b.summary.ceiling);
  }

  const results: { genre: GenreId; ceiling: number; previous: number | null }[] = [];
  for (const genre of Object.keys(bestThisSession) as GenreId[]) {
    const ceiling = bestThisSession[genre]!;
    const previous = prevBest[genre] ?? null;
    if (previous === null || ceiling > previous) results.push({ genre, ceiling, previous });
  }
  return results;
}

/** Trailing consecutive-correct count at the end of a block's items-so-far. */
export function streakAfter(records: ItemRecord[]): number {
  let streak = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (!records[i].correct) break;
    streak++;
  }
  return streak;
}
