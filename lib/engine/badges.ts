// Badges: durable "you did a thing" markers derived purely from session
// history (owner brief 2026-08-23). Every BADGE_DEFS.test() is pure and
// deterministic: it scans `sessions` in chronological order and reports the
// ISO `startedAt` of the first session at which the badge's condition first
// became true, or null if it never has.
//
// Ceilings are read after remapSession (lib/engine/scale.ts) so a ramp
// rebuild never costs her a badge she already earned, and blocks flagged
// with an EXCLUDING_CODES quality flag (lib/engine/quality.ts, AGENTS.md
// decision #14) are skipped entirely, the same way profile.ts excludes them
// from her ceilings — a broken or misunderstood block must not manufacture a
// badge any more than it should manufacture a weakness.
import { remapSession } from "./scale";
import { EXCLUDING_CODES } from "./quality";
import { sessionStars } from "./rewards";
import type { BlockRecord, GenreId, SessionRecord } from "./types";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  earnedAt: string; // ISO of the session that earned it
}

interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  test: (sessions: SessionRecord[]) => string | null;
}

// Level 1 / Level 2's part ids, kept in sync by hand with lib/levels/level1.ts
// and lib/levels/level2.ts (as of 2026-08-23: Level 1 = A/B/C, Level 2 =
// A/B/C/D). Not imported from lib/levels to keep this module a leaf in the
// engine layer (lib/levels depends on lib/engine, not the other way round).
const LEVEL_PART_IDS: Record<number, string[]> = {
  1: ["A", "B", "C"],
  2: ["A", "B", "C", "D"],
};

