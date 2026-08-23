"use client";
import { useEffect, useState } from "react";
import type { PartConfig } from "@/lib/engine/types";
import type { Badge } from "@/lib/engine/badges";
import { flushOutbox, syncState } from "@/lib/engine/storage";
import { BigButton } from "./BigButton";
import { Pip } from "./Pip";

const SYNC_POLL_MS = 1000;
const SYNC_POLL_TRIES = 10;

// Positives-only recap card (practice levels only — see app/play/page.tsx
// `funOn`). Every field here is something to celebrate; there is no "misses"
// or "score" field on purpose (owner decision #8: never show right/wrong).
export interface PartDoneRecap {
  puzzles: number;
  stars: number;
  bests: { kidTitle: string; d: number }[];
  badges: Badge[];
  nextLine: string;
}

export function PartDone({
  part,
  minutes,
  synced,
  onHome,
  recap,
  pipLine,
}: {
  part: PartConfig;
  minutes: number;
  synced: boolean;
  onHome: () => void;
  recap?: PartDoneRecap | null;
  pipLine?: string | null;
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
    // A new sticker (recap.badges) gets a bigger fanfare burst.
    const fanfare = !!recap?.badges?.length;
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const burst = () =>
        confetti({ particleCount: fanfare ? 160 : 80, spread: fanfare ? 100 : 70, origin: { y: 0.6 } });
      burst();
      timers.push(setTimeout(burst, 500));
      timers.push(setTimeout(burst, 1000));
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount, sized by the recap this instance was given
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-cream p-8 text-center">
      <div className="text-8xl">{part.sticker}</div>
      <h1 className="font-bubble text-4xl text-ink">All done for today!</h1>
      <p className="font-bubble text-2xl text-teal-600">You earned the {part.sticker} sticker</p>
      <p className="text-base text-ink/60">{minutes} min</p>
      <p className="text-lg text-ink/70">{saved ? "☁️ Saved" : "⏳ Will save when you're back online"}</p>

      {recap && (
        <div className="flex w-full max-w-sm flex-col gap-2 rounded-3xl bg-white p-4 text-left shadow-lg">
          <p className="font-bubble text-lg text-ink">
            Today: {recap.puzzles} puzzles · ⭐ {recap.stars} stars
          </p>
          {recap.bests.map((b, i) => (
            <p key={`best-${i}`} className="text-base text-teal-700">
              New best: {b.kidTitle} level {b.d}
            </p>
          ))}
          {recap.badges.map((b) => (
            <p key={b.id} className="text-base text-amber-600">
              NEW sticker: {b.emoji} {b.name}
            </p>
          ))}
          <p className="text-base text-ink/70">{recap.nextLine}</p>
        </div>
      )}

      {pipLine && <Pip mood="proud" line={pipLine} speak />}

      <BigButton onClick={onHome} tone="teal">
        Home
      </BigButton>
    </div>
  );
}

export default PartDone;
