# AGENTS.md — Aoife Puzzles

> **Read this first. Single source of truth for anyone (human or AI) touching this repo.**
> README.md is Jalal's plain-English doc — leave it alone unless asked. If something here
> is wrong, fix *this* file.

## 1. What this is

A tablet (iPad) web game for Aoife (born 2021-01-11) of **original puzzles in the formats of
the 13 WISC-V subtests** the Gifted Development Center administers (10 primary + Information,
Comprehension, Arithmetic). She sits the WISC-V at GDC in early 2027. **Level 1** is a
diagnostic ("Find Your Superpowers", three ~15-minute parts) that maps her relative
strengths and weaknesses; later levels are added as data and can start from her recorded
profile. Every item, answer, time and time-out is stored server-side.

Live: **https://aoife-puzzles.vercel.app** · repo `jalalchowdhury1/aoife-puzzles` (public) ·
spec `docs/superpowers/specs/2026-08-22-aoife-puzzles-design.md` · plan `docs/superpowers/plans/`.

### Owner decisions (2026-08-22) — do not re-litigate

| # | Decision | Choice |
|---|---|---|
| 1 | Coaching line | **WISC-V-format puzzles, original content.** The owner was told this sits on the "coaching" side of GDC form 10.4 and chose it. **Never reproduce, paraphrase, or fetch actual Pearson/WISC-V items — formats only.** |
| 2 | Timing | **Visible countdown** (calm bar + seconds) on timed genres. Deliberately differs from aoife-math's no-timer rule. |
| 3 | Verbal subtests | Multiple choice, options weighted 2/1/0 like real scoring. |
| 4 | Storage | Shared **free** Upstash Redis (the planner's DB) under `aoife_puzzles:*` keys + localStorage mirror. No paid services. |
| 5 | Device | iPad, touch first, landscape and portrait. |
| 6 | Company | Usually alone → every block self-explains (spoken instructions + untimed sample item). |
| 7 | Audio | Browser speech reads digit sequences and word problems; one Replay per item; visual fallback only if speech unavailable (logged `audioFallback`). |
| 8 | Level 1 feedback | **None** — "Next!" only. No ticks/crosses/answers. |
| 9 | Sittings | Level 1 = 3 parts (A Shapes, B Memory and Speed, C Words); progress saves after every block. |
| 10 | Verbal difficulty | Age 6 → 13 ramp over d1–10. |
| 11 | Mood | Calm during; confetti + sticker at the end of a part only. |
| 12 | Telegram | One summary message per completed part to the owner's @ZingerJC_bot DM. |

## 2. Architecture

```
app/
  page.tsx               home: Play → current part; stickers; ☁️/⏳ sync icon. No scores.
  play/page.tsx          THE RUNNER: sample screen → staircase/speed block → "Next!" → persist → PartDone
  parent/page.tsx        unlinked dashboard; asks for PARENT_KEY once (localStorage); profile + sessions + replay links
  api/sessions/route.ts  POST upsert SessionRecord (→ Telegram on first `complete`), GET list (gated)
  api/profile/route.ts   GET computeProfile(sessions) (gated)
lib/engine/
  types.ts     Genre<I,R> contract, GenreViewProps, Item/Block/Session records, Level/Part/Block configs, summarize()
  rng.ts       mulberry32 — every item = (genreId, seed, difficulty), fully deterministic
  staircase.ts startStair/stepStair: +1 on correct, hold on wrong, stop after 2 consecutive wrong / maxItems / top
  timing.ts    itemMs table helper, SPEED_BLOCK_MS = 120 s
  profile.ts   sessions → per-genre stats → domain roll-ups (VS FR WM PS VC) + EGAI/CPI bundles; z-flags ±0.5 within HER OWN domains
  speech.ts    Web Speech wrapper (speak, speakSequence, warmUpSpeech) — the only browser code under lib/
  storage.ts   localStorage mirror + outbox → /api/sessions (20 tries then keep local), currentPosition, profileStart
  kv.ts        Upstash REST; EVERY key goes through PREFIX "aoife_puzzles:"
  telegram.ts  sendTelegram (never throws) + formatPartSummary
  gate.ts      x-parent-key === PARENT_KEY
lib/genres/    one pure module per genre (generate/score/sample/timing/mode) + banks/ (authored verbal + arithmetic items)
  index.ts     GENRES registry + GENRE_LIST (spec order)
components/genres/*View.tsx   one UI per genre (4 verbal genres share ChoiceView); components/genres/index.tsx = VIEWS map
components/{BigButton,Countdown,SampleScreen,PartDone,Figure,ParentTable}.tsx
lib/levels/    level1.ts + index.ts (LEVELS) — levels are DATA
```

Genre ↔ subtest map: blockDesign=Block Design (VS) · visualPuzzles=Visual Puzzles (VS) ·
matrix=Matrix Reasoning (FR) · figureWeights=Figure Weights (FR) · arithmetic=Arithmetic (FR/QRI) ·
digitSpan=Digit Span (WM) · pictureSpan=Picture Span (WM) · coding=Coding A (PS) · symbolSearch=Symbol
Search A (PS) · similarities / vocabulary / information / comprehension (VC).
EGAI bundle = SI VC IN CO BD MR FW AR (Pearson TR#5, verified). CPI bundle = DS PS CD SS.

Data flow: runner builds `SessionRecord` (one per part attempt) → after every block: `saveSessionLocal` +
`enqueue` + `flushOutbox` → `POST /api/sessions` → Upstash `aoife_puzzles:session:<ulid>` +
`aoife_puzzles:index` (LPUSH) → on first `complete: true`, Telegram summary (idempotent via
`aoife_puzzles:notified:<id>`, cleared with DEL if the send fails so the next POST retries).

## 3. Run / test / deploy

- `npm install --cache ./.npm-cache` (the global npm cache on this Mac is corrupted; `.npm-cache/` is gitignored).
- `npm run dev` · `npm test` (Vitest, `lib/**/*.test.ts`, generators swept 500 seeds × 10 difficulties) ·
  `npm run lint` · `npm run typecheck` · `npm run build`.
- Deploy: `vercel --prod --yes` from the repo root. **GitHub auto-deploy is NOT connected** (the Vercel
  GitHub App lacks access to the repo; same gotcha as aoife-math). Pushing to main does nothing on Vercel.
- Definition of done for any change: tests + lint + tsc + build green, deployed, and a real walkthrough on
  the iPad (speech needs a real Safari; simulators lie about audio).

## 4. Secrets & env (Vercel project `aoife-puzzles`, team jalalchowdhury-8053)

| Var | Where it came from |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | copied from the `aoifes-schedule` Vercel project (same Upstash DB `upstash-kv-alizarin-helmet`, Free plan: 1 DB, 256 MB, 500K cmds/mo, $0) |
| `PARENT_KEY` | generated 2026-08-22; local copy `~/PycharmProjects/.secrets/aoife-puzzles.env` (mode 600) |
| `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID` | `~/PycharmProjects/.secrets/telegram.env` (@ZingerJC_bot → Jalal's DM) |

No secrets in the repo. Never print them to a transcript.

## 5. Gotchas / hard rules

- **NEVER read or write the planner's keys** `aoifes_schedule`, `aoife_plan`, `aoife_plan_prev`. Every KV
  access goes through `PREFIX` in `lib/engine/kv.ts`. The DB is shared; the namespace is the only wall.
- **No Pearson content, ever.** Formats are generic cognitive-task designs; item content is ours.
- **No "I don't know" / skip buttons anywhere** (GDC's own advice: practice guessing). Done stays disabled
  until there is a response; speed blocks respond on first tap.
- **Nothing the child sees shows scores, right/wrong, or time except the countdown bar.**
- **Views fire `onReady()` in a mount effect → the runner remounts the view per item (`key`).** Do not
  "optimize" that away; the timer start and speed-block streaming depend on it.
- Matrix Reasoning, Digit Span, Picture Span and the verbal genres are **untimed** (time recorded).
  Block Design 45/75/120 s by difficulty, Visual Puzzles 30 s, Figure Weights 30 s, Arithmetic 30 s after
  speech ends, Coding / Symbol Search 120 s block windows.
- **Reload mid-block** restarts that block with fresh seeds; completed blocks are never redone; a part
  that is complete redirects to `/` unless `?replay=1`.
- **iOS speech needs a user gesture**: the Start button on the sample screen is it (`warmUpSpeech`). If
  `speechSynthesis` is missing, views fall back to visual presentation and mark `audioFallback`.
- React Compiler lint rules (`react-hooks/set-state-in-effect`, `react-hooks/refs`) reject "reset state in
  an effect" — views use the "adjust state during render" pattern. Follow it in new views.
- The staircase's "correct" for 2/1/0 genres = points ≥ 1; ceiling = highest difficulty with points > 0.
- Profile flags are **relative to her own five domains** (population-SD z, ±0.5). No norms, no IQ-like
  numbers, ever. Say so wherever the profile is shown.
- Symbol Search item score is 1/0; the block-level "correct − incorrect" is derivable from `BlockSummary`.
- `.claude/` (agent worktrees) and `.npm-cache/` are gitignored and ESLint-ignored; keep them that way.

## 6. State / TODO

- 2026-08-22: v0.1.0 shipped — Level 1 (3 parts) live; parent page; Telegram summaries; no Level 2 yet.
- Cosmetic: the SampleScreen card is narrower than the two Block Builder boards at 1180px wide (boards overflow the white card). Harmless; fix when touching SampleScreen.
- `vercel env add` via stdin marks vars *sensitive*: `vercel env pull` on this project returns BLANK values (production still works). To run `scripts/kv-del.mjs`, pull the env from the `aoifes-schedule` project instead.
- Ideas parked, not promised: Cancellation / Letter-Number Sequencing / Picture Concepts genres;
  `feedback: "reveal"` practice levels with explanations (banks already carry `explanation`);
  per-session "guess rate" proxy; audio-only Arithmetic (`display: "audio"`) in later levels.

## 7. Playbooks

**"Add a level"** → new `lib/levels/levelN.ts` exporting a `LevelConfig` (usually `feedback: "reveal"`,
blocks with `start: "fromProfile"` so each genre begins just under her last ceiling, and `display:
"audio"` for Arithmetic if she is ready); register in `lib/levels/index.ts`; `levels.test.ts` guards
genre ids. **Before designing the level, read her profile** (next playbook).

**"How is she doing / design the next level"** → read the live profile:
```bash
curl -s -H "x-parent-key: $(grep PARENT_KEY ~/PycharmProjects/.secrets/aoife-puzzles.env | cut -d= -f2-)" https://aoife-puzzles.vercel.app/api/profile | jq .
curl -s -H "x-parent-key: …" "https://aoife-puzzles.vercel.app/api/sessions?level=1" | jq .   # raw sessions
```

**"Add a genre"** → `lib/genres/<id>.ts` (pure: generate/score/sample/timing/mode) + `.test.ts` (500 seeds
× 10 d) + `components/genres/<Id>View.tsx` + register in `lib/genres/index.ts` AND `components/genres/index.tsx`
(VIEWS) + add `GenreId` to `types.ts` + put it in a level. Domain roll-ups in `profile.ts` need the new id too.

**"Replay a part"** → parent page → Replay links (`/play?level=1&part=A&replay=1`). The first run stays
the diagnostic of record; replays are separate sessions.

**"Remove test data"** → `scripts/kv-del.mjs <sessionId>` (reads KV creds from `vercel env pull`).

## 8. File map

See §2. Tests live beside their modules (`*.test.ts`). `docs/superpowers/` holds the spec and plan that
produced v0.1.0; research notes live outside the repo in `~/Documents/Research/wisc-v-puzzle-prep/`.
