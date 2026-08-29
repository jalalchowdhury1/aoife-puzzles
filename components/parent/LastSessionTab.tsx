"use client";

import { useMemo, useState } from "react";
import type { Insights } from "@/lib/engine/insights";
import { isDoorGenre } from "@/lib/levels/doors";
import { QuestionDetail, resultLabel } from "./QuestionDetail";
import { fmtDate, fmtDateTime, fmtNum, plural } from "./format";

// New tab (2026-08-28 revamp, spec docs/superpowers/specs/2026-08-28-dashboard-revamp-design.md):
// Jalal asked for "her questions from the last time she did the app, with
// time taken for each question, full breakdown."
//
// 2026-08-29 (decision #25): rows expand into the whole question. This tab
// deliberately shows ONLY the most recent sitting — for the full history
// across every session, see the All questions tab (AllQuestionsTab.tsx),
// which is what to reach for when the last session was a short 4-item
// practice round and looks sparse here.

export function LastSessionTab({ insights }: { insights: Insights }) {
  const last = insights.timeline[insights.timeline.length - 1];
  // One open row at a time, keyed "blockIndex:itemIndex"; null = all collapsed.
  const [open, setOpen] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  // Defaults to the six Davidson games, matching the All questions tab
  // (2026-08-29). Every level from 7 on is doors-only so this changes
  // nothing for a recent sitting — it matters when looking back at a
  // Level 1-3 session, which mixed in the eight retired genres.
  const [doorsOnly, setDoorsOnly] = useState(true);

  const blocks = useMemo(() => {
    if (!last) return [];
    const doors = last.blocks.filter((b) => isDoorGenre(b.genre));
    // A sitting with NO door games would otherwise render an empty tab and
    // look broken. Falling back to everything is the honest answer: there is
    // nothing to filter down to.
    return doorsOnly && doors.length > 0 ? doors : last.blocks;
  }, [last, doorsOnly]);

  if (!last) return <p className="pd-glass p-6 text-white/60">No sessions yet — play a part first.</p>;

  const hiddenBlocks = last.blocks.length - blocks.length;
  const totalItems = blocks.reduce((n, b) => n + b.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="pd-glass flex flex-wrap items-start justify-between gap-3 p-4 text-sm text-white/85">
        <div>
          <p className="font-bold text-white">
            {fmtDateTime(last.date)} · Level {last.level} Part {last.part} · {fmtNum(last.minutes)} min · {plural(totalItems, "question")}
          </p>
          <p className="mt-1 text-white/60">
            Every question she was asked last time, in order. Tap one to see the whole thing — what it
            said, every choice she was offered, and which she took.
          </p>
          {hiddenBlocks > 0 && (
            <p className="mt-1 text-xs text-white/40">
              Showing the six Davidson games only — {hiddenBlocks} other {hiddenBlocks === 1 ? "game" : "games"} from
              this sitting {hiddenBlocks === 1 ? "is" : "are"} hidden.
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => { setDoorsOnly((v) => !v); setOpen(null); }}
            className={`pd-chip cursor-pointer ${doorsOnly ? "pd-chip-good" : "pd-chip-mute"}`}
          >
            {doorsOnly ? "🎯 Davidson six" : "Everything"}
          </button>
          <button
            type="button"
            onClick={() => { setExpandAll((v) => !v); setOpen(null); }}
            className="pd-chip pd-chip-mute cursor-pointer"
          >
            {expandAll ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </div>

      {blocks.map((b, bi) => (
        <section key={bi} className="pd-glass p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{b.kidTitle}</h2>
            <span className="pd-chip pd-chip-info">
              {b.summary.correct}/{b.summary.attempted}
              {b.summary.ceiling !== null ? ` · ceiling ${b.summary.ceiling}` : ""}
            </span>
          </div>
          {b.excluded && (
            <p className="pd-chip pd-chip-bad mb-3 w-fit">This block was excluded from her profile — see its flags below.</p>
          )}
          {b.flags.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1 text-xs text-[var(--pd-rose)]">
              {b.flags.map((f, fi) => (
                <li key={fi}>⚠ {f.code} — {f.detail}</li>
              ))}
            </ul>
          )}

          <ul className="flex flex-col gap-1.5">
            {b.items.map((it, ii) => {
              const r = resultLabel(it);
              const priorBankIds = b.items.slice(0, ii).map((p) => p.bankId).filter((x): x is string => !!x);
              const key = `${bi}:${ii}`;
              const isOpen = expandAll || open === key;
              return (
                <li key={ii} className="pd-row overflow-hidden rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen && !expandAll ? null : key)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm"
                  >
                    <span className="w-5 shrink-0 tabular-nums text-white/35">{ii + 1}</span>
                    <span className="w-20 shrink-0 text-xs text-white/55">step {it.d}</span>
                    <span className={`pd-chip ${r.cls} shrink-0`}>{r.text}</span>
                    <span className="flex-1" />
                    <span className="shrink-0 tabular-nums text-white/60">{it.seconds.toFixed(1)}s</span>
                    <span className={`shrink-0 text-white/35 transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/8 px-3 pb-3 pt-3">
                      <QuestionDetail genre={b.genre} item={it} priorBankIds={priorBankIds} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-xs text-white/40">From {fmtDate(last.date)} — every other past session lives in her Skills tab&apos;s item log, per puzzle.</p>
    </div>
  );
}

export default LastSessionTab;
