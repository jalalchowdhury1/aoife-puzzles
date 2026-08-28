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
  if (it.bailed) return { text: "😕 not fun", cls: "text-amber-600" };
  if (it.timedOut) return { text: "⏱ timed out", cls: "text-amber-600" };
  if (it.correct) return { text: "✓ correct", cls: "text-[#2e7d32]" };
  return { text: "✗ wrong", cls: "text-rose-500" };
}

export function LastSessionTab({ insights }: { insights: Insights }) {
  const last = insights.timeline[insights.timeline.length - 1];
  if (!last) return <p className="text-ink/60">No sessions yet — play a part first.</p>;

  const totalItems = last.blocks.reduce((n, b) => n + b.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-sky-300/25 p-4 text-sm text-ink">
        <p className="font-semibold">
          {fmtDateTime(last.date)} · Level {last.level} Part {last.part} · {fmtNum(last.minutes)} min · {plural(totalItems, "question")}
        </p>
        <p className="mt-1 text-ink/70">Every question she was asked last time, in order, with how long she took.</p>
      </div>

      {last.blocks.map((b, bi) => (
        <section key={bi}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bubble text-xl text-ink">{b.kidTitle}</h2>
            <span className="text-sm text-ink/60">
              {b.summary.correct}/{b.summary.attempted}
              {b.summary.ceiling !== null ? ` · ceiling ${b.summary.ceiling}` : ""}
            </span>
          </div>
          {b.excluded && (
            <p className="mb-2 rounded-xl bg-rose-100 px-3 py-1.5 text-xs text-rose-600">
              This block was excluded from her profile — see its flags below.
            </p>
          )}
          {b.flags.length > 0 && (
            <ul className="mb-2 flex flex-col gap-0.5 text-xs text-rose-500">
              {b.flags.map((f, fi) => (
                <li key={fi}>⚠ {f.code} — {f.detail}</li>
              ))}
            </ul>
          )}
          <div className="overflow-x-auto rounded-2xl border border-teal-100">
            <table className="w-full min-w-[420px] text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-teal-100 bg-teal-50/60">
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">Difficulty</th>
                  <th className="px-3 py-2 font-semibold">Result</th>
                  <th className="px-3 py-2 font-semibold">Time taken</th>
                </tr>
              </thead>
              <tbody>
                {b.items.map((it, ii) => {
                  const r = resultLabel(it);
                  return (
                    <tr key={ii} className="border-b border-teal-50">
                      <td className="px-3 py-1.5 tabular-nums text-ink/50">{ii + 1}</td>
                      <td className="px-3 py-1.5 tabular-nums">{it.d}</td>
                      <td className={`px-3 py-1.5 font-semibold ${r.cls}`}>{r.text}</td>
                      <td className="px-3 py-1.5 tabular-nums">{it.seconds.toFixed(1)}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="text-xs text-ink/50">From {fmtDate(last.date)} — every other past session lives in her Skills tab&apos;s item log, per puzzle.</p>
    </div>
  );
}

export default LastSessionTab;
