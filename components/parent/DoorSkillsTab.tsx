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
import { CollapsibleSection } from "./CollapsibleSection";
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

  if (!skill) return <p className="pd-glass p-6 text-white/60">No skill data yet.</p>;

  const ceilingPoints = skill.ceilingDates.map((c) => ({ x: fmtDate(c.date), y: c.ceiling, excluded: c.excluded }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((s) => (
          <SkillCard key={s.genre} skill={s} onSelect={() => setFocused(s.genre)} />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white">{skill.kidTitle}</h2>

      <section className="pd-glass p-5">
        <h3 className="mb-3 text-sm font-bold text-white/85">Ceiling over time</h3>
        {ceilingPoints.length === 0 ? (
          <p className="text-sm text-white/45">No measurements yet.</p>
        ) : (
          <>
            <LineChart points={ceilingPoints} yMax={skill.maxD} valueLabel={(v) => String(v)} />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[var(--pd-accent-light)] bg-[#0a0c10]" /> hollow =
              excluded from her profile
            </p>
          </>
        )}
      </section>

      <CollapsibleSection title="Per difficulty" storageKey="skills-perdiff" defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5 text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-white/40">
                <th className="px-3 py-1">d</th>
                <th className="px-3 py-1">Attempts</th>
                <th className="px-3 py-1">Correct</th>
                <th className="px-3 py-1">Time-outs</th>
                <th className="px-3 py-1">Median s</th>
                <th className="px-3 py-1">Mastered</th>
              </tr>
            </thead>
            <tbody>
              {skill.perDifficulty.map((pd) => {
                const acc = pd.attempts > 0 ? pd.correct / pd.attempts : null;
                const bg =
                  acc === null
                    ? "rgba(255,255,255,0.04)"
                    : acc === 0
                      ? "rgba(240,107,122,0.16)"
                      : `rgba(43,179,169,${Math.max(0.1, acc * 0.4)})`;
                return (
                  <tr key={pd.d} style={{ background: bg }}>
                    <td className="rounded-l-xl px-3 py-1.5 font-semibold tabular-nums text-white/90">{pd.d}</td>
                    <td className="px-3 py-1.5 tabular-nums text-white/70">{pd.attempts}</td>
                    <td className="px-3 py-1.5 tabular-nums text-white/70">{pd.correct}</td>
                    <td className="px-3 py-1.5 tabular-nums text-white/70">{pd.timeouts}</td>
                    <td className="px-3 py-1.5 tabular-nums text-white/70">{pd.medianSeconds === null ? "—" : fmtNum(pd.medianSeconds)}</td>
                    <td className="rounded-r-xl px-3 py-1.5 text-[var(--pd-accent-light)]">{pd.mastered ? "✓" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <section className="flex flex-wrap gap-3">
        <StatTile label="Fast rate" value={fmtPct(skill.fastRate)} />
        <StatTile label="Teaching misses" value={String(skill.teachingMisses)} />
        <StatTile label="Not-fun taps" value={String(skill.bails)} />
        <StatTile label="Excluded blocks" value={String(skill.excludedBlocks)} />
      </section>

      {skill.missedBankItems.length > 0 && (
        <CollapsibleSection title="Missed questions" subtitle={`${skill.missedBankItems.length}`} storageKey="skills-missed" defaultOpen>
          <div className="flex flex-col gap-3">
            {skill.missedBankItems.map((m, i) => {
              const bank = lookupBankItem(m.bankId);
              if (!bank) {
                return (
                  <div key={i} className="pd-row p-3 text-sm text-white/55">
                    {fmtDate(m.date)} · d{m.d} — item {m.bankId} not found in the bank.
                  </div>
                );
              }
              const best = bank.options.reduce<{ text: string; points: number } | null>(
                (acc, o) => (acc === null || o.points > acc.points ? o : acc),
                null
              );
              return (
                <div key={i} className="pd-row flex flex-col gap-1 p-4 text-sm text-white/80">
                  <div className="text-xs text-white/40">
                    {fmtDate(m.date)} · d{m.d}
                  </div>
                  <p className="font-semibold text-white">
                    {bank.emoji ? `${bank.emoji} ` : ""}
                    {bank.prompt}
                  </p>
                  <p>
                    Her pick: <span className="font-semibold text-[var(--pd-rose)]">{m.herPick ?? "—"}</span>
                  </p>
                  {best && (
                    <p>
                      Best answer: <span className="font-semibold text-[var(--pd-accent-light)]">{best.text}</span>
                    </p>
                  )}
                  <p className="text-white/60">{bank.explanation}</p>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Item log" subtitle={`${skill.items.length}`} storageKey="skills-itemlog" defaultOpen={false}>
        <ItemLog items={skill.items} />
      </CollapsibleSection>
    </div>
  );
}

export default DoorSkillsTab;
