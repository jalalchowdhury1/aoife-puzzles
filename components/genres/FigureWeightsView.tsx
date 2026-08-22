"use client";

import { useEffect, useState } from "react";
import type { GenreViewProps } from "@/lib/engine/types";
import type { FigureWeightsItem, Scale } from "@/lib/genres/figureWeights";
import { SHAPES, COLORS, shapePath, type Shape } from "@/lib/genres/shapes";

// Fixed per-shape fill colors, taken from the shared SHAPES/COLORS pairing:
// circle rose, square teal, triangle amber, star sky, hexagon purple, diamond green.
const SHAPE_FILL: Record<Shape, string> = SHAPES.reduce(
  (acc, s, i) => {
    acc[s] = COLORS[i];
    return acc;
  },
  {} as Record<Shape, string>
);

const TILT_DEG = 9;

function PanShapes({ shapes, cx, cy }: { shapes: Shape[]; cx: number; cy: number }) {
  const size = 26;
  const gap = 6;
  const totalWidth = shapes.length * size + (shapes.length - 1) * gap;
  const startX = cx - totalWidth / 2;
  return (
    <>
      {shapes.map((s, i) => {
        const x = startX + i * (size + gap);
        const y = cy - size - 6;
        return <path key={i} d={shapePath(s, size)} fill={SHAPE_FILL[s]} transform={`translate(${x}, ${y})`} />;
      })}
    </>
  );
}

/** One SVG balance beam: level when both pans are known, tilted toward the loaded
 * side (with a big "?" on the empty pan) when this is the question scale. */
function Beam({ scale, tilt }: { scale: Scale; tilt: number }) {
  const pivot = { x: 150, y: 78 };
  const halfBeam = 90;
  const panDrop = 40;
  const rad = (tilt * Math.PI) / 180;
  const leftEnd = { x: pivot.x - halfBeam * Math.cos(rad), y: pivot.y + halfBeam * Math.sin(rad) };
  const rightEnd = { x: pivot.x + halfBeam * Math.cos(rad), y: pivot.y - halfBeam * Math.sin(rad) };
  const leftPan = { x: leftEnd.x, y: leftEnd.y + panDrop };
  const rightPan = { x: rightEnd.x, y: rightEnd.y + panDrop };

  return (
    <svg viewBox="0 0 300 170" className="w-full max-w-xs" role="img" aria-label="balance scale">
      {/* stand */}
      <line x1={pivot.x} y1={pivot.y} x2={pivot.x} y2={150} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
      <line x1={pivot.x - 34} y1={150} x2={pivot.x + 34} y2={150} stroke="#1f2937" strokeWidth={6} strokeLinecap="round" />
      {/* beam */}
      <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
      {/* strings */}
      <line x1={leftEnd.x} y1={leftEnd.y} x2={leftPan.x} y2={leftPan.y} stroke="#1f2937" strokeWidth={2} />
      <line x1={rightEnd.x} y1={rightEnd.y} x2={rightPan.x} y2={rightPan.y} stroke="#1f2937" strokeWidth={2} />
      {/* pan trays */}
      <line x1={leftPan.x - 30} y1={leftPan.y} x2={leftPan.x + 30} y2={leftPan.y} stroke="#1f2937" strokeWidth={4} strokeLinecap="round" />
      <line x1={rightPan.x - 30} y1={rightPan.y} x2={rightPan.x + 30} y2={rightPan.y} stroke="#1f2937" strokeWidth={4} strokeLinecap="round" />
      <PanShapes shapes={scale.left} cx={leftPan.x} cy={leftPan.y} />
      {scale.right ? (
        <PanShapes shapes={scale.right} cx={rightPan.x} cy={rightPan.y} />
      ) : (
        <text x={rightPan.x} y={rightPan.y - 14} textAnchor="middle" fontSize={34} fontWeight="bold" fill="#1f2937">
          ?
        </text>
      )}
      {/* pivot */}
      <circle cx={pivot.x} cy={pivot.y} r={4} fill="#1f2937" />
    </svg>
  );
}

function OptionTile({ shapes }: { shapes: Shape[] }) {
  const size = 26;
  const gap = 4;
  const totalWidth = shapes.length * size + (shapes.length - 1) * gap;
  const startX = 50 - totalWidth / 2;
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10">
      {shapes.map((s, i) => {
        const x = startX + i * (size + gap);
        const y = 20 - size / 2;
        return <path key={i} d={shapePath(s, size)} fill={SHAPE_FILL[s]} transform={`translate(${x}, ${y})`} />;
      })}
    </svg>
  );
}

export default function FigureWeightsView({
  item,
  disabled,
  onReady,
  onRespond,
}: GenreViewProps<FigureWeightsItem, number>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shownItem, setShownItem] = useState(item);
  if (item !== shownItem) {
    // A new item arrived: clear the previous pick during this render (not in an
    // effect) so we never flash the old selection before the effect below fires.
    setShownItem(item);
    setSelected(null);
  }

  useEffect(() => {
    // Stimulus (the scales + options) is fully drawn synchronously on mount for
    // a new item; onReady should fire once per item, not on every parent re-render.
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const submit = () => {
    if (disabled || selected === null) return;
    onRespond(selected);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex flex-wrap justify-center gap-4">
        {item.scales.map((scale, i) => (
          <Beam key={i} scale={scale} tilt={scale.right === null ? TILT_DEG : 0} />
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3 w-full max-w-2xl">
        {item.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
            className={`min-h-16 min-w-16 rounded-2xl border-4 flex items-center justify-center p-2 bg-white ${
              selected === i ? "border-teal-400" : "border-teal-100"
            }`}
          >
            <OptionTile shapes={opt} />
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || selected === null}
        onClick={submit}
        className="min-h-16 min-w-32 px-8 rounded-full bg-teal-400 text-white text-2xl font-bubble disabled:opacity-40"
      >
        Done
      </button>
    </div>
  );
}
