"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { AnimalParadeItem, Animal, ParadeTask } from "@/lib/genres/animalParade";
import { ANIMALS, ANIMAL_EMOJI, ANIMAL_NAME } from "@/lib/genres/animalParade";
import { speak, speakSequence, speechAvailable } from "@/lib/engine/speech";
import { BigButton } from "@/components/BigButton";

const TASK_LABEL: Record<ParadeTask, string> = {
  same: "Tap them in the SAME order",
  backward: "Tap them BACKWARD",
  size: "Tap them SMALLEST to BIGGEST",
};

type Phase = "intro" | "listening" | "answering";

// A new rule (backward, then size) gets a one-time worked-example intro the
// first time it's played in this page session, so the child sees each rule
// demonstrated on its own instead of inferring it from a "same" sample.
// Module-level (not state) so it isn't reset per item and isn't repeated
// once a level's later items reuse the same task — mirrors
// DigitSpanView.tsx's own introShown Set exactly.
type RuleTask = Extract<ParadeTask, "backward" | "size">;
const introShown = new Set<RuleTask>();

function isRuleTask(task: ParadeTask): task is RuleTask {
  return task === "backward" || task === "size";
}

const INTRO_HEADING: Record<RuleTask, string> = {
  backward: "New rule: backward",
  size: "New rule: smallest to biggest",
};
const INTRO_SPEECH: Record<RuleTask, string> = {
  backward: "New rule! Tap them backward. If I say cat, dog, you tap dog, then cat.",
  size: "New rule! Tap them from smallest to biggest. If I say dog, ant, you tap ant, then dog.",
};
const INTRO_EXAMPLE: Record<RuleTask, { say: Animal[]; tap: Animal[] }> = {
  backward: { say: ["cat", "dog"], tap: ["dog", "cat"] },
  size: { say: ["dog", "ant"], tap: ["ant", "dog"] },
};

/** Animal Parade (auditory sequence memory cousin): listens to (or watches) a
 * list of animals, then taps them back on a 6-animal board per the task. */
