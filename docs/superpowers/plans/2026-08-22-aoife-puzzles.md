# Aoife Puzzles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `aoife-puzzles.vercel.app` — 13 WISC-V-format puzzle genres, a 3-part diagnostic Level 1 with adaptive staircases, server-side result storage, a parent profile page, and a Telegram summary per completed part.

**Architecture:** Pure, seeded generators + scorers in `lib/genres/*` behind one `Genre` interface; a pure `staircase`/`profile` engine; one block-runner page that drives any genre through a `GenreView` component contract; Next.js route handlers persist `SessionRecord`s to the shared free Upstash Redis (`aoife_puzzles:*`) and send Telegram. Levels are data objects.

**Tech Stack:** Next.js 16.2.1 (App Router, `"use client"` pages), React 19.2, TypeScript 5, Tailwind v4, Vitest 3, canvas-confetti, Web Speech API, Upstash REST (plain `fetch`), Vercel Hobby.

**Spec:** `docs/superpowers/specs/2026-08-22-aoife-puzzles-design.md` — read §0 (decisions) and §2 (genre rules) before any genre task. Nothing from Pearson's test may be reproduced; all items are original.

**Conventions for every task:** `npm test` (Vitest, `lib/**/*.test.ts`) must be green before each commit; `npm run lint` and `npx tsc --noEmit` clean before Task 19's build; commit straight to `main`; kid-facing copy is short, warm, no dashes in kid text.

---

## File map

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs, vitest.config.ts, .gitignore
app/layout.tsx, app/globals.css, app/page.tsx (home), app/play/page.tsx (runner), app/parent/page.tsx
app/api/sessions/route.ts, app/api/profile/route.ts
lib/engine/{rng,types,staircase,timing,profile,speech,storage,kv,telegram,gate}.ts (+ .test.ts for rng/staircase/profile/timing)
lib/genres/{index,blockDesign,visualPuzzles,matrix,figureWeights,arithmetic,digitSpan,pictureSpan,coding,symbolSearch,similarities,vocabulary,information,comprehension,glyphs,shapes,bankGenre}.ts (+ .test.ts each)
lib/genres/banks/{arithmetic,similarities,vocabulary,information,comprehension}.ts (+ banks.test.ts)
lib/levels/{index,level1}.ts
components/{Countdown,SampleScreen,PartDone,BigButton,Figure,ParentTable}.tsx
components/genres/{BlockDesignView,VisualPuzzlesView,MatrixView,FigureWeightsView,ArithmeticView,DigitSpanView,PictureSpanView,CodingView,SymbolSearchView,ChoiceView}.tsx
AGENTS.md, README.md
```

---

### Task 1: Scaffold the Next.js project

**Files:** create everything listed under the root + `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder), `vitest.config.ts`.

- [ ] **Step 1: package.json** (versions pinned to the sibling repo `aoife-order`)

```json
{
  "name": "aoife-puzzles",
  "version": "0.1.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "lint": "eslint", "test": "vitest run", "typecheck": "tsc --noEmit" },
  "dependencies": { "canvas-confetti": "^1.9.4", "next": "16.2.1", "react": "19.2.4", "react-dom": "19.2.4" },
  "devDependencies": { "@tailwindcss/postcss": "^4", "@types/canvas-confetti": "^1.9.0", "@types/node": "^20", "@types/react": "^19", "@types/react-dom": "^19", "eslint": "^9", "eslint-config-next": "16.2.1", "tailwindcss": "^4", "typescript": "^5", "vitest": "^3" }
}
```

- [ ] **Step 2: copy configs from the sibling** — `cp ~/PycharmProjects/aoife-order/{tsconfig.json,next.config.ts,postcss.config.mjs,eslint.config.mjs,next-env.d.ts} .` then `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["lib/**/*.test.ts"] } });
```

`.gitignore`: `node_modules/`, `.next/`, `.env*`, `.vercel/`, `.npm-cache/`, `*.tsbuildinfo`.

- [ ] **Step 3: app/globals.css** — Tailwind v4 + theme tokens:

```css
@import url('https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Inter:wght@400;700&display=swap');
@import "tailwindcss";
@theme {
  --font-bubble: "Bubblegum Sans", cursive;
  --font-body: "Inter", system-ui, sans-serif;
  --color-cream: #fff8ec; --color-teal-100: #ccf2ef; --color-teal-400: #2bb3a9; --color-teal-600: #1c8a82;
  --color-ink: #1f2937; --color-amber-400: #f5b63d; --color-rose-400: #f06b7a; --color-sky-300: #8cc9ff;
}
html, body { background: var(--color-cream); color: var(--color-ink); font-family: var(--font-body); }
* { -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; }
```

- [ ] **Step 4: app/layout.tsx** — metadata `title: "Aoife Puzzles"`, `viewport: { width: "device-width", initialScale: 1, maximumScale: 1 }`, `<body className="min-h-dvh flex flex-col">`. `app/page.tsx` placeholder: `export default function Home(){ return <main className="p-8 font-bubble text-4xl">Aoife Puzzles</main> }`.

- [ ] **Step 5: install, verify, commit**

```bash
npm install && npm run build && npm test   # vitest: "No test files found" exit 0 is acceptable here only
git add -A && git commit -m "scaffold: Next.js 16 + Tailwind v4 + Vitest"
```

---

### Task 2: Engine types and RNG

**Files:** `lib/engine/rng.ts`, `lib/engine/rng.test.ts`, `lib/engine/types.ts`

- [ ] **Step 1: rng** — copy `~/PycharmProjects/aoife-order/lib/rng.ts` and `rng.test.ts` verbatim into `lib/engine/` (mulberry32: `makeRng(seed)` → `{next,int,pick,shuffle}`, `randomSeed()`).

- [ ] **Step 2: types.ts** (the contract every later task imports — do not rename fields)

```ts
export type GenreId =
  | "blockDesign" | "visualPuzzles" | "matrix" | "figureWeights" | "arithmetic"
  | "digitSpan" | "pictureSpan" | "coding" | "symbolSearch"
  | "similarities" | "vocabulary" | "information" | "comprehension";
export type Domain = "VS" | "FR" | "WM" | "PS" | "VC";
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface ScoreResult { points: number; max: number; correct: boolean }
export type Timing =
  | { kind: "item"; ms: (d: Difficulty) => number }
  | { kind: "block"; ms: number }
  | { kind: "none" };

export interface GenerateOpts { excludeBankIds?: string[] }

export interface Genre<I = unknown, R = unknown> {
  id: GenreId; subtest: string; domain: Domain; kidTitle: string;
  instructions: string;                       // spoken + shown on the sample screen
  sample(): { item: I; explanation: string };
  generate(seed: number, d: Difficulty, opts?: GenerateOpts): I;
  score(item: I, response: R | null): ScoreResult;
  timing: Timing;
  mode: "staircase" | "speedBlock";
  bankId?(item: I): string | undefined;       // bank-backed genres only
}

export interface ItemRecord {
  idx: number; seed: number; d: Difficulty; points: number; max: number; correct: boolean;
  ms: number; timedOut: boolean; response: unknown; bankId?: string;
  fast?: boolean; audioFallback?: boolean; replayed?: boolean;
}
export interface BlockSummary {
  attempted: number; correct: number; points: number; max: number;
  ceiling: number | null; medianMs: number; timeouts: number; incorrect?: number;
}
export interface BlockRecord {
  genre: GenreId; mode: "staircase" | "speedBlock"; startedAt: string; endedAt: string;
  items: ItemRecord[]; summary: BlockSummary;
}
export interface SessionRecord {
  id: string; level: number; part: string; startedAt: string; endedAt?: string;
  device: { ua: string; w: number; h: number };
  blocks: BlockRecord[]; complete: boolean; appVersion: string;
}

export interface BlockConfig { genre: GenreId; start?: number | "fromProfile"; maxItems?: number; display?: "audio" | "both" }
export interface PartConfig { id: string; title: string; sticker: string; blocks: BlockConfig[] }
export interface LevelConfig { id: number; title: string; feedback: "none" | "mark" | "reveal"; parts: PartConfig[] }

export function summarize(items: ItemRecord[], mode: "staircase" | "speedBlock"): BlockSummary {
  const attempted = items.length;
  const correct = items.filter(i => i.correct).length;
  const points = items.reduce((s, i) => s + i.points, 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  const ceiling = mode === "staircase" ? items.filter(i => i.points > 0).reduce<number | null>((m, i) => (m === null || i.d > m ? i.d : m), null) : null;
  const sorted = items.map(i => i.ms).sort((a, b) => a - b);
  const medianMs = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const timeouts = items.filter(i => i.timedOut).length;
  const s: BlockSummary = { attempted, correct, points, max, ceiling, medianMs, timeouts };
  if (mode === "speedBlock") s.incorrect = attempted - correct;
  return s;
}
```

