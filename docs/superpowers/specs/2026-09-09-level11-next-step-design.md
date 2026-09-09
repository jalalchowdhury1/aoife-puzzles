# Level 11 "Pip's Next Step" — design (2026-09-09)

Owner ask (Jalal, 2026-09-09): *"She just finished and I think did well. Please build the next
session for her."* Then, on the proposal: *"go for it. so the math one you can test her limits.
start higher. cause she's really good at math."*

## 1. What Level 10 taught us

All three parts played 2026-09-09 (about four minutes each). **33/36, zero "Not fun" taps, every
block ran to its last dot.** Raw data from `/api/sessions?level=10`:

| Block | Result | Read |
|---|---|---|
| 10A arithmetic d10→12 | **6/6**, d12 items in 4 s and 0.5 s | flawless and fast |
| 10A information d8→10 | 5/6, one miss at d10, 35–40 s items | frontier d10 |
| 10B whichTwo d2→4 | **6/6**, neither teaching item used, one 37 s item | flawless |
| 10B whatWouldYouDo d7→8 | 5/6, miss at d8, 20–39 s each | frontier d8 |
| 10C swapShop d7→9 | 5/6, miss at d9 (24 s, under the 1.5× clock) | frontier d9 |
| 10C fillTheGap d7→9 | 5/6, miss at d8 | frontier d8–9 |

The win-heavy shape (decision #30) did what it was built for, so the shape stays.

## 2. The rule

**Climb where she was flawless, hold where she missed.** Held blocks keep their Level 10 start
but draw fresh seeds, so nothing is a replay. Same machinery: `stepUp 2`, `fastLane false`,
`easeIn`, 1.5× clock on the two timed genres, reveal feedback — a flawless N-item block answers
its last item at `start + floor((N − 1) / 2)`.

**Owner override — Story Sums is the one probe.** She is "really good at math" and the d15 wall
came from a single 5-second miss on item one of a Level 9 block that started AT d15. So Story Sums
starts at d13 (unit rates and averages she beat 13/14 in Level 8) with eight items, reaching
**d16** — one past the wall. Her live ceiling is d15, so `easeIn` treats d16 as frontier: one free
miss and a 1.5× clock on top of the block's own 1.5×. The two-miss stop still ends the block
gently. No other block may pass its wall.

| Genre | Wall | L10 start | L11 start | Items | Reach | Change |
|---|---|---|---|---|---|---|
| arithmetic | 15 | 10 | **13** | 8 | **16** | PROBE (owner call) |
| information | 12 | 8 | 8 | 6 | 10 | hold |
| whichTwo | 5 | 2 | **3** (+1 teaching) | 4 | 4 | climb, still under the wall |
| fillTheGap | 10 | 7 | 7 | 6 | 9 | hold |
| whatWouldYouDo | 10 | 7 | 7 | 6 | 9 | hold |
| swapShop | 10 | 7 | 7 | 6 | 9 | hold |

Wall table unchanged from Level 10: Level 10 never reached a wall, so no wall moved.

## 3. Parts

| Part | Title | Blocks | Why |
|---|---|---|---|
| A | Rocket Sums 🚀 | arithmetic (probe) → information | the big ask first, her happiest block to close |
| B | Word Garden 🌻 | whichTwo → whatWouldYouDo | one-step climb with a cushion, then a held closer |
| C | Treasure Chest 💎 | swapShop → fillTheGap | both held at d7 with fresh problems |

## 4. Guards

- `levels.test.ts` (Level 11 describe): released; six door genres once; only arithmetic may pass
  its wall and by exactly one step; climbs only where Level 10 was flawless; machinery pinned;
  only whichTwo has a teaching item.
- `level11.shape.test.ts`: drives the real staircase — every clean run ends on `maxItems`,
  arithmetic reaches d16 and gets a free frontier miss there, whichTwo's first miss is free.

## 5. Scope

- New: `lib/levels/level11.ts`, registered in `lib/levels/index.ts`; tests; AGENTS.md §6 +
  decision #31; memory update. **No engine, bank or scale change.** Her record is untouched;
  position resolves to L11A once released.
- Verification: `npm run release` gate plus a throwaway Playwright self-play of all three parts
  against a KV-less production server with her 27 live sessions injected into localStorage
  (2026-09-09: 3/3 parts to "All done", zero page errors, every block on its pinned start,
  teaching miss recorded, stepUp-2 climb observed).

## 6. Parked, on purpose

- whatWouldYouDo d11–15 ladder is still *earned* (topped d10 in L9C) but she missed at d8 on
  Level 10, so it is not urgent. Bank-authoring job for a later level.
- If the d16 probe lands clean and fast, Level 12 can probe d17–18 (the bank goes to d20).
