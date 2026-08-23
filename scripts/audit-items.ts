// Item audit page generator (owner decision #14: validity is sacred).
//
// Renders 3 seeded items (seeds 1, 2, 3) for every genre x every difficulty
// 1-10 into one self-contained HTML file, so a human can eyeball every
// difficulty of every puzzle in one page before a release.
//
// Run with:  npx tsx scripts/audit-items.ts
// (plain `node scripts/audit-items.ts` does not work here: this project's
// .ts files use extensionless relative imports, e.g. `from "../engine/types"`,
// which Node's own ESM resolver refuses to guess at even with
// --experimental-strip-types; tsx resolves them the same way a bundler does.)
//
// Pure Node + this repo's pure genre modules — no React, no DOM. Visual
// genres are redrawn as plain inline SVG using the exact same drawing
// primitives the real views use (shapePath, faceSvg, GLYPHS, and the
// polyomino cell/rotate helpers), so what you see here is what she sees.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GENRES, GENRE_LIST } from "../lib/genres";
import { DIFFICULTIES, genreMaxD, type Difficulty, type GenreId } from "../lib/engine/types";
import { SHAPES, COLORS, shapePath, type Figure } from "../lib/genres/shapes";
import { faceSvg, type BlockDesignItem } from "../lib/genres/blockDesign";
import { rotate, type Cell, type VisualPuzzlesItem } from "../lib/genres/visualPuzzles";
import { GLYPHS } from "../lib/genres/glyphs";
import type { SymbolSearchItem } from "../lib/genres/symbolSearch";
import { CODE_KEY, type CodingItem, type Mark } from "../lib/genres/coding";
import type { MatrixItem } from "../lib/genres/matrix";
import type { FigureWeightsItem } from "../lib/genres/figureWeights";
import type { DigitSpanItem } from "../lib/genres/digitSpan";
import type { PictureSpanItem } from "../lib/genres/pictureSpan";
import type { ChoiceItem, ArithmeticItem } from "../lib/genres/bankGenre";

const SEEDS = [1, 2, 3];

