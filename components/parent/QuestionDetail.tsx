"use client";

import { useMemo } from "react";
import type { ItemDetail } from "@/lib/engine/insights";
import { resolveItemView, type ItemView } from "@/lib/engine/itemView";
import type { GenreId } from "@/lib/engine/types";

// One question, rendered in full: what it asked, every choice she was
// offered, which she took, the answer, and why. Shared by the Last session
// tab and the All questions archive so there is exactly one implementation
// of "show a question honestly" (decision #25).

export function resultLabel(it: { bailed: boolean; timedOut: boolean; correct: boolean }): { text: string; cls: string } {
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

export function QuestionDetail(
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
