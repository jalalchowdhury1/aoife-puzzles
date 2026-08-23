// STUB — a real engine worker is building this module in a parallel worktree
// (see the "fun layer" brief, 2026-08-23) and will replace this file at
// merge time. Sane, deterministic behavior (a small fixed badge catalog) so
// the Sticker Book / PartDone recap have real data while both worktrees are
// developed side by side. Keep the exported names/signatures exactly as
// agreed so nothing downstream needs to change when the real module lands.
import type { SessionRecord } from "./types";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  earnedAt: string;
}

interface Stats {
  partsCompleted: number;
  totalStars: number;
  maxCeiling: number;
  hadStreak3: boolean;
  hadStreak5: boolean;
  perfectBlock: boolean;
}

interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  check: (s: Stats) => boolean;
}

const CATALOG: BadgeDef[] = [
  { id: "first-part", name: "First Steps", emoji: "🐣", blurb: "Finished your very first puzzle part.", check: (s) => s.partsCompleted >= 1 },
  { id: "five-parts", name: "Puzzle Explorer", emoji: "🗺️", blurb: "Finished five puzzle parts.", check: (s) => s.partsCompleted >= 5 },
  { id: "ten-stars", name: "Star Collector", emoji: "⭐", blurb: "Earned ten stars.", check: (s) => s.totalStars >= 10 },
  { id: "fifty-stars", name: "Star Champion", emoji: "🌟", blurb: "Earned fifty stars.", check: (s) => s.totalStars >= 50 },
  { id: "hundred-stars", name: "Star Legend", emoji: "💫", blurb: "Earned one hundred stars.", check: (s) => s.totalStars >= 100 },
  { id: "streak-3", name: "On a Roll", emoji: "🔥", blurb: "Got three puzzles in a row.", check: (s) => s.hadStreak3 },
  { id: "streak-5", name: "Unstoppable", emoji: "🚀", blurb: "Got five puzzles in a row.", check: (s) => s.hadStreak5 },
  { id: "top-of-ramp", name: "Mountain Climber", emoji: "🏔️", blurb: "Reached the very top level in a puzzle.", check: (s) => s.maxCeiling >= 10 },
  { id: "perfect-block", name: "Perfect Round", emoji: "🎯", blurb: "Got every puzzle right in a round.", check: (s) => s.perfectBlock },
];

/** The full catalog (earned or not) — used by the Sticker Book to render "?" silhouettes for badges she hasn't earned yet. */
export const BADGE_CATALOG: { id: string; name: string; emoji: string; blurb: string }[] = CATALOG.map(
  ({ id, name, emoji, blurb }) => ({ id, name, emoji, blurb })
);

function computeStats(sessions: SessionRecord[]): Stats {
  let maxCeiling = 0;
  let totalStars = 0;
  let hadStreak3 = false;
  let hadStreak5 = false;
  let perfectBlock = false;
  const completedParts = new Set<string>();

  for (const s of sessions) {
    if (s.complete) completedParts.add(`${s.level}:${s.part}`);
    for (const b of s.blocks) {
      if (b.summary.ceiling !== null) maxCeiling = Math.max(maxCeiling, b.summary.ceiling);
      if (b.mode === "staircase" && b.summary.attempted >= 4 && b.summary.correct === b.summary.attempted) {
        perfectBlock = true;
      }
      let run = 0;
      for (const it of b.items) {
        totalStars += it.stars ?? 0;
        if (it.correct) {
          run++;
          if (run >= 3) hadStreak3 = true;
          if (run >= 5) hadStreak5 = true;
        } else {
          run = 0;
        }
      }
    }
  }

  return { partsCompleted: completedParts.size, totalStars, maxCeiling, hadStreak3, hadStreak5, perfectBlock };
}

/** Every badge earned so far, given the full session history. */
export function computeBadges(sessions: SessionRecord[]): Badge[] {
  const stats = computeStats(sessions);
  const now = new Date().toISOString();
  return CATALOG.filter((b) => b.check(stats)).map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, blurb: b.blurb, earnedAt: now }));
}

/** Badges present in `after` but not in `before` — for the PartDone recap's "NEW sticker" lines. */
export function newBadges(before: SessionRecord[], after: SessionRecord[]): Badge[] {
  const beforeIds = new Set(computeBadges(before).map((b) => b.id));
  return computeBadges(after).filter((b) => !beforeIds.has(b.id));
}
