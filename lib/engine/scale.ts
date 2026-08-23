// Difficulty-scale history. When a genre's ramp is rebuilt (gentler bottom, same top),
// results recorded BEFORE the cutover were measured on the old scale and must be
// mapped onto the new one, or the profile/adaptation would read an old "ceiling 3"
// as the new "2-piece basics" and undersell her. Pure; applied in computeProfile.
import type { GenreId, SessionRecord, BlockRecord } from "./types";

interface ScaleChange { genre: GenreId; cutover: string; map: Record<number, number> }

export const SCALE_CHANGES: ScaleChange[] = [
  // 2026-08-23: Piece Picker ramp rebuilt from level 0 (old d1 == new d5).
  { genre: "visualPuzzles", cutover: "2026-08-23T14:00:00Z", map: { 1: 5, 2: 6, 3: 7, 4: 8, 5: 8, 6: 9, 7: 9, 8: 10, 9: 10, 10: 10 } },
  // 2026-08-23: Balance ramp rebuilt (old d1-3 kept, old d4 == new d6).
  { genre: "figureWeights", cutover: "2026-08-23T14:00:00Z", map: { 1: 1, 2: 2, 3: 3, 4: 6, 5: 7, 6: 7, 7: 8, 8: 9, 9: 9, 10: 10 } },
];

export function remapCeiling(genre: GenreId, startedAt: string, ceiling: number | null): number | null {
  if (ceiling === null) return null;
  let c = ceiling;
  for (const ch of SCALE_CHANGES) if (ch.genre === genre && startedAt < ch.cutover) c = ch.map[c] ?? c;
  return c;
}

/** Returns a copy of the block with its summary ceiling and item difficulties on the current scale. */
export function remapBlock(block: BlockRecord, startedAt: string): BlockRecord {
  if (!SCALE_CHANGES.some(ch => ch.genre === block.genre && startedAt < ch.cutover)) return block;
  return { ...block, summary: { ...block.summary, ceiling: remapCeiling(block.genre, startedAt, block.summary.ceiling) } };
}

export function remapSession(s: SessionRecord): SessionRecord {
  return { ...s, blocks: s.blocks.map(b => remapBlock(b, s.startedAt)) };
}
