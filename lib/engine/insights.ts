// STUB — replaced at merge.
//
// A parallel worker owns the real lib/engine/insights.ts. This local stub
// implements the exact exported shape the parent dashboard consumes (see
// the "Insights API you consume" section of the build brief), verbatim,
// with a real-enough implementation (built from the existing profile/adapt/
// quality/scale/rewards modules) so this worktree compiles and its
// screenshots show sane, non-fake data. Do not extend this file's scope —
// it is discarded at merge in favor of the real one.
import type { BlockRecord, BlockSummary, Domain, GenreId, ItemRecord, SessionRecord } from "./types";
import { genreMaxD } from "./types";
import { GENRES, GENRE_LIST, RETIRED_GENRE_IDS } from "../genres";
import { computeProfile, DOMAIN_GENRES } from "./profile";
import { ensureFlags, EXCLUDING_CODES } from "./quality";
import { dayStreak, totalStars } from "./rewards";
import { lookupBankItem } from "./bankLookup";

export interface ItemDetail {
  date: string; level: number; part: string; genre: GenreId; d: number; correct: boolean; points: number;
  max: number; seconds: number; timedOut: boolean; fast: boolean; teaching: boolean; bailed: boolean;
  excludedBlock: boolean; bankId?: string; seed: number;
}

export interface SkillDetail {
  genre: GenreId; kidTitle: string; retired: boolean; maxD: number; ceiling: number | null;
  ceilingDates: { date: string; ceiling: number | null; excluded: boolean }[];
  perDifficulty: { d: number; attempts: number; correct: number; timeouts: number; medianSeconds: number | null; mastered: boolean }[];
  speed?: { runs: { date: string; perMinute: number; accuracy: number }[]; bestPerMinute: number };
  fastRate: number | null; teachingMisses: number; bails: number; excludedBlocks: number;
  flags: { date: string; code: string; detail: string }[];
  missedBankItems: { date: string; bankId: string; herPick: string | null; d: number }[];
  items: ItemDetail[];
}

export interface MatrixCell { status: "mastered" | "passed" | "seen" | "struggled" | "unreached"; attempts: number; correct: number }

export interface Insights {
  generatedAt: string | null;
  totals: { sessions: number; minutes: number; items: number; stars: number; dayStreakEnd: string | null };
  domains: { domain: Domain; label: string; value: number | null; flag: string; genres: GenreId[] }[];
  bundles: { egai: number | null; cpi: number | null };
  skills: SkillDetail[];
  matrix: { genre: GenreId; kidTitle: string; retired: boolean; maxD: number; cells: MatrixCell[] }[];
  timeline: {
    sessionId: string; date: string; level: number; part: string; complete: boolean; minutes: number;
    blocks: { genre: GenreId; kidTitle: string; mode: string; summary: BlockSummary; flags: { code: string; detail: string }[]; excluded: boolean; items: ItemDetail[] }[];
  }[];
  deltas: { genre: GenreId; kidTitle: string; from: number | null; to: number | null; when: string }[];
  engagement: { byDate: { date: string; minutes: number; items: number; stars: number; bails: number }[] };
}

const DOMAIN_LABELS: Record<Domain, string> = {
  VS: "Visual Spatial", FR: "Fluid Reasoning", WM: "Working Memory", PS: "Processing Speed", VC: "Verbal Comprehension",
};

const NY_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" });
function nyDate(iso: string): string {
  return NY_FMT.format(new Date(iso));
}
function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
function minutesBetween(startedAt: string, endedAt?: string): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt ?? new Date().toISOString()).getTime();
  return Math.max(0, Math.round((end - start) / 60_000));
}
function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
function blockExcluded(block: BlockRecord): boolean {
  return (block.flags ?? []).some((f) => EXCLUDING_CODES.has(f.code));
}
function herPickText(item: ItemRecord): string | null {
  if (item.response === null || item.response === undefined) return null;
  if (item.bankId) {
    const bank = lookupBankItem(item.bankId);
    if (bank && bank.options.length && typeof item.response === "number") {
      return bank.options[item.response]?.text ?? String(item.response);
    }
  }
  if (typeof item.response === "string" || typeof item.response === "number") return String(item.response);
  return null;
}

const SPEED_GENRES = new Set<GenreId>(["coding", "symbolSearch", "translator", "spotIt"]);

