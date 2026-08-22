// 20 abstract SVG "stroke" symbols in a 40x40 box for Symbol Hunt (Symbol Search).
// Built as 10 deliberately confusable twin pairs, ids `<letter>1`/`<letter>2`.
// Intended rendering: <path d={d} stroke="currentColor" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
export interface Glyph { id: string; d: string }

export const GLYPHS: Glyph[] = [
  // a: vertical bar vs vertical bar with a foot
  { id: "a1", d: "M20,6 L20,34" },
  { id: "a2", d: "M20,6 L20,34 M13,34 L27,34" },

  // b: open circle vs circle with a small gap
  { id: "b1", d: "M28.49,26.49 A12,12 0 1,1 28.49,13.51" },
  { id: "b2", d: "M19.96,8.00 A12,12 0 1,1 19.90,32.00" },

  // c: arrow up vs arrow down
  { id: "c1", d: "M20,32 L20,8 M12,16 L20,8 L28,16" },
  { id: "c2", d: "M20,8 L20,32 M12,24 L20,32 L28,24" },

  // d: L vs mirrored L
  { id: "d1", d: "M14,8 L14,32 L28,32" },
  { id: "d2", d: "M26,8 L26,32 L12,32" },

  // e: two dots vs three dots
  { id: "e1", d: "M14,20 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M26,20 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0" },
  { id: "e2", d: "M10,20 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M20,20 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M30,20 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0" },

  // f: zigzag with 2 bends vs zigzag with 3 bends
  { id: "f1", d: "M6,30 L14,12 L22,30 L30,12" },
  { id: "f2", d: "M4,30 L11,12 L18,30 L25,12 L32,30" },

  // g: triangle vs inverted triangle
  { id: "g1", d: "M20,8 L32,32 L8,32 Z" },
  { id: "g2", d: "M20,32 L32,8 L8,8 Z" },

  // h: plus vs x
  { id: "h1", d: "M20,8 L20,32 M8,20 L32,20" },
  { id: "h2", d: "M10,10 L30,30 M30,10 L10,30" },

  // i: square vs square with a center dot
  { id: "i1", d: "M10,10 L30,10 L30,30 L10,30 Z" },
  { id: "i2", d: "M10,10 L30,10 L30,30 L10,30 Z M20,20 m-2,0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0" },

  // j: wave vs inverted wave
  { id: "j1", d: "M6,20 C11,8 17,8 20,20 C23,32 29,32 34,20" },
  { id: "j2", d: "M6,20 C11,32 17,32 20,20 C23,8 29,8 34,20" },
];
