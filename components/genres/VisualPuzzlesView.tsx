"use client";
import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import { rotate, type Cell, type Piece, type VisualPuzzlesItem } from "@/lib/genres/visualPuzzles";

// One cell is always this many px, in both the target silhouette and every
// option piece, so pieces render at true relative scale (comparable to the
// target and to each other) instead of each being auto-fit to a uniform tile.
const CELL_PX = 32;

function pieceBounds(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(c => c[0])) + 1;
  const cols = Math.max(...cells.map(c => c[1])) + 1;
  return { rows, cols };
}

function PieceGlyph({ piece }: { piece: Piece }) {
  const displayCells = rotate(piece.cells, piece.rot);
  const { rows, cols } = pieceBounds(displayCells);
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} width={cols * CELL_PX} height={rows * CELL_PX}>
      {displayCells.map(([r, c], i) => (
        <rect key={i} x={c + 0.08} y={r + 0.08} width={0.84} height={0.84} rx={0.14} className="fill-teal-400" />
      ))}
    </svg>
  );
}

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
        <rect key={i} x={c} y={r} width={1} height={1} className="fill-teal-600" />
      ))}
    </svg>
  );
}

/** Piece Picker (Visual Puzzles, VS): tap the 3 pieces that tile the target shape. */
export function VisualPuzzlesView({ item, disabled, onReady, onRespond }: GenreViewProps<VisualPuzzlesItem, number[]>) {
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
    if (disabled || submitted) return;
    setSelected(prev => {
      if (prev.includes(i)) return prev.filter(x => x !== i);
      if (prev.length >= 3) return prev;
      return [...prev, i];
    });
  }

  function handleDone() {
    if (disabled || submitted || selected.length !== 3) return;
    setSubmitted(true);
    onRespond([...selected].sort((a, b) => a - b));
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-cream p-4">
      <TargetSilhouette item={item} />

      <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-4">
        {item.pieces.map((piece, i) => {
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
