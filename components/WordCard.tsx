"use client";

import { useEffect } from "react";
import { speak, speechAvailable } from "@/lib/engine/speech";

// Owner, 2026-09-12: "when she has finished answering whether right or wrong
// … show her the definition of the word appropriate for a six year old with a
// small example sentence." Fill the Gap only (the only bank with the fields).

export interface WordCardData {
  word: string;
  definition: string;
  example: string;
}

/** The card for an item: its 2 point option plus the bank's kid definition and example, or null when the item has none. */
export function wordCardOf(item: unknown): WordCardData | null {
  const it = item as { options?: { text: string; points: number }[]; definition?: string; example?: string } | null;
  if (!it || !it.definition || !it.example || !Array.isArray(it.options)) return null;
  const key = it.options.find((o) => o.points === 2);
  return key ? { word: key.text, definition: it.definition, example: it.example } : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The example sentence with the word in bold (case-insensitive, whole word). */
function ExampleLine({ example, word }: { example: string; word: string }) {
  const parts = example.split(new RegExp(`(\\b${escapeRe(word)}\\b)`, "i"));
  return (
    <p className="text-lg italic text-ink/80">
      {parts.map((p, i) =>
        p.toLowerCase() === word.toLowerCase() ? (
          <b key={i} className="not-italic text-teal-700">
            {p}
          </b>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

/**
 * Shown under the between screen after every Fill the Gap answer. The play
 * page parks its advance timer while this is up, so only "Got it!" moves on.
 * Taps on the card itself never bubble to the page's tap-to-advance.
 *
 * Speech: speak() cancels whatever is playing, and Pip reads its praise or
 * reveal line on mount. So the card waits until the speech queue is idle
 * (capped at 8s, since some browsers never report it idle) before reading.
 */
export function WordCard({ card, onDone }: { card: WordCardData; onDone: () => void }) {
  const text = `${card.word}. ${card.definition} For example: ${card.example}`;

  useEffect(() => {
    if (!speechAvailable()) return;
    let cancelled = false;
    let started = false;
    const t0 = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      const busy = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      if (busy && Date.now() - t0 < 8000) {
        timer = setTimeout(tick, 250);
        return;
      }
      started = true;
      void speak(text);
    };
    timer = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      // React runs this before the next item's effects, so it never cuts off the next item's own speech.
      if (started) window.speechSynthesis.cancel();
    };
  }, [text]);

  return (
    <div className="w-full shrink-0 px-4 pb-6" onClick={(e) => e.stopPropagation()}>
      <div
        data-testid="word-card"
        className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-3xl border-4 border-teal-200 bg-white p-5 text-center shadow-lg"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">Word to know</p>
        <p className="font-bubble text-4xl text-teal-700">{card.word}</p>
        <p className="text-xl text-ink">{card.definition}</p>
        <ExampleLine example={card.example} word={card.word} />
        <button
          type="button"
          data-testid="word-card-continue"
          onClick={onDone}
          className="mt-2 min-h-12 shrink-0 rounded-full bg-teal-400 px-8 font-bubble text-xl text-white shadow-md active:scale-95"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
