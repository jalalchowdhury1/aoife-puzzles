// Research-anchored typical-age bands for the skill each difficulty level
// demands (owner decision #20, 2026-08-26). Source: the Perplexity research
// digest docs/research/2026-08-26-age-benchmarks-research.md — every band's
// `basis` names its anchor. These are APPROXIMATE developmental bands, never
// norms, percentiles, or IQ-like numbers, and they surface on the PARENT
// page only. Speed genres carry NO bands: public items-per-minute norms do
// not exist (Pearson tables are proprietary), so pretending otherwise would
// be a false comparison.
import type { GenreId } from "./types";
import { genreMaxD } from "./types";
import { GENRES } from "../genres";
import type { Insights } from "./insights";

export interface AgeBand { lo: number; hi: number | null } // years; hi null = "and up"

export interface DifficultyBenchmark {
  dMin: number;
  dMax: number;
  /** Concrete description of what this band demands — plain language, no jargon. */
  skill: string;
  /** Typical age band for that demand, or null when no defensible anchor exists. */
  typicalAge: AgeBand | null;
  /** One-line research anchor (see the digest doc). */
  basis: string;
}

export interface GenreBenchmark {
  genre: GenreId;
  /** Genre-level caution shown alongside the bands. */
  caveat?: string;
  /** Contiguous bands covering d1..maxD; empty for genres with no anchor at all. */
  bands: DifficultyBenchmark[];
}

const CORSI = "Corsi block-tapping developmental data (approximate; game format differs)";
const SPANS = "digit/object span norms: forward ~4, backward 2-3, reordered objects 1-2 at age 5-6";
const VSLADDER = "block/mosaic construction + mental assembly ladder (ages 3-9)";
const PATTERNS = "repeating/growing pattern research ladder; interleaving is typically 7-9+";
const RCPM = "RCPM data (n=947): identity items near ceiling at 6; progression/closure 6-11";
const LATIN = "latin-square/sudoku ladder: 3x3 with choices 5-7; 4x4 one-line 6-8; row+column 7-9+";
const SUBST = "transitive/substitution research: two-premise coordination reliable ~7-8 (grades 3-4)";
const CCSS = "Common Core word-problem grade mapping (grade ~ age-5+grade years)";
const VERBAL = "verbal development ladder ages 4-13; banks are authored to an age-6->13 ramp (decision #10)";
const SPEEDNOTE =
  "No published items-per-minute norms exist for children's matching-speed tasks (Wechsler tables are proprietary) — speed is shown only as her own trend.";

