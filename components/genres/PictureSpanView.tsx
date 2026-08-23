"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { PictureSpanItem } from "@/lib/genres/pictureSpan";

type Phase = "show" | "pick";

/** Picture Memory (Picture Span): shows a row of pictures, then asks for them back in order. */
export function PictureSpanView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<PictureSpanItem, string[]>) {
  const [prevItem, setPrevItem] = useState(item);
  const [phase, setPhase] = useState<Phase>("show");
  const [tray, setTray] = useState<string[]>([]);

  // Reset local state during render when a new item arrives, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (item !== prevItem) {
    setPrevItem(item);
    setPhase("show");
    setTray([]);
  }

  // Run the exposure timer for the current item, then reveal the response grid.
  // Reveal mode skips straight to showing the answer: no exposure timer, no
  // phase transition — just the one onReady() call every mount already makes.
  useEffect(() => {
    if (reveal) {
      onReady();
      return;
    }
    const timer = setTimeout(() => {
      setPhase("pick");
      onReady();
    }, item.exposureMs);
    return () => clearTimeout(timer);
  }, [item, onReady, reveal]);

  function tapChoice(icon: string) {
    if (disabled || reveal) return;
    setTray(t => [...t, icon]);
  }

  function removeLast() {
    if (disabled || reveal) return;
    setTray(t => t.slice(0, -1));
  }

  function submit() {
    if (disabled || reveal || tray.length === 0) return;
    onRespond(tray);
  }

  if (reveal) {
    const tapped = lastResponse ?? [];
    return (
      <div className="flex flex-1 flex-col items-center justify-center-safe gap-8 p-6">
        <p className="text-2xl text-ink">Here they are, in order.</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {item.shown.map((icon, i) => (
            <div
              key={i}
              className="relative flex items-center justify-center rounded-3xl bg-teal-100"
              style={{ width: 112, height: 112, fontSize: 64 }}
            >
              <span>{icon}</span>
              <span
                className="absolute -right-2 -top-2 flex items-center justify-center rounded-full bg-[#6fcf6f] text-base font-bold text-white"
                style={{ width: 28, height: 28 }}
              >
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 opacity-50">
          <p className="text-lg text-ink">You tapped</p>
          <div className="flex min-h-16 w-full max-w-xl flex-wrap items-center justify-center gap-3 rounded-2xl bg-teal-100 p-3">
            {tapped.length === 0 ? (
              <span className="text-xl text-ink/60">Nothing</span>
            ) : (
              tapped.map((icon, i) => (
                <span
                  key={`${icon}-${i}`}
                  className="flex items-center justify-center rounded-xl bg-cream text-3xl"
                  style={{ width: 56, height: 56 }}
                >
                  {icon}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "show") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center-safe gap-8 p-8">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {item.shown.map((icon, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-3xl bg-teal-100"
              style={{ width: 112, height: 112, fontSize: 64 }}
            >
              <span>{icon}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // QA 2026-08-23: the tray + 4-choice grid live in their OWN
  // flex-1/min-h-0/overflow-y-auto region, so they scroll *internally* if
  // ever taller than the available space, instead of pushing Done below the
  // fold — Done is a plain sibling AFTER that region, never part of the
  // scroll, so it's always fully visible without scrolling.
  return (
    <div className="flex min-h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 min-h-0 flex-col items-center gap-6 overflow-y-auto p-6 pb-2">
        <p className="text-2xl text-ink">Tap them back in the same order.</p>

        <div className="flex min-h-24 w-full max-w-xl flex-wrap items-center justify-center gap-3 rounded-2xl bg-teal-100 p-3">
          {tray.length === 0 && <span className="text-2xl text-ink/60">Your tray is empty</span>}
          {tray.map((icon, i) => (
            <button
              key={`${icon}-${i}`}
              type="button"
              onClick={removeLast}
              disabled={disabled}
              aria-label="Remove last picture"
              className="flex items-center justify-center rounded-xl bg-cream text-4xl"
              style={{ width: 64, height: 64 }}
            >
              <span>{icon}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {item.choices.map((icon, i) => (
            <button
              key={`${icon}-${i}`}
              type="button"
              data-testid="picture-choice"
              onClick={() => tapChoice(icon)}
              disabled={disabled}
              className="flex items-center justify-center rounded-2xl bg-white text-5xl shadow"
              style={{ width: 80, height: 80 }}
            >
              <span>{icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full shrink-0 bg-cream px-6 pb-4 pt-3 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.15)]">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || tray.length === 0}
          className="mx-auto block rounded-full bg-teal-400 px-10 py-4 text-2xl font-bold text-white disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default PictureSpanView;
