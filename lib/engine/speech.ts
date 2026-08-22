// Web Speech API wrapper: availability probe + spoken instructions/items with a
// visual-fallback-friendly contract (every call resolves even when speech is
// unavailable or the browser never fires end/error).
//
// NOTE: placeholder implementation for Task 17 (SampleScreen speaks
// genre.instructions on mount). A sibling task owns the canonical speech.ts
// and will replace this file at merge time; the exported API below is fixed
// so callers don't need to change.

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/** Speaks `text`; resolves on end/error, or after a generous fallback timeout. */
export function speak(text: string, rate = 0.9): Promise<void> {
  if (!speechAvailable()) return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.speechSynthesis.cancel(); // cancel whatever was already speaking

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    const timeoutId = setTimeout(finish, 1000 + text.length * 120);

    window.speechSynthesis.speak(utterance);
  });
}

/** Speaks each part in order, with a pause between them. */
export async function speakSequence(parts: string[], gapMs = 1000): Promise<void> {
  for (let i = 0; i < parts.length; i++) {
    await speak(parts[i]);
    if (i < parts.length - 1) await new Promise((resolve) => setTimeout(resolve, gapMs));
  }
}

/** iOS/Safari require a user gesture before speech works; call this from the gesture handler. */
export function warmUpSpeech(): void {
  if (!speechAvailable()) return;
  const utterance = new SpeechSynthesisUtterance(" ");
  utterance.volume = 0;
  window.speechSynthesis.speak(utterance);
}