export const BENCHMARKS: Partial<Record<GenreId, GenreBenchmark>> = {
  // ---- WM cousins ----------------------------------------------------------
  fireflyBoxes: {
    genre: "fireflyBoxes",
    caveat: "Glowing-box spans are Corsi-LIKE, not a Corsi test.",
    bands: [
      { dMin: 1, dMax: 1, skill: "Tap back 1 glowing box", typicalAge: { lo: 2, hi: 3 }, basis: CORSI },
      { dMin: 2, dMax: 2, skill: "2 boxes in order", typicalAge: { lo: 3, hi: 4 }, basis: CORSI },
      { dMin: 3, dMax: 3, skill: "3 boxes in order", typicalAge: { lo: 4, hi: 5 }, basis: CORSI },
      { dMin: 4, dMax: 4, skill: "4 boxes in order", typicalAge: { lo: 5, hi: 7 }, basis: CORSI },
      { dMin: 5, dMax: 5, skill: "5 boxes in order", typicalAge: { lo: 7, hi: 10 }, basis: CORSI },
      { dMin: 6, dMax: 6, skill: "6 boxes in order", typicalAge: { lo: 10, hi: null }, basis: CORSI },
      { dMin: 7, dMax: 7, skill: "2 boxes BACKWARD", typicalAge: { lo: 5, hi: 6 }, basis: CORSI },
      { dMin: 8, dMax: 8, skill: "3 boxes backward", typicalAge: { lo: 6, hi: 8 }, basis: CORSI },
      { dMin: 9, dMax: 9, skill: "4 boxes backward", typicalAge: { lo: 8, hi: 11 }, basis: CORSI },
      { dMin: 10, dMax: 10, skill: "5 boxes backward", typicalAge: { lo: 11, hi: null }, basis: CORSI },
    ],
  },
  animalParade: {
    genre: "animalParade",
    bands: [
      { dMin: 1, dMax: 1, skill: "Repeat 2 spoken animals in order", typicalAge: { lo: 3, hi: 4 }, basis: SPANS },
      { dMin: 2, dMax: 2, skill: "3 spoken animals in order", typicalAge: { lo: 4, hi: 6 }, basis: SPANS },
      { dMin: 3, dMax: 3, skill: "4 spoken animals in order", typicalAge: { lo: 6, hi: 9 }, basis: SPANS },
      { dMin: 4, dMax: 4, skill: "2 animals BACKWARD", typicalAge: { lo: 5, hi: 7 }, basis: SPANS },
      { dMin: 5, dMax: 5, skill: "3 animals backward", typicalAge: { lo: 7, hi: 9 }, basis: SPANS },
      { dMin: 6, dMax: 6, skill: "4 animals backward", typicalAge: { lo: 8, hi: 11 }, basis: SPANS },
      { dMin: 7, dMax: 7, skill: "3 animals sorted by SIZE", typicalAge: { lo: 7, hi: 9 }, basis: SPANS },
      { dMin: 8, dMax: 8, skill: "4 animals sorted by size", typicalAge: { lo: 9, hi: 12 }, basis: SPANS },
      { dMin: 9, dMax: 9, skill: "5 forward / 4 backward", typicalAge: { lo: 9, hi: 12 }, basis: SPANS },
      { dMin: 10, dMax: 10, skill: "5 backward / 5 by size", typicalAge: { lo: 11, hi: null }, basis: SPANS },
    ],
  },
  // Retired replica, kept here because it is her strongest working-memory
  // evidence (decision #16 retired the FORMAT from play, not the data).
  digitSpan: {
    genre: "digitSpan",
    bands: [
      { dMin: 1, dMax: 1, skill: "Repeat 2 digits", typicalAge: { lo: 2, hi: 3 }, basis: SPANS },
      { dMin: 2, dMax: 2, skill: "Repeat 3 digits", typicalAge: { lo: 3, hi: 4 }, basis: SPANS },
      { dMin: 3, dMax: 3, skill: "Repeat 4 digits", typicalAge: { lo: 4, hi: 6 }, basis: SPANS },
      { dMin: 4, dMax: 4, skill: "2 digits BACKWARD", typicalAge: { lo: 4, hi: 6 }, basis: SPANS },
      { dMin: 5, dMax: 5, skill: "3 digits backward", typicalAge: { lo: 5, hi: 7 }, basis: SPANS },
      { dMin: 6, dMax: 6, skill: "4 backward / 5 forward", typicalAge: { lo: 8, hi: 10 }, basis: SPANS },
      { dMin: 7, dMax: 7, skill: "Re-sort 3 digits smallest-first", typicalAge: { lo: 6, hi: 8 }, basis: SPANS },
      { dMin: 8, dMax: 8, skill: "Re-sort 4 / 5 backward", typicalAge: { lo: 9, hi: 12 }, basis: SPANS },
      { dMin: 9, dMax: 9, skill: "6 forward / re-sort 5", typicalAge: { lo: 9, hi: 12 }, basis: SPANS },
      { dMin: 10, dMax: 10, skill: "7 forward / 6 backward", typicalAge: { lo: 12, hi: null }, basis: SPANS },
    ],
  },
  // ---- VS cousins ----------------------------------------------------------
  mosaic: {
    genre: "mosaic",
    bands: [
      { dMin: 1, dMax: 2, skill: "Copy a 2x2 tile picture (solid colours)", typicalAge: { lo: 3, hi: 4 }, basis: VSLADDER },
      { dMin: 3, dMax: 4, skill: "2x2 with diagonal half-tiles", typicalAge: { lo: 4, hi: 6 }, basis: VSLADDER },
      { dMin: 5, dMax: 6, skill: "3x3, a few half-tiles", typicalAge: { lo: 5, hi: 7 }, basis: VSLADDER },
      { dMin: 7, dMax: 8, skill: "3x3 with quarter-tiles mixed in", typicalAge: { lo: 6, hi: 8 }, basis: VSLADDER },
      { dMin: 9, dMax: 9, skill: "3x3 nearly all diagonal tiles", typicalAge: { lo: 7, hi: 9 }, basis: VSLADDER },
      { dMin: 10, dMax: 10, skill: "3x3 all-diagonal pinwheel motif", typicalAge: { lo: 8, hi: 10 }, basis: VSLADDER },
    ],
  },
  fixPicture: {
    genre: "fixPicture",
    bands: [
      { dMin: 1, dMax: 3, skill: "Pick the piece that fills a 1-3 cell hole", typicalAge: { lo: 4, hi: 6 }, basis: VSLADDER },
      { dMin: 4, dMax: 4, skill: "Same-size wrong-shape distractors", typicalAge: { lo: 5, hi: 7 }, basis: VSLADDER },
      { dMin: 5, dMax: 5, skill: "Mirror-image distractors", typicalAge: { lo: 6, hi: 8 }, basis: VSLADDER },
      { dMin: 6, dMax: 6, skill: "Pieces shown ROTATED", typicalAge: { lo: 6, hi: 8 }, basis: VSLADDER },
      { dMin: 7, dMax: 7, skill: "Rotated + mirrored pieces", typicalAge: { lo: 7, hi: 9 }, basis: VSLADDER },
      { dMin: 8, dMax: 8, skill: "TWO holes at once", typicalAge: { lo: 7, hi: 9 }, basis: VSLADDER },
      { dMin: 9, dMax: 9, skill: "Two holes with rotation", typicalAge: { lo: 8, hi: 10 }, basis: VSLADDER },
      { dMin: 10, dMax: 10, skill: "Two holes, rotation + mirror, 5x5", typicalAge: { lo: 8, hi: 10 }, basis: VSLADDER },
    ],
  },
  // ---- FR cousins ----------------------------------------------------------
  patternTrain: {
    genre: "patternTrain",
    bands: [
      { dMin: 1, dMax: 2, skill: "Continue an AB pattern", typicalAge: { lo: 3, hi: 5 }, basis: PATTERNS },
      { dMin: 3, dMax: 4, skill: "ABC / AAB-style repeats", typicalAge: { lo: 4, hi: 6 }, basis: PATTERNS },
      { dMin: 5, dMax: 6, skill: "Growing counts; two attributes together", typicalAge: { lo: 5, hi: 7 }, basis: PATTERNS },
      { dMin: 7, dMax: 9, skill: "Combined rules; counts growing in pairs", typicalAge: { lo: 6, hi: 8 }, basis: PATTERNS },
      { dMin: 10, dMax: 10, skill: "Two interleaved streams", typicalAge: { lo: 7, hi: 9 }, basis: PATTERNS },
      { dMin: 11, dMax: 11, skill: "Peak-and-mirror count chain", typicalAge: { lo: 7, hi: 9 }, basis: PATTERNS },
      { dMin: 12, dMax: 13, skill: "Interleave + mirror; triple rule", typicalAge: { lo: 8, hi: 11 }, basis: PATTERNS },
      { dMin: 14, dMax: 15, skill: "Three independent streams at once", typicalAge: { lo: 9, hi: 13 }, basis: PATTERNS + "; " + RCPM },
    ],
  },
  pictureSudoku: {
    genre: "pictureSudoku",
    bands: [
      { dMin: 1, dMax: 1, skill: "2x2: which picture is missing?", typicalAge: { lo: 4, hi: 5 }, basis: LATIN },
      { dMin: 2, dMax: 3, skill: "3x3, all other cells visible", typicalAge: { lo: 5, hi: 7 }, basis: LATIN },
      { dMin: 4, dMax: 6, skill: "3x3 with a hidden cell — must pick the line that proves it", typicalAge: { lo: 6, hi: 8 }, basis: LATIN },
      { dMin: 7, dMax: 8, skill: "4x4, one line resolves it", typicalAge: { lo: 6, hi: 8 }, basis: LATIN },
      { dMin: 9, dMax: 10, skill: "4x4, must combine row AND column", typicalAge: { lo: 7, hi: 9 }, basis: LATIN },
      { dMin: 11, dMax: 12, skill: "4x4 with the 2x2 box rule", typicalAge: { lo: 8, hi: 10 }, basis: LATIN },
      { dMin: 13, dMax: 15, skill: "6x6 with boxes", typicalAge: { lo: 9, hi: 12 }, basis: LATIN },
    ],
  },
  swapShop: {
    genre: "swapShop",
    bands: [
      { dMin: 1, dMax: 2, skill: "Match the same pile / same count", typicalAge: { lo: 3, hi: 5 }, basis: SUBST },
      { dMin: 3, dMax: 5, skill: "Read one trade card straight off", typicalAge: { lo: 5, hi: 7 }, basis: SUBST },
      { dMin: 6, dMax: 6, skill: "Mixed piles appear (as wrong options)", typicalAge: { lo: 5, hi: 7 }, basis: SUBST },
      { dMin: 7, dMax: 7, skill: "Price a mixed pile from one rule", typicalAge: { lo: 6, hi: 8 }, basis: SUBST },
      { dMin: 8, dMax: 9, skill: "TWO chained trade rules", typicalAge: { lo: 7, hi: 9 }, basis: SUBST },
      { dMin: 10, dMax: 10, skill: "Chained rules, mixed question, bigger rates", typicalAge: { lo: 8, hi: 10 }, basis: SUBST },
    ],
  },
  arithmetic: {
    genre: "arithmetic",
    bands: [
      { dMin: 1, dMax: 2, skill: "Add within 10 in a story", typicalAge: { lo: 5, hi: 6 }, basis: CCSS },
      { dMin: 3, dMax: 4, skill: "One-step add/subtract within 20", typicalAge: { lo: 6, hi: 8 }, basis: CCSS },
      { dMin: 5, dMax: 6, skill: "Two-step problems within 100, time & money", typicalAge: { lo: 7, hi: 9 }, basis: CCSS },
      { dMin: 7, dMax: 8, skill: "Multiply/divide in stories, remainders", typicalAge: { lo: 8, hi: 10 }, basis: CCSS },
      { dMin: 9, dMax: 10, skill: "Multi-step with fractions of groups and rates", typicalAge: { lo: 9, hi: 11 }, basis: CCSS },
    ],
  },
  // ---- VC cousins (banks authored to an age-6->13 ramp, decision #10) ------
  whichTwo: {
    genre: "whichTwo",
    bands: [
      { dMin: 1, dMax: 2, skill: "Obvious category pairs (animals, foods)", typicalAge: { lo: 5, hi: 7 }, basis: VERBAL },
      { dMin: 3, dMax: 4, skill: "Function/category with tempting theme distractors", typicalAge: { lo: 7, hi: 9 }, basis: VERBAL },
      { dMin: 5, dMax: 6, skill: "Second-order categories (both measure things)", typicalAge: { lo: 8, hi: 10 }, basis: VERBAL },
      { dMin: 7, dMax: 8, skill: "Abstract shared-rule pairs", typicalAge: { lo: 10, hi: 12 }, basis: VERBAL },
      { dMin: 9, dMax: 10, skill: "Multiple-level abstract categories", typicalAge: { lo: 12, hi: 13 }, basis: VERBAL },
    ],
  },
  fillTheGap: {
    genre: "fillTheGap",
    bands: [
      { dMin: 1, dMax: 2, skill: "Concrete, everyday-word sentences", typicalAge: { lo: 5, hi: 7 }, basis: VERBAL },
      { dMin: 3, dMax: 4, skill: "School-language words in context", typicalAge: { lo: 7, hi: 9 }, basis: VERBAL },
      { dMin: 5, dMax: 6, skill: "World-knowledge + grammar constraints", typicalAge: { lo: 8, hi: 10 }, basis: VERBAL },
      { dMin: 7, dMax: 8, skill: "Inferential, lower-frequency words", typicalAge: { lo: 10, hi: 12 }, basis: VERBAL },
      { dMin: 9, dMax: 10, skill: "Abstract/idiomatic completion", typicalAge: { lo: 12, hi: 13 }, basis: VERBAL },
    ],
  },
  information: {
    genre: "information",
    bands: [
      { dMin: 1, dMax: 2, skill: "Everyday facts (seasons, animals, home)", typicalAge: { lo: 5, hi: 7 }, basis: VERBAL },
      { dMin: 3, dMax: 4, skill: "Early-school facts (days vs months, coins)", typicalAge: { lo: 7, hi: 9 }, basis: VERBAL },
      { dMin: 5, dMax: 6, skill: "Clocks, calendars, basic science systems", typicalAge: { lo: 8, hi: 10 }, basis: VERBAL },
      { dMin: 7, dMax: 8, skill: "Curriculum knowledge (geography, units)", typicalAge: { lo: 10, hi: 12 }, basis: VERBAL },
      { dMin: 9, dMax: 10, skill: "Integrated cross-subject knowledge", typicalAge: { lo: 12, hi: 13 }, basis: VERBAL },
    ],
  },
  whatWouldYouDo: {
    genre: "whatWouldYouDo",
    bands: [
      { dMin: 1, dMax: 2, skill: "Safe, conventional responses (tell an adult)", typicalAge: { lo: 5, hi: 7 }, basis: VERBAL },
      { dMin: 3, dMax: 4, skill: "More than one solution; simple fairness", typicalAge: { lo: 7, hi: 9 }, basis: VERBAL },
      { dMin: 5, dMax: 6, skill: "Intent vs accident; taking turns and repair", typicalAge: { lo: 8, hi: 10 }, basis: VERBAL },
      { dMin: 7, dMax: 8, skill: "Perspective, consequences, negotiation", typicalAge: { lo: 10, hi: 12 }, basis: VERBAL },
      { dMin: 9, dMax: 10, skill: "Trade-offs and when to escalate", typicalAge: { lo: 12, hi: 13 }, basis: VERBAL },
    ],
  },
  // ---- PS cousins: NO bands, deliberately ---------------------------------
  translator: { genre: "translator", caveat: SPEEDNOTE, bands: [] },
  spotIt: { genre: "spotIt", caveat: SPEEDNOTE, bands: [] },
};

