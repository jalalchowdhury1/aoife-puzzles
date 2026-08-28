"use client";

import { useState } from "react";
import type { GenreId } from "@/lib/engine/types";
import type { Insights } from "@/lib/engine/insights";
import { DOOR_GENRES } from "@/lib/levels/doors";
import { lookupBankItem } from "@/lib/engine/bankLookup";
import { SkillCard } from "./SkillCard";
import { StatTile } from "./StatTile";
import { LineChart } from "./LineChart";
import { ItemLog } from "./ItemLog";
import { fmtDate, fmtNum, fmtPct } from "./format";

// "Skills" perspective on the Davidson tracker (2026-08-28 revamp, spec
// docs/superpowers/specs/2026-08-28-dashboard-revamp-design.md): the raw,
// un-framed numbers behind Road 1/2 — her ceiling, per-difficulty accuracy,
// missed questions — scoped to just the 6 door genres. Merges what used to
// be two separate tabs (Skills grid + Skill detail) into one, since there
// are only 6 genres to page through now. Davidson shows the pathway view of
// this same data; WISC lens shows the CHC-domain view; this is the raw view.

export function DoorSkillsTab({ insights }: { insights: Insights }) {
  const skills = DOOR_GENRES.map((g) => insights.skills.find((s) => s.genre === g)).filter((s) => s !== undefined);
  const [focused, setFocused] = useState<GenreId | null>(null);
  const skill = skills.find((s) => s.genre === focused) ?? skills[0] ?? null;

  if (!skill) return <p className="text-ink/60">No skill data yet.</p>;

  const ceilingPoints = skill.ceilingDates.map((c) => ({ x: fmtDate(c.date), y: c.ceiling, excluded: c.excluded }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <SkillCard key={s.genre} skill={s} onSelect={() => setFocused(s.genre)} />
        ))}
      </div>

      <h2 className="font-bubble text-2xl text-ink">{skill.kidTitle}</h2>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-ink/70">Ceiling over time</h3>
        {ceilingPoints.length === 0 ? (
          <p className="text-sm text-ink/50">No measurements yet.</p>
        ) : (
          <>
            <LineChart points={ceilingPoints} yMax={skill.maxD} valueLabel={(v) => String(v)} />
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-teal-400 bg-cream" /> hollow = excluded from her
              profile
            </p>
          </>
        )}
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-ink/70">Per difficulty</h3>
        <div className="overflow-x-auto rounded-2xl border border-teal-100">
          <table className="w-full min-w-[520px] text-left text-sm text-ink">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/60">
                <th className="px-3 py-2 font-semibold">d</th>
                <th className="px-3 py-2 font-semibold">Attempts</th>
                <th className="px-3 py-2 font-semibold">Correct</th>
                <th className="px-3 py-2 font-semibold">Time-outs</th>
                <th className="px-3 py-2 font-semibold">Median s</th>
                <th className="px-3 py-2 font-semibold">Mastered</th>
              </tr>
            </thead>
            <tbody>
              {skill.perDifficulty.map((pd) => {
                const acc = pd.attempts > 0 ? pd.correct / pd.attempts : null;
                const bg =
                  acc === null
                    ? undefined
                    : acc === 0
                      ? "rgba(240,107,122,0.25)"
                      : `rgba(43,179,169,${Math.max(0.12, acc * 0.55)})`;
                return (
                  <tr key={pd.d} className="border-b border-teal-50" style={{ background: bg }}>
                    <td className="px-3 py-1.5 font-semibold tabular-nums">{pd.d}</td>
                    <td className="px-3 py-1.5 tabular-nums">{pd.attempts}</td>
                    <td className="px-3 py-1.5 tabular-nums">{pd.correct}</td>
                    <td className="px-3 py-1.5 tabular-nums">{pd.timeouts}</td>
                    <td className="px-3 py-1.5 tabular-nums">{pd.medianSeconds === null ? "—" : fmtNum(pd.medianSeconds)}</td>
                    <td className="px-3 py-1.5">{pd.mastered ? "✓" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <StatTile label="Fast rate" value={fmtPct(skill.fastRate)} />
        <StatTile label="Teaching misses" value={String(skill.teachingMisses)} />
        <StatTile label="Not-fun taps" value={String(skill.bails)} />
        <StatTile label="Excluded blocks" value={String(skill.excludedBlocks)} />
      </section>

      {skill.missedBankItems.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-semibold text-ink/70">Missed questions</h3>
          <div className="flex flex-col gap-3">
            {skill.missedBankItems.map((m, i) => {
              const bank = lookupBankItem(m.bankId);
              if (!bank) {
                return (
                  <div key={i} className="rounded-2xl bg-white/50 p-3 text-sm text-ink/60">
                    {fmtDate(m.date)} · d{m.d} — item {m.bankId} not found in the bank.
                  </div>
                );
              }
              const best = bank.options.reduce<{ text: string; points: number } | null>(
                (acc, o) => (acc === null || o.points > acc.points ? o : acc),
                null
              );
              return (
                <div key={i} className="flex flex-col gap-1 rounded-2xl bg-white/60 p-3 text-sm text-ink">
                  <div className="flex items-center justify-between text-xs text-ink/50">
                    <span>
                      {fmtDate(m.date)} · d{m.d}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {bank.emoji ? `${bank.emoji} ` : ""}
                    {bank.prompt}
                  </p>
                  <p>
                    Her pick: <span className="font-semibold text-rose-500">{m.herPick ?? "—"}</span>
                  </p>
                  {best && (
                    <p>
                      Best answer: <span className="font-semibold text-teal-600">{best.text}</span>
                    </p>
                  )}
                  <p className="text-ink/70">{bank.explanation}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-1 text-sm font-semibold text-ink/70">Item log</h3>
        <ItemLog items={skill.items} />
      </section>
    </div>
  );
}

export default DoorSkillsTab;
