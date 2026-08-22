"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { ArithmeticItem } from "@/lib/genres/bankGenre";
import { speak, speechAvailable } from "@/lib/engine/speech";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** View for Story Sums (Arithmetic). Speaks the problem on mount, then shows a numpad. */
export function ArithmeticView({ item, disabled, display, onReady, onRespond }: GenreViewProps<ArithmeticItem, number>) {
  const [prevItem, setPrevItem] = useState(item);
  const [value, setValue] = useState("");
  const [replayed, setReplayed] = useState(false);

  const showText = display === undefined || display === "both";
  const audioFallback = !speechAvailable();

  // A fresh item (new object each `generate()` call) means the previous
  // answer and replay state no longer apply. Reset during render rather
  // than in an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  if (item !== prevItem) {
    setPrevItem(item);
    setValue("");
    setReplayed(false);
  }

  useEffect(() => {
    if (audioFallback) {
      onReady();
      return;
    }
    let cancelled = false;
    void speak(item.text).then(() => {
      if (!cancelled) onReady();
    });
    return () => {
      cancelled = true;
    };
  }, [item, onReady, audioFallback]);

  const appendDigit = (d: string) => {
    if (disabled) return;
    setValue(v => (v.length >= 6 ? v : v + d));
  };
  const backspace = () => {
    if (disabled) return;
    setValue(v => v.slice(0, -1));
  };
  const listenAgain = () => {
    if (disabled || replayed) return;
    setReplayed(true);
    void speak(item.text);
  };
  const handleDone = () => {
    if (disabled || value === "") return;
    onRespond(Number(value), { replayed, audioFallback });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-4">
      {showText ? (
        <p className="text-[28px] leading-snug font-bold text-center text-ink">{item.text}</p>
      ) : (
        <button
          type="button"
          onClick={listenAgain}
          disabled={disabled || replayed}
          className="min-h-[72px] px-6 rounded-2xl bg-teal-100 text-[22px] font-bold text-ink disabled:opacity-40"
        >
          👂 Listen again
        </button>
      )}

      <div className="text-[36px] font-bold text-ink min-h-[48px]" aria-live="polite">
        {value || " "}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {DIGITS.map(d => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => appendDigit(d)}
            className="min-h-[64px] rounded-2xl bg-white border-4 border-teal-100 text-[24px] font-bold text-ink active:scale-95"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={backspace}
          aria-label="Backspace"
          className="min-h-[64px] rounded-2xl bg-rose-400 text-white text-[24px] font-bold active:scale-95"
        >
          ⌫
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => appendDigit("0")}
          className="min-h-[64px] rounded-2xl bg-white border-4 border-teal-100 text-[24px] font-bold text-ink active:scale-95"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled || value === ""}
          onClick={handleDone}
          className="min-h-[64px] rounded-2xl bg-amber-400 text-[22px] font-bold text-ink disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default ArithmeticView;
