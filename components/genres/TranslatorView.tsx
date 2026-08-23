"use client";

import { useEffect, useRef } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { TranslatorItem } from "@/lib/genres/translator";

/** Translator (cousin of lookup speed): a fixed animal-to-food key, tap the
 * food the big animal gets, as fast as possible. Speed-block genre — the
 * runner never sends `reveal` for these (see app/play/page.tsx), so, like
 * CodingView/SymbolSearchView, this view doesn't implement it. */
export function TranslatorView({ item, disabled, onReady, onRespond }: GenreViewProps<TranslatorItem, string>) {
  const responded = useRef(false);

  useEffect(() => {
    onReady();
    // Fires exactly once when this item's stimulus mounts; onReady/onRespond
    // identity is not a dependency we want to re-trigger on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(food: string) {
    if (disabled || responded.current) return;
    responded.current = true;
    onRespond(food);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 p-4">
      <div className="flex flex-wrap justify-center gap-3 rounded-3xl bg-teal-100 p-3">
        {item.key.map(({ animal, food }) => (
          <div key={animal} className="flex flex-col items-center gap-1 rounded-2xl bg-cream p-2">
            <span className="text-3xl">{animal}</span>
            <span className="text-3xl">{food}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center justify-center rounded-3xl bg-teal-100 p-4" style={{ width: 130, height: 130 }}>
          <span style={{ fontSize: 80 }}>{item.animal}</span>
        </div>
        <div className="flex gap-2">
          {item.lookahead.map((a, i) => (
            <span key={i} className="opacity-35" style={{ fontSize: 40 }}>
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {item.key.map(({ food }) => (
          <button
            key={food}
            type="button"
            data-testid="answer-option"
            disabled={disabled}
            onClick={() => respond(food)}
            className="flex items-center justify-center rounded-2xl bg-teal-400 text-cream active:bg-teal-600 disabled:opacity-60"
            style={{ width: 88, height: 88, fontSize: 44 }}
          >
            {food}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TranslatorView;