- [ ] **Step 3: test `summarize`** in `lib/engine/types.test.ts`: three items (d2 correct 800ms, d3 wrong 1200ms, d3 timedOut) → `{attempted:3, correct:1, points:1, max:3, ceiling:2, medianMs:1200, timeouts:1}`; speedBlock adds `incorrect`. Run `npm test` → PASS. Commit `engine: types, rng, summarize`.

---

### Task 3: Staircase

**Files:** `lib/engine/staircase.ts`, `lib/engine/staircase.test.ts`

- [ ] **Step 1: failing tests**

```ts
import { describe, it, expect } from "vitest";
import { startStair, stepStair } from "./staircase";
describe("staircase", () => {
  it("climbs on correct, holds on wrong, stops after two consecutive wrong", () => {
    let s = startStair(1, 8);
    s = stepStair(s, true);  expect(s.d).toBe(2);
    s = stepStair(s, true);  expect(s.d).toBe(3);
    s = stepStair(s, false); expect(s.d).toBe(3); expect(s.done).toBe(false);
    s = stepStair(s, false); expect(s.done).toBe(true); expect(s.reason).toBe("twoWrong");
    expect(s.ceiling).toBe(2); expect(s.items).toBe(4);
  });
  it("a correct answer resets the wrong counter", () => {
    let s = startStair(1, 8);
    s = stepStair(s, false); s = stepStair(s, true); s = stepStair(s, false);
    expect(s.done).toBe(false);
  });
  it("stops at maxItems and at the top", () => {
    let s = startStair(1, 3);
    s = stepStair(s, true); s = stepStair(s, true); s = stepStair(s, true);
    expect(s.done).toBe(true); expect(s.reason).toBe("maxItems");
    let t = startStair(10, 8); t = stepStair(t, true);
    expect(t.done).toBe(true); expect(t.reason).toBe("topReached"); expect(t.ceiling).toBe(10);
  });
  it("clamps start into 1..10 and fromProfile uses ceiling-1", () => {
    expect(startStair(0, 8).d).toBe(1); expect(startStair(14, 8).d).toBe(10);
    expect(startStair({ fromProfileCeiling: 5 }, 8).d).toBe(4);
    expect(startStair({ fromProfileCeiling: null }, 8).d).toBe(1);
  });
});
```

- [ ] **Step 2: implementation**

```ts
import type { Difficulty } from "./types";
export interface StairState { d: Difficulty; consecutiveWrong: number; items: number; ceiling: number | null; done: boolean; reason?: "twoWrong" | "maxItems" | "topReached"; maxItems: number }
const clamp = (n: number): Difficulty => Math.max(1, Math.min(10, Math.round(n))) as Difficulty;
export function startStair(start: number | { fromProfileCeiling: number | null }, maxItems: number): StairState {
  const d = typeof start === "number" ? clamp(start) : clamp(start.fromProfileCeiling === null ? 1 : start.fromProfileCeiling - 1);
  return { d, consecutiveWrong: 0, items: 0, ceiling: null, done: false, maxItems };
}
export function stepStair(s: StairState, correct: boolean): StairState {
  if (s.done) return s;
  const items = s.items + 1;
  if (correct) {
    const ceiling = s.ceiling === null ? s.d : Math.max(s.ceiling, s.d);
    if (s.d === 10) return { ...s, items, ceiling, consecutiveWrong: 0, done: true, reason: "topReached" };
    const next = { ...s, items, ceiling, consecutiveWrong: 0, d: clamp(s.d + 1) };
    return items >= s.maxItems ? { ...next, done: true, reason: "maxItems" } : next;
  }
  const consecutiveWrong = s.consecutiveWrong + 1;
  if (consecutiveWrong >= 2) return { ...s, items, consecutiveWrong, done: true, reason: "twoWrong" };
  const next = { ...s, items, consecutiveWrong };
  return items >= s.maxItems ? { ...next, done: true, reason: "maxItems" } : next;
}
```

- [ ] **Step 3:** `npm test` → PASS. Commit `engine: adaptive staircase`.

---

### Task 4: Timing policy and profile

**Files:** `lib/engine/timing.ts`, `lib/engine/profile.ts`, `lib/engine/profile.test.ts`

- [ ] **Step 1: timing.ts** — helpers used by genres: `export const itemMs = (table: [maxD: number, ms: number][]) => (d: Difficulty) => table.find(([m]) => d <= m)![1];` and `export const SPEED_BLOCK_MS = 120_000;`.

- [ ] **Step 2: profile.test.ts** (fixture: one complete session with a `matrix` block ceiling 7 + a `blockDesign` block ceiling 3 + a `coding` speed block 30 correct in 120 s) asserting:
  - `profile.genres.matrix.ceiling === 7`, `profile.genres.coding.perMinute === 15`
  - `profile.domains.FR.value` = 0.7 (only matrix present), `profile.domains.VS.value` = 0.3
  - `profile.domains.PS.value` = 15/60 = 0.25
  - flags: with values {FR .7, VS .3, PS .25} the z of FR is > +0.5 → `"strength"`, VS `"typical"` or `"weakness"` per z; assert FR is `"strength"` and that exactly the domains present are flagged (absent domains `value: null, flag: "n/a"`).
  - `profile.bundles.egai` = mean of present EGAI genres' `ceiling/10` (matrix .7, blockDesign .3 → .5); `profile.bundles.cpi` = mean of present CPI genres (coding only → .25).
  - `trend` lists `{date, ceiling}` per session for each genre.

- [ ] **Step 3: profile.ts**

```ts
import type { SessionRecord, GenreId, Domain } from "./types";
export interface GenreStats { attempted: number; correct: number; points: number; max: number; ceiling: number | null; medianMs: number; timeouts: number; perMinute?: number; trend: { date: string; ceiling: number | null; points: number; max: number }[] }
export interface DomainStat { value: number | null; z: number | null; flag: "strength" | "typical" | "weakness" | "n/a"; genres: GenreId[] }
export interface Profile { sessions: number; genres: Partial<Record<GenreId, GenreStats>>; domains: Record<Domain, DomainStat>; bundles: { egai: number | null; cpi: number | null }; computedAt: string }
export const DOMAIN_GENRES: Record<Domain, GenreId[]> = { VS: ["blockDesign", "visualPuzzles"], FR: ["matrix", "figureWeights", "arithmetic"], WM: ["digitSpan", "pictureSpan"], PS: ["coding", "symbolSearch"], VC: ["similarities", "vocabulary", "information", "comprehension"] };
export const EGAI: GenreId[] = ["similarities", "vocabulary", "information", "comprehension", "blockDesign", "matrix", "figureWeights", "arithmetic"];
export const CPI: GenreId[] = ["digitSpan", "pictureSpan", "coding", "symbolSearch"];
const SPEED_CEILING_PER_MIN: Partial<Record<GenreId, number>> = { coding: 60, symbolSearch: 40 };
```
  Algorithm: iterate sessions sorted by `startedAt`; for each block accumulate per-genre totals, `ceiling = max`, `medianMs` = median over all items, `trend.push`; speed genres: `perMinute = correct / (blockMs/60000)` using `(endedAt - startedAt)` clamped to ≥ 60 s, keep the best. Genre value: staircase → `ceiling/10`; VC genres → `points/max`; speed → `min(1, perMinute / SPEED_CEILING_PER_MIN)`. Domain value = mean of present genre values (null if none). z across present domains (population SD; if SD = 0 or < 2 domains → z 0 → "typical"). Flag thresholds ±0.5. Bundles = mean of present genre values over EGAI / CPI lists.

