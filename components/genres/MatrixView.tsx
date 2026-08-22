"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { MatrixItem } from "@/lib/genres/matrix";
import { Figure } from "@/components/Figure";

// Cells must read at >=120px even on iPad landscape (1180x713) — the real
// data showed a 5-year-old missing near-identical distractors (rotated
// hexagon, M vs L) when figures rendered too small to compare at a glance.
const CELL_BOX = 120;
// Reduced from 88: in landscape the 5 options stack in one column next to
// the grid (see the comment below), and at 88px + gap-3 that column plus the
// 3x3 grid + Done button didn't reliably fit an iPad's 713px tall viewport
// without scrolling. 64px (+ an 8px gap) keeps the option figures legible
// while the whole screen clears 713px.
const OPTION_BOX = 64;

/** "What's Missing?" — a matrix (or 1x5 series) of figures with the last cell blank. */
export default function MatrixView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<MatrixItem, number>) {
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
    if (disabled || reveal) return;
    setSelected(i);
  };

  const confirm = () => {
    if (disabled || reveal || selected === null) return;
    onRespond(selected);
  };

  const correctFigure = reveal ? item.options[item.answer] : null;

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
          ) : reveal && correctFigure ? (
            // Reveal: fill the missing cell in with the figure that actually completes the pattern.
            <div
              key={i}
              className="flex items-center justify-center rounded-2xl bg-white shadow-sm ring-4 ring-[#6fcf6f]"
              style={{ width: CELL_BOX, height: CELL_BOX }}
            >
              <Figure f={correctFigure} box={CELL_BOX * 0.78} />
            </div>
          ) : (
            <div
              key={i}
              className="flex items-center justify-center rounded-2xl border-4 border-dashed border-teal-400 text-5xl font-bubble text-teal-600"
              style={{ width: CELL_BOX, height: CELL_BOX }}
            >
              ?
            </div>
          )
        )}
      </div>

      <div className="flex flex-col items-center gap-6">
        {/*
          Portrait: wrap the 5 options in a row (plenty of vertical room).
          Landscape (iPad 1180x713): stack them in a column to the right of
          the grid instead, at a reduced 64px tile height and 8px gap — 5
          options (5*64 + 4*8 = 352px) plus the Done button comfortably clears
          the 3x3 grid's ~384px height, and the whole screen stays well within
          713px tall with no scrolling.
        */}
        <div className="flex max-w-md flex-wrap justify-center gap-4 landscape:max-w-none landscape:flex-col landscape:flex-nowrap landscape:gap-2">
          {item.options.map((opt, i) => {
            if (reveal) {
              const isCorrect = i === item.answer;
              const isWrongPick = !isCorrect && lastResponse === i;
              const revealClass = isCorrect
                ? "border-[#6fcf6f] bg-[#6fcf6f]/15"
                : isWrongPick
                  ? "border-rose-400 bg-white"
                  : "border-transparent bg-white opacity-40";
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center rounded-2xl border-4 ${revealClass}`}
                  style={{ width: OPTION_BOX, height: OPTION_BOX }}
                >
                  <Figure f={opt} box={OPTION_BOX * 0.8} />
                </div>
              );
            }
            return (
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
            );
          })}
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
