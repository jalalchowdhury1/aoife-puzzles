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

  useEffect(() => {
    void speak(genre.instructions);
  }, [genre]);

  const handleStart = () => {
    warmUpSpeech(); // the iOS/Safari audio-unlock gesture
    onStart();
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6 bg-cream p-6 text-center">
      <h1 className="font-bubble text-5xl text-ink">{genre.kidTitle}</h1>
      <p className="max-w-xl text-xl text-ink">{genre.instructions}</p>

      <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
        <View item={sample.item} disabled onReady={() => {}} onRespond={() => {}} />
      </div>

      <div className="max-w-xl rounded-3xl bg-sky-300/40 p-4 text-lg text-ink">{sample.explanation}</div>

      <p className="max-w-xl text-lg text-ink/80">
        Some puzzles are easy and some are for much older kids. If you are not sure, take your best guess!
      </p>

      <BigButton onClick={handleStart} tone="teal">
        Start
      </BigButton>
    </div>
  );
}

export default SampleScreen;
