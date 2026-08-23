"use client";
import { useEffect, useRef } from "react";
import { speak } from "@/lib/engine/speech";

export type PipMood = "happy" | "excited" | "thinking" | "proud" | "sleepy";

// Order matches the owner brief exactly: happy/excited/thinking/proud/sleepy -> ✨ 🎉 🤔 🏆 💤
const ACCESSORY: Record<PipMood, string> = {
  happy: "✨",
  excited: "🎉",
  thinking: "🤔",
  proud: "🏆",
  sleepy: "💤",
};

// Only 3 animations exist (bounce/wiggle/nod, keyframes in app/globals.css,
// respecting prefers-reduced-motion there). Sleepy stays still on purpose.
const ANIMATION: Record<PipMood, string> = {
  happy: "pip-wiggle",
  excited: "pip-bounce",
  thinking: "pip-nod",
  proud: "pip-bounce",
  sleepy: "",
};

/**
 * Pip the fox: the game's mascot. A soft circle with a mood-accessory emoji
 * and a small idle animation, plus a speech bubble with `line`. When `speak`
 * is true, reads `line` aloud once per line change (never re-speaks on a
 * re-render with the same line).
 */
export function Pip({ mood, line, speak: shouldSpeak = false }: { mood: PipMood; line: string; speak?: boolean }) {
  const lastSpokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldSpeak || !line) return;
    if (lastSpokenRef.current === line) return;
    lastSpokenRef.current = line;
    void speak(line);
  }, [line, shouldSpeak]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-400/25 text-6xl shadow-inner ${ANIMATION[mood]}`}
        aria-hidden
      >
        <span>🦊</span>
        <span className="absolute -right-1 -top-1 text-2xl">{ACCESSORY[mood]}</span>
      </div>
      {line && (
        <div className="max-w-xs rounded-3xl bg-white px-4 py-3 text-lg text-ink shadow-lg" role="status">
          {line}
        </div>
      )}
    </div>
  );
}

export default Pip;
