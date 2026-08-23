import type { Genre, ScoreResult, Difficulty } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { itemMs } from "../engine/timing";

/**
 * Swap Shop (cousin of quantitative substitution, domain FR): trade cards
 * show exchange rules with emoji tokens; the question asks what a fixed
 * multiset of tokens is worth, and she picks the pile that matches.
 */
export type Token = "⭐" | "🪙" | "🍎" | "🎈" | "🐚";
export const TOKENS: Token[] = ["⭐", "🪙", "🍎", "🎈", "🐚"];

export interface TradeRule {
  give: Token[];
  get: Token[];
}

export interface SwapShopItem {
  rules: TradeRule[];
  question: Token[]; // what she has
  options: Token[][]; // 3-4 candidate piles
  answer: number; // index into options
  values: Partial<Record<Token, number>>; // hidden per-token value, never shown
}

type ValueMap = Partial<Record<Token, number>>;

/** Thrown internally when a bounded search can't find a fair combination; the caller re-seeds and retries the whole item. */
class GenFail extends Error {}

const MAX_ATTEMPTS = 200;
const RESEED_STEP = 1_000_003;
// Every rule side, the question, and every option is capped at this many
// token instances (owner decision #14: no cluttered, hard-to-count piles).
const MAX_LEN = 4;

function repeat(t: Token, n: number): Token[] {
  return Array.from({ length: n }, () => t);
}

function multisetKey(tokens: Token[]): string {
  return [...tokens].sort().join(",");
}

/** Sums the (hidden) values of a multiset of tokens. Missing values count as 0. */
export function totalValue(tokens: Token[], values: ValueMap): number {
  return tokens.reduce((sum, t) => sum + (values[t] ?? 0), 0);
}

function pickTwo(rng: Rng): [Token, Token] {
  const [a, b] = rng.shuffle(TOKENS).slice(0, 2);
  return [a, b];
}

function pickThree(rng: Rng): [Token, Token, Token] {
  const [a, b, c] = rng.shuffle(TOKENS).slice(0, 3);
  return [a, b, c];
}

/** Every non-empty multiset (size 1..maxLen) drawable, with repetition, from `tokens`. */
function allMultisets(tokens: Token[], maxLen: number): Token[][] {
  const out: Token[][] = [];
  const n = tokens.length;
  const current: Token[] = [];
  function rec(start: number) {
    if (current.length > 0) out.push([...current]);
    if (current.length === maxLen) return;
    for (let i = start; i < n; i++) {
      current.push(tokens[i]);
      rec(i);
      current.pop();
    }
  }
  rec(0);
  return out;
}

/** Closed-enumeration option set (d1-d5's "read off a single token" bands):
 * the counts 1-4 of one token are automatically all distinct totals, so
 * there is never a search or a GenFail here. */
function countOptionsRange(rng: Rng, token: Token, target: number): { options: Token[][]; answer: number } {
  const entries = [1, 2, 3, 4].map(n => ({ n, tokens: repeat(token, n) }));
  const shuffled = rng.shuffle(entries);
  return { options: shuffled.map(e => e.tokens), answer: shuffled.findIndex(e => e.n === target) };
}

/**
 * Builds `count` options drawn from `tokens` (2-3 distinct types) so exactly
 * one totals `target` under `values`, every option's total is pairwise
 * distinct, and the correct option is a genuinely different pile from
 * `avoid` (normally the question's own multiset) whenever one exists — the
 * answer should never be a bare restatement of the question.
 */
