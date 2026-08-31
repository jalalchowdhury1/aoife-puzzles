import type { Genre, GenreId, Domain, Difficulty, GenerateOpts, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { bankAsOf } from "./banks/legacy";

// ---------------------------------------------------------------------------
// Choice genres (Similarities, Vocabulary, Information, Comprehension)
// ---------------------------------------------------------------------------

export interface ChoiceOption { text: string; points: 0 | 1 | 2 }
export interface ChoiceBankItem {
  id: string; d: Difficulty; prompt: string; emoji?: string;
  options: ChoiceOption[]; explanation: string;
  /**
   * Reviewer note (decision #29, required on every active verbal bank item):
   * why each 0 point option is plausible but wrong, why the 1 point option is
   * only partly right, what makes the best option uniquely best, and which
   * giveaway cues (length, register, stem echo, moral adverb, silliness) were
   * checked. Never shown to her.
   */
  reviewNote?: string;
}
export interface ChoiceItem {
  bankId: string; d: Difficulty; prompt: string; emoji?: string;
  options: { text: string; points: number }[];
  explanation: string;
}

export interface ChoiceGenreMeta {
  id: GenreId; subtest: string; domain: Domain; kidTitle: string; instructions: string;
  sampleId: string; sampleExplanation: string;
  maxDifficulty?: number;   // widened past 10 only when her data earned it (decision #17)
}

/** Picks a bank item at difficulty `d`, excluding `exclude`; widens |d' - d| outward if the exact tier is empty. */
function pickWidening<T extends { id: string; d: Difficulty }>(
  bank: readonly T[], d: Difficulty, exclude: Set<string>, rng: Rng,
): T {
  for (let widen = 0; widen <= 9; widen++) {
    const candidates = bank.filter(b => Math.abs(b.d - d) === widen && !exclude.has(b.id));
    if (candidates.length > 0) return rng.pick(candidates);
  }
  const fallback = bank.filter(b => !exclude.has(b.id));
  if (fallback.length > 0) return rng.pick(fallback);
  return rng.pick(bank);
}

export function makeChoiceGenre(meta: ChoiceGenreMeta, bank: readonly ChoiceBankItem[]): Genre<ChoiceItem, number> {
  const generate = (seed: number, d: Difficulty, opts?: GenerateOpts): ChoiceItem => {
    const rng = makeRng(seed);
    const exclude = new Set(opts?.excludeBankIds ?? []);
    // A history replay (opts.asOf = session date) draws from the bank that
    // was live then (banks/legacy), so it shows the words she actually saw.
    const picked = pickWidening(bankAsOf(meta.id, bank, opts?.asOf), d, exclude, rng);
    const options = rng.shuffle(picked.options).map(o => ({ text: o.text, points: o.points }));
    return { bankId: picked.id, d: picked.d, prompt: picked.prompt, emoji: picked.emoji, options, explanation: picked.explanation };
  };
  return {
    id: meta.id, subtest: meta.subtest, domain: meta.domain, kidTitle: meta.kidTitle, instructions: meta.instructions,
    ...(meta.maxDifficulty !== undefined ? { maxDifficulty: meta.maxDifficulty } : {}),
    mode: "staircase",
    timing: { kind: "none" },
    sample() {
      const found = bank.find(b => b.id === meta.sampleId);
      if (!found) throw new Error(`sampleId ${meta.sampleId} not found in bank for ${meta.id}`);
      // Fixed seed: banks store the best option first, and an unshuffled
      // sample taught "the top one is right" right before the scored items
      // (found in the 2026-08-30 audit). Shuffle exactly like play, but the
      // same way every time so the spoken walkthrough stays in step.
      const item = generate(20260830, found.d, { excludeBankIds: bank.filter(b => b.id !== found.id).map(b => b.id) });
      return { item, explanation: meta.sampleExplanation };
    },
    generate,
    score(item: ChoiceItem, response: number | null): ScoreResult {
      const max = item.options.reduce((m, o) => Math.max(m, o.points), 0);
      if (response === null || response === undefined || response < 0 || response >= item.options.length) {
        return { points: 0, max, correct: false };
      }
      const points = item.options[response].points;
      const correct = max === 2 ? points >= 1 : points === max;
      return { points, max, correct };
    },
    bankId(item: ChoiceItem): string | undefined {
      return item.bankId;
    },
  };
}

// ---------------------------------------------------------------------------
// Arithmetic genre (Story Sums)
// ---------------------------------------------------------------------------

export interface ArithmeticBankItem {
  id: string; d: Difficulty; template: string;
  vars: Record<string, [number, number]>;
  answer: (v: Record<string, number>) => number;
  ok?: (v: Record<string, number>) => boolean;
  /** Optional explanation template ({a}/{b}/... placeholders like `template`).
   *  Falls back to a generic "text + answer" restatement when omitted. */
  explanation?: string;
}
export interface ArithmeticItem { bankId: string; d: Difficulty; text: string; answer: number; explanation: string }

export interface ArithmeticGenreMeta {
  id: GenreId; subtest: string; domain: Domain; kidTitle: string; instructions: string;
  maxDifficulty?: number;   // widened past 10 only when her data earned it (decision #17)
}

function renderTemplate(template: string, vars: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => String(vars[k]));
}