- [ ] **Step 4:** `npm test` → PASS. Commit `engine: timing helpers + profile computation`.

---

### Task 5: Shared drawing primitives and the genre registry skeleton

**Files:** `lib/genres/shapes.ts`, `lib/genres/glyphs.ts`, `components/Figure.tsx`, `lib/genres/index.ts`

- [ ] **Step 1: shapes.ts** — `export type Shape = "circle"|"square"|"triangle"|"star"|"hexagon"|"diamond"; export const SHAPES: Shape[]; export const COLORS = ["#f06b7a","#2bb3a9","#f5b63d","#8cc9ff","#9b7bea","#6fcf6f"]; export function shapePath(shape: Shape, size: number): string` returning an SVG path centered in a `size×size` box (circle via two arcs; square; equilateral triangle; 5-point star; regular hexagon; diamond).

- [ ] **Step 2: glyphs.ts** — 20 abstract symbols as SVG path strings in a 40×40 box (`export const GLYPHS: { id: string; d: string }[]`), built as deliberately confusable pairs: vertical bar vs vertical bar with a foot, open circle vs circle with a gap, arrow up vs arrow down, L vs mirrored L, two dots vs three dots, zigzag 2 vs zigzag 3, triangle vs inverted triangle, plus vs x, square vs square with a dot, wave vs wave inverted. Test: 20 unique ids, 20 unique path strings.

- [ ] **Step 3: components/Figure.tsx** — `<Figure f={figure} box={n}/>` renders a `Figure` (`{shape,color,size:"S"|"M"|"L",count:1..4,rot:0|90|180|270,dot:boolean}` defined in matrix task, import the type from `lib/genres/matrix.ts`) as an inline SVG: count copies laid out in a row (count ≤2) or 2×2 (count 3–4), size S/M/L = 40/60/80 % of the cell, rotation via `transform`, `dot` = small black circle at the center.

- [ ] **Step 4: lib/genres/index.ts** — `export const GENRES: Record<GenreId, Genre<any, any>>` filled in as genres land (start with an empty object typed `Partial` and switch to full `Record` in Task 17); `export const GENRE_LIST: GenreId[]`.

- [ ] **Step 5:** commit `genres: shapes, glyphs, Figure, registry skeleton`.

---

### Task 6: Digit Span — "Number Echo" (exemplar genre, full code)

**Files:** `lib/genres/digitSpan.ts`, `lib/genres/digitSpan.test.ts`, `components/genres/DigitSpanView.tsx`, `lib/engine/speech.ts`

- [ ] **Step 1: failing tests**

```ts
import { describe, it, expect } from "vitest";
import { digitSpan, type DigitSpanItem } from "./digitSpan";
import { DIFFICULTIES } from "../engine/types";
const LEN: Record<number, number[]> = { 1: [2], 2: [3], 3: [4], 4: [2], 5: [3], 6: [4, 5], 7: [3], 8: [4, 5], 9: [6, 5], 10: [7, 6] };
describe("digitSpan", () => {
  it("is deterministic and obeys length/task rules for 500 seeds × 10 d", () => {
    for (const d of DIFFICULTIES) for (let seed = 0; seed < 500; seed++) {
      const a = digitSpan.generate(seed, d), b = digitSpan.generate(seed, d);
      expect(a).toEqual(b);
      expect(LEN[d]).toContain(a.digits.length);
      for (let i = 1; i < a.digits.length; i++) expect(a.digits[i]).not.toBe(a.digits[i - 1]);
      for (let i = 2; i < a.digits.length; i++) {
        const run = a.digits[i] - a.digits[i - 1] === a.digits[i - 1] - a.digits[i - 2] && Math.abs(a.digits[i] - a.digits[i - 1]) === 1;
        expect(run).toBe(false);
      }
      const exp = a.task === "forward" ? a.digits : a.task === "backward" ? [...a.digits].reverse() : [...a.digits].sort((x, y) => x - y);
      expect(a.expected).toEqual(exp);
    }
  });
  it("scores exact sequence only", () => {
    const it: DigitSpanItem = { digits: [4, 1, 7], task: "backward", expected: [7, 1, 4] };
    expect(digitSpan.score(it, [7, 1, 4]).points).toBe(1);
    expect(digitSpan.score(it, [4, 1, 7]).points).toBe(0);
    expect(digitSpan.score(it, null).correct).toBe(false);
  });
});
```

- [ ] **Step 2: implementation**

```ts
import { makeRng } from "../engine/rng";
import type { Genre, Difficulty } from "../engine/types";
export type SpanTask = "forward" | "backward" | "sequencing";
export interface DigitSpanItem { digits: number[]; task: SpanTask; expected: number[] }
const PLAN: Record<Difficulty, [SpanTask, number][]> = {
  1: [["forward", 2]], 2: [["forward", 3]], 3: [["forward", 4]], 4: [["backward", 2]], 5: [["backward", 3]],
  6: [["backward", 4], ["forward", 5]], 7: [["sequencing", 3]], 8: [["sequencing", 4], ["backward", 5]],
  9: [["forward", 6], ["sequencing", 5]], 10: [["forward", 7], ["backward", 6]],
};
function expectedFor(digits: number[], task: SpanTask) {
  return task === "forward" ? [...digits] : task === "backward" ? [...digits].reverse() : [...digits].sort((a, b) => a - b);
}
export const digitSpan: Genre<DigitSpanItem, number[]> = {
  id: "digitSpan", subtest: "Digit Span", domain: "WM", kidTitle: "Number Echo",
  instructions: "I will say some numbers. Listen carefully. When I finish, tap the numbers in the order I ask for.",
  sample: () => ({ item: { digits: [5, 2], task: "forward", expected: [5, 2] }, explanation: "I said 5, then 2. So you tap 5, then 2. Same order." }),
  generate(seed, d) {
    const r = makeRng(seed * 13 + d);
    const [task, len] = PLAN[d][seed % PLAN[d].length];
    const digits: number[] = [];
    while (digits.length < len) {
      const n = r.int(1, 9);
      if (digits.length && n === digits[digits.length - 1]) continue;
      if (digits.length >= 2) {
        const a = digits[digits.length - 2], b = digits[digits.length - 1];
        if (Math.abs(b - a) === 1 && n - b === b - a) continue;
      }
      digits.push(n);
    }
    if (task === "sequencing" && expectedFor(digits, "sequencing").every((v, i) => v === digits[i])) return this.generate(seed + 1000, d);
    return { digits, task, expected: expectedFor(digits, task) };
  },
  score(item, response) {
    const ok = !!response && response.length === item.expected.length && response.every((v, i) => v === item.expected[i]);
    return { points: ok ? 1 : 0, max: 1, correct: ok };
  },
  timing: { kind: "none" }, mode: "staircase",
};
```

- [ ] **Step 3: speech.ts** (browser-only; every function no-ops in tests)