// One-line difficulty-ramp explanation per genre, for the reviewer — drawn
// from each generator's own difficulty-band comments (matrixRules.ts,
// blockDesign.ts's `band()`, visualPuzzles.ts's `bandFor()`, the bank
// modules' header comments, etc.), not re-derived here.
const RAMP: Partial<Record<GenreId, string>> = {
  matrix:
    "d1-2: 2x2 grid, one of shape/colour varies. d3-4: count or size (S/L only) progresses. d5-8: 3x3 grids mixing more attributes, Latin squares from d7. d9-10: two Latin-square attributes plus a dot column.",
  visualPuzzles:
    "Level-0 ramp (2026-08-23): d1: 2 pieces (1+2 cells), 3 options. d2: 2 pieces (4 cells), 4 options. " +
    "d3: 2 pieces (5-6 cells), 4 options. d4: 3 pieces (1+2+3), 4 options. d5-7: 3 pieces, 6 options, " +
    "distractors 'obviously wrong' by cell count (4x4 boards growing 5-8 cells). d8: 4x4/5x5 boards " +
    "(6-8 or 9-12 cells), mirror/near-miss distractors begin, no rotation. d9-10: 5x5 then 6x6 boards " +
    "(9-16 cells) with rotated pieces.",
  blockDesign:
    "d1-2: 2x2, white/red only, no diagonals. d3-6: 2x2/3x3 with 1-3 diagonals, grid lines shown. d7-10: 3x3 with 3-9 diagonals, grid lines hidden from d7.",
  figureWeights:
    "d1: one scale, 1 shape, 'is this the same?' (3 options: 1/2/3 copies). d2: one scale, 2-3 of one shape (4 options: counts 1-4). d3: one scale, a mix of two shapes; find the identical pile among 4 mixed-count options. d4: an equivalence is SHOWN and the question reads it straight off, no arithmetic. d5: the same shown equivalence, doubled. d6-7: one equivalence with mixed-shape distractor options (d7: larger counts / sometimes a mixed question pan). d8: two chained equivalences over three shapes, single-shape question. d9-10: two chained equivalences with a mixed-shape question pan.",
  arithmetic:
    "d1-2: counting/adding within 10 (~age 6). d3-4: add/subtract within 20 (~age 7-8). d5-6: two-step within 100, time and money (~age 9-10). d7-8: multiplication/division with remainders (~age 11-12). d9-10: multi-step with fractions and rates (~age 13).",
  digitSpan:
    "d1-3: forward spans of 2-4. d4-6: backward spans of 2-5 (d6 also mixes in a forward-5). d7-9: sequencing (smallest to biggest) joins in. d10: forward/backward spans of 6-7.",
  pictureSpan:
    "span k grows from 1 (d1) to 7 (d10); the distractor pool widens from 4 extra choices to 6 from d6 on; exposure time steps from 3s (k<=2) to 5s.",
  coding:
    "a single fixed 5-shape-to-mark key used at every difficulty; difficulty only changes how many items stream past in the 120s speed block, not the per-item rule shown here.",
  symbolSearch:
    "a single fixed 20-glyph, 10-twin-pair bank used at every difficulty; the target is present 40-60% of the time, with its confusable twin preferred as the decoy when absent.",
  similarities: "d1 (~age 6) concrete object pairs ramping to d10 (~age 13) abstract-noun pairs.",
  vocabulary: "d1-2 (~age 6) picture-plus-emoji items ramping to d10 (~age 13) word-and-definition items.",
  information: "d1 (~age 6) everyday facts ramping to d10 (~age 13) broader general-knowledge questions.",
  comprehension: "d1 (~age 6) basic safety/rules questions ramping to d10 (~age 13) reasoning about consequences.",
  pictureSudoku:
    "d1: 2x2, 1 blank. d2-6: 3x3, 0-1 extra blanks (d4/d5 teach 'check the row, check the column'). " +
    "d7-10: 4x4, 0-3 extra blanks, a foreign-picture distractor option joins from d6. d11-15 (2026-08-24, " +
    "owner decision #17 — earned extension past 10): a genuine SUDOKU BOX constraint joins row/column. " +
    "d11: 4x4 with 2x2 boxes, still just 1 blank — the new rule at a familiar size, box present but not " +
    "needed yet. d12: 4x4 boxed, 4 blanks placed so the box is genuinely load-bearing (row/column alone " +
    "can't resolve the asked cell). d13: 6x6 with 2x3 boxes, 1 blank — 'new size, simple case' again. " +
    "d14: 6x6 boxed, 4 blanks, box load-bearing. d15 (capstone): 6x6 boxed, 5 blanks, box load-bearing, " +
    "the busiest grid.",
};

const SHAPE_COLOR: Record<string, string> = Object.fromEntries(SHAPES.map((s, i) => [s, COLORS[i]]));

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- shared drawing primitives (reused across genres) -----------------------

const SIZE_PCT: Record<Figure["size"], number> = { S: 0.4, M: 0.6, L: 0.8 };

/** Inline SVG for one attribute-based Figure — mirrors components/Figure.tsx exactly. */
function figureSvg(f: Figure, box = 56): string {
  const cols = f.count <= 2 ? f.count : 2;
  const rows = f.count <= 2 ? 1 : 2;
  const cellW = box / cols;
  const cellH = box / rows;
  const shapeSize = Math.min(cellW, cellH) * SIZE_PCT[f.size];
  let cells = "";
  for (let i = 0; i < f.count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;
    const offsetX = cx - shapeSize / 2;
    const offsetY = cy - shapeSize / 2;
    const d = shapePath(f.shape, shapeSize);
    const dot = f.dot ? `<circle cx="${shapeSize / 2}" cy="${shapeSize / 2}" r="${shapeSize * 0.08}" fill="#000" />` : "";
    cells += `<g transform="translate(${offsetX}, ${offsetY}) rotate(${f.rot}, ${shapeSize / 2}, ${shapeSize / 2})"><path d="${d}" fill="${f.color}" />${dot}</g>`;
  }
  return `<svg viewBox="0 0 ${box} ${box}" width="${box}" height="${box}">${cells}</svg>`;
}