/** The band that applies at difficulty `d`, or null. */
export function benchmarkAt(genre: GenreId, d: number): DifficultyBenchmark | null {
  const gb = BENCHMARKS[genre];
  if (!gb) return null;
  return gb.bands.find((b) => d >= b.dMin && d <= b.dMax) ?? null;
}

/**
 * The strongest demonstrated band at/below `ceiling` — the one with the
 * highest typical-age floor, because some ramps follow a hard skill with a
 * gentler NEW rule (fireflyBoxes d7 backward-2 after d6 forward-6), so the
 * band AT the ceiling can undersell what she has already shown.
 */
export function cumulativeBenchmark(genre: GenreId, ceiling: number | null): DifficultyBenchmark | null {
  const gb = BENCHMARKS[genre];
  if (!gb || ceiling === null) return null;
  let best: DifficultyBenchmark | null = null;
  for (const b of gb.bands) {
    if (b.dMin > ceiling) continue;
    if (b.typicalAge === null) continue;
    if (best === null || best.typicalAge === null || b.typicalAge.lo > best.typicalAge.lo) best = b;
  }
  return best;
}

/** Her exact age in years at an ISO timestamp (DOB 2021-01-11). */
export const DOB = "2021-01-11";
export function ageYearsAt(iso: string | null): number {
  const at = iso ? new Date(iso) : new Date(DOB); // null only in empty states; avoids wall-clock in tests
  const dob = new Date(DOB + "T00:00:00Z");
  return (at.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
}

export type MeasureStatus = "still-winning" | "at-top" | "bailed" | "measured";

/**
 * How trustworthy the recorded ceiling is, from her LATEST non-excluded
 * block of this genre: a block she ended by bailing marks a self-chosen
 * wall; a block that ran out of items while she was still winning means the
 * true ceiling is HIGHER than recorded (display "at least"); a ceiling at
 * the genre's top means the game, not she, ran out of ladder.
 */
export function measureStatus(insights: Insights, genre: GenreId): MeasureStatus | null {
  let latest: { date: string; correct: number; attempted: number; ceiling: number | null; bailed: boolean } | null = null;
  for (const session of insights.timeline) {
    for (const block of session.blocks) {
      if (block.genre !== genre || block.excluded || block.mode !== "staircase") continue;
      const bailed = block.items.some((i) => i.bailed);
      const entry = {
        date: session.date,
        correct: block.summary.correct,
        attempted: block.summary.attempted,
        ceiling: block.summary.ceiling,
        bailed,
      };
      if (latest === null || entry.date > latest.date) latest = entry;
    }
  }
  if (latest === null) return null;
  if (latest.bailed) return "bailed";
  const maxD = genreMaxD(GENRES[genre]);
  if (latest.ceiling !== null && latest.ceiling >= maxD) return "at-top";
  if (latest.attempted >= 4 && latest.correct >= latest.attempted - 1) return "still-winning";
  return "measured";
}

export type AgeVerdict = "ahead" | "age-typical" | "below-band" | "no-anchor";

/** Compare a typical-age band with her age. Bands are wide; only a clear gap counts. */
export function ageVerdict(band: AgeBand | null, ageYears: number): AgeVerdict {
  if (band === null) return "no-anchor";
  if (ageYears < band.lo - 0.25) return "ahead";
  if (band.hi !== null && ageYears > band.hi + 0.25) return "below-band";
  return "age-typical";
}
