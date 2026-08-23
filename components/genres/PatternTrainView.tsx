"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { PatternTrainItem } from "@/lib/genres/patternTrain";
import { Figure } from "@/components/Figure";

const CAR_BOX = 72;
const OPTION_BOX = 84;
const WHEEL = 12;

/** Pattern Train: a train of carriages with the last one empty; pick the figure that keeps the pattern going. */
export default function PatternTrainView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<PatternTrainItem, number>) {
  const [selected, setSelected] = useState<number | null>(null);

  // A new item is a new object reference; reset the selection during render
  // (React's documented "adjust state when a prop changes" pattern) rather
  // than in an effect, so there is no extra render pass.
  const [shownItem, setShownItem] = useState(item);
  if (item !== shownItem) {
    setShownItem(item);
    setSelected(null);
  }

  useEffect(() => {
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i: number) => {
    if (disabled || reveal) return;
    setSelected(i);
  };

  const confirm = () => {
    if (disabled || reveal || selected === null) return;
    onRespond(selected);
  };

  const correctFigure = item.options[item.answer];

  return (
    // QA 2026-08-23: the train + options live in their OWN
    // flex-1/min-h-0/overflow-y-auto region, so they scroll *internally* if
    // ever taller than the available space, instead of pushing Done below
    // the fold — Done is a plain sibling AFTER that region, never part of
    // the scroll, so it's always fully visible without scrolling.
    <div className="flex min-h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center-safe gap-8 overflow-y-auto p-4 pb-2">
        <div className="flex w-full max-w-full items-end gap-2 overflow-x-auto px-2 py-2">
          <span className="shrink-0" style={{ fontSize: CAR_BOX * 0.7, lineHeight: 1 }} aria-hidden>
            🚂
          </span>

          {item.cars.map((car, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center">
              <div
                className="flex items-center justify-center rounded-2xl bg-white shadow-sm"
                style={{ width: CAR_BOX, height: CAR_BOX }}
              >
                <Figure f={car} box={CAR_BOX * 0.75} />
              </div>
              <div className="-mt-1 flex gap-4">
                <span className="rounded-full bg-ink/60" style={{ width: WHEEL, height: WHEEL }} />
                <span className="rounded-full bg-ink/60" style={{ width: WHEEL, height: WHEEL }} />
              </div>
            </div>
          ))}

          <div className="flex shrink-0 flex-col items-center">
            {reveal ? (
              <div
                className="flex items-center justify-center rounded-2xl bg-white shadow-sm ring-4 ring-[#6fcf6f]"
                style={{ width: CAR_BOX, height: CAR_BOX }}
              >
                <Figure f={correctFigure} box={CAR_BOX * 0.75} />
              </div>
            ) : (
              <div
                className="flex items-center justify-center rounded-2xl border-4 border-dashed border-teal-400 text-3xl font-bubble text-teal-600"
                style={{ width: CAR_BOX, height: CAR_BOX }}
              >
                ?
              </div>
            )}
            <div className="-mt-1 flex gap-4">
              <span className="rounded-full bg-ink/60" style={{ width: WHEEL, height: WHEEL }} />
              <span className="rounded-full bg-ink/60" style={{ width: WHEEL, height: WHEEL }} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {item.options.map((opt, i) => {
            if (reveal) {
              const isCorrect = i === item.answer;
              const isWrongPick = !isCorrect && lastResponse === i;
              const revealClass = isCorrect
                ? "border-[#6fcf6f] bg-[#6fcf6f]/15"
                : isWrongPick
                  ? "border-rose-400 bg-white"
                  : "border-transparent bg-white opacity-40";
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center rounded-2xl border-4 ${revealClass}`}
                  style={{ width: OPTION_BOX, height: OPTION_BOX }}
                >
                  <Figure f={opt} box={OPTION_BOX * 0.75} />
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                data-testid="answer-option"
                onClick={() => pick(i)}
                disabled={disabled}
                aria-pressed={selected === i}
                className={`flex items-center justify-center rounded-2xl border-4 bg-white transition-colors ${
                  selected === i ? "border-teal-600 bg-teal-100" : "border-transparent"
                }`}
                style={{ width: OPTION_BOX, height: OPTION_BOX }}
              >
                <Figure f={opt} box={OPTION_BOX * 0.75} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-full shrink-0 justify-center bg-cream px-4 pb-4 pt-3 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.15)]">
        <button
          type="button"
          data-testid="done"
          onClick={confirm}
          disabled={disabled || reveal || selected === null}
          className="min-h-16 min-w-40 rounded-full bg-teal-400 px-8 text-2xl font-bubble text-white disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}