/** A single shapePath-drawn shape (Figure Weights pans/options, Coding shapes). */
function shapeIconSvg(shape: Figure["shape"], color: string, size = 22): string {
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path d="${shapePath(shape, size)}" fill="${color}" /></svg>`;
}
function shapesRowSvg(shapes: Figure["shape"][]): string {
  return shapes.map(s => shapeIconSvg(s, SHAPE_COLOR[s])).join("");
}

/** Coding's 5 fixed mark glyphs — mirrors components/genres/CodingView.tsx's MarkSvg. */
function markSvg(mark: Mark, size = 26): string {
  const c = `stroke="#2b2b2b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const inner =
    mark === "bar" ? `<line x1="20" y1="6" x2="20" y2="34" ${c}/>`
    : mark === "dash" ? `<line x1="6" y1="20" x2="34" y2="20" ${c}/>`
    : mark === "ring" ? `<circle cx="20" cy="20" r="12" ${c}/>`
    : mark === "hat" ? `<polyline points="8,26 20,10 32,26" ${c}/>`
    : `<line x1="10" y1="10" x2="30" y2="30" ${c}/><line x1="30" y1="10" x2="10" y2="30" ${c}/>`;
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}">${inner}</svg>`;
}

/** One polyomino piece's normalized-and-rotated cells, as filled grid squares. */
function pieceGlyphSvg(rawCells: Cell[], rot: 0 | 90 | 180 | 270, cellPx = 16): string {
  const cells = rotate(rawCells, rot);
  const rows = Math.max(...cells.map(c => c[0])) + 1;
  const cols = Math.max(...cells.map(c => c[1])) + 1;
  const rects = cells
    .map(([r, c]) => `<rect x="${c}" y="${r}" width="1" height="1" fill="#2bb3a9" stroke="#fdf6e9" stroke-width="0.06" />`)
    .join("");
  return `<svg viewBox="0 0 ${cols} ${rows}" width="${cols * cellPx}" height="${rows * cellPx}">${rects}</svg>`;
}

const GLYPH_PATH = new Map(GLYPHS.map(g => [g.id, g.d]));
function glyphSvg(id: string, size = 32): string {
  const d = GLYPH_PATH.get(id) ?? "";
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="${d}" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
}

// --- per-genre item renderers ------------------------------------------------

function renderMatrix(item: MatrixItem): string {
  const cols = item.form === "series" ? 5 : item.rows;
  const cellsHtml = item.cells
    .map(c => (c === null ? `<div class="cell placeholder">?</div>` : `<div class="cell">${figureSvg(c, 52)}</div>`))
    .join("");
  const optionsHtml = item.options
    .map((o, i) => `<div class="option${i === item.answer ? " correct" : ""}">${figureSvg(o, 36)}</div>`)
    .join("");
  return (
    `<div class="matrix-grid" style="grid-template-columns:repeat(${cols},1fr)">${cellsHtml}</div>` +
    `<div class="options-row">${optionsHtml}</div>`
  );
}

function renderVisualPuzzles(item: VisualPuzzlesItem): string {
  const cellPx = 12;
  const targetRects = item.target
    .map((filled, i) => {
      if (!filled) return "";
      const r = Math.floor(i / item.size);
      const c = i % item.size;
      return `<rect x="${c}" y="${r}" width="1" height="1" fill="#1f9d94" stroke="#fdf6e9" stroke-width="0.06" />`;
    })
    .join("");
  const target = `<svg viewBox="0 0 ${item.size} ${item.size}" width="${item.size * cellPx}" height="${item.size * cellPx}">${targetRects}</svg>`;
  const piecesHtml = item.pieces
    .map((p, i) => `<div class="vp-piece${item.answer.includes(i) ? " correct" : ""}">${pieceGlyphSvg(p.cells, p.rot, cellPx)}</div>`)
    .join("");
  return `<div class="vp-target">${target}</div><div class="vp-pieces">${piecesHtml}</div>`;
}