```ts
export function speechAvailable(): boolean { return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"; }
export function speak(text: string, rate = 0.9): Promise<void> {
  return new Promise(resolve => {
    if (!speechAvailable()) return resolve();
    const u = new SpeechSynthesisUtterance(text); u.rate = rate; u.lang = "en-US";
    const voice = window.speechSynthesis.getVoices().find(v => v.lang === "en-US" && /Samantha|Google US|Aria/.test(v.name)); if (voice) u.voice = voice;
    let done = false; const finish = () => { if (!done) { done = true; resolve(); } };
    u.onend = finish; u.onerror = finish;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    setTimeout(finish, 1000 + text.length * 120);   // iOS sometimes never fires onend
  });
}
export async function speakSequence(parts: string[], gapMs = 1000): Promise<void> {
  for (const p of parts) { const t0 = Date.now(); await speak(p, 0.8); const wait = gapMs - (Date.now() - t0); if (wait > 0) await new Promise(r => setTimeout(r, wait)); }
}
export function warmUpSpeech() { if (speechAvailable()) { window.speechSynthesis.getVoices(); speak(" "); } }
```

- [ ] **Step 4: the GenreView contract** — add to `lib/engine/types.ts`:

```ts
export interface GenreViewProps<I, R> {
  item: I; disabled: boolean; display?: "audio" | "both";
  onReady: () => void;                 // call once when the stimulus is fully presented (timer starts)
  onRespond: (r: R, meta?: { replayed?: boolean; audioFallback?: boolean }) => void;
}
```

- [ ] **Step 5: DigitSpanView.tsx** — phases `listening → answering`. On mount: if `speechAvailable()` → `speakSequence(item.digits.map(String))` then `onReady()`; else flash each digit 900 ms on / 100 ms off, then `onReady()` with `audioFallback` remembered. Answering: task label in big text ("Tap them in the SAME order" / "Tap them BACKWARD" / "Tap them from SMALLEST to BIGGEST"), a tray showing tapped digits, 1–9 numpad (≥ 72 px keys), ⌫, 🔁 Replay (once; disabled after; sets `replayed`), ✔ Done enabled when tray length ≥ 1 → `onRespond(tray, meta)`.

- [ ] **Step 6:** `npm test` → PASS; register `digitSpan` in `lib/genres/index.ts`; commit `genre: digit span + speech`.

---

### Task 7: Picture Span — "Picture Memory"

**Files:** `lib/genres/pictureSpan.ts`, `.test.ts`, `components/genres/PictureSpanView.tsx`

- [ ] **Step 1: types + rules**

```ts
export interface PictureSpanItem { shown: string[]; choices: string[]; exposureMs: number }
// Response: string[] (ordered taps)
```
  Icon bank (24 emoji): 🍎 🐶 🚗 ⭐ 🌸 🐟 🎈 🏠 🍌 🐱 ✈️ 🌙 🍪 🐸 ⚽ 🎁 🍓 🐘 🚲 ☂️ 🧸 🐢 🎺 🔑. k by d: `{1:1,2:2,3:2,4:3,5:3,6:4,7:4,8:5,9:6,10:7}`; `shown` = k distinct icons; `choices` = shown + (d≤5 ? 4 : 6) distinct distractors, shuffled; `exposureMs` = k ≤ 2 ? 3000 : 5000.
  Score: same set and same order → 2; same set, different order → 1; else 0. `max: 2`, `correct = points > 0`.

- [ ] **Step 2: tests** — 500 seeds × 10 d: deterministic; `shown.length === k[d]`; all `shown` ⊂ `choices`; `choices` unique; `choices.length === k + (d<=5?4:6)`; scoring table (exact → 2, reversed of length ≥2 → 1, wrong pick → 0, null → 0).

- [ ] **Step 3: view** — phase `show`: the icons in a row, each ≥ 96 px, for `exposureMs`, then `onReady()`; phase `pick`: grid of `choices` (4 per row), tapping appends to a tray above (tap the tray to remove last), Done enabled when tray.length ≥ 1 → `onRespond(tray)`.

- [ ] **Step 4:** test → PASS; register; commit `genre: picture span`.

---

### Task 8: Coding — "Secret Code" and Symbol Search — "Symbol Hunt" (speed genres)

**Files:** `lib/genres/coding.ts`, `lib/genres/symbolSearch.ts`, tests, `components/genres/CodingView.tsx`, `components/genres/SymbolSearchView.tsx`

- [ ] **Step 1: coding** — `export type Mark = "bar"|"dash"|"ring"|"hat"|"cross"; export const CODE_KEY: { shape: Shape; mark: Mark }[]` fixed = star→bar, circle→dash, triangle→ring, square→hat, hexagon→cross. `CodingItem { shape: Shape; lookahead: Shape[] }` (lookahead = next 4 shapes from the same stream; generate(seed) uses `makeRng(seed)` to produce 5 shapes and returns shape = first, lookahead = rest; consecutive duplicates allowed). Response: `Mark`. Score 1/0. `timing: {kind:"block", ms: SPEED_BLOCK_MS}`, `mode: "speedBlock"`. Difficulty ignored.
  View: key row at top (shape above its mark, 5 cells), current shape large center, lookahead faded to the right, 5 mark buttons ≥ 80 px at bottom → `onRespond(mark)` immediately; `onReady()` on mount.

- [ ] **Step 2: symbolSearch** — `SymbolSearchItem { target: string; group: string[]; present: boolean }` from `GLYPHS`: target random; `present = r.next() < 0.5`; group = 3 glyphs, distinct, containing target iff present; when not present, prefer including the target's confusable twin (glyph ids are paired `a1/a2`, `b1/b2`… — use the twin 70 % of the time). Response `boolean` (YES = present). Score 1/0. Speed block 120 s.
  View: target glyph in a box on the left, a divider, the 3 glyphs, then two huge buttons **YES** (teal) / **NO** (rose).

- [ ] **Step 3: tests** — coding: 500 seeds deterministic, shapes ∈ SHAPES[0..4], lookahead length 4, score via CODE_KEY. symbolSearch: 500 seeds: group length 3, unique, `group.includes(target) === present`; across 500 seeds `present` rate between 40–60 %.

- [ ] **Step 4:** register both; commit `genres: coding + symbol search`.

---

### Task 9: Matrix Reasoning — "What's Missing?"

**Files:** `lib/genres/matrix.ts`, `.test.ts`, `components/genres/MatrixView.tsx`

- [ ] **Step 1: types**

```ts
export interface Figure { shape: Shape; color: string; size: "S"|"M"|"L"; count: 1|2|3|4; rot: 0|90|180|270; dot: boolean }
export interface MatrixItem { form: "matrix" | "series"; rows: 2 | 3; cells: (Figure | null)[]; options: Figure[]; answer: number }
// Response: number (option index)
```
  Attribute value lists: shape (6), color (6), size [S,M,L], count [1,2,3,4], rot [0,90,180,270], dot [false,true].
  Rule kinds per attribute: `const` (one value everywhere), `constRow` (same within a row, different across rows), `constCol`, `progressRow` (value index increases by 1 along the row, wrapping; rows may start at different offsets), `dist3` (rows=3: each row is a permutation of 3 chosen values and each column too — a Latin square).
  Rule plan by d: d1–2: rows 2, {one attr constRow}, rest const. d3: rows 2, {one of size/count progressRow}. d4: rows 3, {one of size/count progressRow}. d5–6: rows 3, {constRow on A, progressRow on B}. d7–8: rows 3, {dist3 on A, constRow on B, progressRow on C}. d9–10: rows 3, {dist3 on A, dist3 on B (independent Latin squares), progressRow on C, constCol on D}. Attributes for A..D drawn without replacement from [shape,color,size,count,rot]; `dot` only used as the constCol attribute at d≥9 or stays `false`. Series form (30 % of seeds when d ≤ 6): 5 cells in a row, last missing; one attribute cycles (progressRow over 5 with wrap) and, at d5–6, a second attribute alternates.
  Generation: build the full grid from the rules, remove the last cell → answer figure; options = answer + 4 distractors each = answer with 1 attribute changed (d ≤ 6) or 1–2 (d ≥ 7), all distinct from each other and from the answer, and **none equal to another visible cell's figure**; shuffle options; `answer` = index.

