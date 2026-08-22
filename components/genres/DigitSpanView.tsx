"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { DigitSpanItem } from "@/lib/genres/digitSpan";
import { speak, speechAvailable } from "@/lib/engine/speech";

const TASK_LABEL: Record<DigitSpanItem["task"], string> = {
  forward: "Tap them in the SAME order",
  backward: "Tap them BACKWARD",
  sequencing: "Tap them from SMALLEST to BIGGEST",
};

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type Phase = "listening" | "answering";

/** Number Echo (Digit Span): listens to (or watches) a digit sequence, then taps it back per the task. */
export function DigitSpanView({ item, disabled, onReady, onRespond }: GenreViewProps<DigitSpanItem, number[]>) {
  const [presented, setPresented] = useState<DigitSpanItem | null>(null);
  const [phase, setPhase] = useState<Phase>("listening");
  const [replaying, setReplaying] = useState(false);
  const [flashIndex, setFlashIndex] = useState(-1);
  const [audioFallback, setAudioFallback] = useState(false);
  const [tray, setTray] = useState<number[]>([]);
  const [replayUsed, setReplayUsed] = useState(false);

  const readyCalled = useRef(false);
  const responded = useRef(false);
  const runId = useRef(0);

  // Reset all per-item state during render when a new item arrives (React's
  // documented "adjust state while rendering" pattern) rather than in an
  // effect, so this doesn't trigger a cascading extra render.
  if (presented !== item) {
    setPresented(item);
    setPhase("listening");
    setReplaying(false);
    setFlashIndex(-1);
    setAudioFallback(false);
    setTray([]);
    setReplayUsed(false);
  }

  // Presents the digit sequence: spoken 1/s when speech is available, otherwise
  // flashed one at a time (900ms on / 100ms off). Calls onDone when finished.
  const present = useCallback((onDone: () => void) => {
    const id = ++runId.current;
    const stale = () => id !== runId.current;

    if (speechAvailable()) {
      (async () => {
        for (const n of item.digits) {
          const t0 = Date.now();
          await speak(String(n), 0.8);
          if (stale()) return;
          const wait = 1000 - (Date.now() - t0);
          if (wait > 0) await new Promise(r => setTimeout(r, wait));
          if (stale()) return;
        }
        onDone();
      })();
    } else {
      setAudioFallback(true);
      let i = 0;
      const step = () => {
        if (stale()) return;
        if (i >= item.digits.length) { onDone(); return; }
        setFlashIndex(i);
        setTimeout(() => {
          if (stale()) return;
          setFlashIndex(-1);
          i += 1;
          setTimeout(step, 100);
        }, 900);
      };
      step();
    }
  }, [item]);

  // Ref writes belong outside of render; this resets the "call once" guards
  // for the new item before the presentation effect below can fire onReady.
  useEffect(() => {
    readyCalled.current = false;
    responded.current = false;
  }, [item]);

  useEffect(() => {
    // present() stamps a fresh generation id on every call (including the
    // next item's or a Replay's), which auto-invalidates this run's stale()
    // checks, so no cleanup-based cancellation is needed here.
    present(() => {
      setPhase("answering");
      if (!readyCalled.current) { readyCalled.current = true; onReady(); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function handleReplay() {
    if (disabled || replayUsed || replaying) return;
    setReplayUsed(true);
    setReplaying(true);
    present(() => setReplaying(false));
  }

  function handleDigit(n: number) {
    if (disabled || replaying || phase !== "answering") return;
    setTray(t => (t.length >= item.digits.length ? t : [...t, n]));
  }

  function handleBackspace() {
    if (disabled || replaying || phase !== "answering") return;
    setTray(t => t.slice(0, -1));
  }

  function handleDone() {
    if (disabled || replaying || phase !== "answering" || responded.current) return;
    if (tray.length < 1) return;
    responded.current = true;
    onRespond(tray, { replayed: replayUsed, audioFallback });
  }

  const showListening = phase === "listening" || replaying;

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 text-ink">
      {showListening ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl" aria-hidden>👂</div>
          <p className="font-bubble text-3xl">Listening…</p>
          {audioFallback && flashIndex >= 0 && (
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-teal-100 text-6xl font-bold text-teal-600">
              {item.digits[flashIndex]}
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <p className="text-center font-bubble text-2xl">{TASK_LABEL[item.task]}</p>

          <div className="flex min-h-[64px] flex-wrap justify-center gap-2">
            {tray.length === 0 && <span className="text-2xl text-ink/50">Tap the numbers</span>}
            {tray.map((n, i) => (
              <div
                key={i}
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-100 text-3xl font-bold text-ink"
              >
                {n}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {KEYS.map(n => (
              <button
                key={n}
                type="button"
                disabled={disabled || tray.length >= item.digits.length}
                onClick={() => handleDigit(n)}
                className="min-h-[72px] min-w-[72px] rounded-2xl bg-teal-400 text-3xl font-bold text-white active:scale-95 disabled:opacity-40"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={disabled || tray.length === 0}
              onClick={handleBackspace}
              className="min-h-[72px] min-w-[72px] rounded-2xl bg-rose-400 px-4 text-2xl font-bold text-white disabled:opacity-40"
            >
              ⌫
            </button>
            <button
              type="button"
              disabled={disabled || replayUsed}
              onClick={handleReplay}
              className="min-h-[72px] min-w-[72px] rounded-2xl bg-sky-300 px-4 text-2xl font-bold text-ink disabled:opacity-40"
            >
              🔁 Replay
            </button>
            <button
              type="button"
              disabled={disabled || tray.length < 1}
              onClick={handleDone}
              className="min-h-[72px] min-w-[72px] rounded-2xl bg-amber-400 px-4 text-2xl font-bold text-ink disabled:opacity-40"
            >
              ✔ Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DigitSpanView;
