"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { PictureSpanItem } from "@/lib/genres/pictureSpan";

type Phase = "show" | "pick";

/** Picture Memory (Picture Span): shows a row of pictures, then asks for them back in order. */
export function PictureSpanView({ item, disabled, onReady, onRespond }: GenreViewProps<PictureSpanItem, string[]>) {
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
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("pick");
      onReady();
    }, item.exposureMs);
    return () => clearTimeout(timer);
  }, [item, onReady]);

  function tapChoice(icon: string) {
    if (disabled) return;
    setTray(t => [...t, icon]);
  }

  function removeLast() {
    if (disabled) return;
    setTray(t => t.slice(0, -1));
  }

  function submit() {
    if (disabled || tray.length === 0) return;
    onRespond(tray);
  }

  if (phase === "show") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
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

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-6">
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
            onClick={() => tapChoice(icon)}
            disabled={disabled}
            className="flex items-center justify-center rounded-2xl bg-white text-5xl shadow"
            style={{ width: 80, height: 80 }}
          >
            <span>{icon}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={disabled || tray.length === 0}
        className="rounded-full bg-teal-400 px-10 py-4 text-2xl font-bold text-white disabled:opacity-40"
      >
        Done
      </button>
    </div>
  );
}

export default PictureSpanView;
