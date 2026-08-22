"use client";
import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import { rotate, type Cell, type Piece, type VisualPuzzlesItem } from "@/lib/genres/visualPuzzles";

// One cell is always this many px, in both the target silhouette and every
// option piece, so pieces render at true relative scale (comparable to the
// target and to each other) instead of each being auto-fit to a uniform tile.
const CELL_PX = 36;
// A true 1px grid line regardless of CELL_PX — expressed in viewBox units
// (1 unit = 1 cell = CELL_PX real px), so both the target and every piece
// draw the same hairline weight.
const GRID_STROKE_WIDTH = 1 / CELL_PX;

function pieceBounds(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(c => c[0])) + 1;
  const cols = Math.max(...cells.map(c => c[1])) + 1;
  return { rows, cols };
}

// Pieces render as contiguous, gap-free cells with the same light grid-line
// style as the target (see TargetSilhouette) — no rounded corners, no
// margins between cells. Her real d1 data showed two identical pieces and a
// mirror-image distractor that were easy to miss when pieces were drawn as
// separate rounded squares; a solid, gridded, contiguous piece reads as one
// object instead of a pile of separate tiles.
function PieceGlyph({ piece }: { piece: Piece }) {
  const displayCells = rotate(piece.cells, piece.rot);
  const { rows, cols } = pieceBounds(displayCells);
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} width={cols * CELL_PX} height={rows * CELL_PX}>
      {displayCells.map(([r, c], i) => (
        <rect
          key={i}
          x={c}
          y={r}
          width={1}
          height={1}
          className="fill-teal-400 stroke-cream"
          strokeWidth={GRID_STROKE_WIDTH}
        />
      ))}
    </svg>
  );
}

// Drawn WITH light cell grid lines so the cells are countable — her real d1
// data showed a solid silhouette with no lines meant she couldn't count
// cells to check a piece's size against the target.
function TargetSilhouette({ item }: { item: VisualPuzzlesItem }) {
  const { size, target } = item;
  const cells: Cell[] = [];
  target.forEach((filled, i) => {
    if (filled) cells.push([Math.floor(i / size), i % size]);
  });
  const px = size * CELL_PX;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={px} height={px} className="shrink-0" aria-hidden="true">
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={c}
          y={r}
          width={1}
          height={1}
          className="fill-teal-600 stroke-cream"
          strokeWidth={GRID_STROKE_WIDTH}
        />
      ))}
    </svg>
  );
}

/** Piece Picker (Visual Puzzles, VS): tap the 3 pieces that tile the target shape. */
export function VisualPuzzlesView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<VisualPuzzlesItem, number[]>) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [renderedItem, setRenderedItem] = useState(item);

  // Reset selection when a new item arrives (React's "adjust state during
  // render" pattern, rather than an effect that sets local state).
  if (item !== renderedItem) {
    setRenderedItem(item);
    setSelected([]);
    setSubmitted(false);
  }

  useEffect(() => {
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function toggle(i: number) {
    if (disabled || reveal || submitted) return;
    setSelected(prev => {
      if (prev.includes(i)) return prev.filter(x => x !== i);
      if (prev.length >= 3) return prev;
      return [...prev, i];
    });
  }

  function handleDone() {
    if (disabled || reveal || submitted || selected.length !== 3) return;
    setSubmitted(true);
    onRespond([...selected].sort((a, b) => a - b));
  }

  // Reveal: the 3 true pieces always get the green "correct" treatment; any
  // piece she tapped that wasn't one of them gets the rose "wrong pick"
  // treatment; everything else is dimmed out of the way.
  const answerSet = reveal ? new Set(item.answer) : null;
  const pickedSet = reveal ? new Set(lastResponse ?? []) : null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-cream p-4">
      <TargetSilhouette item={item} />

      {/* max-w wide enough that 6 tiles at CELL_PX=36 fit across the 1180px
          iPad viewport in one row when the pieces are small; flex-wrap still
          drops to two rows for larger (d>=7) pieces without clipping anything. */}
      <div className="flex w-full max-w-[68rem] flex-wrap items-center justify-center gap-4">
        {item.pieces.map((piece, i) => {
          if (reveal) {
            const isCorrect = answerSet!.has(i);
            const isWrongPick = !isCorrect && pickedSet!.has(i);
            const revealClass = isCorrect
              ? "bg-[#6fcf6f]/15 ring-4 ring-[#6fcf6f]"
              : isWrongPick
                ? "bg-white ring-4 ring-rose-400"
                : "bg-white ring-2 ring-teal-100 opacity-40";
            return (
              <div
                key={i}
                className={`flex min-h-16 min-w-16 items-center justify-center rounded-2xl p-2 ${revealClass}`}
              >
                <PieceGlyph piece={piece} />
              </div>
            );
          }
          const isSelected = selected.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => toggle(i)}
              className={`flex min-h-16 min-w-16 items-center justify-center rounded-2xl bg-white p-2 transition ${
                isSelected ? "ring-4 ring-teal-600" : "ring-2 ring-teal-100"
              }`}
            >
              <PieceGlyph piece={piece} />
            </button>
          );
        })}
      </div>

      {!disabled && (
        <button
          type="button"
          disabled={selected.length !== 3 || submitted}
          onClick={handleDone}
          className="rounded-full bg-teal-400 px-12 py-5 text-2xl font-bold text-white transition active:scale-95 disabled:bg-teal-100 disabled:text-ink/40"
        >
          Done
        </button>
      )}
    </div>
  );
}

export default VisualPuzzlesView;
