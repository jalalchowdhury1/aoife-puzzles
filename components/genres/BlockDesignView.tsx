"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import { FACES, faceSvg, type BlockDesignItem, type Face } from "@/lib/genres/blockDesign";

const CELL = 100;

/** One face drawn from the pure `faceSvg` string helper. */
function FaceCell({ face, size }: { face: Face; size: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      // faceSvg is a static, self-authored SVG string (no user content), safe to inject.
      dangerouslySetInnerHTML={{ __html: faceSvg(face, size) }}
    />
  );
}

export function BlockDesignView({ item, disabled, onReady, onRespond }: GenreViewProps<BlockDesignItem, Face[]>) {
  const [renderedItem, setRenderedItem] = useState(item);
  const [board, setBoard] = useState<Face[]>(() => Array(item.grid.length).fill("W"));
  const [responded, setResponded] = useState(false);

  // Reset the board synchronously during render when a new item arrives (React's
  // recommended pattern for adjusting state from props, instead of setState-in-effect).
  if (item !== renderedItem) {
    setRenderedItem(item);
    setBoard(Array(item.grid.length).fill("W"));
    setResponded(false);
  }

  useEffect(() => {
    onReady();
    // Re-fire only when a new item arrives; onReady's identity isn't part of the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  function cycle(i: number) {
    if (disabled) return;
    setBoard(prev => {
      const next = [...prev];
      const idx = FACES.indexOf(next[i]);
      next[i] = FACES[(idx + 1) % FACES.length];
      return next;
    });
  }

  function submit() {
    if (disabled || responded) return;
    setResponded(true);
    onRespond(board);
  }

  const targetGap = item.showGridLines ? 4 : 0;

  return (
    <div className="flex h-full w-full flex-col landscape:flex-row items-center justify-center gap-8 bg-cream p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-bold text-ink">Picture</div>
        <div
          className="grid rounded-lg bg-teal-100 p-2"
          style={{ gridTemplateColumns: `repeat(${item.n}, ${CELL}px)`, gap: targetGap }}
        >
          {item.grid.map((face, i) => (
            <FaceCell key={i} face={face} size={CELL} />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-bold text-ink">Your board</div>
        <div
          className="grid rounded-lg bg-teal-100 p-2"
          style={{ gridTemplateColumns: `repeat(${item.n}, ${CELL}px)`, gap: 4 }}
        >
          {board.map((face, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => cycle(i)}
              aria-label={`Board square ${i + 1}`}
              className="overflow-hidden rounded-md border-2 border-teal-600"
              style={{ width: CELL, height: CELL }}
            >
              <FaceCell face={face} size={CELL} />
            </button>
          ))}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={submit}
            className="min-h-16 rounded-full bg-teal-400 px-10 text-2xl font-bold text-ink"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}

export default BlockDesignView;