function renderBlockDesign(item: BlockDesignItem): string {
  const cellsHtml = item.grid.map(f => `<div class="face-cell">${faceSvg(f, 40)}</div>`).join("");
  return (
    `<div class="bd-grid" style="grid-template-columns:repeat(${item.n},1fr)">${cellsHtml}</div>` +
    `<div class="meta-line">${item.n}x${item.n}, grid lines ${item.showGridLines ? "on" : "off"}</div>`
  );
}

function renderFigureWeights(item: FigureWeightsItem): string {
  const scalesHtml = item.scales
    .map(s => {
      const right = s.right ? shapesRowSvg(s.right) : `<span class="qmark">?</span>`;
      return `<div class="fw-scale"><span class="pan">${shapesRowSvg(s.left)}</span><span class="eq">=</span><span class="pan">${right}</span></div>`;
    })
    .join("");
  const optionsHtml = item.options
    .map((o, i) => `<div class="option${i === item.answer ? " correct" : ""}">${shapesRowSvg(o)}</div>`)
    .join("");
  const weightsHtml = Object.entries(item.weights)
    .map(([s, w]) => `${s}=${w}`)
    .join(", ");
  return (
    `<div class="fw-scales">${scalesHtml}</div><div class="options-row">${optionsHtml}</div>` +
    `<div class="meta-line">hidden weights (audit only, never shown to her): ${esc(weightsHtml)}</div>`
  );
}

function renderDigitSpan(item: DigitSpanItem): string {
  const digitsHtml = item.digits.map(n => `<span class="digit">${n}</span>`).join("");
  const expectedHtml = item.expected.map(n => `<span class="digit correct">${n}</span>`).join("");
  return (
    `<div class="meta-line">task: ${item.task}</div>` +
    `<div class="ds-row"><span class="label">said</span>${digitsHtml}</div>` +
    `<div class="ds-row"><span class="label">correct tap order</span>${expectedHtml}</div>`
  );
}

function renderPictureSpan(item: PictureSpanItem): string {
  const shownHtml = item.shown.map(icon => `<span class="emoji correct">${icon}</span>`).join("");
  const shownSet = new Set(item.shown);
  const choicesHtml = item.choices.map(icon => `<span class="emoji${shownSet.has(icon) ? " is-shown" : ""}">${icon}</span>`).join("");
  return (
    `<div class="ps-row"><span class="label">shown (${item.exposureMs}ms)</span>${shownHtml}</div>` +
    `<div class="ps-row"><span class="label">choices</span>${choicesHtml}</div>`
  );
}

function renderCoding(item: CodingItem): string {
  const keyHtml = CODE_KEY.map(
    k => `<div class="code-pair">${shapeIconSvg(k.shape, "#2b2b2b", 22)}${markSvg(k.mark, 22)}</div>`
  ).join("");
  const correctMark = CODE_KEY.find(k => k.shape === item.shape)!.mark;
  const lookaheadHtml = item.lookahead.map(s => shapeIconSvg(s, "#999999", 20)).join("");
  return (
    `<div class="code-key">${keyHtml}</div>` +
    `<div class="code-target">${shapeIconSvg(item.shape, "#2bb3a9", 40)}<span class="arrow">-&gt;</span><span class="correct-inline">${markSvg(correctMark, 32)}</span></div>` +
    `<div class="meta-line">lookahead:</div><div class="ds-row">${lookaheadHtml}</div>`
  );
}

function renderSymbolSearch(item: SymbolSearchItem): string {
  const groupHtml = item.group.map(id => `<div class="glyph-tile">${glyphSvg(id)}</div>`).join("");
  return (
    `<div class="ss-row"><span class="label">target</span>${glyphSvg(item.target, 40)}</div>` +
    `<div class="ss-row"><span class="label">group</span>${groupHtml}</div>` +
    `<div class="meta-line${item.present ? " correct-text" : ""}">answer: ${item.present ? "YES, it is there" : "NO, it is not"}</div>`
  );
}