function buildMixedOptions(
  rng: Rng,
  tokens: Token[],
  values: ValueMap,
  target: number,
  avoid: Token[],
  count: number
): { options: Token[][]; answer: number } {
  const all = allMultisets(tokens, MAX_LEN).map(m => ({ m, total: totalValue(m, values) }));
  const avoidKey = multisetKey(avoid);

  const freshHits = all.filter(x => x.total === target && multisetKey(x.m) !== avoidKey);
  const pool = freshHits.length ? freshHits : all.filter(x => x.total === target);
  if (!pool.length) throw new GenFail("no combination reaches the target value");
  const mixedHits = pool.filter(x => new Set(x.m).size > 1);
  const correct = rng.pick(mixedHits.length ? mixedHits : pool).m;

  const usedTotals = new Set([target]);
  const candidates = rng.shuffle(all.filter(x => x.total !== target));
  const distractors: Token[][] = [];
  for (const cand of candidates) {
    if (usedTotals.has(cand.total)) continue;
    usedTotals.add(cand.total);
    distractors.push(cand.m);
    if (distractors.length === count - 1) break;
  }
  if (distractors.length < count - 1) throw new GenFail("not enough distinct-total distractors");

  const entries = [{ tokens: correct, isCorrect: true }, ...distractors.map(d => ({ tokens: d, isCorrect: false }))];
  const shuffled = rng.shuffle(entries);
  return { options: shuffled.map(e => e.tokens), answer: shuffled.findIndex(e => e.isCorrect) };
}

// d1: no rules; 1 copy of one token; "which is the same?" — options are 1
// (correct), 2, 3 copies of that same token. The most literal possible
// matching rule: the same thing is worth the same.
function buildD1(rng: Rng): SwapShopItem {
  const a = rng.pick(TOKENS);
  const values: ValueMap = { [a]: rng.int(1, 4) };
  const question = repeat(a, 1);
  const entries = [1, 2, 3].map(n => ({ n, tokens: repeat(a, n) }));
  const shuffled = rng.shuffle(entries);
  return { rules: [], question, options: shuffled.map(e => e.tokens), answer: shuffled.findIndex(e => e.n === 1), values };
}

// d2: no rules; matching counts 2-3 of one token, against the full 1-4 range.
function buildD2(rng: Rng): SwapShopItem {
  const a = rng.pick(TOKENS);
  const values: ValueMap = { [a]: rng.int(1, 4) };
  const k = rng.int(2, 3);
  const question = repeat(a, k);
  const { options, answer } = countOptionsRange(rng, a, k);
  return { rules: [], question, options, answer, values };
}

// d3: one rule shown (e.g. 1 star = 2 coins); the question repeats the
// rule's give side exactly (1 copy), so the answer is read straight off the
// rule — no arithmetic. Options are the full 1-4 count range of the "get" token.
function buildD3(rng: Rng): SwapShopItem {
  const [a, b] = pickTwo(rng);
  const R = rng.int(2, 3);
  const values: ValueMap = { [a]: R, [b]: 1 };
  const rules: TradeRule[] = [{ give: repeat(a, 1), get: repeat(b, R) }];
  const question = repeat(a, 1);
  const { options, answer } = countOptionsRange(rng, b, R);
  return { rules, question, options, answer, values };
}

// d4: the same rule shape as d3, but the question DOUBLES the give count
// ("you have 2 stars" instead of 1). The rule's ratio is restricted to 1-2
// (not d3's 2-3) purely so the doubled answer never needs more than 4 coins
// — the same "cap the base count so a later multiply survives the 4-token
// budget" trick figureWeights.ts uses for its own d5.
function buildD4(rng: Rng): SwapShopItem {
  const [a, b] = pickTwo(rng);
  const R = rng.int(1, 2);
  const values: ValueMap = { [a]: R, [b]: 1 };
  const rules: TradeRule[] = [{ give: repeat(a, 1), get: repeat(b, R) }];
  const question = repeat(a, 2);
  const { options, answer } = countOptionsRange(rng, b, 2 * R);
  return { rules, question, options, answer, values };
}

// d5: a bigger single-step trade rate (3-4 instead of 2-3) — a genuinely new
// idea — read off at a single copy rather than doubled. (Doubling a rate of
// 3-4 would need 6-8 coins, which no longer fits a plain count-of-one-token
// option; the "new idea" here is the bigger rate, not another multiply.)
function buildD5(rng: Rng): SwapShopItem {
  const [a, b] = pickTwo(rng);
  const R = rng.int(3, 4);
  const values: ValueMap = { [a]: R, [b]: 1 };
  const rules: TradeRule[] = [{ give: repeat(a, 1), get: repeat(b, R) }];
  const question = repeat(a, 1);
  const { options, answer } = countOptionsRange(rng, b, R);
  return { rules, question, options, answer, values };
}

