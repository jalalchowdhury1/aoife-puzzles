# Item audit page

`items.html` renders 3 seeded items (seeds 1, 2, 3) for every genre x every
difficulty 1-10, as plain inline SVG/HTML built from the same drawing
primitives the real views use (`shapePath`, `faceSvg`, `GLYPHS`, polyomino
cells) — so a human can eyeball every difficulty of every puzzle in one page
before a release. It is committed so reviewers can just open it; no build
step needed to view it.

Regenerate before a release (or after touching any generator in
`lib/genres/`) with:

```bash
npx tsx scripts/audit-items.ts
```

This overwrites `docs/audit/items.html` in place. Commit the result.
