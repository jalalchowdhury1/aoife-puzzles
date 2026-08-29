// Which Two Belong? (owner decision #16, "similar, not same"): a cousin of
// category reasoning — the same muscle as Similarities and the parked
// "Picture Concepts" idea (AGENTS.md's TODO list), built as a clearly
// different mechanic: four pictures/words, tap the TWO that belong
// together, then tap the best reason why. Untimed, bank backed (see
// lib/genres/banks/whichTwo.ts for the authored items and the pattern this
// module borrows from lib/genres/bankGenre.ts's makeChoiceGenre, which does
// not fit here since the item/response shape — a pair plus a reason — is
// not a single-prompt multiple choice question.
import type { Difficulty, Genre, GenerateOpts, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { WHICH_TWO_BANK, type WhichTwoBankItem, type WhichTwoOption, type WhichTwoReason } from "./banks/whichTwo";

export type { WhichTwoOption, WhichTwoReason, WhichTwoBankItem } from "./banks/whichTwo";

export interface WhichTwoItem {
  bankId: string;
  d: Difficulty;
  items: [WhichTwoOption, WhichTwoOption, WhichTwoOption, WhichTwoOption];
  /** Indices into `items` (post shuffle) of the two that belong together. */
  pair: [number, number];
  reasons: [WhichTwoReason, WhichTwoReason, WhichTwoReason];
  explanation: string;
}

export interface WhichTwoResponse { pair: number[]; reason: number }

/**
 * Picks a bank item at difficulty `d`, excluding `exclude`; widens |d' - d|
 * outward if the exact tier is empty. Mirrors bankGenre.ts's own (private)
 * pickWidening — kept local here since that file is shared and off limits
 * to this genre's worktree, and this genre's bank item shape does not fit
 * makeChoiceGenre's ChoiceBankItem contract anyway.
 */
function pickWidening(d: Difficulty, exclude: Set<string>, rng: Rng): WhichTwoBankItem {
  for (let widen = 0; widen <= 9; widen++) {
    const candidates = WHICH_TWO_BANK.filter(b => Math.abs(b.d - d) === widen && !exclude.has(b.id));
    if (candidates.length > 0) return rng.pick(candidates);
  }
  const fallback = WHICH_TWO_BANK.filter(b => !exclude.has(b.id));
  if (fallback.length > 0) return rng.pick(fallback);
  return rng.pick(WHICH_TWO_BANK);
}

function isSamePair(a: readonly number[], b: readonly [number, number]): boolean {
  if (a.length !== 2) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa[0] === sb[0] && sa[1] === sb[1];
}

export const whichTwo: Genre<WhichTwoItem, WhichTwoResponse> = {
  id: "whichTwo",
  subtest: "Picture Concepts",
  domain: "VC",
  kidTitle: "Which Two Belong?",
  instructions:
    "Look at the four pictures. Tap the two that go together. Then tap the best reason why they go together.",
  // Widened to 15 on 2026-08-29 (decision #17 earned, decision #26): her Level
  // 8C probe scored 10/10 and topped d10 with no miss, so the old cap was
  // measuring the bank rather than her. See banks/whichTwo.ts for the ramp.
  maxDifficulty: 15,

  sample() {
    const found = WHICH_TWO_BANK.find(b => b.id === "wt-01")!;
    const item: WhichTwoItem = {
      bankId: found.id,
      d: found.d,
      items: found.items,
      pair: found.pair,
      reasons: found.reasons,
      explanation: found.explanation,
    };
    return {
      item,
      explanation: "The apple and the banana are both fruit. That is the best reason, so it gets picked.",
    };
  },

  generate(seed: number, d: Difficulty, opts?: GenerateOpts): WhichTwoItem {
    const rng = makeRng(seed);
    const exclude = new Set(opts?.excludeBankIds ?? []);
    const picked = pickWidening(d, exclude, rng);

    // Shuffle the four options' on-screen order (and recompute `pair`
    // against the new positions) so the pair is never predictably at the
    // same two spots every time.
    const order = rng.shuffle([0, 1, 2, 3]);
    const items = order.map(origIdx => picked.items[origIdx]) as [WhichTwoOption, WhichTwoOption, WhichTwoOption, WhichTwoOption];
    const newPairUnsorted = order.reduce<number[]>((acc, origIdx, pos) => {
      if (picked.pair.includes(origIdx)) acc.push(pos);
      return acc;
    }, []);
    const pair: [number, number] = [Math.min(...newPairUnsorted), Math.max(...newPairUnsorted)];
    const reasons = rng.shuffle(picked.reasons) as [WhichTwoReason, WhichTwoReason, WhichTwoReason];

    return { bankId: picked.id, d: picked.d, items, pair, reasons, explanation: picked.explanation };
  },

  score(item: WhichTwoItem, response: WhichTwoResponse | null): ScoreResult {
    const max = 2;
    if (!response || !Array.isArray(response.pair)) return { points: 0, max, correct: false };
    if (!isSamePair(response.pair, item.pair)) return { points: 0, max, correct: false };
    const reason = item.reasons[response.reason];
    const points = reason && reason.points === 2 ? 2 : 1;
    return { points, max, correct: points >= 1 };
  },

  bankId(item: WhichTwoItem): string | undefined {
    return item.bankId;
  },

  timing: { kind: "none" },
  mode: "staircase",
};

export default whichTwo;

// ---------------------------------------------------------------------------
// Future data-driven play-through harness plan. e2e/playthrough.spec.ts is a
// shared file this genre's worktree does not edit (see the common brief);
// this constant documents the intended generic plan so wiring it in later is
// a lookup, not a redesign — tap the first two answer-options (the tile
// pair) and, once the reason panel renders, the first reason, then Done. See
// components/genres/WhichTwoView.tsx for the data-testid contract this
// depends on: all four tiles carry `answer-option` until a pair is picked,
// then none of them do (only the three reasons do) until Done.
// ---------------------------------------------------------------------------
export const e2ePlan = { kind: "options", pick: 3 } as const;

// ---------------------------------------------------------------------------
// Audit (owner decision #14: validity is sacred). A self-contained HTML
// fragment for a per-item review page — not wired into the shared
// scripts/audit-items.ts from this worktree, but ready to be plugged in
// there as a RENDERERS[id] entry.
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function audit(item: WhichTwoItem): string {
  const tilesHtml = item.items
    .map((opt, i) => {
      const isPair = item.pair.includes(i);
      const border = isPair ? "3px solid #2ecc71" : "2px solid #e2e2e2";
      const bg = isPair ? "#eafaf0" : "#fff";
      const emoji = opt.emoji ? `<div style="font-size:22px;">${esc(opt.emoji)}</div>` : "";
      return (
        `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;` +
        `width:96px;height:72px;margin:4px;border:${border};border-radius:10px;background:${bg};` +
        `font-family:-apple-system,sans-serif;font-size:13px;text-align:center;padding:4px;">` +
        `${emoji}<div>${esc(opt.text)}</div></div>`
      );
    })
    .join("");
  const reasonsHtml = item.reasons
    .map(r => {
      const isBest = r.points === 2;
      const border = isBest ? "3px solid #2ecc71" : "1px solid #ddd";
      const bg = isBest ? "#eafaf0" : "#fff";
      return (
        `<div style="border:${border};border-radius:8px;background:${bg};padding:4px 8px;margin:3px 0;` +
        `font-family:-apple-system,sans-serif;font-size:12px;">${esc(r.text)} <span style="color:#999;">(${r.points}pt)</span></div>`
      );
    })
    .join("");
  return (
    `<div style="font-family:-apple-system,sans-serif;">` +
    `<div style="display:flex;flex-wrap:wrap;">${tilesHtml}</div>` +
    `<div style="margin-top:6px;">${reasonsHtml}</div>` +
    `<div style="font-size:11px;color:#888;margin-top:4px;">${esc(item.explanation)}</div>` +
    `</div>`
  );
}
