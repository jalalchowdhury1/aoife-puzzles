"use client";

import { useEffect, useRef, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { ChoiceItem } from "@/lib/genres/bankGenre";
import { speak } from "@/lib/engine/speech";

/** Shared view for the four bank-backed multiple choice genres (Alike, Meaning, Do You Know, What Should You Do). */
export function ChoiceView({ item, disabled, reveal, lastResponse, onReady, onRespond }: GenreViewProps<ChoiceItem, number>) {
  const [prevItem, setPrevItem] = useState(item);
  const [selected, setSelected] = useState<number | null>(null);
  const correctRef = useRef<HTMLButtonElement | null>(null);

  // A fresh item (new object each `generate()` call) means the previous
  // selection no longer applies. Reset it during render rather than in an
  // effect, per https://react.dev/learn/you-might-not-need-an-effect.
  if (item !== prevItem) {
    setPrevItem(item);
    setSelected(null);
  }

  useEffect(() => {
    onReady();
  }, [item, onReady]);

  // QA 2026-08-23: on a long options/reasons list (Fill the Gap, What Would
  // You Do?), the correct answer could sit below the fold when reveal opens
  // — and the reveal auto-advances after a few seconds regardless, so she'd
  // never actually see it. Scroll it into view the moment reveal renders.
  useEffect(() => {
    if (reveal) correctRef.current?.scrollIntoView({ block: "center" });
  }, [reveal, item]);

  const handleDone = () => {
    if (disabled || reveal || selected === null) return;
    onRespond(selected);
  };

  // In reveal, inputs are inert: no selection, no Done. The top-scoring
  // option is highlighted green, a 1-point (partial credit) option amber,
  // and her own wrong pick rose — using `lastResponse`, not local `selected`
  // state, since this is the answer the runner actually recorded.
  const maxPoints = reveal ? Math.max(...item.options.map(o => o.points)) : -1;

  return (
    // QA 2026-08-23: the stimulus (emoji/prompt/options) lives in its OWN
    // flex-1/min-h-0/overflow-y-auto region, so it scrolls *internally* if
    // it's ever taller than the available space (a long options list — Fill
    // the Gap, What Would You Do?), instead of pushing Done below the fold —
    // Done is a plain sibling AFTER that region, never part of the scroll,
    // so it's always fully visible without scrolling.
    <div className="flex min-h-full w-full max-w-xl mx-auto flex-col items-center">
      <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center-safe gap-6 overflow-y-auto p-4 pb-2">
        {item.emoji && (
          <div className="text-8xl leading-none" aria-hidden>
            {item.emoji}
          </div>
        )}
        <div className="flex items-center justify-center gap-3 w-full">
          <p className="text-[28px] leading-snug font-bold text-center text-ink">{item.prompt}</p>
          <button
            type="button"
            onClick={() => void speak(item.prompt)}
            aria-label="Read the question aloud"
            className="shrink-0 w-16 h-16 rounded-full bg-teal-100 text-3xl flex items-center justify-center active:scale-95"
          >
            🔊
          </button>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {item.options.map((opt, i) => {
            if (!reveal) {
              return (
                <button
                  key={i}
                  type="button"
                  data-testid="answer-option"
                  disabled={disabled}
                  onClick={() => setSelected(i)}
                  className={`min-h-[72px] rounded-2xl px-4 py-3 text-[22px] text-left font-body border-4 transition-colors ${
                    selected === i ? "bg-teal-400 border-teal-600 text-white" : "bg-white border-teal-100 text-ink"
                  }`}
                >
                  {opt.text}
                </button>
              );
            }
            const isTop = opt.points === maxPoints;
            const isHerWrongPick = !isTop && lastResponse === i;
            const isAmber = !isTop && !isHerWrongPick && opt.points === 1;
            const revealClasses = isTop
              ? "bg-[#eaf9ea] border-[#6fcf6f] ring-4 ring-[#6fcf6f] text-ink"
              : isHerWrongPick
                ? "bg-white border-rose-400 ring-4 ring-rose-400 text-ink"
                : isAmber
                  ? "bg-white border-amber-400 ring-4 ring-amber-400 text-ink"
                  : "bg-white border-teal-100 text-ink";
            return (
              <button
                key={i}
                type="button"
                ref={isTop ? correctRef : undefined}
                disabled={disabled}
                className={`min-h-[72px] rounded-2xl px-4 py-3 text-[22px] text-left font-body border-4 transition-colors ${revealClasses}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
      {!reveal && (
        <div className="flex w-full shrink-0 justify-center bg-cream px-4 pb-4 pt-3 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.15)]">
          <button
            type="button"
            onClick={handleDone}
            disabled={disabled || selected === null}
            className="min-h-[64px] px-10 rounded-full bg-amber-400 text-[22px] font-bold text-ink disabled:opacity-40"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default ChoiceView;
