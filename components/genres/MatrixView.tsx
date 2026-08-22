"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { MatrixItem } from "@/lib/genres/matrix";
import { Figure } from "@/components/Figure";

const CELL_BOX = 110;
const OPTION_BOX = 88;

/** "What's Missing?" — a matrix (or 1x5 series) of figures with the last cell blank. */
export default function MatrixView({ item, disabled, onReady, onRespond }: GenreViewProps<MatrixItem, number>) {
  const [selected, setSelected] = useState<number | null>(null);

  // A new item is a new object reference; reset the selection during render
  // (React's documented pattern for "adjusting state when a prop changes")
  // rather than in an effect, so there is no extra render pass.
  const [shownItem, setShownItem] = useState(item);
  if (item !== shownItem) {
    setShownItem(item);
    setSelected(null);
  }

  useEffect(() => {
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cols = item.form === "series" ? 5 : item.rows;

  const pick = (i: number) => {
    if (disabled) return;
    setSelected(i);
  };

  const confirm = () => {
    if (disabled || selected === null) return;
    onRespond(selected);
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-10 p-4 landscape:flex-row landscape:items-center landscape:gap-14">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, ${CELL_BOX}px)` }}
      >
        {item.cells.map((cell, i) =>
          cell ? (
            <div
              key={i}
              className="flex items-center justify-center rounded-2xl bg-white shadow-sm"
              style={{ width: CELL_BOX, height: CELL_BOX }}
            >
              <Figure f={cell} box={CELL_BOX * 0.78} />
            </div>
          ) : (
            <div
              key={i}
              className="flex items-center justify-center rounded-2xl border-4 border-dashed border-teal-400 text-4xl font-bubble text-teal-600"
              style={{ width: CELL_BOX, height: CELL_BOX }}
            >
              ?
            </div>
          )
        )}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex max-w-md flex-wrap justify-center gap-4">
          {item.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              aria-pressed={selected === i}
              className={`flex items-center justify-center rounded-2xl border-4 bg-white transition-colors ${
                selected === i ? "border-teal-600 bg-teal-100" : "border-transparent"
              }`}
              style={{ width: OPTION_BOX, height: OPTION_BOX }}
            >
              <Figure f={opt} box={OPTION_BOX * 0.8} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={confirm}
          disabled={disabled || selected === null}
          className="min-h-16 min-w-40 rounded-full bg-teal-400 px-8 text-2xl font-bubble text-white disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}