function renderChoice(item: ChoiceItem): string {
  const max = Math.max(...item.options.map(o => o.points));
  const emojiHtml = item.emoji ? `<div class="emoji-big">${item.emoji}</div>` : "";
  const optionsHtml = item.options
    .map(o => `<div class="choice-option${o.points === max ? " correct" : ""}">${esc(o.text)} <span class="pts">(${o.points}pt)</span></div>`)
    .join("");
  return `${emojiHtml}<div class="prompt">${esc(item.prompt)}</div><div class="options-col">${optionsHtml}</div>`;
}

function renderArithmeticItem(item: ArithmeticItem): string {
  return `<div class="prompt">${esc(item.text)}</div><div class="answer correct">answer: ${item.answer}</div>`;
}

const RENDERERS: Partial<Record<GenreId, (item: unknown) => string>> = {
  matrix: item => renderMatrix(item as MatrixItem),
  visualPuzzles: item => renderVisualPuzzles(item as VisualPuzzlesItem),
  blockDesign: item => renderBlockDesign(item as BlockDesignItem),
  figureWeights: item => renderFigureWeights(item as FigureWeightsItem),
  digitSpan: item => renderDigitSpan(item as DigitSpanItem),
  pictureSpan: item => renderPictureSpan(item as PictureSpanItem),
  coding: item => renderCoding(item as CodingItem),
  symbolSearch: item => renderSymbolSearch(item as SymbolSearchItem),
  similarities: item => renderChoice(item as ChoiceItem),
  vocabulary: item => renderChoice(item as ChoiceItem),
  information: item => renderChoice(item as ChoiceItem),
  comprehension: item => renderChoice(item as ChoiceItem),
  arithmetic: item => renderArithmeticItem(item as ArithmeticItem),
};

// --- page assembly ------------------------------------------------------------

