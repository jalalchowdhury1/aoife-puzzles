// Every question Aoife has ever answered, flattened into one queryable list
// for the parent dashboard's "All questions" tab.
//
// Jalal, 2026-08-29: "i want a place where i can see ALL the questions she
// answered. with all the details. right / wrong / time taken / median time
// for these questions etc and more." The Last session tab answers "what
// happened just now"; this answers "show me everything, let me slice it".
//
// Pure: takes an already-computed `Insights` and returns rows + summary
// stats. No I/O, no clock — the caller filters and renders.
//
// Two things here are easy to get wrong and are handled deliberately:
//
//  1. `priorBankIds`. A block never repeats a bank entry, so replaying any
//     item needs the bankIds that came BEFORE it in its own block (see
//     lib/engine/itemView.ts). The archive is flat, so that context has to
//     be captured while walking blocks, not reconstructed later.
//
//  2. Which items may define a MEDIAN. Practice rematches, teaching items,
//     bails, and blocks excluded for measurement quality are all shown in
//     the archive (they are real things that happened) but none of them may
//     shape the baseline she is compared against — a rematch of a question
//     she already saw is faster for a reason that is not ability, and a
//     flagged block is exactly the data decision #14 says to distrust.
import type { GenreId } from "./types";
import type { Insights, ItemDetail } from "./insights";
import { GENRES } from "../genres";

export interface LoggedQuestion extends ItemDetail {
  /** Stable identity for React keys and expand state: session + block + index. */
  key: string;
  sessionId: string;
  kidTitle: string;
  practice: boolean;
  /** 1-based position within its own block, as she met it. */
  n: number;
  /** bankIds used earlier in this block — required to replay the item. */
  priorBankIds: string[];
  /** Her median time on this genre AT this difficulty, from counted items only. */
  medianSecondsAtD: number | null;
  /** Her median time on this genre overall, from counted items only. */
  medianSecondsGenre: number | null;
}

export interface QuestionLogStats {
  total: number;
  correct: number;
  wrong: number;
  timeouts: number;
  bails: number;
  teaching: number;
  practice: number;
  /** Share correct across COUNTED questions only (teaching/bail/practice/excluded excluded). */
  accuracyPct: number | null;
  countedTotal: number;
  /** Correct answers among counted questions — the numerator behind accuracyPct.
   *  Distinct from `correct`, which counts every correct answer shown, rematches
   *  included; reporting one over the other's denominator would overstate her. */
  correctCounted: number;
  /** Distinct genres present — a median across all of them is close to meaningless
   *  (Translator ~1.3s vs Which Two ~27.6s), so the UI uses this to say so. */
  genres: number;
  medianSeconds: number | null;
  totalMinutes: number;
  sessions: number;
  days: number;
  /** Highest difficulty reached on a counted, correct answer. */
  topDifficulty: number | null;
}

/**
 * True when an item may contribute to a baseline (median, accuracy). Shown
 * either way — this governs what she is MEASURED by, not what is displayed.
 */
export function countsTowardBaseline(q: { practice: boolean; teaching: boolean; bailed: boolean; excludedBlock: boolean }): boolean {
  return !q.practice && !q.teaching && !q.bailed && !q.excludedBlock;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 === 1 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/**
 * Flattens every session/block/item in `insights.timeline` into one list,
 * newest question first, each carrying what it needs to be replayed and the
 * medians it should be read against.
 */
export function buildQuestionLog(insights: Insights): LoggedQuestion[] {
  const rows: LoggedQuestion[] = [];

  for (const session of insights.timeline) {
    for (let bi = 0; bi < session.blocks.length; bi++) {
      const block = session.blocks[bi];
      const prior: string[] = [];
      for (let ii = 0; ii < block.items.length; ii++) {
        const item = block.items[ii];
        rows.push({
          ...item,
          key: `${session.sessionId}:${bi}:${ii}`,
          sessionId: session.sessionId,
          kidTitle: block.kidTitle,
          practice: session.practice,
          n: ii + 1,
          priorBankIds: [...prior],
          medianSecondsAtD: null,   // filled below, once every row is known
          medianSecondsGenre: null,
        });
        if (item.bankId) prior.push(item.bankId);
      }
    }
  }

  // Medians come from counted rows only (see the header note), then get
  // attached to EVERY row — including the uncounted ones, which is the whole
  // point: "she answered this rematch in 4s, her real median here is 12s".
  const byGenre = new Map<GenreId, number[]>();
  const byGenreD = new Map<string, number[]>();
  for (const r of rows) {
    if (!countsTowardBaseline(r)) continue;
    if (!byGenre.has(r.genre)) byGenre.set(r.genre, []);
    byGenre.get(r.genre)!.push(r.seconds);
    const k = `${r.genre}:${r.d}`;
    if (!byGenreD.has(k)) byGenreD.set(k, []);
    byGenreD.get(k)!.push(r.seconds);
  }
  const genreMedian = new Map<GenreId, number | null>();
  for (const [g, xs] of byGenre) genreMedian.set(g, median(xs));
  const genreDMedian = new Map<string, number | null>();
  for (const [k, xs] of byGenreD) genreDMedian.set(k, median(xs));

  for (const r of rows) {
    r.medianSecondsGenre = genreMedian.get(r.genre) ?? null;
    r.medianSecondsAtD = genreDMedian.get(`${r.genre}:${r.d}`) ?? null;
  }

  // Newest first: that is what a parent opening the tab wants to see.
  rows.sort((a, b) => (a.date === b.date ? b.n - a.n : b.date.localeCompare(a.date)));
  return rows;
}

/** Headline numbers for whatever subset is currently on screen. */
export function summarize(rows: LoggedQuestion[]): QuestionLogStats {
  const counted = rows.filter(countsTowardBaseline);
  const correctCounted = counted.filter((r) => r.correct).length;
  const tops = counted.filter((r) => r.correct).map((r) => r.d);

  // Minutes are per SESSION, not per question: summing item times would
  // undercount (reading, reveals, between-screens) and double-count nothing.
  const sessions = new Set(rows.map((r) => r.sessionId));
  const days = new Set(rows.map((r) => r.date.slice(0, 10)));

  return {
    total: rows.length,
    correct: rows.filter((r) => r.correct).length,
    wrong: rows.filter((r) => !r.correct && !r.timedOut && !r.bailed).length,
    timeouts: rows.filter((r) => r.timedOut).length,
    bails: rows.filter((r) => r.bailed).length,
    teaching: rows.filter((r) => r.teaching).length,
    practice: rows.filter((r) => r.practice).length,
    countedTotal: counted.length,
    correctCounted,
    genres: new Set(rows.map((r) => r.genre)).size,
    accuracyPct: counted.length ? (correctCounted / counted.length) * 100 : null,
    medianSeconds: median(counted.map((r) => r.seconds)),
    totalMinutes: rows.reduce((sum, r) => sum + r.seconds, 0) / 60,
    sessions: sessions.size,
    days: days.size,
    topDifficulty: tops.length ? Math.max(...tops) : null,
  };
}

/** Genres present in the log, in the app's canonical order, with counts. */
export function genreFacets(rows: LoggedQuestion[]): { genre: GenreId; kidTitle: string; count: number }[] {
  const counts = new Map<GenreId, number>();
  for (const r of rows) counts.set(r.genre, (counts.get(r.genre) ?? 0) + 1);
  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, kidTitle: GENRES[genre]?.kidTitle ?? genre, count }))
    .sort((a, b) => b.count - a.count);
}
