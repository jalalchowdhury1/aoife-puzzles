// The Practice queue (owner decision #23, 2026-08-27): "for all of these
// things, make sure we can go back and practice the ones we got wrong."
// Pure: sessions in, replayable item refs out. Every item is regenerable
// from (genre, seed, d) because generators are deterministic (lib/engine/rng.ts).
//
// What counts as "one she got wrong": a counted miss or timeout in a REAL
// (non-practice) session. Deliberately excluded:
// - bailed items ("Not fun" is agency, not ability — decision #18);
// - teaching/frontier items (the answer was revealed and the miss never
//   counted — practicing them re-teaches nothing the flow didn't);
// - speed-block genres (a wrong tap under a 120s block clock is pressure
//   noise, not a knowledge gap to revisit);
// - retired replica genres (practicing those formats is exactly the
//   decision-#16 coaching line the cousins exist to avoid).
//
// An item leaves the queue once she answers it correctly anywhere later —
// in the Practice tab or in a real session. Newest misses come first, so
// practice always feels connected to what she just played.
import type { Difficulty, GenreId, SessionRecord } from "./types";
import { GENRES } from "../genres";

export interface PracticeRef { genre: GenreId; seed: number; d: Difficulty }

const keyOf = (genre: GenreId, seed: number, d: number) => `${genre}:${seed}:${d}`;

export const PRACTICE_CAP = 30;

export function practiceQueue(sessions: SessionRecord[], cap = PRACTICE_CAP): PracticeRef[] {
  const clearedKeys = new Set<string>();
  for (const s of sessions) {
    for (const b of s.blocks) {
      for (const i of b.items) {
        if (i.correct) clearedKeys.add(keyOf(b.genre, i.seed, i.d));
      }
    }
  }

  const seen = new Set<string>();
  const pending: { ref: PracticeRef; at: string }[] = [];
  // Newest sessions first, so a miss repeated across sessions carries its
  // MOST RECENT date into the newest-first ordering below.
  const newestFirst = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  for (const s of newestFirst) {
    if (s.practice) continue; // misses made DURING practice never re-queue
    for (const b of s.blocks) {
      const genre = GENRES[b.genre];
      if (!genre || genre.retired || genre.mode !== "staircase") continue;
      for (const i of b.items) {
        if (i.correct || i.bailed || i.teaching) continue;
        const key = keyOf(b.genre, i.seed, i.d);
        if (clearedKeys.has(key) || seen.has(key)) continue;
        seen.add(key);
        pending.push({ ref: { genre: b.genre, seed: i.seed, d: i.d }, at: s.startedAt });
      }
    }
  }

  pending.sort((a, b) => b.at.localeCompare(a.at));
  return pending.slice(0, cap).map((p) => p.ref);
}
