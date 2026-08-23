"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { WhichTwoItem, WhichTwoResponse } from "@/lib/genres/whichTwo";

/** Which Two Belong?: tap the two that go together, then tap the best reason why. */
export function WhichTwoView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<WhichTwoItem, WhichTwoResponse>) {
  const [prevItem, setPrevItem] = useState(item);
  const [pair, setPair] = useState<number[]>([]);
  const [reason, setReason] = useState<number | null>(null);

  // A fresh item (new object each `generate()` call) means the previous
  // picks no longer apply. Reset during render rather than in an effect,
  // per https://react.dev/learn/you-might-not-need-an-effect.
  if (item !== prevItem) {
    setPrevItem(item);
    setPair([]);
    setReason(null);
  }

  useEffect(() => {
    onReady();
  }, [item, onReady]);

  function toggleTile(i: number) {
    if (disabled || reveal) return;
    setPair(p => {
      if (p.includes(i)) return p.filter(x => x !== i);
      if (p.length >= 2) return p;
      return [...p, i];
    });
  }

  function chooseReason(i: number) {
    if (disabled || reveal) return;
    setReason(i);
  }

  function submit() {
    if (disabled || reveal) return;
    if (pair.length !== 2 || reason === null) return;
    onRespond({ pair, reason });
  }

  const showReasons = pair.length === 2;

  if (reveal) {
    const herPair = lastResponse?.pair ?? [];
    const herReason = lastResponse?.reason ?? -1;
    const bestReasonIdx = item.reasons.findIndex(r => r.points === 2);

    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {item.items.map((opt, i) => {
            const isCorrect = item.pair.includes(i);
            const isHerWrongPick = !isCorrect && herPair.includes(i);
            const cls = isCorrect
              ? "bg-[#eaf9ea] border-[#6fcf6f] ring-4 ring-[#6fcf6f]"
              : isHerWrongPick
                ? "bg-white border-rose-400 ring-4 ring-rose-400"
                : "bg-white border-teal-100 opacity-60";
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-4 p-3 ${cls}`}
                style={{ width: 120, minHeight: 88 }}
              >
                {opt.emoji && <span className="text-3xl">{opt.emoji}</span>}
                <span className="text-lg font-body text-ink text-center">{opt.text}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 w-full">
          {item.reasons.map((r, i) => {
            const isBest = i === bestReasonIdx;
            const isHerWrongReason = !isBest && herReason === i;
            const cls = isBest
              ? "bg-[#eaf9ea] border-[#6fcf6f] ring-4 ring-[#6fcf6f]"
              : isHerWrongReason
                ? "bg-white border-rose-400 ring-4 ring-rose-400"
                : "bg-white border-teal-100";
            return (
              <div
                key={i}
                className={`min-h-[56px] flex items-center rounded-2xl px-4 py-3 text-lg text-left font-body border-4 text-ink ${cls}`}
              >
                {r.text}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-4">
      <p className="text-xl text-ink text-center">Tap the two that go together.</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {item.items.map((opt, i) => {
          const isSelected = pair.includes(i);
          const canPick = isSelected || pair.length < 2;
          return (
            <button
              key={i}
              type="button"
              data-testid={!isSelected && pair.length < 2 ? "answer-option" : undefined}
              onClick={() => toggleTile(i)}
              disabled={disabled || !canPick}
              aria-pressed={isSelected}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-4 p-3 transition-colors disabled:opacity-40 ${
                isSelected ? "bg-teal-400 border-teal-600 text-white" : "bg-white border-teal-100 text-ink"
              }`}
              style={{ width: 120, minHeight: 88 }}
            >
              {opt.emoji && <span className="text-3xl">{opt.emoji}</span>}
              <span className="text-lg font-body text-center">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {showReasons && (
        <div className="flex flex-col gap-3 w-full">
          <p className="text-lg text-ink text-center">Why do they go together?</p>
          {item.reasons.map((r, i) => (
            <button
              key={i}
              type="button"
              data-testid="answer-option"
              onClick={() => chooseReason(i)}
              disabled={disabled}
              className={`min-h-[64px] rounded-2xl px-4 py-3 text-lg text-left font-body border-4 transition-colors ${
                reason === i ? "bg-amber-400 border-amber-600 text-ink" : "bg-white border-teal-100 text-ink"
              }`}
            >
              {r.text}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        data-testid="done"
        onClick={submit}
        disabled={disabled || pair.length !== 2 || reason === null}
        className="min-h-[64px] px-10 rounded-full bg-teal-400 text-[22px] font-bold text-white disabled:opacity-40"
      >
        Done
      </button>
    </div>
  );
}

export default WhichTwoView;