/**
 * The var draw a template falls back on when 50 random draws all fail its
 * `ok`. Deterministic (its own fixed seed), and — unlike the draw this
 * replaced — it NEVER returns a combination that violates `ok`.
 *
 * Why this matters (decision #14, validity is sacred): most `ok` predicates
 * are divisibility guards, and `answer` divides. The old fallback returned
 * the FIRST random draw regardless, so a template like "share {a} stickers
 * two for one" could render with a = 7 and compute a correct answer of
 * 4.666..., which she then cannot possibly type. That is a false weakness
 * written straight into her profile. An audit on 2026-08-29 found 19 of the
 * 100 templates able to do this — every one of them guarded only by
 * probability (roughly 1e-6 to 1e-15 per item, never zero).
 *
 * Throws if no valid combination exists at all; `banks.test.ts` proves that
 * never happens for any authored template, which is what makes the throw
 * safe to leave in.
 */
export function fallbackVars(tmpl: ArithmeticBankItem): Record<string, number> {
  const keys = Object.keys(tmpl.vars);
  const rng = makeRng(0x5EED);
  for (let attempt = 0; attempt < 100_000; attempt++) {
    const vars: Record<string, number> = {};
    for (const k of keys) {
      const [min, max] = tmpl.vars[k];
      vars[k] = rng.int(min, max);
    }
    if (!tmpl.ok || tmpl.ok(vars)) return vars;
  }
  throw new Error(`arithmetic template ${tmpl.id}: no var draw satisfies its ok predicate`);
}

function drawVars(tmpl: ArithmeticBankItem, rng: Rng): Record<string, number> {
  const keys = Object.keys(tmpl.vars);
  // The 50 random attempts and their rng consumption are UNCHANGED: every
  // item she has already played must keep regenerating identically (her
  // history, the Practice tab, and the parent page's question replay all
  // depend on it). Only the give up path below is different.
  for (let attempt = 0; attempt < 50; attempt++) {
    const vars: Record<string, number> = {};
    for (const k of keys) {
      const [min, max] = tmpl.vars[k];
      vars[k] = rng.int(min, max);
    }
    if (!tmpl.ok || tmpl.ok(vars)) return vars;
  }
  return fallbackVars(tmpl);
}

/** Draws vars for `tmpl` with `rng` and renders the text + computed answer + explanation. Exported for bank tests. */
export function renderArithmetic(tmpl: ArithmeticBankItem, rng: Rng): { text: string; answer: number; explanation: string } {
  const vars = drawVars(tmpl, rng);
  const text = renderTemplate(tmpl.template, vars);
  const answer = tmpl.answer(vars);
  const explanation = tmpl.explanation ? renderTemplate(tmpl.explanation, vars) : `${text} The answer is ${answer}.`;
  return { text, answer, explanation };
}

export function makeArithmeticGenre(meta: ArithmeticGenreMeta, bank: readonly ArithmeticBankItem[]): Genre<ArithmeticItem, number> {
  return {
    id: meta.id, subtest: meta.subtest, domain: meta.domain, kidTitle: meta.kidTitle, instructions: meta.instructions,
    ...(meta.maxDifficulty !== undefined ? { maxDifficulty: meta.maxDifficulty } : {}),
    mode: "staircase",
    timing: { kind: "item", ms: () => 30_000 },
    sample() {
      const explanation = "Two apples plus one more apple makes three apples.";
      return {
        item: { bankId: "sample", d: 1, text: "Aoife has 2 apples and picks 1 more. How many apples now?", answer: 3, explanation },
        explanation,
      };
    },
    generate(seed: number, d: Difficulty, opts?: GenerateOpts): ArithmeticItem {
      const rng = makeRng(seed);
      const exclude = new Set(opts?.excludeBankIds ?? []);
      const tmpl = pickWidening(bank, d, exclude, rng);
      const { text, answer, explanation } = renderArithmetic(tmpl, rng);
      return { bankId: tmpl.id, d: tmpl.d, text, answer, explanation };
    },
    score(item: ArithmeticItem, response: number | null): ScoreResult {
      const correct = response !== null && response !== undefined && response === item.answer;
      return { points: correct ? 1 : 0, max: 1, correct };
    },
    bankId(item: ArithmeticItem): string | undefined {
      return item.bankId;
    },
  };
}
