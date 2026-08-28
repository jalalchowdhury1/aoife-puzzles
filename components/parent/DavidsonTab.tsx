"use client";

import type { GenreId } from "@/lib/engine/types";
import type { Insights } from "@/lib/engine/insights";
import {
  cumulativeBenchmark, ageYearsAt, measureStatus, ageVerdict, yearsAheadLabel,
} from "@/lib/engine/benchmarks";
import { GENRES } from "@/lib/genres";
import { fmtDate } from "./format";

// Davidson tracker (2026-08-28, spec docs/superpowers/specs/2026-08-28-davidson-tracker-design.md).
// Regroups the six live door genres (lib/levels/doors.ts DOOR_GENRES) by the
// two actual WISC-V admission pathways instead of by domain, and adds the
// achievement door (WIAT-4) alongside. Never a fabricated composite/IQ
// number — every cell traces to a real ceiling, a real age-band comparison,
// or an honest "not yet".

type Door = "veci" | "vciqri";

const DOOR_SUBTESTS: { genre: GenreId; subtest: string; aside: string; doors: Door[] }[] = [
  { genre: "whichTwo", subtest: "Similarities", aside: "“how are these two alike?”", doors: ["veci", "vciqri"] },
  { genre: "fillTheGap", subtest: "Vocabulary", aside: "fill-in-the-blank word sense", doors: ["veci", "vciqri"] },
  { genre: "information", subtest: "Information", aside: "general knowledge", doors: ["veci"] },
  { genre: "whatWouldYouDo", subtest: "Comprehension", aside: "“what would you do?”", doors: ["veci"] },
  { genre: "swapShop", subtest: "Figure Weights", aside: "balance-the-trade logic", doors: ["vciqri"] },
  { genre: "arithmetic", subtest: "Arithmetic", aside: "word-problem math", doors: ["vciqri"] },
];

const DOOR_META: Record<Door, { label: string; needs: string }> = {
  veci: { label: "Door 1 — VECI", needs: "Needs ALL FOUR: Similarities, Vocabulary, Information, Comprehension" },
  vciqri: { label: "Door 2 — VCI + QRI", needs: "Needs: Similarities + Vocabulary, PLUS Figure Weights + Arithmetic" },
};

const CHIP = {
  ahead: "bg-[#6fcf6f]/25 text-[#2e7d32]",
  typical: "bg-sky-300/25 text-sky-900",
  behind: "bg-amber-300/30 text-amber-900",
  pending: "bg-ink/10 text-ink/60",
} as const;

function DoorBox({ door, insights, age }: { door: Door; insights: Insights; age: number }) {
  const required = DOOR_SUBTESTS.filter((s) => s.doors.includes(door));
  let measured = 0;
  let ahead = 0;
  for (const s of required) {
    const skill = insights.skills.find((sk) => sk.genre === s.genre);
    if (!skill || skill.ceiling === null) continue;
    measured += 1;
    const benchmark = cumulativeBenchmark(s.genre, skill.ceiling);
    if (ageVerdict(benchmark?.typicalAge ?? null, age) === "ahead") ahead += 1;
  }
  return (
    <div className="flex-1 min-w-[220px] rounded-2xl bg-[#6fcf6f]/15 p-3">
      <div className="font-semibold text-ink">{DOOR_META[door].label}</div>
      <div className="mt-1 text-xs text-ink/60">{DOOR_META[door].needs}</div>
      <div className="mt-2 text-lg font-bold text-ink">
        {measured} of {required.length} measured{measured > 0 ? ` — ${ahead} ahead ✅` : ""}
      </div>
    </div>
  );
}

function whatHappened(insights: Insights, genre: GenreId): string {
  const skill = insights.skills.find((s) => s.genre === genre);
  if (!skill) return "Not played yet.";
  const valid = skill.ceilingDates.filter((c) => !c.excluded);
  if (valid.length === 0) return "Not played yet.";
  const latest = valid[valid.length - 1];
  const blockItems = skill.items.filter((i) => i.date === latest.date && !i.excludedBlock);
  const attempted = blockItems.length;
  const correct = blockItems.filter((i) => i.correct).length;
  const bailed = blockItems.some((i) => i.bailed);
  const delta = insights.deltas.find((d) => d.genre === genre && d.when === latest.date);
  const ceilingText =
    latest.ceiling === null
      ? "no ceiling this block"
      : delta
        ? delta.from === null
          ? `first measured ceiling ${delta.to}`
          : `ceiling moved ${delta.from} → ${delta.to}`
        : `ceiling ${latest.ceiling}`;
  const bailText = bailed ? " — then a comfort stop (Not fun), handled gracefully" : "";
  const scoreText = attempted > 0 ? `, ${correct}/${attempted}` : "";
  return `${fmtDate(latest.date)}: ${ceilingText}${scoreText}${bailText}.`;
}

function DoorTags({ doors }: { doors: Door[] }) {
  const label = doors.length === 2 ? "both doors" : doors[0] === "veci" ? "Door 1 only" : "Door 2 only";
  return <div className="text-[11px] text-ink/50">{label}</div>;
}

