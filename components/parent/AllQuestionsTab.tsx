"use client";

import { useMemo, useState } from "react";
import type { Insights } from "@/lib/engine/insights";
import type { GenreId } from "@/lib/engine/types";
import {
  buildQuestionLog, summarize, genreFacets, countsTowardBaseline, type LoggedQuestion,
} from "@/lib/engine/questionLog";
import { DOOR_GENRES, isDoorGenre } from "@/lib/levels/doors";
import { QuestionDetail, resultLabel } from "./QuestionDetail";
import { fmtDate, fmtNum } from "./format";

// The archive (2026-08-29). Jalal: "i want a place where i can see ALL the
// questions she answered. with all the details. right / wrong / time taken /
// median time for these questions etc and more."
//
// The Last session tab answers "what just happened" and is deliberately one
// sitting; when that sitting is a 4-item practice round it looks empty, which
// is what prompted this. Here every question she has ever answered is in one
// list, filterable, each row expandable into the full question.
//
// The pace column is the "and more": her time against her own median for that
// GAME AT THAT DIFFICULTY, which is the comparison that means something. A
// 30-second answer is fast on Which Two (median ~28s) and slow on Story Sums
// (median ~5s), so a single overall median would mislead on both.

type ResultFilter = "all" | "correct" | "wrong" | "timeout" | "bail";

// Which games are in view. "doors" is the default: 394 of her 791 questions
// are retired speed games (Secret Code, Symbol Hunt, Translator, Spot It)
// that no longer appear in any level and feed neither Davidson door, so
// opening on "everything" buries the six games that actually matter and
// drags every headline stat toward 2-second tapping. "all" is one tap away.
type GameFilter = { kind: "doors" } | { kind: "all" } | { kind: "one"; genre: GenreId };

const sameGame = (a: GameFilter, b: GameFilter): boolean =>
  a.kind === b.kind && (a.kind !== "one" || b.kind !== "one" || a.genre === b.genre);

function matchesGame(q: LoggedQuestion, f: GameFilter): boolean {
  if (f.kind === "all") return true;
  if (f.kind === "doors") return isDoorGenre(q.genre);
  return q.genre === f.genre;
}

const RESULT_LABELS: Record<ResultFilter, string> = {
  all: "All", correct: "✓ Correct", wrong: "✗ Wrong", timeout: "⏱ Timed out", bail: "😕 Not fun",
};

function matchesResult(q: LoggedQuestion, f: ResultFilter): boolean {
  if (f === "all") return true;
  if (f === "correct") return q.correct;
  if (f === "timeout") return q.timedOut;
  if (f === "bail") return q.bailed;
  return !q.correct && !q.timedOut && !q.bailed;
}

/** Her time vs her own median for this game at this difficulty. */
function Pace({ q }: { q: LoggedQuestion }) {
  const med = q.medianSecondsAtD ?? q.medianSecondsGenre;
  if (med === null || med <= 0) return <span className="text-white/25">—</span>;
  const ratio = q.seconds / med;
  // Within ±25% of her own median is just "typical" — labelling normal
  // variation as fast or slow would invent a signal that is not there.
  //
  // Note the INVERSION on the fast side: taking 0.4x her usual time is
  // being 2.5x faster, not "0.4x faster". Printing the raw ratio with the
  // word "faster" said the opposite of the truth.
  if (ratio <= 0.75) return <span className="text-[var(--pd-accent-light)]">{fmtNum(1 / ratio, 1)}× faster than usual</span>;
  if (ratio >= 1.5) return <span className="text-[var(--pd-amber)]">{fmtNum(ratio, 1)}× slower than usual</span>;
  return <span className="text-white/45">about usual ({fmtNum(med, 0)}s)</span>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-[92px]">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</div>
      <div className="text-xl font-bold text-white tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-white/40">{hint}</div>}
    </div>
  );
}

