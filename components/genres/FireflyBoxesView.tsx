"use client";

import { useEffect, useRef, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { FireflyBoxesItem } from "@/lib/genres/fireflyBoxes";
import { EXPOSURE_OFF_MS, GRID_SIZE } from "@/lib/genres/fireflyBoxes";
import { speak } from "@/lib/engine/speech";
import { BigButton } from "@/components/BigButton";

type Phase = "intro" | "exposure" | "tap";

const CELLS = Array.from({ length: GRID_SIZE }, (_, i) => i);

// The "backward" rule gets a one-time worked-example intro the first time it
// is played in this page session (mirrors DigitSpanView's introShown set),
// so she sees the new idea demonstrated instead of inferring it mid-item.
// Module-level (not state) so it isn't reset per item and isn't repeated
// once later items reuse the same task.
const introShown = new Set<"backward">();

const INTRO_SPEECH = "New rule! Tap them backward. If the firefly went here, then here, you tap here first, then here.";

/** Firefly Boxes (cousin of visual sequence memory): watch boxes light up in
 * order, then tap them back — same order, or (from the "backward" rule on)
 * reversed. */
export function FireflyBoxesView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<FireflyBoxesItem, number[]>) {
  const [presented, setPresented] = useState(item);
  const [phase, setPhase] = useState<Phase>("exposure");
  const [lit, setLit] = useState(-1);
  const [tray, setTray] = useState<number[]>([]);

  const readyCalled = useRef(false);
  const responded = useRef(false);
  const runId = useRef(0);

  // Reset all per-item state during render when a new item arrives, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (presented !== item) {
    const needsIntro = !reveal && !disabled && item.task === "backward" && !introShown.has("backward");
    setPresented(item);
    setPhase(needsIntro ? "intro" : "exposure");
    setLit(-1);
    setTray([]);
  }

  // Ref writes belong outside of render; resets the "call once" guards for
  // the new item before the exposure effect below can fire onReady.
  useEffect(() => {
    readyCalled.current = false;
    responded.current = false;
  }, [item]);

  // Steps the firefly through `item.sequence` (600ms on / 300ms off each),
  // then reveals the tap grid and fires the one-time onReady() the runner's
  // "stimulus fully presented" contract requires. Shared by the mount effect
  // below and handleIntroReady() (after she taps Ready on a new-rule intro).
  function runExposure() {
    const id = ++runId.current;
    let i = 0;
    const step = () => {
      if (id !== runId.current) return;
      if (i >= item.sequence.length) {
        setLit(-1);
        setPhase("tap");
        if (!readyCalled.current) {
          readyCalled.current = true;
          onReady();
        }
        return;
      }
      setLit(item.sequence[i]);
      setTimeout(() => {
        if (id !== runId.current) return;
        setLit(-1);
        setTimeout(() => {
          if (id !== runId.current) return;
          i += 1;
          step();
        }, EXPOSURE_OFF_MS);
      }, item.exposureOnMs);
    };
    step();
  }

  useEffect(() => {
    // In reveal, the answer is simply shown: no exposure, no speech, no
    // timers. Still call onReady() once, as the contract requires (the
    // runner ignores it in this phase).
    if (reveal) {
      if (!readyCalled.current) {
        readyCalled.current = true;
        onReady();
      }
      return;
    }
    // First time this session a "backward" item shows, the render-time
    // adjustment above already put us in "intro": wait for Ready.
    // handleIntroReady() calls runExposure() (and thus onReady()) once she
    // taps it, so no timing pressure is added by the rule explanation.
    if (phase === "intro") return;
    runExposure();
    // runId auto-invalidates any in-flight timer chain from a stale item, so
    // no cleanup-based cancellation is needed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, reveal]);

  function handleIntroReady() {
    if (disabled || reveal || phase !== "intro") return;
    introShown.add("backward");
    void speak(INTRO_SPEECH);
    setPhase("exposure");
    runExposure();
  }

  function handleCellTap(cell: number) {
    if (disabled || reveal || phase !== "tap" || responded.current) return;
    setTray(t => (t.length >= item.sequence.length ? t : [...t, cell]));
  }

  function handleBackspace() {
    if (disabled || reveal || phase !== "tap") return;
    setTray(t => t.slice(0, -1));
  }

  function handleDone() {
    if (disabled || reveal || phase !== "tap" || responded.current || tray.length === 0) return;
    responded.current = true;
    onRespond(tray);
  }

  if (reveal) {
    const herTaps = lastResponse ?? [];
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-ink">
        <p className="text-2xl text-ink">Here is the order.</p>
        <div className="grid grid-cols-3 gap-3">
          {CELLS.map(i => {
            const orderIdx = item.expected.indexOf(i);
            const isTarget = orderIdx >= 0;
            return (
              <div
                key={i}
                className={`relative flex items-center justify-center rounded-2xl ${
                  isTarget ? "bg-[#6fcf6f]" : "bg-ink/10"
                }`}
                style={{ width: 88, height: 88 }}
              >
                {isTarget && <span className="font-bubble text-3xl text-white">{orderIdx + 1}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2 opacity-50">
          <p className="text-lg text-ink">You tapped</p>
          <div className="flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-2xl bg-teal-100 p-3">
            {herTaps.length === 0 ? (
              <span className="text-xl text-ink/60">Nothing</span>
            ) : (
              herTaps.map((cell, i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-lg font-bold text-ink"
                >
                  {cell + 1}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-ink">
        <p className="text-center font-bubble text-3xl">New rule! Tap them backward</p>

        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-ink/50">The firefly went here, then here</span>
          <div className="flex gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100/60 text-2xl font-bold text-ink/50">
              1
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100/60 text-2xl font-bold text-ink/50">
              2
            </div>
          </div>
        </div>

        <div className="text-4xl" aria-hidden>
          ↓
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-ink/70">So you tap here first, then here</span>
          <div className="flex gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-[#6fcf6f] bg-[#eaf9ea] text-3xl font-bold text-ink">
              2
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-[#6fcf6f] bg-[#eaf9ea] text-3xl font-bold text-ink">
              1
            </div>
          </div>
        </div>

        <BigButton onClick={handleIntroReady}>Ready</BigButton>
      </div>
    );
  }

  if (phase === "exposure") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="grid grid-cols-3 gap-3">
          {CELLS.map(i => (
            <div
              key={i}
              className={`flex items-center justify-center rounded-2xl transition-colors ${
                lit === i ? "bg-amber-300" : "bg-ink/10"
              }`}
              style={{ width: 88, height: 88, fontSize: 40 }}
            >
              {lit === i && <span className="animate-pulse">🟡</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-6">
      <p className="text-2xl text-ink">{item.task === "backward" ? "Tap them BACKWARD" : "Tap them back in the same order"}</p>

      <div className="grid grid-cols-3 gap-3">
        {CELLS.map(i => (
          <button
            key={i}
            type="button"
            data-testid="answer-option"
            onClick={() => handleCellTap(i)}
            disabled={disabled}
            className="rounded-2xl bg-teal-400 active:bg-teal-600 disabled:opacity-40"
            style={{ width: 88, height: 88 }}
            aria-label={`Box ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex min-h-16 w-full max-w-xs flex-wrap items-center justify-center gap-2 rounded-2xl bg-teal-100 p-3">
        {tray.length === 0 && <span className="text-xl text-ink/60">Tap the boxes</span>}
        {tray.map((_, i) => (
          <span key={i} className="text-3xl" aria-hidden>
            ✨
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBackspace}
          disabled={disabled || tray.length === 0}
          className="min-h-[72px] min-w-[72px] rounded-2xl bg-rose-400 px-4 text-2xl font-bold text-white disabled:opacity-40"
        >
          ⌫
        </button>
        <button
          type="button"
          data-testid="done"
          onClick={handleDone}
          disabled={disabled || tray.length === 0}
          className="rounded-full bg-teal-400 px-10 py-4 text-2xl font-bold text-white disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default FireflyBoxesView;
