"use client";
import { useEffect, useState } from "react";
import type { PartConfig } from "@/lib/engine/types";
import { flushOutbox, syncState } from "@/lib/engine/storage";
import { BigButton } from "./BigButton";

const SYNC_POLL_MS = 1000;
const SYNC_POLL_TRIES = 10;

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
  // The runner already awaits flushOutbox() before switching to this screen
  // (see app/play/page.tsx endBlock), so `synced` reflects reality on the
  // very first render. This local copy is a belt-and-suspenders fallback for
  // the genuinely-offline case: keep quietly retrying while the screen is up
  // and flip the message the moment the outbox actually drains, instead of
  // leaving a stale "⏳" up for the rest of the visit once she's back online.
  const [saved, setSaved] = useState(synced);

  useEffect(() => {
    if (saved) return;
    let cancelled = false;
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      void flushOutbox().then(() => {
        if (cancelled) return;
        if (syncState() === "synced") {
          setSaved(true);
          clearInterval(id);
        } else if (tries >= SYNC_POLL_TRIES) {
          clearInterval(id);
        }
      });
    }, SYNC_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [saved]);

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
      <p className="text-lg text-ink/70">{saved ? "☁️ Saved" : "⏳ Will save when you're back online"}</p>
      <BigButton onClick={onHome} tone="teal">
        Home
      </BigButton>
    </div>
  );
}

export default PartDone;