export function AllQuestionsTab({ insights }: { insights: Insights }) {
  const all = useMemo(() => buildQuestionLog(insights), [insights]);

  const [game, setGame] = useState<GameFilter>({ kind: "doors" });
  const [result, setResult] = useState<ResultFilter>("all");
  const [includePractice, setIncludePractice] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [limit, setLimit] = useState(60);

  const facets = useMemo(() => genreFacets(all), [all]);
  // Door games get their own always-visible row, in the canonical door order
  // (VECI/VCI four, then the two QRI ones) rather than by volume — that is
  // how the Davidson tab and the strategy page read, so they should match.
  const doorFacets = useMemo(
    () => DOOR_GENRES.map((g) => facets.find((f) => f.genre === g)).filter((f): f is NonNullable<typeof f> => !!f),
    [facets],
  );
  const otherFacets = useMemo(() => facets.filter((f) => !isDoorGenre(f.genre)), [facets]);

  const doorCount = useMemo(() => all.filter((q) => isDoorGenre(q.genre)).length, [all]);

  const rows = useMemo(() => all.filter((q) =>
    matchesGame(q, game)
    && matchesResult(q, result)
    && (includePractice || !q.practice)
  ), [all, game, result, includePractice]);

  const stats = useMemo(() => summarize(rows), [rows]);
  const shown = rows.slice(0, limit);

  if (all.length === 0) {
    return <p className="pd-glass p-6 text-white/60">No questions yet — play a part first.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="pd-glass p-5">
        <h2 className="text-lg font-bold text-white">Every question she has answered</h2>
        <p className="mt-1 text-sm text-white/60">
          {game.kind === "doors"
            ? <>The <strong className="text-white/85">six Davidson games</strong> only — {doorCount} questions, newest first. Tap any row for the whole question, the choices she was offered, and what she picked.</>
            : game.kind === "all"
              ? <>Every one of the {all.length}, newest first — including the retired games she no longer plays. Tap any row for the whole question.</>
              : <>One game, newest first. Tap any row for the whole question, the choices she was offered, and what she picked.</>}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
          <Stat label="Questions" value={String(stats.total)} hint={`${stats.sessions} sittings · ${stats.days} days`} />
          <Stat
            label="Correct"
            value={stats.accuracyPct === null ? "—" : `${Math.round(stats.accuracyPct)}%`}
            hint={`${stats.correctCounted} of ${stats.countedTotal} counted`}
          />
          <Stat
            label="Median time"
            value={stats.medianSeconds === null ? "—" : `${fmtNum(stats.medianSeconds, 1)}s`}
            // A median across every game averages 1.3s Translator taps with
            // 27.6s Which Two reasoning, which describes neither. Say so
            // rather than quietly present a number that means nothing.
            hint={stats.genres > 1 ? `across ${stats.genres} games — pick one to make this mean something` : undefined}
          />
          <Stat label="Time played" value={`${Math.round(stats.totalMinutes)} min`} hint="answering, not counting reading" />
          <Stat label="Hardest won" value={stats.topDifficulty === null ? "—" : `step ${stats.topDifficulty}`} />
          {(stats.timeouts > 0 || stats.bails > 0 || stats.practice > 0) && (
            <Stat
              label="Set aside"
              value={String(stats.timeouts + stats.bails + stats.practice)}
              hint={`${stats.timeouts} timed out · ${stats.bails} not fun · ${stats.practice} rematch`}
            />
          )}
        </div>
      </div>

      <div className="pd-glass flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Game</span>
          {([{ kind: "doors" }, { kind: "all" }] as GameFilter[]).map((f) => (
            <button key={f.kind} type="button" onClick={() => { setGame(f); setLimit(60); }}
              className={`pd-chip cursor-pointer ${sameGame(game, f) ? "pd-chip-good" : "pd-chip-mute"}`}>
              {f.kind === "doors" ? `🎯 Davidson six (${doorCount})` : `Everything (${all.length})`}
            </button>
          ))}

          <span className="mx-1 h-4 w-px shrink-0 bg-white/15" aria-hidden />

          {doorFacets.map((f) => (
            <button key={f.genre} type="button" onClick={() => { setGame({ kind: "one", genre: f.genre }); setLimit(60); }}
              className={`pd-chip cursor-pointer ${sameGame(game, { kind: "one", genre: f.genre }) ? "pd-chip-good" : "pd-chip-mute"}`}>
              {f.kidTitle} ({f.count})
            </button>
          ))}
        </div>

        {otherFacets.length > 0 && (
          <details className="pd-details">
            {/* pd-details strips the native marker, so without an explicit
                chevron this reads as a dead label rather than something to open. */}
            <summary className="flex cursor-pointer items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40 hover:text-white/70">
              <span className="pd-chevron">▸</span>
              Retired games ({otherFacets.reduce((n, f) => n + f.count, 0)}) — no longer in any level
            </summary>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {otherFacets.map((f) => (
                <button key={f.genre} type="button" onClick={() => { setGame({ kind: "one", genre: f.genre }); setLimit(60); }}
                  className={`pd-chip cursor-pointer ${sameGame(game, { kind: "one", genre: f.genre }) ? "pd-chip-good" : "pd-chip-mute"}`}>
                  {f.kidTitle} ({f.count})
                </button>
              ))}
            </div>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Result</span>
          {(Object.keys(RESULT_LABELS) as ResultFilter[]).map((r) => (
            <button key={r} type="button" onClick={() => { setResult(r); setLimit(60); }}
              className={`pd-chip cursor-pointer ${result === r ? "pd-chip-good" : "pd-chip-mute"}`}>
              {RESULT_LABELS[r]}
            </button>
          ))}
          <button type="button" onClick={() => { setIncludePractice((v) => !v); setLimit(60); }}
            className={`pd-chip ml-2 cursor-pointer ${includePractice ? "pd-chip-mute" : "pd-chip-info"}`}>
            {includePractice ? "including rematches" : "real sittings only"}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="pd-glass p-6 text-white/60">No questions match those filters.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {shown.map((q) => {
            const r = resultLabel(q);
            const isOpen = open === q.key;
            const counted = countsTowardBaseline(q);
            return (
              <li key={q.key} className="pd-row overflow-hidden rounded-xl">
                <button type="button" onClick={() => setOpen(isOpen ? null : q.key)} aria-expanded={isOpen}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-left text-sm">
                  <span className="w-[92px] shrink-0 text-xs text-white/40">{fmtDate(q.date)}</span>
                  <span className="w-[116px] shrink-0 truncate text-white/80">{q.kidTitle}</span>
                  <span className="w-14 shrink-0 text-xs text-white/55">step {q.d}</span>
                  <span className={`pd-chip ${r.cls} shrink-0`}>{r.text}</span>
                  {!counted && (
                    <span className="pd-chip pd-chip-mute shrink-0" title="Shown, but never counted toward her ability">
                      {q.practice ? "rematch" : q.teaching ? "free try" : q.excludedBlock ? "excluded" : "not counted"}
                    </span>
                  )}
                  <span className="flex-1" />
                  <span className="w-16 shrink-0 text-right tabular-nums text-white/70">{q.seconds.toFixed(1)}s</span>
                  <span className="w-[168px] shrink-0 text-right text-xs"><Pace q={q} /></span>
                  <span className={`shrink-0 text-white/35 transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/8 px-3 pb-3 pt-3">
                    <p className="mb-2 text-[11px] text-white/40">
                      {q.practice ? "Practice rematch" : `Level ${q.level} Part ${q.part}`} · question {q.n} of that round
                      {q.medianSecondsAtD !== null && ` · her median at step ${q.d}: ${fmtNum(q.medianSecondsAtD, 1)}s`}
                    </p>
                    <QuestionDetail genre={q.genre} item={q} priorBankIds={q.priorBankIds} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > shown.length && (
        <button type="button" onClick={() => setLimit((n) => n + 120)}
          className="pd-glass cursor-pointer p-3 text-sm font-semibold text-white/80">
          Show more ({rows.length - shown.length} left)
        </button>
      )}

      <p className="text-xs text-white/40">
        &quot;Counted&quot; excludes practice rematches, free frontier tries, and blocks flagged for
        measurement quality — they are all shown, but none of them shape her medians or her profile.
      </p>
    </div>
  );
}

export default AllQuestionsTab;
