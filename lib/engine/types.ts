import type { QualityFlag } from "./quality";

export type GenreId =
  | "blockDesign" | "visualPuzzles" | "matrix" | "figureWeights" | "arithmetic"
  | "digitSpan" | "pictureSpan" | "coding" | "symbolSearch"
  | "similarities" | "vocabulary" | "information" | "comprehension";
export type Domain = "VS" | "FR" | "WM" | "PS" | "VC";
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface ScoreResult { points: number; max: number; correct: boolean }
export type Timing =
  | { kind: "item"; ms: (d: Difficulty) => number }
  | { kind: "block"; ms: number }
  | { kind: "none" };

export interface GenerateOpts { excludeBankIds?: string[] }

export interface Genre<I = unknown, R = unknown> {
  id: GenreId; subtest: string; domain: Domain; kidTitle: string;
  instructions: string;                       // spoken + shown on the sample screen
  sample(): { item: I; explanation: string };
  generate(seed: number, d: Difficulty, opts?: GenerateOpts): I;
  score(item: I, response: R | null): ScoreResult;
  timing: Timing;
  mode: "staircase" | "speedBlock";
  bankId?(item: I): string | undefined;       // bank-backed genres only
}

export interface GenreViewProps<I, R> {
  item: I; disabled: boolean; display?: "audio" | "both";
  onReady: () => void;                 // call once when the stimulus is fully presented (timer starts)
  onRespond: (r: R, meta?: { replayed?: boolean; audioFallback?: boolean }) => void;
  reveal?: boolean;                    // practice levels: show the correct answer highlighted, inputs inert
  lastResponse?: R | null;             // with reveal: the child's own answer, so the view can contrast it
}

export interface ItemRecord {
  idx: number; seed: number; d: Difficulty; points: number; max: number; correct: boolean;
  ms: number; timedOut: boolean; response: unknown; bankId?: string;
  fast?: boolean; audioFallback?: boolean; replayed?: boolean;
  teaching?: boolean;                  // a teaching-item that revealed the answer (see BlockConfig.teachingItems)
}
export interface BlockSummary {
  attempted: number; correct: number; points: number; max: number;
  ceiling: number | null; medianMs: number; timeouts: number; incorrect?: number;
}
export interface BlockRecord {
  genre: GenreId; mode: "staircase" | "speedBlock"; startedAt: string; endedAt: string;
  items: ItemRecord[]; summary: BlockSummary;
  flags?: QualityFlag[];                // server-stamped measurement-quality flags; see lib/engine/quality.ts
}
export interface SessionRecord {
  id: string; level: number; part: string; startedAt: string; endedAt?: string;
  device: { ua: string; w: number; h: number };
  blocks: BlockRecord[]; complete: boolean; appVersion: string;
}

export interface BlockConfig {
  genre: GenreId; start?: number | "fromProfile"; maxItems?: number; display?: "audio" | "both";
  teachingItems?: number;              // overrides the level-wide teachingItems for this block
}
export interface PartConfig { id: string; title: string; sticker: string; blocks: BlockConfig[] }
export interface LevelConfig {
  id: number; title: string; feedback: "none" | "mark" | "reveal"; parts: PartConfig[];
  weighting?: "none" | "remedial";     // remedial = adapt starts/reps/repeats to her profile (lib/engine/adapt.ts)
  released?: boolean;                  // false = hidden from Play/home until the owner releases it (direct ?level= links still work)
  // Level-wide default count of "teaching items": the first N items of each
  // block get corrective feedback (answer reveal) if missed, and a miss
  // there does not count toward the staircase's two-consecutive-wrong stop
  // rule. Mirrors WISC-V teaching items. A block's own `teachingItems`
  // overrides this. See lib/engine/staircase.ts and AGENTS.md §8/decision 8.
  teachingItems?: number;
}

export function summarize(items: ItemRecord[], mode: "staircase" | "speedBlock"): BlockSummary {
  const attempted = items.length;
  const correct = items.filter(i => i.correct).length;
  const points = items.reduce((s, i) => s + i.points, 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  const ceiling = mode === "staircase" ? items.filter(i => i.points > 0).reduce<number | null>((m, i) => (m === null || i.d > m ? i.d : m), null) : null;
  const sorted = items.map(i => i.ms).sort((a, b) => a - b);
  const medianMs = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const timeouts = items.filter(i => i.timedOut).length;
  const s: BlockSummary = { attempted, correct, points, max, ceiling, medianMs, timeouts };
  if (mode === "speedBlock") s.incorrect = attempted - correct;
  return s;
}