function SubtestRow({ insights, age, def }: { insights: Insights; age: number; def: (typeof DOOR_SUBTESTS)[number] }) {
  const genreDef = GENRES[def.genre];
  const skill = insights.skills.find((s) => s.genre === def.genre);
  const status = measureStatus(insights, def.genre);
  const benchmark = skill && skill.ceiling !== null ? cumulativeBenchmark(def.genre, skill.ceiling) : null;
  const band = benchmark?.typicalAge ?? null;
  const bandText = band ? (band.hi === null ? `ages ${band.lo}+` : `ages ${band.lo}–${band.hi}`) : "—";
  const verdict = ageVerdict(band, age);
  const chip = verdict === "ahead" ? CHIP.ahead : verdict === "below-band" ? CHIP.behind : verdict === "age-typical" ? CHIP.typical : CHIP.pending;
  const chipLabel =
    verdict === "ahead" ? `✅ ahead${status === "still-winning" || status === "at-top" ? ", still climbing" : ""}` :
    verdict === "age-typical" ? "on pace" :
    verdict === "below-band" && status === "measured" ? "needs a peek" : "not measured yet";

  return (
    <tr className="border-b border-teal-100/60 align-top">
      <td className="py-2 pr-2">
        <div className="font-semibold text-ink">{def.subtest}</div>
        <div className="text-[11px] text-ink/50">{def.aside}</div>
        <DoorTags doors={def.doors} />
      </td>
      <td className="py-2 pr-2 text-ink/80">{genreDef.kidTitle}</td>
      <td className="py-2 pr-2 text-ink/80">{whatHappened(insights, def.genre)}</td>
      <td className="py-2 pr-2 text-ink/70 tabular-nums">{bandText}</td>
      <td className="py-2 pr-2 text-ink/70 tabular-nums">{skill ? yearsAheadLabel(band, age, status) : "—"}</td>
      <td className="py-2">
        <span className={`rounded-full px-2 py-0.5 text-xs ${chip}`}>{chipLabel}</span>
      </td>
    </tr>
  );
}

const ACHIEVEMENT_ROWS: { composite: string; needs: string; app: string }[] = [
  { composite: "Reading", needs: "Word Reading + Reading Comprehension", app: "Word Woods (aoife-reads)" },
  { composite: "Math", needs: "Numerical Operations + Math Problem Solving", app: "aoife-math" },
  { composite: "Written Language", needs: "Spelling + Alphabet Writing Fluency", app: "Word Woods (aoife-reads)" },
];

export function DavidsonTab({
  insights,
  achievement,
}: {
  insights: Insights;
  achievement: { readsStarted: boolean | null; readsSessionCount: number | null } | null;
}) {
  const age = ageYearsAt(insights.generatedAt);
  const ageLabel = `${Math.floor(age)}y ${Math.round((age % 1) * 12)}m`;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-sky-300/25 p-4 text-sm leading-relaxed text-ink">
        <p className="font-semibold">
          Davidson only needs her to be exceptional on ONE of two roads below — she doesn&apos;t need both.
          &ldquo;Ahead of age&rdquo; means kids that age typically do this; she&apos;s doing it now. Aoife is {ageLabel} old.
        </p>
      </div>

      <section>
        <h2 className="mb-2 font-bubble text-xl text-ink">Road 1 — Thinking skills (WISC-V)</h2>
        <div className="mb-3 flex flex-wrap gap-3">
          <DoorBox door="veci" insights={insights} age={age} />
          <DoorBox door="vciqri" insights={insights} age={age} />
        </div>
        <p className="mb-2 text-xs text-ink/50">Similarities and Vocabulary count toward both doors — shown once each, tagged below.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs text-ink/50">
                <th className="py-1 pr-2">WISC-V subtest</th>
                <th className="py-1 pr-2">Her puzzle</th>
                <th className="py-1 pr-2">What happened</th>
                <th className="py-1 pr-2">Typical age</th>
                <th className="py-1 pr-2">Roughly how far ahead</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {DOOR_SUBTESTS.map((def) => (
                <SubtestRow key={def.genre} insights={insights} age={age} def={def} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bubble text-xl text-ink">Road 2 — School skills (WIAT-4)</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs text-ink/50">
                <th className="py-1 pr-2">Composite</th>
                <th className="py-1 pr-2">Needs</th>
                <th className="py-1 pr-2">Where it lives</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {ACHIEVEMENT_ROWS.map((row) => {
                const isReads = row.app.startsWith("Word Woods");
                let label: string;
                if (!isReads) label = "⏳ not tracked yet";
                else if (achievement === null) label = "⏳ checking…";
                else if (achievement.readsStarted === null) label = "⏳ couldn’t check just now";
                else if (achievement.readsStarted) label = `✅ started — ${achievement.readsSessionCount} session${achievement.readsSessionCount === 1 ? "" : "s"} so far`;
                else label = "⏳ not started — she hasn’t opened the app yet";
                return (
                  <tr key={row.composite} className="border-b border-teal-100/60">
                    <td className="py-2 pr-2 font-semibold text-ink">{row.composite}</td>
                    <td className="py-2 pr-2 text-ink/80">{row.needs}</td>
                    <td className="py-2 pr-2 text-ink/80">{row.app}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${CHIP.pending}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-ink/50">
        Never a made-up composite or IQ number — every cell above traces to something she actually did, or honestly says &ldquo;not yet.&rdquo;
      </p>
    </div>
  );
}

export default DavidsonTab;
