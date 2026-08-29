"use client";

import { useMemo, useState } from "react";
import type { Insights, ItemDetail } from "@/lib/engine/insights";
import { resolveItemView, type ItemView } from "@/lib/engine/itemView";
import type { GenreId } from "@/lib/engine/types";
import { fmtDate, fmtDateTime, fmtNum, plural } from "./format";

// New tab (2026-08-28 revamp, spec docs/superpowers/specs/2026-08-28-dashboard-revamp-design.md):
// Jalal asked for "her questions from the last time she did the app, with
// time taken for each question, full breakdown."
//
// 2026-08-29 (decision #25): widened from difficulty+result+seconds to the
// WHOLE question on demand — Jalal: "in this i actually want to see all the
// questions. in details if and when i want. also what choices there were,
// what she answered. the whole thing." Tap any row to expand it. The text is
// regenerated from the recorded (seed, d) by lib/engine/itemView.ts, which
// returns null rather than guess whenever it cannot prove the replay matches
// what she saw — so a row that cannot be proven says so instead of showing a
// question that might be the wrong one (decision #14).

function resultLabel(it: { bailed: boolean; timedOut: boolean; correct: boolean }): { text: string; cls: string } {
  if (it.bailed) return { text: "😕 not fun", cls: "pd-chip-warn" };
  if (it.timedOut) return { text: "⏱ timed out", cls: "pd-chip-warn" };
  if (it.correct) return { text: "✓ correct", cls: "pd-chip-good" };
  return { text: "✗ wrong", cls: "pd-chip-bad" };
}

/** Per-option row inside an expanded question: hers, the best one, or neither. */
function OptionLine({ o }: { o: ItemView["options"][number] }) {
  const tone = o.chosen && o.best ? "border-[var(--pd-accent-light)]/60 bg-[var(--pd-accent-light)]/12"
    : o.chosen ? "border-[var(--pd-rose)]/50 bg-[var(--pd-rose)]/10"
    : o.best ? "border-[var(--pd-accent-light)]/35 bg-[var(--pd-accent-light)]/6"
    : "border-white/10";
  return (
    <li className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${tone}`}>
      <span className="mt-0.5 w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-white/45">
        {o.chosen ? "her pick" : o.best ? "best" : ""}
      </span>
      <span className="flex-1 text-white/85">{o.text}</span>
      {typeof o.points === "number" && (
        <span className="shrink-0 text-xs tabular-nums text-white/45">{o.points} pt</span>
      )}
    </li>
  );
}

function QuestionDetail(
  { genre, item, priorBankIds }: { genre: GenreId; item: ItemDetail; priorBankIds: string[] },
) {
  const key = priorBankIds.join(",");
  const view = useMemo(
    () => resolveItemView(genre, {
      seed: item.seed, d: item.d, response: item.response,
      bankId: item.bankId, points: item.points, date: item.date,
      // A block never repeats a bank entry, so replaying this item needs the
      // same exclusion list play used — every bankId before it in the block.
      priorBankIds,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- priorBankIds is a fresh array each render; `key` is its stable identity.
    [genre, item, key],
  );

  if (!view) {
    return (
      <p className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/45">
        This question can&apos;t be shown exactly as she saw it — its game&apos;s difficulty ladder was
        rebuilt after she played, so replaying it now would show a different puzzle. Nothing is shown
        rather than the wrong thing.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {view.rules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {view.rules.map((r, i) => (
            <span key={i} className="rounded-lg border border-white/12 px-2.5 py-1 text-sm text-white/70">{r}</span>
          ))}
        </div>
      )}

      <p className="text-[15px] font-medium leading-snug text-white">
        {view.emoji ? `${view.emoji} ` : ""}{view.prompt}
      </p>

      {view.options.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm">
          {view.options.map((o, i) => <OptionLine key={i} o={o} />)}
        </ul>
      ) : (
        <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/45">She answered</dt>
            <dd className="tabular-nums text-white/90">{view.herAnswer ?? "— nothing"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/45">Answer</dt>
            <dd className="tabular-nums text-[var(--pd-accent-light)]">{view.correctAnswer}</dd>
          </div>
        </dl>
      )}

      {view.options.length > 0 && view.herAnswer === null && (
        <p className="text-xs text-white/45">She gave no answer to this one.</p>
      )}

      {view.explanation && (
        <p className="rounded-xl border border-white/10 px-3 py-2 text-xs leading-relaxed text-white/55">
          {view.explanation}
        </p>
      )}
    </div>
  );
}

export function LastSessionTab({ insights }: { insights: Insights }) {
  const last = insights.timeline[insights.timeline.length - 1];
  // One open row at a time, keyed "blockIndex:itemIndex"; null = all collapsed.
  const [open, setOpen] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  if (!last) return <p className="pd-glass p-6 text-white/60">No sessions yet — play a part first.</p>;

  const totalItems = last.blocks.reduce((n, b) => n + b.items.length, 0);

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
        </div>
        <button
          type="button"
          onClick={() => { setExpandAll((v) => !v); setOpen(null); }}
          className="pd-chip pd-chip-mute shrink-0 cursor-pointer"
        >
          {expandAll ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {last.blocks.map((b, bi) => (
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
