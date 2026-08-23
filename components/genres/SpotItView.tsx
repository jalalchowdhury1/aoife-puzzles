"use client";

import { useEffect, useRef } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { SpotItItem } from "@/lib/genres/spotIt";

/** Spot It (speed block): a target picture, a small group, YES/NO as fast as possible. */
export function SpotItView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<SpotItItem, boolean>) {
  const responded = useRef(false);

  useEffect(() => {
    onReady();
    // Fires exactly once when this item's stimulus mounts; onReady/onRespond
    // identity is not a dependency we want to re-trigger on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(value: boolean) {
    if (disabled || reveal || responded.current) return;
    responded.current = true;
    onRespond(value);
  }

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center bg-teal-100 rounded-3xl p-3"
          style={{ width: 96, height: 96, fontSize: 56 }}
        >
          <span>{item.target}</span>
        </div>

        <div className="self-stretch w-px bg-ink/15" />

        <div className="flex gap-3">
          {item.group.map((icon, i) => {
            const isMatch = reveal && icon === item.target;
            return (
              <div
                key={i}
                className={`flex items-center justify-center rounded-2xl border-2 ${
                  isMatch ? "border-[#6fcf6f] bg-[#eaf9ea]" : "border-teal-100 bg-cream"
                }`}
                style={{ width: 88, height: 88, fontSize: 48 }}
              >
                <span>{icon}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reveal ? (
        <div className="flex gap-6">
          {[true, false].map(val => {
            const isCorrect = val === item.present;
            const isHerWrongPick = !isCorrect && lastResponse === val;
            const cls = isCorrect
              ? "bg-[#eaf9ea] border-[#6fcf6f] ring-4 ring-[#6fcf6f] text-ink"
              : isHerWrongPick
                ? "bg-white border-rose-400 ring-4 ring-rose-400 text-ink"
                : "bg-white border-teal-100 text-ink/40";
            return (
              <div
                key={String(val)}
                className={`flex items-center justify-center font-bubble rounded-2xl border-4 ${cls}`}
                style={{ width: 150, height: 100, fontSize: 32 }}
              >
                {val ? "YES" : "NO"}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-6">
          <button
            type="button"
            data-testid="answer-option"
            disabled={disabled}
            onClick={() => respond(true)}
            className="flex items-center justify-center bg-teal-400 text-cream font-bubble rounded-2xl active:bg-teal-600 disabled:opacity-60"
            style={{ width: 150, height: 100, fontSize: 32 }}
          >
            YES
          </button>
          <button
            type="button"
            data-testid="answer-option"
            disabled={disabled}
            onClick={() => respond(false)}
            className="flex items-center justify-center bg-rose-400 text-cream font-bubble rounded-2xl active:opacity-80 disabled:opacity-60"
            style={{ width: 150, height: 100, fontSize: 32 }}
          >
            NO
          </button>
        </div>
      )}
    </div>
  );
}

export default SpotItView;