- [ ] **Step 2: tests** — 500 seeds × 10 d: deterministic; `cells.length === rows*rows` (or 5 for series); exactly one null at the end; options 5 unique; `options[answer]` equals the removed figure; rows rule holds for d1–2 (all cells in a row share the chosen attr); d≥4 ⇒ rows 3; at d9–10 every row and column of attr A contains 3 distinct values. Scoring 1/0.

- [ ] **Step 3: view** — matrix as a CSS grid of `Figure` boxes (cell ≥ 110 px on iPad landscape), missing cell shown as a dashed "?" box; options as 5 tappable boxes below (or right in landscape); tap selects (highlight) and a Done button confirms → `onRespond(index)`. Series form: one row of 5. `onReady()` on mount.

- [ ] **Step 4:** register; commit `genre: matrix reasoning`.

---

### Task 10: Block Design — "Block Builder"

**Files:** `lib/genres/blockDesign.ts`, `.test.ts`, `components/genres/BlockDesignView.tsx`

- [ ] **Step 1: types/rules** — `export type Face = "W"|"R"|"NE"|"SE"|"SW"|"NW"; export interface BlockDesignItem { n: 2|3; grid: Face[]; showGridLines: boolean }`; Response `Face[]`.
  d1–2: n 2, faces ∈ {W,R}, not all identical, gridlines. d3–4: n 2, ≥1 diagonal, gridlines. d5–6: n 3, 1–3 diagonals, gridlines. d7–8: n 3, 3–5 diagonals, `showGridLines:false`. d9–10: n 3, ≥ 6 diagonals, no gridlines. Diagonal faces are chosen so that at d ≥ 7 adjacent diagonals form continuous edges (generate by picking a "diamond" template: center R, corners with the four NE/SE/SW/NW pointing inward, edges W; then randomly rotate/flip the template and mutate 0–2 cells at d9–10). Score 1 iff `response` equals `grid` exactly; `fast` flag is computed by the engine (ms < 0.5 × cap). `timing: {kind:"item", ms: itemMs([[3,45000],[6,75000],[10,120000]])}`.
  Face rendering (shared helper `faceSvg(face, size)` in the same file, pure string): W = white square with thin gray border; R = red (`#e0413f`) square; NE = red triangle covering the top-right half (points (0,0),(s,0),(s,s)), SE = bottom-right half (points (s,0),(s,s),(0,s)), SW = bottom-left, NW = top-left.

- [ ] **Step 2: tests** — 500 seeds × 10 d: deterministic; `grid.length === n*n`; diagonal counts within the d band; `showGridLines` false iff d ≥ 7; at d1–2 no diagonals and not all same; score exact match only; a rotated copy of the grid does NOT score (n=2 grid [R,W,W,R] vs [W,R,R,W] → 0).

- [ ] **Step 3: view** — target board (left/top) drawn with `faceSvg`, separated cells when `showGridLines` else contiguous; build board (right/bottom): n×n cells all starting `W`; tap cycles W→R→NE→SE→SW→NW→W; **Done** → `onRespond(cells)`. Cells ≥ 96 px. `onReady()` on mount.

- [ ] **Step 4:** register; commit `genre: block design`.

---

### Task 11: Visual Puzzles — "Piece Picker"

**Files:** `lib/genres/visualPuzzles.ts`, `.test.ts`, `components/genres/VisualPuzzlesView.tsx`

- [ ] **Step 1: types/rules**

```ts
export type Cell = [number, number];                  // [row, col]
export interface Piece { cells: Cell[]; rot: 0|90|180|270 }   // cells normalized (min row/col = 0), rot = display rotation applied by the view
export interface VisualPuzzlesItem { size: 4|5|6; target: boolean[]; pieces: Piece[]; answer: number[] }  // answer sorted indices (3)
// Response: number[] (selected indices, any order)
```
  Area by d: d1–4 size 4, area 6–8; d5–7 size 5, area 9–12; d8–10 size 6, area 12–16. Target: random connected growth from a center cell. Partition: pick 3 distinct seed cells of the target far apart (max pairwise Manhattan among 20 random triples), multi-source BFS growth alternating sources until all target cells are claimed; reject and retry (new rng draw) if any piece has < 2 cells or is disconnected. Normalize pieces. Display rotation: d ≤ 5 → rot 0; d ≥ 6 → random rot ∈ {90,180,270} for at least one true piece. Distractors (3): (a) mirror (horizontal flip) of a random true piece, (b) a true piece with one boundary cell moved to another adjacent empty position (must stay connected), (c) a fresh random connected piece with the same cell count as a true piece. Equivalence check: for d ≤ 5 exact shape equality; for d ≥ 6 equality under any rotation. Regenerate any distractor that equals a true piece or another distractor. Options = 3 true + 3 distractors shuffled; `answer` = sorted indices of true ones. Score 1 iff `new Set(response)` equals `answer` set (length 3). `timing: {kind:"item", ms: () => 30000}`.
  Export helpers `rotate(cells, rot)`, `mirror(cells)`, `normalize(cells)`, `isConnected(cells)`, `equalShape(a,b,allowRotation)` for tests.

- [ ] **Step 2: tests** — 500 seeds × 10 d: deterministic; target area in band; target connected; the 3 answer pieces tile the target exactly (union of un-rotated pieces after re-placing — keep the original placement `origin` per piece in a non-exported field or recompute: simplest is to also store `placed: Cell[]` per true piece internally and test that their union equals the target and they are disjoint); every non-answer piece is not `equalShape` to any answer piece; at d ≤ 5 all rot 0; at d ≥ 6 at least one true piece rotated. Score: correct set in any order → 1; 2 of 3 → 0.

- [ ] **Step 3: view** — target as a filled silhouette (SVG rects, no inner borders, teal) sized to ~40 % of the shorter viewport edge; pieces in a 3×2 grid as SVG cell groups rotated by `rot`, tap toggles selection (ring), max 3 selected; Done enabled when exactly 3 → `onRespond(selected)`.

- [ ] **Step 4:** register; commit `genre: visual puzzles`.

---

### Task 12: Figure Weights — "Balance"

**Files:** `lib/genres/figureWeights.ts`, `.test.ts`, `components/genres/FigureWeightsView.tsx`

- [ ] **Step 1: types/rules**

```ts
export interface Scale { left: Shape[]; right: Shape[] | null }       // null = the "?" pan (only on the last scale)
export interface FigureWeightsItem { scales: Scale[]; options: Shape[][]; answer: number; weights: Partial<Record<Shape, number>> }
// Response: number (option index)
```
  Weights: distinct integers 1–6 per shape used. d1–3: one scale, `left` = k (1–4) copies of one shape, answer option = the same multiset; shapes used: 2–3. d4–6: scale 1 balanced with two shapes (e.g. left [triangle] right [circle,circle] — search random multisets ≤ 4 per pan with equal total and different shape sets), scale 2 left = 1–3 copies of one shape, right null. d7–8: two balanced scales over 3 shapes, then the question. d9–10: two balanced scales over 3 shapes, question left pan mixes two shapes. Target total T = weight(question left). Correct option: a random multiset (1–4 shapes, from used shapes) with total T that is not identical to the question's left multiset (and at d ≥ 4 must differ in shape composition). Distractors: 4 multisets with total ≠ T, distinct, each within ±3 of T in total and of similar length. Score 1/0. `timing: {kind:"item", ms: () => 30000}`.

- [ ] **Step 2: tests** — 500 × 10: deterministic; every balanced scale has equal totals under `weights`; `options[answer]` total === T; all other options ≠ T; options distinct; d1–3 exactly one scale; d ≥ 7 at least two balanced scales; option lengths ≤ 4.

