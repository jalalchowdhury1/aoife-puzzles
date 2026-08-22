"use client";
import { useEffect } from "react";
import type { PartConfig } from "@/lib/engine/types";
import { BigButton } from "./BigButton";

export function PartDone({
  part,
  minutes,
  synced,
  onHome,
}: {
  part: PartConfig;
  minutes: number;
  synced: boolean;
  onHome: () => void;
}) {
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Imported dynamically so SSR (and any non-browser render) never touches
    // canvas-confetti, which reaches for `document` at module load.
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const burst = () => confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      burst();
      timers.push(setTimeout(burst, 500));
      timers.push(setTimeout(burst, 1000));
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-cream p-8 text-center">
      <div className="text-8xl">{part.sticker}</div>
      <h1 className="font-bubble text-4xl text-ink">All done for today!</h1>
      <p className="font-bubble text-2xl text-teal-600">You earned the {part.sticker} sticker</p>
      <p className="text-base text-ink/60">{minutes} min</p>
      <p className="text-lg text-ink/70">{synced ? "☁️ Saved" : "⏳ Will save when you're back online"}</p>
      <BigButton onClick={onHome} tone="teal">
        Home
      </BigButton>
    </div>
  );
}

export default PartDone;
