"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { PictureSudokuItem } from "@/lib/genres/pictureSudoku";

const CELL_BOX = 88;
const OPTION_BOX = 76;

/** Picture Sudoku: a small grid where every row/column holds each picture once; one box is a "?". */
export default function PictureSudokuView({
  item,
  disabled,
  reveal = false,
  lastResponse = null,
  onReady,
  onRespond,
}: GenreViewProps<PictureSudokuItem, number>) {
  const [selected, setSelected] = useState<number | null>(null);

  // A new item is a new object reference; reset the selection during render
  // (React's documented "adjust state when a prop changes" pattern) rather
  // than in an effect, so there is no extra render pass.
  const [shownItem, setShownItem] = useState(item);
  if (item !== shownItem) {
    setShownItem(item);
    setSelected(null);
  }

  useEffect(() => {
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i: number) => {
    if (disabled || reveal) return;
    setSelected(i);
  };

  const confirm = () => {
    if (disabled || reveal || selected === null) return;
    onRespond(selected);
  };

  const correctSymbol = item.options[item.answer];

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 p-4">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${item.n}, ${CELL_BOX}px)` }}
      >
        {item.cells.map((cell, i) => {
          if (cell !== null) {
            return (
              <div
                key={i}
                className="flex items-center justify-center rounded-2xl bg-white shadow-sm"
                style={{ width: CELL_BOX, height: CELL_BOX, fontSize: CELL_BOX * 0.55 }}
              >
                {cell}
              </div>
            );
          }
          if (i === item.missing) {
            return reveal ? (
              <div
                key={i}
                className="flex items-center justify-center rounded-2xl bg-white shadow-sm ring-4 ring-[#6fcf6f]"
                style={{ width: CELL_BOX, height: CELL_BOX, fontSize: CELL_BOX * 0.55 }}
              >
                {correctSymbol}
              </div>
            ) : (
              <div
                key={i}
                className="flex items-center justify-center rounded-2xl border-4 border-dashed border-teal-400 text-4xl font-bubble text-teal-600"
                style={{ width: CELL_BOX, height: CELL_BOX }}
              >
                ?
              </div>
            );
          }
          // an extra (grey, unasked, ungraded) blank cell — from d4 up
          return (
            <div
              key={i}
              className="rounded-2xl bg-ink/10"
              style={{ width: CELL_BOX, height: CELL_BOX }}
              aria-hidden
            />
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-4">
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
                  style={{ width: OPTION_BOX, height: OPTION_BOX, fontSize: OPTION_BOX * 0.5 }}
                >
                  {opt}
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                data-testid="answer-option"
                onClick={() => pick(i)}
                disabled={disabled}
                aria-pressed={selected === i}
                className={`flex items-center justify-center rounded-2xl border-4 bg-white transition-colors ${
                  selected === i ? "border-teal-600 bg-teal-100" : "border-transparent"
                }`}
                style={{ width: OPTION_BOX, height: OPTION_BOX, fontSize: OPTION_BOX * 0.5 }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          data-testid="done"
          onClick={confirm}
          disabled={disabled || reveal || selected === null}
          className="min-h-16 min-w-40 rounded-full bg-teal-400 px-8 text-2xl font-bubble text-white disabled:opacity-40"
        >
          Done
        </button>
      </div>
    </div>
  );
}