- [ ] **Step 3: view** — each scale as an SVG beam with two pans (shapes drawn with `shapePath`, filled by fixed per-shape colors), balanced scales level, the question scale tilted slightly toward the loaded side with a large "?" on the empty pan; options as 5 tiles showing the shape sets; tap + Done → `onRespond(i)`.

- [ ] **Step 4:** register; commit `genre: figure weights`.

---

### Task 13: Bank-backed genres — verbal ×4 + arithmetic (shared engine)

**Files:** `lib/genres/bankGenre.ts`, `lib/genres/banks/{similarities,vocabulary,information,comprehension,arithmetic}.ts`, `lib/genres/banks/banks.test.ts`, `lib/genres/{similarities,vocabulary,information,comprehension,arithmetic}.ts`, `components/genres/ChoiceView.tsx`, `components/genres/ArithmeticView.tsx`

- [ ] **Step 1: bank types + factory** (`bankGenre.ts`)

```ts
export interface ChoiceBankItem { id: string; d: Difficulty; prompt: string; emoji?: string; options: { text: string; points: 0|1|2 }[]; explanation: string }
export interface ChoiceItem { bankId: string; d: Difficulty; prompt: string; emoji?: string; options: { text: string; points: number }[] }  // options shuffled
export function makeChoiceGenre(meta: { id: GenreId; subtest: string; domain: Domain; kidTitle: string; instructions: string; sampleId: string; sampleExplanation: string }, bank: ChoiceBankItem[]): Genre<ChoiceItem, number>
```
  `generate(seed, d, opts)`: candidates = bank items with `d`, minus `opts.excludeBankIds`; if empty, widen to |d' − d| = 1, then 2…; pick by `makeRng(seed)`; shuffle options with the rng. `score`: `points = options[response].points`, `max = max(points over options)`, `correct = points >= 1` when max is 2, else `points === max`. `bankId(item) = item.bankId`. `timing: none`, `mode: staircase`.
  Arithmetic bank item: `{ id, d, template: string, vars: Record<string,[number,number]>, answer: (v: Record<string,number>) => number, ok?: (v) => boolean }` → `ArithmeticItem { bankId; d; text: string; answer: number }`; `makeArithmeticGenre(bank)` draws vars with the rng until `ok` passes (max 50 tries, then the first draw), renders `{a}` placeholders, `score`: `response === answer` → 1. `timing: {kind:"item", ms: () => 30000}`.

- [ ] **Step 2: the banks** — authored, original, ≥ 4 items per d for verbal (40+ each), ≥ 6 per d for arithmetic (60+). Rules: exactly one 2-point option (verbal 2/1/0 genres) or one correct option (information: points 1/0; vocabulary picture items d1–2: 1/0); all options same part of speech / same length class; no family or curriculum-specific facts; ids `si-01`…; text kid-readable; explanation one sentence. Age ramp: d1–2 ≈ age 6, d3–4 ≈ 7–8, d5–6 ≈ 9–10, d7–8 ≈ 11–12, d9–10 ≈ 13. Examples to match:
  - similarities d1: `{"prompt":"How are an apple and a banana alike?","options":[{"text":"They are both fruits","points":2},{"text":"You can eat both of them","points":1},{"text":"They are both long","points":0},{"text":"They are not alike","points":0}]}`; d9: "How are a doubt and a fear alike?" 2 = "Both are feelings about something that might go wrong", 1 = "Both are things you feel", 0 ×2.
  - vocabulary d1 (picture): `emoji:"🪜"`, prompt "What is this?", options ladder (1) / stairs / fence / gate (0). d6: "What does *reluctant* mean?" 2 = "Not wanting to do something", 1 = "Being slow", 0 ×2.
  - information d2: "How many days are in a week?" (7); d8: "What gas do plants take in from the air?" (carbon dioxide).
  - comprehension d3: "Why do we wear seatbelts in a car?" 2 = "To keep us safe if the car stops suddenly", 1 = "Because it is the rule", 0 ×2.
  - arithmetic d2: template "Aoife has {a} stickers and gets {b} more. How many now?", vars a [2,6] b [1,4], answer a+b. d9: "A train goes {a} miles every hour. How far does it go in {b} hours?", a [20,60] step 10 via `ok: v => v.a % 10 === 0`, b [2,4].

- [ ] **Step 3: banks.test.ts** — for each bank: ids unique; `d` in 1..10; ≥ 4 (verbal) / ≥ 6 (arithmetic) items per d; exactly 4 options; exactly one top-points option; option texts unique within an item; arithmetic: 100 seeds per item produce integer answers ≥ 0 and render with no `{` left in `text`.

