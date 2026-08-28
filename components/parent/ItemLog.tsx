"use client";

import { useState } from "react";
import type { ItemDetail } from "@/lib/engine/insights";
import { fmtDate } from "./format";

const SHOW_COUNT = 100;

function glyph(it: ItemDetail): string {
  if (it.bailed) return "😕";
  if (it.timedOut) return "⏱";
  if (it.teaching) return "T";
  return it.correct ? "✓" : "✗";
}
function glyphTitle(it: ItemDetail): string {
  if (it.bailed) return "Not fun";
  if (it.timedOut) return "Timed out";
  if (it.teaching) return "Teaching item";
  return it.correct ? "Correct" : "Wrong";
}

/** Full item-log table: latest 100 rows by default, with a "show all" toggle. Excluded-block rows are dimmed. */
export function ItemLog({ items }: { items: ItemDetail[] }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  const shown = showAll ? sorted : sorted.slice(0, SHOW_COUNT);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-y-1.5 text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-white/40">
              <th className="px-3 py-1">Date</th>
              <th className="px-3 py-1">Level · Part</th>
              <th className="px-3 py-1">d</th>
              <th className="px-3 py-1">Result</th>
              <th className="px-3 py-1">Seconds</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-white/45" colSpan={5}>
                  No items yet.
                </td>
              </tr>
            )}
            {shown.map((it, i) => (
              <tr
                key={i}
                title={it.excludedBlock ? "Excluded from her profile — see Flags." : undefined}
                className={`pd-row ${it.excludedBlock ? "opacity-40" : ""}`}
              >
                <td className="rounded-l-xl px-3 py-1.5 tabular-nums whitespace-nowrap text-white/70">{fmtDate(it.date)}</td>
                <td className="px-3 py-1.5 whitespace-nowrap text-white/70">
                  {it.level} · {it.part}
                </td>
                <td className="px-3 py-1.5 tabular-nums text-white/70">{it.d}</td>
                <td className="px-3 py-1.5 text-white/85" title={glyphTitle(it)}>
                  {glyph(it)}
                </td>
                <td className="rounded-r-xl px-3 py-1.5 tabular-nums text-white/70">{it.seconds.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > SHOW_COUNT && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className="pd-row min-h-[40px] self-start px-4 text-xs font-semibold text-white/80 hover:text-white">
          {showAll ? "Show latest 100" : `Show all ${sorted.length}`}
        </button>
      )}
    </div>
  );
}

export default ItemLog;
