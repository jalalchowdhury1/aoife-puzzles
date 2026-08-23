"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import { tileEqual, tileKey, tileSvg, type MosaicItem, type Tile } from "@/lib/genres/mosaic";

const CELL = 88;

/** One tile drawn from the pure `tileSvg` string helper. */
function TileCell({ tile, size }: { tile: Tile; size: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      // tileSvg is a static, self-authored SVG string (no user content), safe to inject.
      dangerouslySetInnerHTML={{ __html: tileSvg(tile, size) }}
    />
  );
}

/** Mosaic Maker (Mosaic Design, VS): tap a board cell to cycle through the palette until it matches the picture. */
export function MosaicView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<MosaicItem, Tile[]>) {
  const [renderedItem, setRenderedItem] = useState(item);
  const [board, setBoard] = useState<Tile[]>(() => Array(item.target.length).fill(item.palette[0]));
  const [responded, setResponded] = useState(false);

  // Reset the board synchronously during render when a new item arrives (React's
  // "adjust state during render" pattern, same as BlockDesignView).
  if (item !== renderedItem) {
    setRenderedItem(item);
    setBoard(Array(item.target.length).fill(item.palette[0]));
    setResponded(false);
  }

  useEffect(() => {
    onReady();
    // Re-fire only when a new item arrives; onReady's identity isn't part of the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function cycle(i: number) {
    if (disabled || reveal) return;
    setBoard(prev => {
      const next = [...prev];
      const idx = item.palette.findIndex(t => tileKey(t) === tileKey(next[i]));
      next[i] = item.palette[(idx + 1) % item.palette.length];
      return next;
    });
  }

  function submit() {
    if (disabled || reveal || responded) return;
    setResponded(true);
    onRespond(board);
  }

  const targetGap = item.showGrid ? 4 : 0;
  // Reveal: show the correct pattern on the "board" side (instead of her live
  // build) and ring the cells where her recorded answer differed from it.
  const displayBoard = reveal ? item.target : board;
  const boardCaption = reveal ? "This is the matching pattern" : "Your board";

  return (
    // QA 2026-08-23: landscape:items-stretch (rather than -center) so each
    // column gets the full row height, letting the board column's Done
    // button pin to the bottom (mt-auto + sticky bottom-0, same pattern as
    // every other view) instead of risking being pushed below the fold on a
    // big board.
    <div className="flex min-h-full w-full flex-col landscape:flex-row items-center landscape:items-center landscape:justify-center-safe justify-center-safe gap-8 bg-cream p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold text-ink">Picture</div>
        <div
          className="grid rounded-lg bg-teal-100 p-2"
          style={{ gridTemplateColumns: `repeat(${item.n}, ${CELL}px)`, gap: targetGap }}
        >
          {item.target.map((tile, i) => (
            <TileCell key={i} tile={tile} size={CELL} />
          ))}
        </div>
      </div>

      {/* QA 2026-08-23: the board + palette live in their OWN
          flex-1/min-h-0/overflow-y-auto region, so they scroll *internally*
          if ever taller than the available space, instead of pushing Done
          below the fold — Done is a plain sibling AFTER that region, never
          part of the scroll, so it's always fully visible without scrolling. */}
      <div className="flex min-h-0 flex-1 landscape:flex-none flex-col items-center">
        <div className="flex w-full flex-1 min-h-0 flex-col items-center justify-center-safe gap-4 overflow-y-auto pb-2">
          <div className="text-2xl font-bold text-ink">{boardCaption}</div>
          <div
            className="grid rounded-lg bg-teal-100 p-2"
            style={{ gridTemplateColumns: `repeat(${item.n}, ${CELL}px)`, gap: 4 }}
          >
            {displayBoard.map((tile, i) => {
              const missed = reveal && !!lastResponse && !tileEqual(lastResponse[i], item.target[i]);
              return (
                <button
                  key={i}
                  type="button"
                  data-testid="answer-option"
                  disabled={disabled}
                  onClick={() => cycle(i)}
                  aria-label={`Board square ${i + 1}`}
                  className={`overflow-hidden rounded-md border-2 border-teal-600 ${
                    missed ? "ring-4 ring-rose-400 ring-offset-2" : ""
                  }`}
                  style={{ width: CELL, height: CELL }}
                >
                  <TileCell tile={tile} size={CELL} />
                </button>
              );
            })}
          </div>

          {!reveal && (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white/60 p-2">
              <span className="text-base text-ink/60">Tiles:</span>
              {item.palette.map((tile, i) => (
                <div key={i} className="overflow-hidden rounded-md border border-teal-200">
                  <TileCell tile={tile} size={40} />
                </div>
              ))}
            </div>
          )}
        </div>

        {!disabled && (
          <div className="w-full shrink-0 bg-cream pb-2 pt-3">
            <button
              type="button"
              data-testid="done"
              onClick={submit}
              className="mx-auto block min-h-16 rounded-full bg-teal-400 px-10 text-2xl font-bold text-ink"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MosaicView;
