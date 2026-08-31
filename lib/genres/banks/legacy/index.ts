// Frozen copies of authored banks as they stood BEFORE a re-author, keyed by
// the ISO cutover of that re-author (decision #29, 2026-08-30).
//
// Why: an ItemRecord stores only (seed, d, response, bankId, points) and the
// parent page REGENERATES the question from those (lib/engine/itemView.ts,
// insights.ts, bankLookup.ts). When a bank's wording, difficulty bands, or
// item set change after she played, a replay on today's bank would either go
// blank (bankId drift) or, worse, show words she never saw. So a replay for a
// session started before a cutover runs the generator on the frozen bank of
// that time — same draw, same shuffle, same text. Live play always uses the
// current bank (asOf omitted).
//
// Adding a revision: `git show HEAD:lib/genres/banks/<bank>.ts` into
// legacy/<date>/<bank>.ts (fix the relative imports), register it below with
// the deploy time as `until`, and set the cutover AFTER the last session that
// could have seen the old wording and BEFORE the deploy.
import type { GenreId } from "../../../engine/types";
import { WHICH_TWO_BANK as WHICH_TWO_2026_08_30 } from "./2026-08-30/whichTwo";
import { FILL_THE_GAP_BANK as FILL_THE_GAP_2026_08_30 } from "./2026-08-30/fillTheGap";
import { WHAT_WOULD_YOU_DO_BANK as WHAT_WOULD_YOU_DO_2026_08_30 } from "./2026-08-30/whatWouldYouDo";
import { INFORMATION_BANK as INFORMATION_2026_08_30 } from "./2026-08-30/information";

/** Cutover of the 2026-08-30 verbal re-author (decision #29). Sessions started before this replay on the frozen banks. */
export const REVISION_2026_08_30 = "2026-08-31T07:00:00.000Z";

interface Revision { genre: GenreId; until: string; bank: readonly unknown[] }

// Newest cutover LAST within a genre; lookup takes the earliest `until` that
// is still after `asOf`, i.e. the bank that was live at that moment.
const REVISIONS: Revision[] = [
  { genre: "whichTwo", until: REVISION_2026_08_30, bank: WHICH_TWO_2026_08_30 },
  { genre: "fillTheGap", until: REVISION_2026_08_30, bank: FILL_THE_GAP_2026_08_30 },
  { genre: "whatWouldYouDo", until: REVISION_2026_08_30, bank: WHAT_WOULD_YOU_DO_2026_08_30 },
  { genre: "information", until: REVISION_2026_08_30, bank: INFORMATION_2026_08_30 },
];

/**
 * The bank that was live at `asOf` (a session's startedAt ISO string):
 * the frozen copy when one exists for that moment, otherwise `current`.
 * Pure; `asOf` undefined always means the current bank.
 */
export function bankAsOf<T>(genre: GenreId, current: readonly T[], asOf?: string): readonly T[] {
  if (!asOf) return current;
  const live = REVISIONS.filter((r) => r.genre === genre && asOf < r.until).sort((a, b) => (a.until < b.until ? -1 : 1));
  return live.length > 0 ? (live[0].bank as readonly T[]) : current;
}

/** Every registered cutover, for tests and the parent page's provenance line. */
export function revisionsFor(genre: GenreId): { until: string }[] {
  return REVISIONS.filter((r) => r.genre === genre).map((r) => ({ until: r.until }));
}
