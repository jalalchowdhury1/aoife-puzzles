"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { SwapShopItem, Token } from "@/lib/genres/swapShop";

function groupTokens(tokens: Token[]): { token: Token; count: number }[] {
  const order: Token[] = [];
  const counts = new Map<Token, number>();
  for (const t of tokens) {
    if (!counts.has(t)) order.push(t);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return order.map(token => ({ token, count: counts.get(token) ?? 0 }));
}

/** Renders a token multiset as small grouped chips ("2 ⭐ + 1 🪙") instead of
 * one glyph per instance — much easier to read at a glance than a wall of
 * repeated emoji, and it's what the "1 ⭐ + 1 🪙" mixed-option notation implies. */
function TokenChips({ tokens, emojiClass = "text-4xl" }: { tokens: Token[]; emojiClass?: string }) {
  const groups = groupTokens(tokens);
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-2">
      {groups.map((g, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && (
            <span className="text-2xl text-ink/50" aria-hidden>
              +
            </span>
          )}
          <span className="text-xl font-bold text-ink">{g.count}</span>
          <span className={emojiClass} aria-hidden>
            {g.token}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Swap Shop: trade cards show exchange rules; she taps the pile that matches what she has. */
export function SwapShopView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<SwapShopItem, number>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shownItem, setShownItem] = useState(item);

  // Reset the local pick during render when a new item arrives, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (item !== shownItem) {
    setShownItem(item);
    setSelected(null);
  }

  useEffect(() => {
    // Everything (rules, question, options) is drawn synchronously on mount;
    // onReady should fire once per item, not on every parent re-render.
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function submit() {
    if (disabled || reveal || selected === null) return;
    onRespond(selected);
  }

  return (
    // QA 2026-08-23: the rules/question/options live in their OWN
    // flex-1/min-h-0/overflow-y-auto region, so they scroll *internally* if
    // ever taller than the available space, instead of pushing Done below
    // the fold — Done is a plain sibling AFTER that region, never part of
    // the scroll, so it's always fully visible without scrolling.
    <div className="flex min-h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 min-h-0 flex-col items-center gap-6 overflow-y-auto p-4 pb-2">
        {item.rules.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {item.rules.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border-4 border-teal-100 bg-white px-4 py-3">
                <TokenChips tokens={r.give} />
                <span className="text-3xl text-teal-500" aria-hidden>
                  →
                </span>
                <TokenChips tokens={r.get} />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 rounded-2xl bg-teal-100 px-6 py-4">
          <p className="text-lg font-semibold text-ink/70">You have</p>
          <TokenChips tokens={item.question} emojiClass="text-5xl" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {item.options.map((opt, i) => {
            if (reveal) {
              const isCorrect = i === item.answer;
              const isWrongPick = !isCorrect && lastResponse === i;
              const revealClass = isCorrect
                ? "border-[#6fcf6f] bg-[#6fcf6f]/15"
                : isWrongPick
                  ? "border-[#f06b7a] bg-[#f06b7a]/10"
                  : "border-teal-100 bg-white opacity-40";
              return (
                <div
                  key={i}
                  className={`flex min-h-16 min-w-16 items-center justify-center rounded-2xl border-4 p-3 ${revealClass}`}
                >
                  <TokenChips tokens={opt} />
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                data-testid="answer-option"
                disabled={disabled}
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
                className={`flex min-h-16 min-w-16 items-center justify-center rounded-2xl border-4 bg-white p-3 ${
                  selected === i ? "border-teal-400" : "border-teal-100"
                }`}
              >
                <TokenChips tokens={opt} />
              </button>
            );
          })}
        </div>
      </div>

      {!reveal && (
        <div className="w-full shrink-0 bg-cream px-4 pb-4 pt-3 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.15)]">
          <button
            type="button"
            data-testid="done"
            disabled={disabled || selected === null}
            onClick={submit}
            className="mx-auto block min-h-16 min-w-32 rounded-full bg-teal-400 px-8 text-2xl font-bold text-white disabled:opacity-40"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default SwapShopView;
