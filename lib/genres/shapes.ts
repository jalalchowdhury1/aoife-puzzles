export type Shape = "circle" | "square" | "triangle" | "star" | "hexagon" | "diamond";
export const SHAPES: Shape[] = ["circle", "square", "triangle", "star", "hexagon", "diamond"];
export const COLORS = ["#f06b7a", "#2bb3a9", "#f5b63d", "#8cc9ff", "#9b7bea", "#6fcf6f"];

// Shared by matrix (What's Missing) and other genres that render attribute-based figures.
export interface Figure { shape: Shape; color: string; size: "S" | "M" | "L"; count: 1 | 2 | 3 | 4; rot: 0 | 90 | 180 | 270; dot: boolean }

function point(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (Math.PI / 180) * angleDeg;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function polygonPath(points: [number, number][]): string {
  const [first, ...rest] = points;
  const line = rest.map(([x, y]) => `L ${fmt(x)},${fmt(y)}`).join(" ");
  return `M ${fmt(first[0])},${fmt(first[1])} ${line} Z`;
}

/** Returns an SVG path `d` string for `shape`, centered in a `size` x `size` box. */
export function shapePath(shape: Shape, size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  switch (shape) {
    case "circle": {
      const left: [number, number] = [cx - r, cy];
      const right: [number, number] = [cx + r, cy];
      return (
        `M ${fmt(left[0])},${fmt(left[1])} ` +
        `A ${fmt(r)},${fmt(r)} 0 1,0 ${fmt(right[0])},${fmt(right[1])} ` +
        `A ${fmt(r)},${fmt(r)} 0 1,0 ${fmt(left[0])},${fmt(left[1])} Z`
      );
    }
    case "square": {
      const h = r * 0.9;
      return polygonPath([
        [cx - h, cy - h],
        [cx + h, cy - h],
        [cx + h, cy + h],
        [cx - h, cy + h],
      ]);
    }
    case "diamond": {
      return polygonPath([0, 90, 180, 270].map(a => point(cx, cy, r, a - 90)));
    }
    case "triangle": {
      return polygonPath([0, 120, 240].map(a => point(cx, cy, r, a - 90)));
    }
    case "hexagon": {
      return polygonPath([0, 60, 120, 180, 240, 300].map(a => point(cx, cy, r, a - 90)));
    }
    case "star": {
      const pts: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const angle = -90 + i * 36;
        const radius = i % 2 === 0 ? r : r * 0.42;
        pts.push(point(cx, cy, radius, angle));
      }
      return polygonPath(pts);
    }
  }
}
