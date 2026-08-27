import type { GenreId } from "../engine/types";

/**
 * The six Davidson-door genres (owner decision #21, 2026-08-26): every
 * released level from Level 7 on uses ONLY these. They are the cousins of
 * the WISC-V subtests behind the two index doors the family is aiming at —
 * VECI alone (Similarities, Vocabulary, Information, Comprehension) or
 * VCI + QRI together (VCI = Similarities + Vocabulary; QRI = Figure
 * Weights + Arithmetic). See docs/superpowers/specs/2026-08-27-davidson-doors-design.md.
 *
 * The other eight active genres are NOT retired: her history renders, the
 * QA level / audit / e2e still sweep them, and the Practice tab may replay
 * a missed item from any of them. They simply stop appearing in new levels.
 */
export const DOOR_GENRES: GenreId[] = [
  "whichTwo", "fillTheGap", "information", "whatWouldYouDo", // VECI / VCI
  "arithmetic", "swapShop",                                  // QRI
];

export const isDoorGenre = (g: GenreId): boolean => DOOR_GENRES.includes(g);
