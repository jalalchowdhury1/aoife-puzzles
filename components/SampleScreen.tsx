"use client";
import { useEffect, useMemo } from "react";
import type { Genre, GenreViewProps } from "@/lib/engine/types";
import { speak, warmUpSpeech } from "@/lib/engine/speech";
import { BigButton } from "./BigButton";

export function SampleScreen({
  genre,
  View,
  onStart,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  genre: Genre<any, any>;
  // The caller passes the genre's own view component so this file never
  // depends on a genre -> view registry.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  View: React.ComponentType<GenreViewProps<any, any>>;
  onStart: () => void;
}) {
  const sample = useMemo(() => genre.sample(), [genre]);

  // The child hears the general instructions, then the sample's own
  // explanation, back to back (not simultaneously) so both register.
  useEffect(() => {
    void speak(genre.instructions).then(() => speak(sample.explanation));
  }, [genre, sample]);

  const handleStart = () => {
    warmUpSpeech(); // the iOS/Safari audio-unlock gesture
    onStart();
  };

  return (
    // Portrait stays a single centered column (plenty of vertical room there).
    // Landscape/wide (iPad 1180x713 counts as both `landscape:` and `lg:`):
    // two columns side by side, vertically centred, so the Start button is
    // never below the fold — see AGENTS.md §6 TODO this closes out.
    <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden bg-cream p-3 text-center landscape:flex-row landscape:items-center landscape:justify-center landscape:gap-8 landscape:text-left lg:flex-row lg:items-center lg:text-left">
      <div className="flex flex-col items-center gap-3 landscape:max-w-[34rem] landscape:items-start lg:max-w-[34rem] lg:items-start">
        <h1 className="font-bubble text-3xl text-ink landscape:text-4xl lg:text-4xl">{genre.kidTitle}</h1>
        <p className="max-w-xl text-lg text-ink">{genre.instructions}</p>

        <div className="max-w-xl rounded-3xl bg-sky-300/40 p-3 text-base text-ink">{sample.explanation}</div>

        <p className="max-w-xl text-base text-ink/80">
          Some puzzles are easy and some are for much older kids. If you are not sure, take your best guess!
        </p>

        <BigButton onClick={handleStart} tone="teal">
          Start
        </BigButton>
      </div>

      {/* Every genre view supports reveal mode: correct answer highlighted,
          inputs inert. Showing the sample this way (instead of an
          unanswered, undecorated item) is the whole point of this change —
          she sees what a correct answer to this format looks like before
          she ever has to produce one herself. */}
      <div className="flex w-full max-w-md items-center justify-center rounded-3xl bg-white p-3 shadow-lg landscape:w-auto landscape:shrink-0 lg:w-auto lg:shrink-0">
        <View item={sample.item} disabled reveal lastResponse={null} onReady={() => {}} onRespond={() => {}} />
      </div>
    </div>
  );
}

export default SampleScreen;
