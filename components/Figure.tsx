import type { Figure as FigureData } from "@/lib/genres/shapes";
import { shapePath } from "@/lib/genres/shapes";

const SIZE_PCT: Record<FigureData["size"], number> = { S: 0.4, M: 0.6, L: 0.8 };

/** Renders one attribute-based Figure (matrix/reasoning genres) as an inline SVG. */
export function Figure({ f, box }: { f: FigureData; box: number }) {
  const cols = f.count <= 2 ? f.count : 2;
  const rows = f.count <= 2 ? 1 : 2;
  const cellW = box / cols;
  const cellH = box / rows;
  const shapeSize = Math.min(cellW, cellH) * SIZE_PCT[f.size];

  const cells = Array.from({ length: f.count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;
    const offsetX = cx - shapeSize / 2;
    const offsetY = cy - shapeSize / 2;
    const d = shapePath(f.shape, shapeSize);
    return (
      <g
        key={i}
        transform={`translate(${offsetX}, ${offsetY}) rotate(${f.rot}, ${shapeSize / 2}, ${shapeSize / 2})`}
      >
        <path d={d} fill={f.color} />
        {f.dot && <circle cx={shapeSize / 2} cy={shapeSize / 2} r={shapeSize * 0.08} fill="#000" />}
      </g>
    );
  });

  return (
    <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box}>
      {cells}
    </svg>
  );
}

export default Figure;
