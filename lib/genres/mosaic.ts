// Mosaic Maker (Mosaic Design, VS): a cousin of Block Design (construct-from-
// a-model). Instead of red/white diagonal blocks, tiles come in four colours
// (teal/amber/rose/sky) and three kinds: a plain `solid` colour, a diagonal
// `half` split (two colours, 4 orientations — the same NE/SE/SW/NW geometry
// as blockDesign's faceSvg, just re-coloured), and a corner `quarter` circle
// (colour A as a quarter-disc in one corner, colour B behind it). She taps a
// board cell to cycle through a small fixed palette until her board matches
// the target picture exactly. No React, no DOM, no Math.random — see
// AGENTS.md §5/decision #14 ("validity is sacred").
import type { Genre, Difficulty, ScoreResult } from "../engine/types";
import { makeRng, type Rng } from "../engine/rng";
import { itemMs } from "../engine/timing";
import { COLORS } from "./shapes";

export const TEAL = COLORS[1];
export const AMBER = COLORS[2];
export const ROSE = COLORS[0];
export const SKY = COLORS[3];
/** The four tile colours available to Mosaic Maker (a fixed subset of the shared COLORS palette). */
export const MOSAIC_COLORS: readonly string[] = [TEAL, AMBER, ROSE, SKY];

/** 0..3, shared by `half` and `quarter` tiles — see `polygonPointsFor`/`quarterPathFor` for what each means per kind. */
export type Orient = 0 | 1 | 2 | 3;
export interface SolidTile { kind: "solid"; color: string }
/** A diagonal split: colour `a` fills one corner-triangle (chosen by `orient`, same geometry as
 * blockDesign's NE/SE/SW/NW faces), colour `b` fills the rest. */
export interface HalfTile { kind: "half"; a: string; b: string; orient: Orient }
/** A quarter-disc of colour `a` centred on one corner (chosen by `orient`), colour `b` behind it. */
export interface QuarterTile { kind: "quarter"; a: string; b: string; orient: Orient }
export type Tile = SolidTile | HalfTile | QuarterTile;

export interface MosaicItem {
  n: 2 | 3;
  target: Tile[]; // row-major, length n*n
  palette: Tile[]; // <=6 tiles, cycle order; always a superset of every tile used in `target`
  showGrid: boolean;
}

const BORDER = "#9ca3af";

