"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { ChoiceItem } from "@/lib/genres/bankGenre";
import { speak } from "@/lib/engine/speech";

/** Shared view for the four bank-backed multiple choice genres (Alike, Meaning, Do You Know, What Should You Do). */
export function ChoiceView({ item, disabled, onReady, onRespond }: GenreViewProps<ChoiceItem, number>) {
  const [prevItem, setPrevItem] = useState(item);
  const [selected, setSelected] = useState<number | null>(null);

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

  const handleDone = () => {
    if (disabled || selected === null) return;
    onRespond(selected);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-4">
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
        {item.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => setSelected(i)}
            className={`min-h-[72px] rounded-2xl px-4 py-3 text-[22px] text-left font-body border-4 transition-colors ${
              selected === i ? "bg-teal-400 border-teal-600 text-white" : "bg-white border-teal-100 text-ink"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleDone}
        disabled={disabled || selected === null}
        className="min-h-[64px] px-10 rounded-full bg-amber-400 text-[22px] font-bold text-ink disabled:opacity-40"
      >
        Done
      </button>
    </div>
  );
}

export default ChoiceView;
