// One place that decides whether a recorded item time is believable.
//
// Two writers could record a time that never happened:
//
//   1. app/practice/page.tsx kept its item clock in a ref that started at 0
//      and was only set from a view's `onReady`. ArithmeticView fires onReady
//      only after its speech promise resolves, so an answer given while Pip
//      was still talking recorded `Date.now() - 0` — about 1.789e12 ms. The
//      parent dashboard rendered "1789129072.9s" and a 59,637,731-minute total.
//   2. app/play/page.tsx fell through to `ms = 0` in the same race. A fake 0
//      is quieter and worse: it reads as a super-fast answer, trips the
//      rapid-wrong quality flag, and drags the per-genre medians that pick
//      her next difficulty.
//
// Both writers are fixed, but sessions already stored carry the bad numbers,
// and the archive is never rewritten (it is a record of what happened). So
// every reader goes through here and treats an impossible time as UNKNOWN —
// null, not a number. Unknown is excluded from medians and totals and shown
// as an em dash. Never silently coerced to 0: a fabricated zero is a lie
// about how fast she answered.

/** Longest believable time for one question. Above this is a clock that never
 *  started, not a slow answer: the longest per-item cap in the app is 120s and
 *  even the untimed rematch page is a few minutes at the very most. */
export const SANE_MAX_MS = 30 * 60_000;

/** A recorded `ItemRecord.ms` that is a real elapsed time, else null.
 *  Rejects NaN/Infinity, negatives, anything past SANE_MAX_MS, and exactly 0
 *  (no question is answered in zero milliseconds — 0 is the never-started
 *  sentinel the play page used to write). */
export function sanitizeMs(ms: number | undefined | null): number | null {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return null;
  if (ms <= 0 || ms > SANE_MAX_MS) return null;
  return ms;
}

/** sanitizeMs in seconds, or null when the time is not believable. */
export function sanitizeSeconds(ms: number | undefined | null): number | null {
  const v = sanitizeMs(ms);
  return v === null ? null : v / 1000;
}
