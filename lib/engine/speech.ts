// Minimal stand-in for the shared speech helper. This genre worker's worktree
// does not yet have the canonical lib/engine/speech.ts (another worker owns
// it); this file exists only so ChoiceView/ArithmeticView have something to
// import and type-check against. It will be replaced by the canonical
// implementation at merge time.

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, rate = 1): Promise<void> {
  if (!speechAvailable()) return Promise.resolve();
  return new Promise<void>(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
    setTimeout(finish, 1000 + text.length * 120);
  });
}
