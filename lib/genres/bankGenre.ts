import type { Genre, GenreId, Domain, Difficulty, GenerateOpts, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";

// ---------------------------------------------------------------------------
// Choice genres (Similarities, Vocabulary, Information, Comprehension)
// ---------------------------------------------------------------------------

export interface ChoiceOption { text: string; points: 0 | 1 | 2 }
export interface ChoiceBankItem {
  id: string; d: Difficulty; prompt: string; emoji?: string;
  options: ChoiceOption[]; explanation: string;
}
export interface ChoiceItem {
  bankId: string; d: Difficulty; prompt: string; emoji?: string;
  options: { text: string; points: number }[];
}

export interface ChoiceGenreMeta {
  id: GenreId; subtest: string; domain: Domain; kidTitle: string; instructions: string;
  sampleId: string; sampleExplanation: string;
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
  return {
    id: meta.id, subtest: meta.subtest, domain: meta.domain, kidTitle: meta.kidTitle, instructions: meta.instructions,
    mode: "staircase",
    timing: { kind: "none" },
    sample() {
      const found = bank.find(b => b.id === meta.sampleId);
      if (!found) throw new Error(`sampleId ${meta.sampleId} not found in bank for ${meta.id}`);
      const item: ChoiceItem = {
        bankId: found.id, d: found.d, prompt: found.prompt, emoji: found.emoji,
        options: found.options.map(o => ({ text: o.text, points: o.points })),
      };
      return { item, explanation: meta.sampleExplanation };
    },
    generate(seed: number, d: Difficulty, opts?: GenerateOpts): ChoiceItem {
      const rng = makeRng(seed);
      const exclude = new Set(opts?.excludeBankIds ?? []);
      const picked = pickWidening(bank, d, exclude, rng);
      const options = rng.shuffle(picked.options).map(o => ({ text: o.text, points: o.points }));
      return { bankId: picked.id, d: picked.d, prompt: picked.prompt, emoji: picked.emoji, options };
    },
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
}
export interface ArithmeticItem { bankId: string; d: Difficulty; text: string; answer: number }

export interface ArithmeticGenreMeta {
  id: GenreId; subtest: string; domain: Domain; kidTitle: string; instructions: string;
}

function renderTemplate(template: string, vars: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => String(vars[k]));
}

function drawVars(tmpl: ArithmeticBankItem, rng: Rng): Record<string, number> {
  const keys = Object.keys(tmpl.vars);
  let first: Record<string, number> | null = null;
  for (let attempt = 0; attempt < 50; attempt++) {
    const vars: Record<string, number> = {};
    for (const k of keys) {
      const [min, max] = tmpl.vars[k];
      vars[k] = rng.int(min, max);
    }
    if (first === null) first = vars;
    if (!tmpl.ok || tmpl.ok(vars)) return vars;
  }
  return first as Record<string, number>;
}

/** Draws vars for `tmpl` with `rng` and renders the text + computed answer. Exported for bank tests. */
export function renderArithmetic(tmpl: ArithmeticBankItem, rng: Rng): { text: string; answer: number } {
  const vars = drawVars(tmpl, rng);
  return { text: renderTemplate(tmpl.template, vars), answer: tmpl.answer(vars) };
}

export function makeArithmeticGenre(meta: ArithmeticGenreMeta, bank: readonly ArithmeticBankItem[]): Genre<ArithmeticItem, number> {
  return {
    id: meta.id, subtest: meta.subtest, domain: meta.domain, kidTitle: meta.kidTitle, instructions: meta.instructions,
    mode: "staircase",
    timing: { kind: "item", ms: () => 30_000 },
    sample() {
      return {
        item: { bankId: "sample", d: 1, text: "Aoife has 2 apples and picks 1 more. How many apples now?", answer: 3 },
        explanation: "Two apples plus one more apple makes three apples.",
      };
    },
    generate(seed: number, d: Difficulty, opts?: GenerateOpts): ArithmeticItem {
      const rng = makeRng(seed);
      const exclude = new Set(opts?.excludeBankIds ?? []);
      const tmpl = pickWidening(bank, d, exclude, rng);
      const { text, answer } = renderArithmetic(tmpl, rng);
      return { bankId: tmpl.id, d: tmpl.d, text, answer };
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
