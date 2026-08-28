# Dashboard revamp: scope to Road 1/2, archive the rest (2026-08-28)

Owner ask (Jalal, verbatim): "we need to revamp the other tabs of the dashboard. oNly keep the
info we need for Road 1 and Road 2. the rest just keep in memory in a .md file. the dashboard
should show davidson path, WISC lens, her actual skills. multiple perspectives. also if possible
her questions from the last time she did the app wiwth time taken for each question. full
breakdwon."

Three follow-up decisions, all his recommended pick:

1. **Talk with Pip stays** as a 5th tab — it's a genuinely separate measurement (spoken production
   vs puzzle recognition, decision #22), not clutter from the archived genres.
2. **Last Session breakdown depth: difficulty + time + right/wrong**, not full question text. Reuses
   data `insights.ts` already computes — no new plumbing. (Full question text was the other option;
   rejected partly because Swap Shop and Arithmetic don't have fixed question text to show anyway,
   so even that option would've been inconsistent across the six door genres.)
3. **Archival mechanism: unlink, don't delete.** Every archived tab's component function stays in
   `app/parent/page.tsx` exactly as it was, just removed from `TABS` and the render switch. This
   doc is the map back if any of them is wanted again.

## Final tab lineup

`app/parent/page.tsx`, `TABS` array, in order:

1. **Davidson** (🎯) — the admission-pathway view (shipped earlier today, unchanged by this revamp).
2. **WISC lens** (🧠) — CHC-domain view (Visual Spatial / Fluid Reasoning / Working Memory /
   Processing Speed / Verbal Comprehension), same grouping as before, but now shows ONLY the 6
   door genres within each domain. Visual Spatial, Working Memory, and Processing Speed have zero
   door genres (see `DOOR_GENRES` below) and so no longer render a section at all — only Fluid
   Reasoning (Swap Shop, Arithmetic) and Verbal Comprehension (the door verbal four) show. The
   per-domain percentage shown is now a LOCAL average over just the visible door genres (their own
   ceiling/maxD ratios), not `insights.domains[].value`, which still silently counts every genre
   including archived ones — using that old value here would have been quietly wrong. The
   EGAI-style/CPI-style bundle sections at the bottom are dropped entirely: they mixed door and
   non-door genres into one number, and the Davidson tab already gives the real door-genre rollup.
3. **Skills** (🧩) — new component `components/parent/DoorSkillsTab.tsx`. Merges what used to be two
   tabs (Skills grid + Skill detail) into one, since there are only 6 genres to browse now instead
   of ~14: a grid of `SkillCard`s across the top, tap one to see its deep-dive below (ceiling over
   time, per-difficulty accuracy table, fast/teaching/bail counters, missed questions with the real
   prompt text via `lookupBankItem`, full item log). This is the "raw numbers" perspective — WISC
   lens groups by CHC domain, Davidson groups by admission pathway, this shows the ungrouped truth
   underneath both.
4. **Last session** (🗓) — new component `components/parent/LastSessionTab.tsx`. Shows
   `insights.timeline`'s most recent entry (her latest played session), one table per block/genre
   in play order, one row per question: # · difficulty · result (✓/✗/⏱/😕) · seconds taken. No genre
   filtering needed here — every level from 7 onward already only uses door genres (decision #21),
   so her most recent session is automatically in-scope.
5. **Talk** (🗣) — unchanged.

## Archived (unlinked, code untouched)

Still fully defined in `app/parent/page.tsx`, just no longer in `TABS` or the render switch. To
bring one back: add its tab id/label back to `TABS`, add its `{tab === "..." && <X .../>}` line
back to the render switch, and (for Skill detail specifically) restore the `focusedGenre` state and
`focusSkill` handler that used to wire it to the Skills tab — both were removed as orphaned glue
once nothing called them.

- **Overview** (`OverviewTab`) — session/minute/star/streak stat tiles, all-5-domain bars, recent
  ceiling movement, engagement chart, quality-flag list. None of it is door-scoped; the streak/star
  stats are motivational (for her), not diagnostic (for Davidson).
- **Skills / Skill detail** (`SkillsTab`, `DetailTab`) — the pre-revamp versions covering ALL ~14
  genres (active + retired), not just the 6 door genres. Superseded by `DoorSkillsTab` above, which
  is the same deep-dive logic scoped down.
- **Matrix** (`MatrixTab`) — the d1-15 mastery grid across every genre. Not door-scoped; no
  Davidson-specific angle it added beyond what Skill detail's per-difficulty table already covers
  for the 6 door genres.
- **Timeline** (`TimelineTab`) — full session-by-session history with collapsible per-item chips
  (tiny, hover-only). Superseded for the *most recent* session by the new Last Session tab, which
  shows the same underlying data as a real readable table instead of hover tooltips; older sessions
  are still fully reachable per-genre via Skill detail's item log in the Skills tab.
- **Ages** (`AgesTab`) — the full age-band lens across every genre with a benchmark. The 6 door
  genres' age-band data now lives in the Davidson tab (with the added "years ahead" number); this
  tab's remaining value was the non-door genres (Mosaic, Piece Picker, Balance, digit span, etc.),
  which are exactly what's out of scope now.

## Small refactors that came with this

- `StatTile` moved from an inline function in `page.tsx` to `components/parent/StatTile.tsx` so
  both the archived tabs and the new `DoorSkillsTab` can use the same component without duplicating
  it.
- `dayStreak`/`todayNY` (page-level glue that only existed to feed Overview's streak stat) removed
  as orphaned once Overview stopped rendering — not "archived," genuinely deleted, since it was
  routing glue rather than a feature in its own right.
