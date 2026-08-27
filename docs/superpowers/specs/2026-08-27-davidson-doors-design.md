# Davidson doors: doors-only levels, Talk with Pip, Practice tab (2026-08-27, overnight build)

Owner directives (2026-08-26 evening, confirmed by MCQ — do not re-litigate):

1. **Doors only.** Future levels contain ONLY the six Davidson-door genres: the verbal four
   (whichTwo, fillTheGap, information, whatWouldYouDo) + arithmetic + swapShop. Targets:
   VECI alone at 145+, or VCI + QRI both. "Only doors. But since we are taking something away.
   Add in a fun factor. Tell her how good she is even more. Pip is funny."
2. **Conversation piece as a separate tab.** "she is asked the question and she answers with
   voice" + "keep it as a separate tab then. I will do that with her at a different time."
3. **Practice the misses.** "for all of these things, make sure we can go back and practice
   the ones we got wrong."

## Design calls made solo tonight (logged for morning review)

- **Doors-only is enforced at the level layer, not by flipping `retired`** on the 8 non-door
  genres. Retiring them would break the Level 3 history tests, shrink GENRE_LIST (QA level +
  e2e + audit derive from it), and orphan views the Practice tab still renders. Instead:
  levels 5 and 6 become `released: false` (she has played NEITHER — nothing is replayed;
  same precedent as Level 2's retirement), Level 7 "Pip's Dream Team" is the first doors-only
  level, and a guard test pins every released level with id ≥ 7 to DOOR_GENRES.
- **Level 7 absorbs the door half of levels 5+6**: swapShop start 5 + timeScale 1.5 and
  arithmetic start 8 + timeScale 1.5 (Level 5A's win-ramp pins, unchanged reasoning) plus the
  verbal four fromProfile (Level 6B's censored-ceiling probing). fastLane stays OFF level-wide
  (win-heavy first; her verbal fromProfile starts land near ceiling anyway, so the fast lane
  buys little and risks the wall) with easeIn ON.
- **Talk with Pip** (`/talk`): grown-up-present production practice for the verbal four areas.
  TTS asks an open-ended question; she answers out loud; the grown-up taps 2 / 1 / 0 against a
  muted model-answer strip (aoife-reads ExaminerView pattern). NO speech recognition, ever —
  a misheard answer would fabricate a false weakness. Items are ours (lib/talk/items.ts),
  authored fresh tonight. Results go to KV under `aoife_puzzles:talk:*` via POST /api/talk
  (public, like /api/sessions) and mirror to localStorage; the retry queue (items scored 0/1
  resurface first) is computed from the local mirror — device-bound, acceptable for v1.
  Production data NEVER mixes into computeProfile; the parent page gets a separate Talk section
  (GET /api/talk, parent-gated).
- **Practice tab** (`/practice`): replays her actual counted misses — staircase-mode ACTIVE
  genres only. Excluded: bailed items (agency), teaching/frontier items (already revealed),
  speed-block items (block pressure, not knowledge), retired replica genres (practicing those
  is decision-#16 coaching). Queue = misses from real sessions MINUS items since answered
  correctly in practice, capped at the 30 most recent. Practice items are UNTIMED (no clock
  pressure; reveal on miss). Practice sessions post as `SessionRecord{level: 0, part: "P",
  practice: true}`; `computeProfile` drops `practice` sessions at the door, so practice can
  never inflate ceilings or the Ages tab. Level 0 is in no registry, so position and Telegram
  are untouched.
- **Fun amp**: new praise lines across correct/blockDone/partDone/welcome pools, silly-Pip
  heavy, same hard rules (no dash characters, no wrong/bad/failed/oops/sorry/mistake/incorrect).

## Decisions recorded in AGENTS.md as #21 (doors only + fun amp), #22 (Talk tab), #23 (Practice).
