export interface SparklinePoint {
  y: number | null;
  excluded?: boolean;
}

/** Tiny inline-SVG ceiling-over-time line for a skill card. No axes, no deps. */
export function Sparkline({
  points,
  maxY,
  width = 140,
  height = 32,
}: {
  points: SparklinePoint[];
  maxY: number;
  width?: number;
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x={4} y={height / 2 + 3} fontSize={10} fill="#fff" opacity={0.35}>
          No data yet
        </text>
      </svg>
    );
  }

  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const pad = 4;
  const scaleY = (y: number) => height - pad - (y / maxY) * (height - pad * 2);
  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: p.y === null ? null : scaleY(p.y),
    excluded: p.excluded,
  }));
  const line = coords
    .filter((c) => c.y !== null)
    .map((c) => `${c.x},${c.y}`)
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={line} fill="none" stroke="#8cf0b0" strokeWidth={2} />
      {coords.map((c, i) =>
        c.y === null ? null : (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={c.excluded ? 3 : 2.5}
            fill={c.excluded ? "#0a0c10" : "#8cf0b0"}
            stroke="#8cf0b0"
            strokeWidth={c.excluded ? 1.5 : 0}
          />
        )
      )}
    </svg>
  );
}

export default Sparkline;