const STYLE = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #fdf6e9; color: #222; margin: 0; padding: 24px 32px 64px; }
h1 { margin: 0 0 4px; }
.subtitle { color: #666; margin: 0 0 20px; }
.legend { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; font-size: 0.85em; color: #555; }
.legend .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 3px; border: 2px solid #2ecc71; background: #eafaf0; margin-right: 4px; vertical-align: middle; }
.toc { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-bottom: 32px; font-size: 0.9em; }
.toc a { color: #1f9d94; text-decoration: none; }
.toc a:hover { text-decoration: underline; }
section { margin-bottom: 48px; border-top: 3px solid #2bb3a9; padding-top: 14px; scroll-margin-top: 12px; }
h2 { margin: 0 0 2px; }
.subtest { color: #888; font-weight: normal; font-size: 0.75em; }
.ramp { color: #555; font-size: 0.92em; margin: 4px 0 16px; max-width: 90ch; }
.d-block { margin-bottom: 14px; }
.d-label { font-weight: bold; font-size: 0.85em; color: #1f9d94; margin-bottom: 6px; }
.grid { display: flex; flex-wrap: wrap; gap: 12px; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; background: #fff; min-width: 150px; }
.card-meta { font-size: 0.7em; color: #999; margin-bottom: 6px; font-weight: bold; letter-spacing: 0.02em; }
.matrix-grid, .bd-grid { display: grid; gap: 2px; margin-bottom: 6px; }
.cell, .face-cell { display: flex; align-items: center; justify-content: center; background: #f4f4f4; width: 54px; height: 54px; border-radius: 4px; }
.cell.placeholder { font-size: 1.4em; color: #2bb3a9; font-weight: bold; }
.options-row, .options-col { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.options-col { flex-direction: column; }
.option, .choice-option { border: 2px solid #e2e2e2; border-radius: 6px; padding: 3px 7px; display: flex; align-items: center; font-size: 0.85em; }
.option.correct, .choice-option.correct, .answer.correct, .vp-piece.correct, .digit.correct, .emoji.correct {
  border-color: #2ecc71 !important; background: #eafaf0;
}
.vp-pieces { display: flex; flex-wrap: wrap; gap: 6px; }
.vp-piece { border: 2px solid #e2e2e2; border-radius: 4px; padding: 3px; background: #fafafa; }
.vp-target { margin-bottom: 6px; }
.meta-line { font-size: 0.72em; color: #888; margin-top: 4px; }
.meta-line.correct-text { color: #1a9850; font-weight: bold; }
.prompt { font-weight: bold; margin-bottom: 6px; max-width: 32ch; }
.pts { color: #999; font-size: 0.85em; }
.emoji-big { font-size: 2.2em; line-height: 1; }
.digit { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: 1px solid #ccc; border-radius: 4px; margin-right: 2px; font-weight: bold; font-size: 0.85em; }
.emoji { font-size: 1.3em; margin-right: 4px; padding: 2px 3px; border-radius: 4px; }
.emoji.is-shown { background: #eef7ff; }
.ds-row, .ps-row, .ss-row, .fw-scale, .code-target { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; flex-wrap: wrap; }
.label { font-size: 0.65em; color: #999; text-transform: uppercase; margin-right: 4px; letter-spacing: 0.03em; }
.code-key { display: flex; gap: 6px; margin-bottom: 6px; background: #eef7f6; padding: 4px 6px; border-radius: 6px; flex-wrap: wrap; }
.code-pair { display: flex; align-items: center; gap: 1px; }
.code-target .arrow { color: #999; font-size: 0.85em; }
.glyph-tile { border: 1px solid #e2e2e2; border-radius: 4px; padding: 2px; background: #fafafa; }
.qmark { font-weight: bold; font-size: 1.1em; color: #999; }
.fw-scale .eq { color: #999; }
`;

function buildPage(): string {
  const toc = GENRE_LIST.map(id => `<a href="#${id}">${esc(GENRES[id].kidTitle)}</a>`).join("");

  const sections = GENRE_LIST.map(id => {
    const genre = GENRES[id];
    const render = genre.audit ? (item: unknown) => genre.audit!(item) : RENDERERS[id];
    if (!render) throw new Error(`no renderer for ${id}`);
    const allD: Difficulty[] = genreMaxD(genre) > 10 ? [...DIFFICULTIES, ...Array.from({ length: genreMaxD(genre) - 10 }, (_, i) => (11 + i) as Difficulty)] : DIFFICULTIES;
    const dBlocks = allD.map(d => {
      const cards = SEEDS.map(seed => {
        const item = genre.generate(seed, d);
        return `<div class="card"><div class="card-meta">seed ${seed}</div>${render(item)}</div>`;
      }).join("");
      return `<div class="d-block"><div class="d-label">d${d}</div><div class="grid">${cards}</div></div>`;
    }).join("");

    return (
      `<section id="${id}">` +
      `<h2>${esc(genre.kidTitle)} <span class="subtest">${esc(genre.subtest)} &middot; ${id}</span></h2>` +
      `<p class="ramp">${esc(RAMP[id] ?? genre.instructions)}</p>` +
      dBlocks +
      `</section>`
    );
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Aoife Puzzles &mdash; Item Audit</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${STYLE}</style>
</head>
<body>
<h1>Aoife Puzzles &mdash; Item Audit</h1>
<p class="subtitle">3 seeded items (seeds 1, 2, 3) per difficulty (d1&ndash;d10), every genre. Generated by <code>scripts/audit-items.ts</code> &mdash; regenerate with <code>npx tsx scripts/audit-items.ts</code> before a release.</p>
<div class="legend"><span><span class="swatch"></span>green border = the credited full/top-scoring answer</span></div>
<div class="toc">${toc}</div>
${sections}
</body>
</html>
`;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(scriptDir, "..", "docs", "audit");
const outFile = path.join(outDir, "items.html");

mkdirSync(outDir, { recursive: true });
const html = buildPage();
writeFileSync(outFile, html, "utf8");

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(0);
console.log(`Wrote ${outFile} (${kb} KB)`);
