// Remedial adaptation: turns a diagnostic profile into per-block start
// difficulties, rep counts, and repeat blocks for a post-diagnostic level.
// Pure and deterministic given (part, level, profile) — see AGENTS.md §7 for
// the owner's rule this encodes and where the knobs live.
import type { BlockConfig, GenreId, LevelConfig, PartConfig, Domain } from "./types";
import { genreValue, DOMAIN_GENRES, type Profile, type DomainStat } from "./profile";

export type Strength = "weak" | "typical" | "strong";

export interface ResolvedBlock extends BlockConfig {
  start: number;
  maxItems: number;
  strength: Strength;
  repeat?: boolean;
  teachingItems: number;
}

// Genres scored by throughput (perMinute), not a staircase ceiling. Their
// start/maxItems are unused by the runner (a speed block streams items on a
// wall-clock timer), so remedial mode leaves them at the neutral 1/8 instead
// of doing ceiling math that doesn't apply to them.
const SPEED_GENRES = new Set<GenreId>(["coding", "symbolSearch"]);

const ALL_GENRES: GenreId[] = (Object.keys(DOMAIN_GENRES) as Domain[]).flatMap((d) => DOMAIN_GENRES[d]);

function clamp(n: number): number {
  return Math.max(1, Math.min(10, n));
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** weak/typical/strong for every known genre, relative to her own data. */
export function classifyGenres(profile: Profile): Record<GenreId, Strength> {
  const values: Partial<Record<GenreId, number>> = {};
  for (const g of ALL_GENRES) {
    const stats = profile.genres[g];
    if (!stats) continue;
    const v = genreValue(g, stats);
    if (v !== null) values[g] = v;
  }
  const med = median(Object.values(values) as number[]);

  const domainFlagByGenre: Partial<Record<GenreId, DomainStat["flag"]>> = {};
  for (const domain of Object.keys(DOMAIN_GENRES) as Domain[]) {
    const flag = profile.domains[domain].flag;
    for (const g of DOMAIN_GENRES[domain]) domainFlagByGenre[g] = flag;
  }

  const result = {} as Record<GenreId, Strength>;
  for (const g of ALL_GENRES) {
    const value = values[g];
    const domainFlag = domainFlagByGenre[g];
    if (value === undefined) {
      result[g] = "typical";
      continue;
    }
    if (domainFlag === "weakness" || value < med - 0.1) {
      result[g] = "weak";
    } else if (domainFlag === "strength" && value >= med) {
      result[g] = "strong";
    } else {
      result[g] = "typical";
    }
  }
  return result;
}

/**
 * Resolves a part's blocks against a level's weighting and her profile.
 * Non-remedial levels resolve start/maxItems literally (still classifying
 * each block's strength for display). Remedial levels start weak genres
 * lower with more reps, strong genres near her ceiling with fewer reps, and
 * append one extra block per weak genre at the end of the part.
 */
export function adaptPart(part: PartConfig, level: LevelConfig, profile: Profile): ResolvedBlock[] {
  const strengths = classifyGenres(profile);
  const remedial = level.weighting === "remedial";

  const resolved: ResolvedBlock[] = part.blocks.map((block) => {
    const strength = strengths[block.genre] ?? "typical";
    const ceiling = profile.genres[block.genre]?.ceiling ?? null;

    let start: number;
    let maxItems: number;

    if (!remedial) {
      start = block.start === "fromProfile" ? clamp(ceiling === null ? 1 : ceiling - 1) : (block.start ?? 1);
      maxItems = block.maxItems ?? 8;
    } else if (SPEED_GENRES.has(block.genre)) {
      start = 1;
      maxItems = 8;
    } else {
      const baseStart =
        strength === "weak" ? (ceiling === null ? 1 : ceiling - 2)
        : strength === "typical" ? (ceiling === null ? 1 : ceiling - 1)
        : (ceiling === null ? 1 : ceiling);
      start = clamp(baseStart);
      const baseMax = strength === "weak" ? 10 : strength === "typical" ? 8 : 6;
      maxItems = block.maxItems !== undefined ? Math.min(block.maxItems, baseMax) : baseMax;
    }

    const teachingItems = block.teachingItems ?? level.teachingItems ?? 0;

    return { ...block, start, maxItems, strength, teachingItems };
  });

  if (!remedial) return resolved;

  const repeats: ResolvedBlock[] = resolved
    .filter((b) => b.strength === "weak")
    .map((b) => ({ ...b, repeat: true }));

  return [...resolved, ...repeats];
}