- [ ] **Step 4: genre tests** (`similarities.test.ts` etc., one shared helper): 500 seeds × 10 d deterministic; `excludeBankIds` is honored (returns a different id when given the first pick's id); widening works when all items of a d are excluded; scoring table.

- [ ] **Step 5: views** — `ChoiceView`: emoji (if any) huge, prompt ≥ 28 px, 🔊 button (`speak(prompt)`), 4 option buttons stacked (≥ 72 px tall), tap + Done → `onRespond(i)`; `onReady()` on mount. `ArithmeticView`: on mount `speak(text)` then `onReady()` (or immediately + `audioFallback` if speech unavailable); text shown when `display === "both"` (default for Level 1) else hidden behind a "👂 Listen again" replay (once); numpad 0–9, ⌫, Done → `onRespond(number)`.

- [ ] **Step 6:** register the five genres; commit `genres: verbal banks + arithmetic`.

---

### Task 14: Genre registry complete + cross-genre invariants test

**Files:** `lib/genres/index.ts`, `lib/genres/index.test.ts`

- [ ] **Step 1:** make `GENRES: Record<GenreId, Genre<any, any>>` full; `GENRE_LIST` in spec order.
- [ ] **Step 2: invariants test** — for each genre: `sample()` returns an item that `score`s to `correct` for its own answer where derivable (skip for bank genres), `instructions` non-empty, `kidTitle` non-empty, `timing.kind` matches mode (speedBlock ⇒ block), and for all d 1..10 × 50 seeds `generate` does not throw. Commit `genres: registry + invariants`.

---

### Task 15: Storage, KV, Telegram, gate (server + client plumbing)

**Files:** `lib/engine/kv.ts`, `lib/engine/telegram.ts`, `lib/engine/gate.ts`, `lib/engine/storage.ts`, `app/api/sessions/route.ts`, `app/api/profile/route.ts`

- [ ] **Step 1: kv.ts** (server only; mirrors the planner's env fallbacks)

```ts
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const kvReady = () => !!(url() && token());
async function cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
  const res = await fetch(url()!, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(args), cache: "no-store" });
  const j = await res.json(); if (j.error) throw new Error(j.error); return j.result as T;
}
export const PREFIX = "aoife_puzzles:";
export const kvGet = <T>(k: string) => cmd<string | null>("GET", PREFIX + k).then(v => (v ? (JSON.parse(v) as T) : null));
export const kvSet = (k: string, v: unknown) => cmd("SET", PREFIX + k, JSON.stringify(v));
export const kvExists = (k: string) => cmd<number>("EXISTS", PREFIX + k).then(n => n === 1);
export const kvLpush = (k: string, v: string) => cmd("LPUSH", PREFIX + k, v);
export const kvLrange = (k: string) => cmd<string[]>("LRANGE", PREFIX + k, 0, -1);
export const kvSetNx = (k: string, v: string) => cmd<number>("SETNX", PREFIX + k, v).then(n => n === 1);
```
  Hard rule in a comment: every key goes through `PREFIX`; never read or write `aoifes_schedule`, `aoife_plan`, `aoife_plan_prev`.

- [ ] **Step 2: telegram.ts** — `sendTelegram(html: string): Promise<boolean>` → `POST https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage` `{chat_id, text, parse_mode:"HTML", disable_web_page_preview:true}`; returns false (never throws) if env missing or non-200. `formatPartSummary(s: SessionRecord, level: LevelConfig): string` producing the spec §4.6 message (genre kidTitle padded, `correct/attempted`, `ceiling N` for staircase, `N time-outs` only when > 0, duration from startedAt/endedAt, parent link).

- [ ] **Step 3: gate.ts** — `export const isParent = (req: Request) => !!process.env.PARENT_KEY && req.headers.get("x-parent-key") === process.env.PARENT_KEY;`

- [ ] **Step 4: sessions route**

```ts
import { NextResponse } from "next/server";
import { kvReady, kvGet, kvSet, kvExists, kvLpush, kvLrange, kvSetNx } from "@/lib/engine/kv";
import { sendTelegram, formatPartSummary } from "@/lib/engine/telegram";
import { isParent } from "@/lib/engine/gate";
import { LEVELS } from "@/lib/levels";
import type { SessionRecord } from "@/lib/engine/types";
const ID = /^[0-9A-HJKMNP-TV-Z]{26}$/;     // ulid
export async function POST(req: Request) {
  if (!kvReady()) return NextResponse.json({ error: "no-kv" }, { status: 200 });
  const raw = await req.text(); if (raw.length > 200_000) return NextResponse.json({ error: "too-large" }, { status: 413 });
  const s = JSON.parse(raw) as SessionRecord;
  if (!ID.test(s.id) || typeof s.level !== "number" || !Array.isArray(s.blocks)) return NextResponse.json({ error: "bad-session" }, { status: 400 });
  const existed = await kvExists(`session:${s.id}`);
  await kvSet(`session:${s.id}`, s);
  if (!existed) await kvLpush("index", s.id);
  let notified = false;
  if (s.complete && (await kvSetNx(`notified:${s.id}`, new Date().toISOString()))) {
    const level = LEVELS.find(l => l.id === s.level);
    notified = level ? await sendTelegram(formatPartSummary(s, level)) : false;
    if (!notified) await kvSet(`notified:${s.id}`, null);   // allow retry on the next POST
  }
  return NextResponse.json({ ok: true, notified });
}
export async function GET(req: Request) {
  if (!isParent(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kvReady()) return NextResponse.json({ error: "no-kv" }, { status: 200 });
  const ids = await kvLrange("index");
  const sessions = (await Promise.all(ids.map(id => kvGet<SessionRecord>(`session:${id}`)))).filter(Boolean) as SessionRecord[];
  const level = new URL(req.url).searchParams.get("level");
  return NextResponse.json(level ? sessions.filter(s => s.level === Number(level)) : sessions);
}
```
  (`kvSet(..., null)` stores the string `null`; `kvSetNx` then fails — so instead use a DEL: add `kvDel` to kv.ts and call it. Do that.)

- [ ] **Step 5: profile route** — gated; loads sessions the same way; returns `computeProfile(sessions)`.

- [ ] **Step 6: storage.ts (client)** — `ulid()` (Crockford base32, time + random via `crypto.getRandomValues`), `loadSessions(): SessionRecord[]` / `saveSessionLocal(s)` under `aoife-puzzles:sessions` (upsert by id, cap 200), `enqueue(s)` under `aoife-puzzles:outbox` (upsert by id), `flushOutbox(): Promise<number>` (POST each; remove on `ok`; keep on network error), `syncState(): "synced"|"pending"`, `currentPosition(levels): { level, part, blockIndex }` (first level with an incomplete part; first part not complete; `blockIndex` = number of blocks already in that part's latest incomplete session), `profileStart(genre): number|null` (max ceiling for the genre across local sessions). Tests for `ulid` shape (26 chars) and `currentPosition` with fixtures (in `storage.test.ts`, stub `localStorage` with a Map).

- [ ] **Step 7:** commit `api: sessions + profile routes, kv, telegram, client storage`.

---

### Task 16: Level 1 config and registry

**Files:** `lib/levels/level1.ts`, `lib/levels/index.ts`, `lib/levels/levels.test.ts`

- [ ] **Step 1:**

```ts
import type { LevelConfig } from "../engine/types";
export const level1: LevelConfig = {
  id: 1, title: "Find Your Superpowers", feedback: "none",
  parts: [
    { id: "A", title: "Shapes", sticker: "🧩", blocks: [{ genre: "blockDesign" }, { genre: "visualPuzzles" }, { genre: "matrix" }, { genre: "figureWeights" }] },
    { id: "B", title: "Memory and Speed", sticker: "⚡", blocks: [{ genre: "digitSpan" }, { genre: "pictureSpan" }, { genre: "coding" }, { genre: "symbolSearch" }, { genre: "arithmetic", display: "both" }] },
    { id: "C", title: "Words", sticker: "📚", blocks: [{ genre: "similarities" }, { genre: "vocabulary" }, { genre: "information" }, { genre: "comprehension" }] },
  ],
};
```
  `index.ts`: `export const LEVELS: LevelConfig[] = [level1];`. Test: every block genre exists in `GENRES`; part ids unique; every genre in `GENRE_LIST` appears exactly once in level 1.

- [ ] **Step 2:** commit `levels: level 1 diagnostic`.

---

### Task 17: Shared UI — BigButton, Countdown, SampleScreen, PartDone

**Files:** `components/BigButton.tsx`, `components/Countdown.tsx`, `components/SampleScreen.tsx`, `components/PartDone.tsx`

- [ ] **Step 1: BigButton** — `{children, onClick, disabled?, tone?: "teal"|"rose"|"amber"|"plain"}` → rounded-3xl, min-h 72 px, text-2xl font-bubble, shadow, `active:scale-95`, disabled = opacity 40.
- [ ] **Step 2: Countdown** — props `{ totalMs, startedAt: number | null, onExpire }`: `requestAnimationFrame` loop; bar width = remaining %, color teal → amber when remaining < 10 s; seconds as `Math.ceil(remaining/1000)` to the right; calls `onExpire` once. Renders nothing when `startedAt` is null. No sound.
- [ ] **Step 3: SampleScreen** — props `{ genre, onStart }`: kidTitle (font-bubble 5xl), instructions text, the sample item rendered read-only through the genre's view (`disabled`, `onRespond` no-op), the explanation in a speech bubble, the fixed line "Some puzzles are easy and some are for much older kids. If you are not sure, take your best guess!", a **Start** BigButton. On mount: `speak(genre.instructions)`; Start click also calls `warmUpSpeech()` (the iOS audio gesture).
- [ ] **Step 4: PartDone** — props `{ part, minutes, synced, onHome }`: confetti burst (canvas-confetti, 3 bursts over 1.5 s), the sticker huge, "All done for today!", "You earned the {sticker} sticker", ☁️/⏳ sync hint, **Home** button.
- [ ] **Step 5:** `npm run typecheck` clean; commit `ui: shared components`.

---

### Task 18: The block runner page

**Files:** `app/play/page.tsx`, `components/genres/index.tsx` (view registry: `GenreId → React component`)

- [ ] **Step 1: view registry** — `export const VIEWS: Record<GenreId, React.ComponentType<GenreViewProps<any, any>>>` mapping the 13 ids to the 10 view components (the 4 verbal genres share `ChoiceView`).

- [ ] **Step 2: runner state machine** (`"use client"`; URL `?level=1&part=A` optional, else `currentPosition`)

  State: `phase: "sample" | "item" | "between" | "done"`, `blockIndex`, `stair: StairState | null`, `item`, `seed`, `startedAtMs: number|null` (set by `onReady`), `records: ItemRecord[]`, `session: SessionRecord` (created on first block of the part, ulid id, `appVersion` from `package.json` version via `process.env.NEXT_PUBLIC_APP_VERSION` set in `next.config.ts` `env`), `blockStartedAt`, `usedBankIds: string[]`, `speedDeadline: number|null`.

  Flow:
  1. On mount: `flushOutbox()`; resolve level/part/blockIndex; `phase = "sample"` for `GENRES[block.genre]`.
  2. Start → `phase = "item"`; staircase: `startStair(cfg.start === "fromProfile" ? { fromProfileCeiling: profileStart(genre) } : cfg.start ?? 1, cfg.maxItems ?? 8)`; `seed = randomSeed()`; `item = genre.generate(seed, stair.d, { excludeBankIds: usedBankIds })`; speed: `speedDeadline = now + timing.ms`, items generated one after another with fresh seeds.
  3. `onReady` → `startedAtMs = performance.now()`; for item-timed genres render `<Countdown totalMs={timing.ms(d)} startedAt={startedAtMs} onExpire={() => finishItem(null, true)} />`; for speed genres one `<Countdown totalMs={timing.ms} startedAt={blockStartMs} onExpire={endBlock} />` above everything.
  4. `onRespond(r, meta)` → `finishItem(r, false, meta)`: `ms = performance.now() - startedAtMs`, `score = genre.score(item, r)`, push `ItemRecord` (`fast` when item-timed and `ms < 0.5*cap`, `bankId` via `genre.bankId?.(item)`), for staircase `stair = stepStair(stair, score.correct)`; then `phase = "between"` for 600 ms showing "Next!" (feedback `none`), or ✓/✗ (`mark`), or the correct answer text (`reveal`, 2.5 s — for v1 only `none` is exercised by Level 1 but the branch must exist), then either next item or `endBlock()` when `stair.done`. Speed: next item immediately (no "between"), until `onExpire`.
  5. `endBlock()` → `BlockRecord` with `summarize(records, mode)`; append to `session.blocks`; `saveSessionLocal`; `enqueue` + `flushOutbox`; if more blocks → `blockIndex+1`, `phase = "sample"`; else `session.complete = true`, `endedAt`, save + flush, `phase = "done"` → `<PartDone/>`.
  6. Header during items: part title small on the left, progress dots (`maxItems` dots, filled = attempted) center, nothing else. No scores, no time except the countdown bar.

- [ ] **Step 3: manual check** — `npm run dev`, play Part A end to end in Safari responsive mode (iPad, landscape and portrait): sample → items → staircase stops → next block → PartDone; confirm `localStorage["aoife-puzzles:sessions"]` holds the session and the outbox drains when `/api/sessions` returns `no-kv` (treat `{error:"no-kv"}` as delivered = false but not retriable forever: after 20 failed flushes of one item keep it local and stop retrying that item; mark `syncState` accordingly).

- [ ] **Step 4:** commit `play: block runner`.

---

### Task 19: Home page and parent page

**Files:** `app/page.tsx`, `app/parent/page.tsx`, `components/ParentTable.tsx`

- [ ] **Step 1: home** — big "Play" (links to `/play`), the three part stickers for the current level (earned = colored, else gray), the level title, ☁️/⏳ icon; if all parts of all levels are complete: "You finished everything! More puzzles are coming." No scores.
- [ ] **Step 2: parent** — on first visit asks for the key (input, stored in `localStorage["aoife-puzzles:parent-key"]`); fetches `/api/profile` and `/api/sessions` with `x-parent-key`; shows: the no-norms disclaimer sentence, a domain table (domain, value %, flag with color), the EGAI-bundle vs CPI-bundle line, a per-genre table (attempted, correct, points/max, ceiling, median s, time-outs, per-minute for speed), a sessions list (date, level, part, duration, complete), and a "Replay a part" row of links `/play?level=1&part=A&replay=1` (the runner treats `replay=1` as "start a new session even if complete"). Also a "Copy JSON" button that copies the profile JSON (for pasting into a Claude session).
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm run build` clean; commit `pages: home + parent`.

---

### Task 20: AGENTS.md, README, deploy, env, Telegram proof

**Files:** `AGENTS.md`, `README.md`, Vercel project

- [ ] **Step 1: AGENTS.md** (house format: title → single-source banner → What this is → Architecture tree → Run/test/deploy → Secrets & env → Gotchas/hard rules → State/TODO → File map → Playbooks). Must include verbatim: the §0 decisions table from the spec; "Never touch planner keys `aoifes_schedule`, `aoife_plan`, `aoife_plan_prev`; every key goes through `PREFIX`"; "No Pearson/WISC-V item content, ever — formats only"; "Visible countdown is an owner decision (2026-08-22), unlike aoife-math"; "No 'I don't know' or skip buttons"; the add-a-level recipe (`lib/levels/levelN.ts` + register + `start: 'fromProfile'`); the add-a-genre recipe (lib + view + registry + VIEWS + tests); "How Claude reads her results": `curl -H "x-parent-key: $(grep PARENT_KEY ~/PycharmProjects/.secrets/aoife-puzzles.env | cut -d= -f2-)" https://aoife-puzzles.vercel.app/api/profile`; Upstash free-plan facts; the iOS speech gesture gotcha; the reload-mid-block rule.
- [ ] **Step 2: README.md** — 10 plain-English lines for Jalal (what it is, the three parts, parent page, Telegram).
- [ ] **Step 3: repo + deploy**

```bash
gh repo create jalalchowdhury1/aoife-puzzles --public --source=. --push
vercel link --yes --project aoife-puzzles
PARENT_KEY=$(openssl rand -hex 16); printf 'PARENT_KEY=%s\n' "$PARENT_KEY" > ~/PycharmProjects/.secrets/aoife-puzzles.env; chmod 600 ~/PycharmProjects/.secrets/aoife-puzzles.env
printf '%s' "$PARENT_KEY" | vercel env add PARENT_KEY production
grep '^TELEGRAM_TOKEN='  ~/PycharmProjects/.secrets/telegram.env | cut -d= -f2- | vercel env add TELEGRAM_TOKEN production
grep '^TELEGRAM_CHAT_ID=' ~/PycharmProjects/.secrets/telegram.env | cut -d= -f2- | vercel env add TELEGRAM_CHAT_ID production
# KV: connect the existing Upstash resource to this project (Vercel dashboard → Storage → upstash-kv-alizarin-helmet → Connect Project → aoife-puzzles),
# or copy KV_REST_API_URL / KV_REST_API_TOKEN from the aoifes-schedule project's env into this project via `vercel env add`.
vercel --prod --yes
```
  The Upstash connect step may need the owner in the dashboard; if `vercel env ls` shows no KV vars after the attempt, hand him the one-click instruction.

- [ ] **Step 4: smoke** — `curl -s -X POST https://aoife-puzzles.vercel.app/api/sessions -d '<a complete fixture session JSON with part A>'` → `{ok:true, notified:true}` and the Telegram message arrives (owner confirms); `curl -H "x-parent-key: …" …/api/profile` returns the profile; `GET /api/profile` without the key → 401. Then delete the fixture: `DEL aoife_puzzles:session:<id>` and `LREM aoife_puzzles:index 0 <id>` via the same REST (add a tiny `scripts/kv-del.mjs` that takes the env from `vercel env pull`).
- [ ] **Step 5:** commit `docs: AGENTS.md + README`; update Claude memory (`project_aoife_puzzles.md` + MEMORY.md line) with the live URL, the decisions, the key location, and the "read the profile before building a level" rule.

---

## Self-review notes
- Spec §2 genres → Tasks 6–13; §1.2 runner → Task 18; §1.3 timing → Task 4 + per-genre `timing`; §3 level → Task 16; §4 data/API/Telegram/profile → Tasks 4, 15; §5 UI rules → Tasks 17–19; §6 tests → every task; §7 deploy → Task 20.
- Type names used consistently: `Genre`, `GenreViewProps`, `ItemRecord`, `BlockRecord`, `SessionRecord`, `StairState`, `startStair/stepStair`, `summarize`, `computeProfile`, `GENRES`, `GENRE_LIST`, `VIEWS`, `LEVELS`.
- Arithmetic's domain is `"FR"` (profile FR = matrix, figureWeights, arithmetic), matching spec §4.5; the spec's `QR` label is informational only.