export function computeInsights(sessions: SessionRecord[]): Insights {
  if (sessions.length === 0) {
    return {
      generatedAt: null,
      totals: { sessions: 0, minutes: 0, items: 0, stars: 0, dayStreakEnd: null },
      domains: (Object.keys(DOMAIN_GENRES) as Domain[]).map((domain) => ({
        domain, label: DOMAIN_LABELS[domain], value: null, flag: "n/a", genres: DOMAIN_GENRES[domain],
      })),
      bundles: { egai: null, cpi: null },
      skills: [],
      matrix: [],
      timeline: [],
      deltas: [],
      engagement: { byDate: [] },
    };
  }

  const flagged = ensureFlags(sessions);
  const profile = computeProfile(flagged);
  const sorted = [...flagged].sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  // ---- item-level rollups, per genre ------------------------------------
  const itemsByGenre = new Map<GenreId, ItemDetail[]>();
  const excludedItemsByGenre = new Map<GenreId, ItemDetail[]>(); // same shape, excludedBlock=false only, used for stats
  const skillFlags = new Map<GenreId, { date: string; code: string; detail: string }[]>();
  const excludedBlockCount = new Map<GenreId, number>();
  const speedRuns = new Map<GenreId, { date: string; perMinute: number; accuracy: number }[]>();
  const byDateAgg = new Map<string, { minutes: number; items: number; stars: number; bails: number }>();

  let totalMinutes = 0;
  let totalItems = 0;

  for (const session of sorted) {
    const day = nyDate(session.startedAt);
    const dayAgg = byDateAgg.get(day) ?? { minutes: 0, items: 0, stars: 0, bails: 0 };
    const sessionMinutes = minutesBetween(session.startedAt, session.endedAt);
    dayAgg.minutes += sessionMinutes;
    totalMinutes += sessionMinutes;

    for (const block of session.blocks) {
      const excluded = blockExcluded(block);
      if (excluded) excludedBlockCount.set(block.genre, (excludedBlockCount.get(block.genre) ?? 0) + 1);

      for (const f of block.flags ?? []) {
        const list = skillFlags.get(block.genre) ?? [];
        list.push({ date: session.startedAt, code: f.code, detail: f.detail });
        skillFlags.set(block.genre, list);
      }

      if (block.mode === "speedBlock") {
        const rawMs = new Date(block.endedAt).getTime() - new Date(block.startedAt).getTime();
        const blockMs = Math.max(60_000, rawMs);
        const perMinute = block.summary.correct / (blockMs / 60_000);
        const accuracy = block.summary.attempted > 0 ? block.summary.correct / block.summary.attempted : 0;
        const runs = speedRuns.get(block.genre) ?? [];
        runs.push({ date: session.startedAt, perMinute, accuracy });
        speedRuns.set(block.genre, runs);
      }

      for (const item of block.items) {
        totalItems += 1;
        dayAgg.items += 1;
        if (item.bailed) dayAgg.bails += 1;
        dayAgg.stars += item.stars ?? 0;

        const detail: ItemDetail = {
          date: session.startedAt, level: session.level, part: session.part, genre: block.genre,
          d: item.d, correct: item.correct, points: item.points, max: item.max, seconds: item.ms / 1000,
          timedOut: item.timedOut, fast: !!item.fast, teaching: !!item.teaching, bailed: !!item.bailed,
          excludedBlock: excluded, bankId: item.bankId, seed: item.seed,
        };
        const list = itemsByGenre.get(block.genre) ?? [];
        list.push(detail);
        itemsByGenre.set(block.genre, list);
        if (!excluded) {
          const clean = excludedItemsByGenre.get(block.genre) ?? [];
          clean.push(detail);
          excludedItemsByGenre.set(block.genre, clean);
        }
      }
    }
    byDateAgg.set(day, dayAgg);
  }

  const allGenreIds: GenreId[] = [...GENRE_LIST, ...RETIRED_GENRE_IDS];

  const skills: SkillDetail[] = allGenreIds.map((g) => {
    const genre = GENRES[g];
    const maxD = genreMaxD(genre);
    const stats = profile.genres[g];
    const items = itemsByGenre.get(g) ?? [];
    const cleanItems = excludedItemsByGenre.get(g) ?? [];

    const perDifficulty = Array.from({ length: maxD }, (_, i) => {
      const d = i + 1;
      const atD = cleanItems.filter((it) => it.d === d);
      const attempts = atD.length;
      const correct = atD.filter((it) => it.correct).length;
      const timeouts = atD.filter((it) => it.timedOut).length;
      const medianSeconds = median(atD.map((it) => it.seconds));
      const mastered = attempts > 0 && correct / attempts >= 0.8;
      return { d, attempts, correct, timeouts, medianSeconds, mastered };
    });

    const ceilingDates = (stats?.trend ?? []).map((t) => ({ date: t.date, ceiling: t.ceiling, excluded: !!t.flagged }));

    const runs = speedRuns.get(g);
    const speed = runs && runs.length
      ? { runs, bestPerMinute: runs.reduce((m, r) => Math.max(m, r.perMinute), 0) }
      : undefined;

    const fastEligible = SPEED_GENRES.has(g) ? [] : cleanItems;
    const fastRate = fastEligible.length ? fastEligible.filter((it) => it.fast).length / fastEligible.length : null;

    const missedBankItems = items
      .filter((it) => it.bankId && !it.correct && !it.excludedBlock)
      .map((it) => {
        // herPick needs the raw response, which ItemDetail doesn't carry —
        // this stub re-derives it from the raw session below.
        return { date: it.date, bankId: it.bankId!, herPick: null as string | null, d: it.d };
      });

    return {
      genre: g, kidTitle: genre.kidTitle, retired: !!genre.retired, maxD,
      ceiling: stats?.ceiling ?? null, ceilingDates, perDifficulty, speed,
      fastRate, teachingMisses: items.filter((it) => it.teaching && !it.correct).length,
      bails: items.filter((it) => it.bailed).length,
      excludedBlocks: excludedBlockCount.get(g) ?? 0,
      flags: skillFlags.get(g) ?? [],
      missedBankItems, items,
    };
  });

  // Second pass: fill in herPick using the raw (un-flattened) response, now
  // that we have lookupBankItem results wired through herPickText.
  const rawByGenre = new Map<GenreId, ItemRecord[]>();
  for (const session of sorted) {
    for (const block of session.blocks) {
      const list = rawByGenre.get(block.genre) ?? [];
      list.push(...block.items);
      rawByGenre.set(block.genre, list);
    }
  }
  for (const skill of skills) {
    const raw = rawByGenre.get(skill.genre) ?? [];
    let cursor = 0;
    skill.missedBankItems = skill.missedBankItems.map((m) => {
      const match = raw.slice(cursor).find((r) => r.bankId === m.bankId && r.d === m.d && !r.correct);
      cursor = match ? raw.indexOf(match) + 1 : cursor;
      return { ...m, herPick: match ? herPickText(match) : null };
    });
  }

  const matrix = allGenreIds.map((g) => {
    const genre = GENRES[g];
    const maxD = genreMaxD(genre);
    const skill = skills.find((s) => s.genre === g)!;
    const cells: MatrixCell[] = skill.perDifficulty.map((pd) => {
      if (pd.attempts === 0) return { status: "unreached", attempts: 0, correct: 0 };
      const acc = pd.correct / pd.attempts;
      const status: MatrixCell["status"] = acc >= 0.85 ? "mastered" : acc >= 0.6 ? "passed" : acc > 0 ? "seen" : "struggled";
      return { status, attempts: pd.attempts, correct: pd.correct };
    });
    return { genre: g, kidTitle: genre.kidTitle, retired: !!genre.retired, maxD, cells };
  });

  const timeline = [...sorted].reverse().map((session) => ({
    sessionId: session.id, date: session.startedAt, level: session.level, part: session.part,
    complete: session.complete, minutes: minutesBetween(session.startedAt, session.endedAt),
    blocks: session.blocks.map((block) => ({
      genre: block.genre, kidTitle: GENRES[block.genre]?.kidTitle ?? block.genre, mode: block.mode,
      summary: block.summary, flags: (block.flags ?? []).map((f) => ({ code: f.code, detail: f.detail })),
      excluded: blockExcluded(block),
      items: block.items.map((item) => ({
        date: session.startedAt, level: session.level, part: session.part, genre: block.genre, d: item.d,
        correct: item.correct, points: item.points, max: item.max, seconds: item.ms / 1000, timedOut: item.timedOut,
        fast: !!item.fast, teaching: !!item.teaching, bailed: !!item.bailed, excludedBlock: blockExcluded(block),
        bankId: item.bankId, seed: item.seed,
      })),
    })),
  }));

  const deltas = allGenreIds
    .map((g) => {
      const readings = (profile.genres[g]?.trend ?? []).filter((t) => t.ceiling !== null);
      if (readings.length < 2) return null;
      const to = readings[readings.length - 1];
      const from = readings[readings.length - 2];
      if (from.ceiling === to.ceiling) return null;
      return { genre: g, kidTitle: GENRES[g].kidTitle, from: from.ceiling, to: to.ceiling, when: to.date };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 8);

  const today = nyDate(new Date().toISOString());
  const streakLen = dayStreak(sessions, today);
  const dayStreakEnd = streakLen === 0 ? null : (dayAggHasDate(byDateAgg, today) ? today : shiftDate(today, -1));

  const domains = (Object.keys(DOMAIN_GENRES) as Domain[]).map((domain) => ({
    domain, label: DOMAIN_LABELS[domain], value: profile.domains[domain].value,
    flag: profile.domains[domain].flag, genres: DOMAIN_GENRES[domain],
  }));

  const engagement = {
    byDate: [...byDateAgg.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };

  return {
    generatedAt: new Date().toISOString(),
    totals: { sessions: sessions.length, minutes: totalMinutes, items: totalItems, stars: totalStars(sessions), dayStreakEnd },
    domains,
    bundles: profile.bundles,
    skills,
    matrix,
    timeline,
    deltas,
    engagement,
  };
}

function dayAggHasDate(byDateAgg: Map<string, unknown>, date: string): boolean {
  return byDateAgg.has(date);
}