// d6: one rule; the options can now MIX the two tokens instead of only
// showing counts of the "get" token (e.g. "1 star + 1 coin" for the same
// total as "3 coins") — the first appearance of a genuinely mixed pile.
function buildD6(rng: Rng): SwapShopItem {
  const [a, b] = pickTwo(rng);
  const R = rng.int(2, 3);
  const values: ValueMap = { [a]: R, [b]: 1 };
  const rules: TradeRule[] = [{ give: repeat(a, 1), get: repeat(b, R) }];
  const k = rng.int(1, 2);
  const question = repeat(a, k);
  const target = k * R;
  const { options, answer } = buildMixedOptions(rng, [a, b], values, target, question, 4);
  return { rules, question, options, answer, values };
}

// d7: two rules chained through a shared middle token (A -> B, C -> A), so
// working out what 1 C is worth in Bs takes two substitutions in a row.
// Ratios stay 1-2 so the compounded value never exceeds the 4-token cap.
function buildD7(rng: Rng): SwapShopItem {
  const [a, b, c] = pickThree(rng);
  const R1 = rng.int(1, 2);
  const R2 = rng.int(1, 2);
  const values: ValueMap = { [b]: 1, [a]: R1, [c]: R1 * R2 };
  const rules: TradeRule[] = [
    { give: repeat(a, 1), get: repeat(b, R1) },
    { give: repeat(c, 1), get: repeat(a, R2) },
  ];
  const question = repeat(c, 1);
  const target = R1 * R2;
  const { options, answer } = countOptionsRange(rng, b, target);
  return { rules, question, options, answer, values };
}

// d8: the same two chained rules, but now the options can mix any of the
// three tokens (not just plain counts of the base token).
function buildD8(rng: Rng): SwapShopItem {
  const [a, b, c] = pickThree(rng);
  const R1 = rng.int(1, 2);
  const R2 = rng.int(1, 2);
  const values: ValueMap = { [b]: 1, [a]: R1, [c]: R1 * R2 };
  const rules: TradeRule[] = [
    { give: repeat(a, 1), get: repeat(b, R1) },
    { give: repeat(c, 1), get: repeat(a, R2) },
  ];
  const question = repeat(c, 1);
  const target = R1 * R2;
  const { options, answer } = buildMixedOptions(rng, [a, b, c], values, target, question, 4);
  return { rules, question, options, answer, values };
}

// d9: same chained pair of rules, but now the QUESTION itself mixes two of
// the three tokens ("1 kite + 1 star"), not just a single type.
function buildD9(rng: Rng): SwapShopItem {
  const [a, b, c] = pickThree(rng);
  const R1 = rng.int(1, 2);
  const R2 = rng.int(1, 2);
  const values: ValueMap = { [b]: 1, [a]: R1, [c]: R1 * R2 };
  const rules: TradeRule[] = [
    { give: repeat(a, 1), get: repeat(b, R1) },
    { give: repeat(c, 1), get: repeat(a, R2) },
  ];
  const question = rng.shuffle([repeat(c, 1), repeat(a, 1)]).flat();
  const target = totalValue(question, values);
  const { options, answer } = buildMixedOptions(rng, [a, b, c], values, target, question, 4);
  return { rules, question, options, answer, values };
}

// d10: the capstone — three tokens, two chained rules, a mixed question AND
// mixed options, with a wider rate range (1-3) for extra stretch.
function buildD10(rng: Rng): SwapShopItem {
  const [a, b, c] = pickThree(rng);
  const R1 = rng.int(1, 3);
  const R2 = rng.int(1, 3);
  const values: ValueMap = { [b]: 1, [a]: R1, [c]: R1 * R2 };
  const rules: TradeRule[] = [
    { give: repeat(a, 1), get: repeat(b, R1) },
    { give: repeat(c, 1), get: repeat(a, R2) },
  ];
  const question = rng.shuffle([repeat(c, 1), repeat(a, 1)]).flat();
  const target = totalValue(question, values);
  const { options, answer } = buildMixedOptions(rng, [a, b, c], values, target, question, 4);
  return { rules, question, options, answer, values };
}

