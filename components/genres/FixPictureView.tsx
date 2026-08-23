"use client";
import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import { rotate, type Cell, type Piece, type FixPictureItem } from "@/lib/genres/fixPicture";

// Same "true relative scale" convention as Piece Picker's PieceGlyph: one
// cell is always this many px in both the picture and every option piece.
const CELL_PX = 32;
const GRID_STROKE_WIDTH = 1 / CELL_PX;

function pieceBounds(cells: Cell[]): { rows: number; cols: number } {
  const rows = Math.max(...cells.map(c => c[0])) + 1;
  const cols = Math.max(...cells.map(c => c[1])) + 1;
  return { rows, cols };
}

/** One option piece, drawn at CELL_PX scale with its display rotation applied. */
function PieceGlyph({ piece }: { piece: Piece }) {
  const displayCells = rotate(piece.cells, piece.rot);
  const { rows, cols } = pieceBounds(displayCells);
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} width={cols * CELL_PX} height={rows * CELL_PX}>
      {displayCells.map(([r, c], i) => (
        <rect key={i} x={c} y={r} width={1} height={1} className="fill-sky-400 stroke-cream" strokeWidth={GRID_STROKE_WIDTH} />
      ))}
    </svg>
  );
}

/** The picture: filled cells solid, the hole drawn as a dashed outline (or, in
 * reveal, filled solid green — "the hole filled"). */
function PictureGrid({ item, reveal }: { item: FixPictureItem; reveal: boolean }) {
  const { size, filled, hole } = item;
  const holeSet = new Set(hole.map(([r, c]) => `${r},${c}`));
  const px = size * CELL_PX;
  const cells: { r: number; c: number; kind: "filled" | "hole" }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      if (filled[i]) cells.push({ r, c, kind: "filled" });
      else if (holeSet.has(`${r},${c}`)) cells.push({ r, c, kind: "hole" });
    }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={px} height={px} className="shrink-0" aria-hidden="true">
      {cells.map(({ r, c, kind }, i) =>
        kind === "filled" || reveal ? (
          <rect
            key={i}
            x={c}
            y={r}
            width={1}
            height={1}
            className={kind === "hole" ? "fill-[#6fcf6f] stroke-cream" : "fill-teal-600 stroke-cream"}
            strokeWidth={GRID_STROKE_WIDTH}
          />
        ) : (
          <rect
            key={i}
            x={c + 0.04}
            y={r + 0.04}
            width={0.92}
            height={0.92}
            fill="none"
            stroke="#9ca3af"
            strokeWidth={0.06}
            strokeDasharray="0.16,0.12"
          />
        )
      )}
    </svg>
  );
}

/** Fix the Picture (Object Assembly, VS): tap the `item.pieceCount` pieces that fill the hole exactly. */
export function FixPictureView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<FixPictureItem, number[]>) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [renderedItem, setRenderedItem] = useState(item);

  // Reset selection when a new item arrives (React's "adjust state during render" pattern).
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
      if (prev.length >= item.pieceCount) return prev;
      return [...prev, i];
    });
  }

  function handleDone() {
    if (disabled || reveal || submitted || selected.length !== item.pieceCount) return;
    setSubmitted(true);
    onRespond([...selected].sort((a, b) => a - b));
  }

  const answerSet = reveal ? new Set(item.answer) : null;
  const pickedSet = reveal ? new Set(lastResponse ?? []) : null;
  const tapLabel = item.pieceCount === 1 ? "Tap 1 piece" : "Tap 2 pieces";

  return (
    // QA 2026-08-23: the picture + pieces live in their OWN
    // flex-1/min-h-0/overflow-y-auto region, so they scroll *internally* if
    // ever taller than the available space, instead of pushing Done below
    // the fold — Done is a plain sibling AFTER that region, never part of
    // the scroll, so it's always fully visible without scrolling.
    <div className="flex min-h-full w-full flex-col items-center bg-cream">
      <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center-safe gap-6 overflow-y-auto p-4 pb-2">
        <PictureGrid item={item} reveal={reveal} />

        {!reveal && <p className="text-lg font-semibold text-ink/70">{tapLabel}</p>}
        {reveal && <p className="text-2xl text-ink">Here is the piece that fits.</p>}

        <div className="flex w-full max-w-[60rem] flex-wrap items-center justify-center gap-4">
          {item.options.map((piece, i) => {
            if (reveal) {
              const isCorrect = answerSet!.has(i);
              const isWrongPick = !isCorrect && pickedSet!.has(i);
              const revealClass = isCorrect
                ? "bg-[#6fcf6f]/15 ring-4 ring-[#6fcf6f]"
                : isWrongPick
                  ? "bg-white ring-4 ring-rose-400"
                  : "bg-white ring-2 ring-teal-100 opacity-40";
              return (
                <div key={i} className={`flex min-h-16 min-w-16 items-center justify-center rounded-2xl p-2 ${revealClass}`}>
                  <PieceGlyph piece={piece} />
                </div>
              );
            }
            const isSelected = selected.includes(i);
            return (
              <button
                key={i}
                type="button"
                data-testid="answer-option"
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
      </div>

      {!disabled && (
        <div className="w-full shrink-0 bg-cream pb-4 pt-3 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.15)]">
          <button
            type="button"
            data-testid="done"
            disabled={selected.length !== item.pieceCount || submitted}
            onClick={handleDone}
            className="mx-auto block rounded-full bg-teal-400 px-12 py-5 text-2xl font-bold text-white transition active:scale-95 disabled:bg-teal-100 disabled:text-ink/40"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default FixPictureView;
