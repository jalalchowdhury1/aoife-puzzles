"use client";

import { useEffect, useRef } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { CodingItem, Mark } from "@/lib/genres/coding";
import { CODE_KEY } from "@/lib/genres/coding";
import { shapePath } from "@/lib/genres/shapes";

const MARK_ORDER: Mark[] = ["bar", "dash", "ring", "hat", "cross"];

/** Tiny inline SVG for one of the 5 code marks (bar, dash, ring, hat, cross). */
function MarkSvg({ mark, size = 40 }: { mark: Mark; size?: number }) {
  const common = { stroke: "currentColor", strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      {mark === "bar" && <line x1={20} y1={6} x2={20} y2={34} {...common} />}
      {mark === "dash" && <line x1={6} y1={20} x2={34} y2={20} {...common} />}
      {mark === "ring" && <circle cx={20} cy={20} r={12} {...common} />}
      {mark === "hat" && <polyline points="8,26 20,10 32,26" {...common} />}
      {mark === "cross" && (
        <>
          <line x1={10} y1={10} x2={30} y2={30} {...common} />
          <line x1={30} y1={10} x2={10} y2={30} {...common} />
        </>
      )}
    </svg>
  );
}

function ShapeSvg({ shape, size, color }: { shape: CodingItem["shape"]; size: number; color: string }) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      <path d={shapePath(shape, size)} fill={color} />
    </svg>
  );
}

export function CodingView({ item, disabled, onReady, onRespond }: GenreViewProps<CodingItem, Mark>) {
  const responded = useRef(false);

  useEffect(() => {
    onReady();
    // Fires exactly once when this item's stimulus mounts; onReady/onRespond
    // identity is not a dependency we want to re-trigger on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(mark: Mark) {
    if (disabled || responded.current) return;
    responded.current = true;
    onRespond(mark);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-3xl mx-auto">
      <div className="flex gap-3 bg-teal-100 rounded-3xl p-3">
        {CODE_KEY.map(({ shape, mark }) => (
          <div key={shape} className="flex flex-col items-center gap-1 bg-cream rounded-2xl p-2">
            <ShapeSvg shape={shape} size={36} color="var(--color-ink)" />
            <MarkSvg mark={mark} size={28} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="bg-teal-100 rounded-3xl p-4">
          <ShapeSvg shape={item.shape} size={110} color="var(--color-teal-600)" />
        </div>
        <div className="flex gap-2">
          {item.lookahead.map((s, i) => (
            <div key={i} className="opacity-35">
              <ShapeSvg shape={s} size={46} color="var(--color-ink)" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {MARK_ORDER.map(mark => (
          <button
            key={mark}
            type="button"
            data-testid="mark-option"
            disabled={disabled}
            onClick={() => respond(mark)}
            className="flex items-center justify-center bg-teal-400 text-cream rounded-2xl active:bg-teal-600 disabled:opacity-60"
            style={{ width: 88, height: 88 }}
          >
            <MarkSvg mark={mark} size={48} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default CodingView;
