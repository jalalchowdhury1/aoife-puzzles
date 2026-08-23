"use client";
import { useEffect } from "react";
import { Pip, type PipMood } from "./Pip";
import { playChime } from "@/lib/chime";

/**
 * The "fun layer" replacement for the plain "Yes!" screen: Pip celebrates a
 * correct answer with a line from lib/engine/praise.ts plus a gentle chime,
 * and (for a 5-streak) a small confetti burst. Shown for ~1.6s by the runner
 * (app/play/page.tsx) and tap-skippable like every other fun screen.
 */
export function PraiseScreen({ mood, line, celebrate }: { mood: PipMood; line: string; celebrate?: boolean }) {
  useEffect(() => {
    playChime();
    if (!celebrate) return;
    let cancelled = false;
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.6 } });
    });
    return () => {
      cancelled = true;
    };
    // Fire once per shown line, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3" data-testid="between-feedback">
      <Pip mood={mood} line={line} speak />
    </div>
  );
}

export default PraiseScreen;
