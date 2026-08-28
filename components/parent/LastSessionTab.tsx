"use client";

import type { Insights } from "@/lib/engine/insights";
import { fmtDate, fmtDateTime, fmtNum, plural } from "./format";

// New tab (2026-08-28 revamp, spec docs/superpowers/specs/2026-08-28-dashboard-revamp-design.md):
// Jalal asked for "her questions from the last time she did the app, with
// time taken for each question, full breakdown." Depth chosen: difficulty +
// result + seconds per question (not full question text — Swap Shop and
// Arithmetic don't have fixed question text to show, and the cheap version
// reuses data already computed by insights.ts with no new plumbing).

function resultLabel(it: { bailed: boolean; timedOut: boolean; correct: boolean }): { text: string; cls: string } {
  if (it.bailed) return { text: "😕 not fun", cls: "pd-chip-warn" };
  if (it.timedOut) return { text: "⏱ timed out", cls: "pd-chip-warn" };
  if (it.correct) return { text: "✓ correct", cls: "pd-chip-good" };
  return { text: "✗ wrong", cls: "pd-chip-bad" };
}

export function LastSessionTab({ insights }: { insights: Insights }) {
  const last = insights.timeline[insights.timeline.length - 1];
  if (!last) return <p className="pd-glass p-6 text-white/60">No sessions yet — play a part first.</p>;

  const totalItems = last.blocks.reduce((n, b) => n + b.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="pd-glass p-4 text-sm text-white/85">
        <p className="font-bold text-white">
          {fmtDateTime(last.date)} · Level {last.level} Part {last.part} · {fmtNum(last.minutes)} min · {plural(totalItems, "question")}
        </p>
        <p className="mt-1 text-white/60">Every question she was asked last time, in order, with how long she took.</p>
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-separate border-spacing-y-1.5 text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-white/40">
                  <th className="px-3 py-1">#</th>
                  <th className="px-3 py-1">Difficulty</th>
                  <th className="px-3 py-1">Result</th>
                  <th className="px-3 py-1">Time taken</th>
                </tr>
              </thead>
              <tbody>
                {b.items.map((it, ii) => {
                  const r = resultLabel(it);
                  return (
                    <tr key={ii} className="pd-row">
                      <td className="rounded-l-xl px-3 py-1.5 tabular-nums text-white/40">{ii + 1}</td>
                      <td className="px-3 py-1.5 tabular-nums text-white/75">{it.d}</td>
                      <td className="px-3 py-1.5">
                        <span className={`pd-chip ${r.cls}`}>{r.text}</span>
                      </td>
                      <td className="rounded-r-xl px-3 py-1.5 tabular-nums text-white/75">{it.seconds.toFixed(1)}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="text-xs text-white/40">From {fmtDate(last.date)} — every other past session lives in her Skills tab&apos;s item log, per puzzle.</p>
    </div>
  );
}

export default LastSessionTab;