function buildItem(rng: Rng, d: Difficulty): SwapShopItem {
  if (d === 1) return buildD1(rng);
  if (d === 2) return buildD2(rng);
  if (d === 3) return buildD3(rng);
  if (d === 4) return buildD4(rng);
  if (d === 5) return buildD5(rng);
  if (d === 6) return buildD6(rng);
  if (d === 7) return buildD7(rng);
  if (d === 8) return buildD8(rng);
  if (d === 9) return buildD9(rng);
  return buildD10(rng); // d10
}

function generate(seed: number, d: Difficulty): SwapShopItem {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = makeRng(seed + attempt * RESEED_STEP);
    try {
      return buildItem(rng, d);
    } catch (e) {
      if (e instanceof GenFail) continue;
      throw e;
    }
  }
  throw new Error("swapShop: failed to generate a solvable item after many attempts");
}

function sample(): { item: SwapShopItem; explanation: string } {
  const item: SwapShopItem = {
    rules: [],
    question: ["⭐"],
    options: [["⭐"], ["⭐", "⭐"], ["⭐", "⭐", "⭐"]],
    answer: 0,
    values: { "⭐": 1 },
  };
  return {
    item,
    explanation: "One star is the same as one star. The same thing is worth the same.",
  };
}

function score(item: SwapShopItem, response: number | null): ScoreResult {
  const correct = response !== null && response === item.answer;
  return { points: correct ? 1 : 0, max: 1, correct };
}

function groupTokens(tokens: Token[]): { token: Token; count: number }[] {
  const order: Token[] = [];
  const counts = new Map<Token, number>();
  for (const t of tokens) {
    if (!counts.has(t)) order.push(t);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return order.map(token => ({ token, count: counts.get(token) ?? 0 }));
}

function renderGroup(tokens: Token[]): string {
  if (tokens.length === 0) return `<span class="group">nothing</span>`;
  return groupTokens(tokens)
    .map(g => `<span class="group">${g.count}&nbsp;${g.token}</span>`)
    .join(" + ");
}

/** Self-contained HTML audit view: trade cards, "you have", and the options with the correct pile outlined green. */
export function audit(item: SwapShopItem): string {
  const rulesHtml = item.rules
    .map(r => `<div class="card">${renderGroup(r.give)} <span class="arrow">&#8594;</span> ${renderGroup(r.get)}</div>`)
    .join("");
  const optionsHtml = item.options
    .map((opt, i) => `<div class="option${i === item.answer ? " correct" : ""}">${renderGroup(opt)}</div>`)
    .join("");
  return (
    `<div class="swap-shop">` +
    (rulesHtml ? `<div class="rules">${rulesHtml}</div>` : `<div class="rules"><em>no trade cards</em></div>`) +
    `<div class="question">You have: ${renderGroup(item.question)}</div>` +
    `<div class="options">${optionsHtml}</div>` +
    `<style>` +
    `.swap-shop{font-family:sans-serif;font-size:20px}` +
    `.card{border:2px solid #2bb3a9;border-radius:12px;padding:8px 12px;margin:4px;display:inline-block}` +
    `.arrow{margin:0 8px}` +
    `.question{margin:10px 0;font-weight:bold}` +
    `.option{border:4px solid #ccc;border-radius:12px;padding:8px 12px;margin:4px;display:inline-block}` +
    `.option.correct{border-color:#6fcf6f;background:rgba(111,207,111,0.15)}` +
    `</style>` +
    `</div>`
  );
}

/** GenreId "swapShop" isn't wired into GENRES/GENRE_LIST/VIEWS yet (those are
 * shared files this worker doesn't touch) — `e2e` is declared here, on the
 * genre object itself, ready for a future generic play-through harness to
 * pick up once integration adds it to the shared Genre type. */
export const swapShop: Genre<SwapShopItem, number> & { e2e: { kind: "options"; pick: number } } = {
  id: "swapShop",
  subtest: "Quantitative Substitution",
  domain: "FR",
  kidTitle: "Swap Shop",
  instructions:
    "Look at the trade cards. They show what you can swap for what. Then look at what you have, and tap the pile that shows what you would get.",
  sample,
  generate,
  score,
  timing: { kind: "item", ms: itemMs([[5, 45000], [10, 30000]]) },
  mode: "staircase",
  e2e: { kind: "options", pick: 1 },
};