function sortByStartedAt(sessions: SessionRecord[]): SessionRecord[] {
  return [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

function blockExcluded(block: BlockRecord): boolean {
  return (block.flags ?? []).some((f) => EXCLUDING_CODES.has(f.code));
}

/** Chronologically finds the first session at which the running best ceiling
 * for `genre` reaches `threshold` (staircase blocks only, quality-excluded
 * blocks skipped, ceilings remapped onto the current scale). */
function earnedAtForCeiling(sessions: SessionRecord[], genre: GenreId, threshold: number): string | null {
  return earnedAtForAnyCeiling(sessions, [{ genre, threshold }]);
}

/** Same as earnedAtForCeiling, but for any of several (genre, threshold) checks (OR). */
function earnedAtForAnyCeiling(sessions: SessionRecord[], checks: { genre: GenreId; threshold: number }[]): string | null {
  const sorted = sortByStartedAt(sessions).map(remapSession);
  const best: Partial<Record<GenreId, number>> = {};
  for (const s of sorted) {
    for (const block of s.blocks) {
      if (block.mode !== "staircase" || block.summary.ceiling === null || blockExcluded(block)) continue;
      const prev = best[block.genre];
      best[block.genre] = prev === undefined ? block.summary.ceiling : Math.max(prev, block.summary.ceiling);
    }
    if (checks.some((c) => (best[c.genre] ?? -Infinity) >= c.threshold)) return s.startedAt;
  }
  return null;
}

function blockPerMinute(block: BlockRecord): number {
  const rawMs = new Date(block.endedAt).getTime() - new Date(block.startedAt).getTime();
  const blockMs = Math.max(60_000, rawMs);
  return block.summary.correct / (blockMs / 60_000);
}

/** Chronologically finds the first session where any of the given speed genres' running-best perMinute reaches its threshold. */
function earnedAtForAnySpeed(sessions: SessionRecord[], checks: { genre: GenreId; threshold: number }[]): string | null {
  const sorted = sortByStartedAt(sessions).map(remapSession);
  const best: Partial<Record<GenreId, number>> = {};
  for (const s of sorted) {
    for (const block of s.blocks) {
      if (block.mode !== "speedBlock" || blockExcluded(block)) continue;
      const perMinute = blockPerMinute(block);
      const prev = best[block.genre];
      best[block.genre] = prev === undefined ? perMinute : Math.max(prev, perMinute);
    }
    if (checks.some((c) => (best[c.genre] ?? -Infinity) >= c.threshold)) return s.startedAt;
  }
  return null;
}

function earnedAtBigThinker(sessions: SessionRecord[]): string | null {
  const sorted = sortByStartedAt(sessions).map(remapSession);
  for (const s of sorted) {
    for (const block of s.blocks) {
      if (block.genre !== "comprehension" || block.mode !== "staircase" || blockExcluded(block)) continue;
      const { ceiling, points, max } = block.summary;
      if (ceiling !== null && ceiling >= 8 && max > 0 && points === max) return s.startedAt;
    }
  }
  return null;
}

function earnedAtFirstSitting(sessions: SessionRecord[]): string | null {
  const complete = sortByStartedAt(sessions.filter((s) => s.complete));
  return complete.length ? complete[0].startedAt : null;
}

function earnedAtLevelDone(sessions: SessionRecord[], levelId: number): string | null {
  const wantedParts = LEVEL_PART_IDS[levelId] ?? [];
  if (!wantedParts.length) return null;
  const sorted = sortByStartedAt(sessions.filter((s) => s.complete && s.level === levelId));
  const seen = new Set<string>();
  for (const s of sorted) {
    seen.add(s.part);
    if (wantedParts.every((p) => seen.has(p))) return s.startedAt;
  }
  return null;
}

function earnedAtForStars(sessions: SessionRecord[], threshold: number): string | null {
  const sorted = sortByStartedAt(sessions.filter((s) => s.complete));
  let total = 0;
  for (const s of sorted) {
    total += sessionStars(s);
    if (total >= threshold) return s.startedAt;
  }
  return null;
}

// Local mirror of rewards.ts's NY-calendar-date logic (kept tiny and
// duplicated rather than exported from rewards.ts, since it is not part of
// that module's public API).
const NY_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" });
function nyDate(iso: string): string {
  return NY_DATE_FORMATTER.format(new Date(iso));
}

function earnedAtThreeDaysRunning(sessions: SessionRecord[]): string | null {
  const sorted = sortByStartedAt(sessions.filter((s) => s.complete));
  for (let i = 0; i < sorted.length; i++) {
    const upToNow = sorted.slice(0, i + 1);
    const today = nyDate(sorted[i].startedAt);
    // Inline the same consecutive-day walk as dayStreak() (lib/engine/rewards.ts)
    // against just the sessions seen so far, so "at that session's date" means
    // "as of what she had done by then", not with the benefit of hindsight.
    const completeDates = new Set(upToNow.map((s) => nyDate(s.startedAt)));
    let streak = 0;
    let cursor = today;
    while (completeDates.has(cursor)) {
      streak++;
      const [y, m, d] = cursor.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCDate(dt.getUTCDate() - 1);
      cursor = dt.toISOString().slice(0, 10);
    }
    if (streak >= 3) return sorted[i].startedAt;
  }
  return null;
}

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "firstSteps",
    name: "First Steps",
    emoji: "👣",
    blurb: "You started your very first puzzle adventure.",
    test: earnedAtFirstSitting,
  },
  {
    id: "patternDetective",
    name: "Pattern Detective",
    emoji: "🔍",
    blurb: "You are excellent at spotting patterns.",
    test: (s) => earnedAtForCeiling(s, "matrix", 6),
  },
  {
    id: "patternMaster",
    name: "Pattern Master",
    emoji: "🕵️",
    blurb: "You solve even the trickiest patterns.",
    test: (s) => earnedAtForCeiling(s, "matrix", 9),
  },
  {
    id: "blockBuilder",
    name: "Block Builder",
    emoji: "🧱",
    blurb: "You build shapes out of blocks like a pro.",
    test: (s) => earnedAtForCeiling(s, "blockDesign", 5),
  },
  {
    id: "blockMaster",
    name: "Block Master",
    emoji: "🏗️",
    blurb: "You are a true master of building shapes.",
    test: (s) => earnedAtForCeiling(s, "blockDesign", 8),
  },
  {
    id: "piecePro",
    name: "Piece Pro",
    emoji: "🧩",
    blurb: "You fit puzzle pieces together so well.",
    test: (s) => earnedAtForCeiling(s, "visualPuzzles", 5),
  },
  {
    id: "pieceWizard",
    name: "Piece Wizard",
    emoji: "✨",
    blurb: "You are a wizard at putting pieces together.",
    test: (s) => earnedAtForCeiling(s, "visualPuzzles", 8),
  },
  {
    id: "balanceBrain",
    name: "Balance Brain",
    emoji: "⚖️",
    blurb: "You figured out how the scales balance.",
    test: (s) => earnedAtForCeiling(s, "figureWeights", 6),
  },
  {
    id: "memoryChampion",
    name: "Memory Champion",
    emoji: "🧠",
    blurb: "Your memory is super strong.",
    test: (s) =>
      earnedAtForAnyCeiling(s, [
        { genre: "digitSpan", threshold: 5 },
        { genre: "pictureSpan", threshold: 6 },
      ]),
  },
  {
    id: "speedStar",
    name: "Speed Star",
    emoji: "⚡",
    blurb: "You are lightning fast at these puzzles.",
    test: (s) =>
      earnedAtForAnySpeed(s, [
        { genre: "coding", threshold: 30 },
        { genre: "symbolSearch", threshold: 30 },
      ]),
  },
  {
    id: "wordWizard",
    name: "Word Wizard",
    emoji: "📖",
    blurb: "You know so many words and what they mean.",
    test: (s) => earnedAtForCeiling(s, "vocabulary", 6),
  },
  {
    id: "bigThinker",
    name: "Big Thinker",
    emoji: "💡",
    blurb: "You understood a whole big story perfectly.",
    test: earnedAtBigThinker,
  },
  {
    id: "numberNinja",
    name: "Number Ninja",
    emoji: "🥷",
    blurb: "You solve number stories like a ninja.",
    test: (s) => earnedAtForCeiling(s, "arithmetic", 6),
  },
  {
    id: "threeDaysRunning",
    name: "Three Days Running",
    emoji: "🔥",
    blurb: "You played three days in a row.",
    test: earnedAtThreeDaysRunning,
  },
  {
    id: "starCollector",
    name: "Star Collector",
    emoji: "🌟",
    blurb: "You collected one hundred stars.",
    test: (s) => earnedAtForStars(s, 100),
  },
  {
    id: "starHoarder",
    name: "Star Hoarder",
    emoji: "💫",
    blurb: "You collected three hundred stars.",
    test: (s) => earnedAtForStars(s, 300),
  },
  {
    id: "level1Done",
    name: "Level 1 Done",
    emoji: "🎉",
    blurb: "You finished your very first level.",
    test: (s) => earnedAtLevelDone(s, 1),
  },
  {
    id: "practiceRoundDone",
    name: "Practice Round Done",
    emoji: "🏆",
    blurb: "You finished the whole practice round.",
    test: (s) => earnedAtLevelDone(s, 2),
  },
];

/** Every badge earned so far, sorted by earnedAt (ascending). */
export function computeBadges(sessions: SessionRecord[]): Badge[] {
  const badges: Badge[] = [];
  for (const def of BADGE_DEFS) {
    const earnedAt = def.test(sessions);
    if (earnedAt !== null) badges.push({ id: def.id, name: def.name, emoji: def.emoji, blurb: def.blurb, earnedAt });
  }
  return badges.sort((a, b) => a.earnedAt.localeCompare(b.earnedAt));
}

/** Badges present after `after` but not after `before` (e.g. before/after a newly-saved session). */
export function newBadges(before: SessionRecord[], after: SessionRecord[]): Badge[] {
  const beforeIds = new Set(computeBadges(before).map((b) => b.id));
  return computeBadges(after).filter((b) => !beforeIds.has(b.id));
}
