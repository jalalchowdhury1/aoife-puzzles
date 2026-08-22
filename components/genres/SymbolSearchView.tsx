"use client";

import { useEffect, useRef } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { SymbolSearchItem } from "@/lib/genres/symbolSearch";
import { GLYPHS } from "@/lib/genres/glyphs";

const GLYPH_PATH = new Map(GLYPHS.map(g => [g.id, g.d]));

function GlyphSvg({ id, size = 56 }: { id: string; size?: number }) {
  const d = GLYPH_PATH.get(id) ?? "";
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SymbolSearchView({ item, disabled, onReady, onRespond }: GenreViewProps<SymbolSearchItem, boolean>) {
  const responded = useRef(false);

  useEffect(() => {
    onReady();
    // Fires exactly once when this item's stimulus mounts; onReady/onRespond
    // identity is not a dependency we want to re-trigger on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(value: boolean) {
    if (disabled || responded.current) return;
    responded.current = true;
    onRespond(value);
  }

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center bg-teal-100 text-ink rounded-3xl p-3" style={{ width: 96, height: 96 }}>
          <GlyphSvg id={item.target} size={64} />
        </div>

        <div className="self-stretch w-px bg-ink/15" />

        <div className="flex gap-3">
          {item.group.map((id, i) => (
            <div
              key={i}
              className="flex items-center justify-center bg-cream border-2 border-teal-100 text-ink rounded-2xl p-2"
              style={{ width: 88, height: 88 }}
            >
              <GlyphSvg id={id} size={56} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <button
          type="button"
          disabled={disabled}
          onClick={() => respond(true)}
          className="flex items-center justify-center bg-teal-400 text-cream font-bubble rounded-2xl active:bg-teal-600 disabled:opacity-60"
          style={{ width: 150, height: 100, fontSize: 32 }}
        >
          YES
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => respond(false)}
          className="flex items-center justify-center bg-rose-400 text-cream font-bubble rounded-2xl active:opacity-80 disabled:opacity-60"
          style={{ width: 150, height: 100, fontSize: 32 }}
        >
          NO
        </button>
      </div>
    </div>
  );
}

export default SymbolSearchView;