export function AnimalParadeView({
  item,
  disabled,
  reveal,
  lastResponse,
  onReady,
  onRespond,
}: GenreViewProps<AnimalParadeItem, Animal[]>) {
  const [presented, setPresented] = useState<AnimalParadeItem | null>(null);
  const [phase, setPhase] = useState<Phase>("listening");
  const [replaying, setReplaying] = useState(false);
  const [flashIndex, setFlashIndex] = useState(-1);
  const [audioFallback, setAudioFallback] = useState(false);
  const [tray, setTray] = useState<Animal[]>([]);
  const [replayUsed, setReplayUsed] = useState(false);

  const readyCalled = useRef(false);
  const responded = useRef(false);
  const runId = useRef(0);

  // Reset all per-item state during render when a new item arrives (React's
  // documented "adjust state while rendering" pattern) rather than in an
  // effect, so this doesn't trigger a cascading extra render.
  if (presented !== item) {
    const needsIntro = !reveal && !disabled && isRuleTask(item.task) && !introShown.has(item.task);
    setPresented(item);
    setPhase(needsIntro ? "intro" : "listening");
    setReplaying(false);
    setFlashIndex(-1);
    setAudioFallback(false);
    setTray([]);
    setReplayUsed(false);
  }

  // Presents the animal list: spoken 1/second via speakSequence when speech
  // is available, otherwise flashed one at a time (900ms on / 100ms off).
  // Calls onDone when finished.
  const present = useCallback(
    (onDone: () => void) => {
      const id = ++runId.current;
      const stale = () => id !== runId.current;

      if (speechAvailable()) {
        (async () => {
          await speakSequence(item.animals.map(a => ANIMAL_NAME[a]));
          if (stale()) return;
          onDone();
        })();
      } else {
        setAudioFallback(true);
        let i = 0;
        const step = () => {
          if (stale()) return;
          if (i >= item.animals.length) {
            onDone();
            return;
          }
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
    },
    [item]
  );

  // Ref writes belong outside of render; this resets the "call once" guards
  // for the new item before the presentation effect below can fire onReady.
  useEffect(() => {
    readyCalled.current = false;
    responded.current = false;
  }, [item]);

  // Shared by the mount effect below and handleIntroReady(): starts the real
  // listening phase and, once the sequence finishes, moves to "answering"
  // and fires the one-time onReady() the runner's timer depends on.
  function presentAndAdvance() {
    present(() => {
      setPhase("answering");
      if (!readyCalled.current) {
        readyCalled.current = true;
        onReady();
      }
    });
  }

  useEffect(() => {
    // In reveal, the answer is simply shown: no listening phase, no speech,
    // no flashing/timers. Still call onReady() once, as the contract requires
    // (the runner ignores it in this phase).
    if (reveal) {
      if (!readyCalled.current) {
        readyCalled.current = true;
        onReady();
      }
      return;
    }
    // First time this page session a backward/size item is shown, the
    // render-time adjustment above already put us in "intro": speak the new
    // rule once and wait — handleIntroReady() calls presentAndAdvance() (and
    // thus onReady()) once she taps Ready, so no timing pressure is added.
    if (phase === "intro") {
      void speak(INTRO_SPEECH[item.task as RuleTask]);
      return;
    }
    // present() stamps a fresh generation id on every call (including the
    // next item's or a Replay's), which auto-invalidates this run's stale()
    // checks, so no cleanup-based cancellation is needed here.
    presentAndAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, reveal]);

  function handleIntroReady() {
    if (disabled || reveal || phase !== "intro") return;
    introShown.add(item.task as RuleTask);
    setPhase("listening");
    presentAndAdvance();
  }

  function handleReplay() {
    if (disabled || reveal || replayUsed || replaying) return;
    setReplayUsed(true);
    setReplaying(true);
    present(() => setReplaying(false));
  }

  function handleAnimal(a: Animal) {
    if (disabled || reveal || replaying || phase !== "answering") return;
    setTray(t => (t.length >= item.animals.length ? t : [...t, a]));
  }

  function handleBackspace() {
    if (disabled || reveal || replaying || phase !== "answering") return;
    setTray(t => t.slice(0, -1));
  }

  function handleDone() {
    if (disabled || reveal || replaying || phase !== "answering" || responded.current) return;
    if (tray.length < 1) return;
    responded.current = true;
    onRespond(tray, { replayed: replayUsed, audioFallback });
  }

  if (reveal) {
    const herTray = lastResponse ?? [];
    const differs = herTray.length !== item.expected.length || herTray.some((a, i) => a !== item.expected[i]);
    return (
      <div className="flex flex-col items-center justify-center-safe gap-6 p-6 text-ink">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <p className="text-center font-bubble text-2xl">{TASK_LABEL[item.task]}</p>

          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-ink/50">Pip said</span>
            <div className="flex flex-wrap justify-center gap-2">
              {item.animals.map((a, i) => (
                <div
                  key={i}
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100/60 text-3xl"
                  aria-label={ANIMAL_NAME[a]}
                >
                  {ANIMAL_EMOJI[a]}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-ink/70">So the answer is</span>
            <div className="flex flex-wrap justify-center gap-2">
              {item.expected.map((a, i) => (
                <div
                  key={i}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-[#6fcf6f] bg-[#eaf9ea] text-4xl"
                  aria-label={ANIMAL_NAME[a]}
                >
                  {ANIMAL_EMOJI[a]}
                </div>
              ))}
            </div>
          </div>

          {differs && herTray.length > 0 && (
            <div className="flex flex-col items-center gap-2 opacity-50">
              <span className="text-base font-semibold text-ink">You tapped</span>
              <div className="flex flex-wrap justify-center gap-2">
                {herTray.map((a, i) => (
                  <div
                    key={i}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-2xl"
                    aria-label={ANIMAL_NAME[a]}
                  >
                    {ANIMAL_EMOJI[a]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    const task = item.task as RuleTask;
    const example = INTRO_EXAMPLE[task];
    return (
      <div className="flex flex-col items-center justify-center-safe gap-6 p-6 text-ink">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <p className="text-center font-bubble text-3xl">{INTRO_HEADING[task]}</p>

          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-ink/50">I say</span>
            <div className="flex flex-wrap justify-center gap-2">
              {example.say.map((a, i) => (
                <div
                  key={i}
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100/60 text-3xl"
                  aria-label={ANIMAL_NAME[a]}
                >
                  {ANIMAL_EMOJI[a]}
                </div>
              ))}
            </div>
          </div>

          <div className="text-4xl" aria-hidden>
            ↓
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-ink/70">You tap</span>
            <div className="flex flex-wrap justify-center gap-2">
              {example.tap.map((a, i) => (
                <div
                  key={i}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-[#6fcf6f] bg-[#eaf9ea] text-4xl"
                  aria-label={ANIMAL_NAME[a]}
                >
                  {ANIMAL_EMOJI[a]}
                </div>
              ))}
            </div>
          </div>

          <BigButton onClick={handleIntroReady}>Ready</BigButton>
        </div>
      </div>
    );
  }

  const showListening = phase === "listening" || replaying;

  if (showListening) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center-safe gap-6 p-6 text-ink">
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl" aria-hidden>
            🦊
          </div>
          <p className="font-bubble text-3xl">Listening…</p>
          {audioFallback && flashIndex >= 0 && (
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-teal-100 text-7xl">
              {ANIMAL_EMOJI[item.animals[flashIndex]]}
            </div>
          )}
        </div>
      </div>
    );
  }

  // QA 2026-08-23: the tray + 6-animal board live in their OWN
  // flex-1/min-h-0/overflow-y-auto region, so they scroll *internally* if
  // ever taller than the available space, instead of pushing the action row
  // below the fold — ⌫/Replay/Done are a plain sibling AFTER that region,
  // never part of the scroll, so they're always fully visible without
  // scrolling.
  return (
    <div className="flex min-h-full w-full flex-col items-center text-ink">
      <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center-safe gap-6 overflow-y-auto p-6 pb-2">
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <p className="text-center font-bubble text-2xl">{TASK_LABEL[item.task]}</p>

          <div className="flex min-h-[64px] flex-wrap justify-center gap-2">
            {tray.length === 0 && <span className="text-2xl text-ink/50">Tap the animals</span>}
            {tray.map((a, i) => (
              <div
                key={i}
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-100 text-3xl"
                aria-label={ANIMAL_NAME[a]}
              >
                {ANIMAL_EMOJI[a]}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ANIMALS.map(a => (
              <button
                key={a}
                type="button"
                data-testid="answer-option"
                disabled={disabled || tray.length >= item.animals.length}
                onClick={() => handleAnimal(a)}
                aria-label={ANIMAL_NAME[a]}
                className="min-h-[72px] min-w-[72px] rounded-2xl bg-teal-400 text-4xl active:scale-95 disabled:opacity-40"
              >
                {ANIMAL_EMOJI[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-center gap-3 bg-cream px-6 pb-4 pt-3 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.15)]">
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
          data-testid="done"
          disabled={disabled || tray.length < 1}
          onClick={handleDone}
          className="min-h-[72px] min-w-[72px] rounded-2xl bg-amber-400 px-4 text-2xl font-bold text-ink disabled:opacity-40"
        >
          ✔ Done
        </button>
      </div>
    </div>
  );
}

export default AnimalParadeView;