/** A stable string identity for a tile — two tiles a child would see as pixel-identical share a key. */
export function tileKey(t: Tile): string {
  return t.kind === "solid" ? `solid:${t.color}` : `${t.kind}:${t.a}:${t.b}:${t.orient}`;
}
export function tileEqual(a: Tile, b: Tile): boolean {
  return tileKey(a) === tileKey(b);
}
function dedupeTiles(tiles: Tile[]): Tile[] {
  const seen = new Set<string>();
  const out: Tile[] = [];
  for (const t of tiles) {
    const k = tileKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

// NE/SE/SW/NW corner-triangle polygons, identical geometry to blockDesign's faceSvg.
function polygonPointsFor(orient: Orient, s: number): string {
  switch (orient) {
    case 0: return `0,0 ${s},0 ${s},${s}`; // NE (upper-right): TL,TR,BR
    case 1: return `${s},0 ${s},${s} 0,${s}`; // SE (lower-right): TR,BR,BL
    case 2: return `0,0 ${s},${s} 0,${s}`; // SW (lower-left): TL,BR,BL
    case 3: return `0,0 ${s},0 0,${s}`; // NW (upper-left): TL,TR,BL
  }
}

// A quarter-disc of radius `s` centred on one corner of the s x s square,
// clipped to the square (it exactly touches the two adjacent corners).
function quarterPathFor(orient: Orient, s: number): string {
  switch (orient) {
    case 0: return `M ${s},0 L 0,0 A ${s},${s} 0 0 1 ${s},${s} Z`; // centred on top-right
    case 1: return `M ${s},${s} L ${s},0 A ${s},${s} 0 0 1 0,${s} Z`; // centred on bottom-right
    case 2: return `M 0,${s} L ${s},${s} A ${s},${s} 0 0 1 0,0 Z`; // centred on bottom-left
    case 3: return `M 0,0 L 0,${s} A ${s},${s} 0 0 1 ${s},0 Z`; // centred on top-left
  }
}

/** Pure SVG markup for one tile in a size x size box. No React, no DOM. */
export function tileSvg(tile: Tile, size: number): string {
  const s = size;
  const open = `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">`;
  if (tile.kind === "solid") {
    return `${open}<rect x="0" y="0" width="${s}" height="${s}" fill="${tile.color}" stroke="${BORDER}" stroke-width="1"/></svg>`;
  }
  const bg = `<rect x="0" y="0" width="${s}" height="${s}" fill="${tile.b}" stroke="${BORDER}" stroke-width="1"/>`;
  if (tile.kind === "half") {
    return `${open}${bg}<polygon points="${polygonPointsFor(tile.orient, s)}" fill="${tile.a}"/></svg>`;
  }
  return `${open}${bg}<path d="${quarterPathFor(tile.orient, s)}" fill="${tile.a}"/></svg>`;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function pickColors(rng: Rng, k: number): string[] {
  return rng.shuffle([...MOSAIC_COLORS]).slice(0, k);
}

/** Fills `count` cells by starting with every tile in `base` (each at least once, order
 * shuffled in later) and topping up the remainder from `extraPool`, then shuffling. */
function fillCells(rng: Rng, base: Tile[], extraPool: Tile[], count: number): Tile[] {
  const cells: Tile[] = [...base];
  while (cells.length < count) cells.push(rng.pick(extraPool));
  return rng.shuffle(cells);
}

/** `m` pairwise-distinct half tiles drawn from `colors` (bounded search; the combo space —
 * up to 4 colours x 3 partners x 4 orientations — is always far bigger than `m` <= 3). */
function distinctHalves(rng: Rng, colors: string[], m: number): Tile[] {
  const halves: Tile[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (halves.length < m && guard < 200) {
    guard++;
    const [a, b] = rng.shuffle(colors).slice(0, 2);
    const orient = rng.int(0, 3) as Orient;
    const h: Tile = { kind: "half", a, b, orient };
    const k = tileKey(h);
    if (seen.has(k)) continue;
    seen.add(k);
    halves.push(h);
  }
  return halves;
}

type Built = Omit<MosaicItem, "showGrid">;

// d1: 2x2, solid tiles, exactly 2 colours (both present) — palette is exactly those two tiles.
function buildD1(rng: Rng): Built {
  const [a, b] = pickColors(rng, 2);
  const required: Tile[] = [{ kind: "solid", color: a }, { kind: "solid", color: b }];
  return { n: 2, target: fillCells(rng, required, required, 4), palette: required };
}

// d2: 2x2, solid tiles, exactly 3 colours among the 4 cells (one colour repeats).
function buildD2(rng: Rng): Built {
  const [a, b, c] = pickColors(rng, 3);
  const required: Tile[] = [{ kind: "solid", color: a }, { kind: "solid", color: b }, { kind: "solid", color: c }];
  return { n: 2, target: fillCells(rng, required, required, 4), palette: required };
}

// d3: 2x2, exactly one half tile, the other three cells solid — palette 3.
function buildD3(rng: Rng): Built {
  const [a, b] = pickColors(rng, 2);
  const solidA: Tile = { kind: "solid", color: a };
  const solidB: Tile = { kind: "solid", color: b };
  const half: Tile = { kind: "half", a, b, orient: rng.int(0, 3) as Orient };
  const extraSolid = rng.pick([solidA, solidB]);
  const target = rng.shuffle([half, solidA, solidB, extraSolid]);
  return { n: 2, target, palette: [solidA, solidB, half] };
}

// d4: 2x2, exactly two half tiles (distinct orientations) + the two solids they're built from —
// a bijective fill, so palette == target's 4 distinct tiles exactly.
function buildD4(rng: Rng): Built {
  const [a, b] = pickColors(rng, 2);
  const [o1, o2] = rng.shuffle([0, 1, 2, 3] as Orient[]).slice(0, 2) as [Orient, Orient];
  const half1: Tile = { kind: "half", a, b, orient: o1 };
  const half2: Tile = { kind: "half", a, b, orient: o2 };
  const solidA: Tile = { kind: "solid", color: a };
  const solidB: Tile = { kind: "solid", color: b };
  const palette = [solidA, solidB, half1, half2];
  return { n: 2, target: rng.shuffle(palette), palette };
}

// d5: 3x3, mostly solids (2-3 colours) with exactly one half tile mixed in.
function buildD5(rng: Rng): Built {
  const k = rng.pick([2, 3]);
  const colors = pickColors(rng, k);
  const solids: Tile[] = colors.map(c => ({ kind: "solid", color: c }));
  const [a, b] = rng.shuffle(colors).slice(0, 2);
  const half: Tile = { kind: "half", a, b, orient: rng.int(0, 3) as Orient };
  const base = [...solids, half];
  return { n: 3, target: fillCells(rng, base, solids, 9), palette: base };
}

// d6 / d8: 3x3, 2-3 colours, exactly 2-3 distinct half tiles mixed with solids.
// (d8's only spec difference from d6 is "no grid lines", applied centrally in generate().)
function buildHalvesAndSolids(rng: Rng): Built {
  const k = rng.pick([2, 3]);
  const colors = pickColors(rng, k);
  const solids: Tile[] = colors.map(c => ({ kind: "solid", color: c }));
  const m = rng.int(2, 3);
  const halves = distinctHalves(rng, colors, m);
  const base = [...solids, ...halves];
  return { n: 3, target: fillCells(rng, base, solids, 9), palette: base };
}

// d7: 3x3, two half tiles in two different orientations + exactly one quarter tile, rest solid.
function buildD7(rng: Rng): Built {
  const [a, b] = pickColors(rng, 2);
  const [o1, o2] = rng.shuffle([0, 1, 2, 3] as Orient[]).slice(0, 2) as [Orient, Orient];
  const half1: Tile = { kind: "half", a, b, orient: o1 };
  const half2: Tile = { kind: "half", a, b, orient: o2 };
  const quarter: Tile = { kind: "quarter", a, b, orient: rng.int(0, 3) as Orient };
  const solidA: Tile = { kind: "solid", color: a };
  const solidB: Tile = { kind: "solid", color: b };
  const base = [solidA, solidB, half1, half2, quarter];
  return { n: 3, target: fillCells(rng, base, [solidA, solidB], 9), palette: base };
}

// d9: 3x3, mostly halves/quarters (>=7 of 9 cells) with at most 2 solid cells mixed in.
function buildD9(rng: Rng): Built {
  const [a, b] = pickColors(rng, 2);
  const halves = distinctHalves(rng, [a, b], rng.int(2, 3));
  const quarter: Tile = { kind: "quarter", a, b, orient: rng.int(0, 3) as Orient };
  const base: Tile[] = [...halves, quarter];
  const solidA: Tile = { kind: "solid", color: a };
  const solidB: Tile = { kind: "solid", color: b };
  const solidCount = rng.int(0, 2);
  const nonSolidCount = 9 - solidCount;

  const cells: Tile[] = [...base];
  while (cells.length < nonSolidCount) cells.push(rng.pick(base));
  const solidsUsed: Tile[] = [];
  for (let i = 0; i < solidCount; i++) {
    const s = rng.pick([solidA, solidB]);
    cells.push(s);
    solidsUsed.push(s);
  }
  const palette = [...base, ...dedupeTiles(solidsUsed)];
  return { n: 3, target: rng.shuffle(cells), palette };
}

// d10: 3x3, ALL cells half/quarter (no solids), a rotationally-symmetric pinwheel motif —
// 4 corners get the same colour pair's quarter tile stepped through all 4 orientations in
// clockwise order, the 4 edges + centre all share one half-tile orientation.
function buildD10(rng: Rng): Built {
  const [a, b] = pickColors(rng, 2);
  const baseCornerOrient = rng.int(0, 3) as Orient;
  const edgeOrient = rng.int(0, 3) as Orient;
  const CORNER_IDX = [0, 2, 8, 6]; // clockwise: TL, TR, BR, BL
  const EDGE_IDX = [1, 5, 7, 3]; // clockwise: top, right, bottom, left
  const cells: Tile[] = new Array(9);
  CORNER_IDX.forEach((idx, i) => {
    const orient = ((baseCornerOrient + i) % 4) as Orient;
    cells[idx] = { kind: "quarter", a, b, orient };
  });
  EDGE_IDX.forEach(idx => {
    cells[idx] = { kind: "half", a, b, orient: edgeOrient };
  });
  cells[4] = { kind: "half", a, b, orient: edgeOrient };
  const palette: Tile[] = [0, 1, 2, 3].map(o => ({ kind: "quarter", a, b, orient: o as Orient }));
  palette.push({ kind: "half", a, b, orient: edgeOrient });
  return { n: 3, target: cells, palette };
}

function buildFor(d: Difficulty, rng: Rng): Built {
  switch (d) {
    case 1: return buildD1(rng);
    case 2: return buildD2(rng);
    case 3: return buildD3(rng);
    case 4: return buildD4(rng);
    case 5: return buildD5(rng);
    case 6: return buildHalvesAndSolids(rng);
    case 7: return buildD7(rng);
    case 8: return buildHalvesAndSolids(rng);
    case 9: return buildD9(rng);
    case 10: return buildD10(rng);
  }
}

export function generate(seed: number, d: Difficulty): MosaicItem {
  const rng = makeRng((seed + d * 1000003) >>> 0);
  const built = buildFor(d, rng);
  return { ...built, showGrid: d < 8 };
}

export function score(item: MosaicItem, response: Tile[] | null): ScoreResult {
  const max = 1;
  if (!response || response.length !== item.target.length) return { points: 0, max, correct: false };
  const correct = response.every((t, i) => tileEqual(t, item.target[i]));
  return { points: correct ? 1 : 0, max, correct };
}

export function sample(): { item: MosaicItem; explanation: string } {
  const target: Tile[] = [
    { kind: "solid", color: TEAL },
    { kind: "solid", color: AMBER },
    { kind: "solid", color: AMBER },
    { kind: "solid", color: TEAL },
  ];
  const palette: Tile[] = [{ kind: "solid", color: TEAL }, { kind: "solid", color: AMBER }];
  return {
    item: { n: 2, target, palette, showGrid: true },
    explanation: "Tap a square until it matches the picture. Two teal, two amber.",
  };
}

/** Self-contained HTML/SVG audit of one item: the target (outlined green) and its palette. */
export function audit(item: MosaicItem): string {
  const CELL = 60;
  const gap = item.showGrid ? 4 : 0;
  const step = CELL + gap;
  const targetTiles = item.target
    .map((t, i) => {
      const x = (i % item.n) * step;
      const y = Math.floor(i / item.n) * step;
      return `<g transform="translate(${x},${y})">${tileSvg(t, CELL)}</g>`;
    })
    .join("");
  const boardSize = item.n * step - gap;
  const paletteTiles = item.palette
    .map((t, i) => `<g transform="translate(${i * (CELL + 8)},0)">${tileSvg(t, CELL)}</g>`)
    .join("");
  return `<!doctype html><html><body style="font-family:sans-serif;background:#faf6ee;padding:16px">
  <h3>Target (correct board)</h3>
  <svg width="${boardSize + 8}" height="${boardSize + 8}">
    <rect x="1" y="1" width="${boardSize + 6}" height="${boardSize + 6}" fill="none" stroke="#6fcf6f" stroke-width="3"/>
    <g transform="translate(4,4)">${targetTiles}</g>
  </svg>
  <h3>Palette (${item.palette.length} tiles, cycle order)</h3>
  <svg width="${item.palette.length * (CELL + 8)}" height="${CELL}">${paletteTiles}</svg>
</body></html>`;
}

export const mosaic: Genre<MosaicItem, Tile[]> = {
  id: "mosaic",
  subtest: "Mosaic Design",
  domain: "VS",
  kidTitle: "Mosaic Maker",
  instructions:
    "Look at the picture. Tap a square on your board to change it. Keep tapping until your board matches the picture exactly, then press Done.",
  sample,
  generate,
  score,
  timing: { kind: "item", ms: itemMs([[4, 60000], [7, 75000], [10, 120000]]) },
  mode: "staircase",
};
