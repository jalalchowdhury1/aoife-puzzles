"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BlockRecord, GenreViewProps, ItemRecord, LevelConfig, PartConfig, SessionRecord } from "@/lib/engine/types";
import { summarize } from "@/lib/engine/types";
import { LEVELS, RELEASED_LEVELS } from "@/lib/levels";
import { GENRES } from "@/lib/genres";
import { VIEWS } from "@/components/genres";
import { startStair, stepStair, type StairState } from "@/lib/engine/staircase";
import { randomSeed } from "@/lib/engine/rng";
import {
  ulid,
  loadSessions,
  saveSessionLocal,
  enqueue,
  flushOutbox,
  syncState,
  currentPosition,
} from "@/lib/engine/storage";
import { computeProfile } from "@/lib/engine/profile";
import { adaptPart, type ResolvedBlock } from "@/lib/engine/adapt";
import { SampleScreen } from "@/components/SampleScreen";
import { Countdown } from "@/components/Countdown";
import { PartDone } from "@/components/PartDone";

type Phase = "loading" | "sample" | "item" | "between" | "done";

// How long the "between" transition shows for `none`/`mark` feedback.
// `reveal` (Level 2) has its own two-speed timing handled by feedbackDelay
// below: a quick "Yes!" on a full-score response, a longer answer-reveal
// pause otherwise.
const BETWEEN_MS: Record<"none" | "mark", number> = { none: 600, mark: 1200 };

// `teaching`: this item was a missed teaching item (see ResolvedBlock.teachingItems
// / lib/engine/staircase.ts) — it gets the same 4s answer-reveal pause as
// Level 2's "reveal" feedback even when the level's own feedback is "none".
function feedbackDelay(feedback: LevelConfig["feedback"], fullScore: boolean, teaching: boolean): number {
  if (feedback === "reveal") return fullScore ? 1200 : 4000;
  if (teaching) return 4000;
  return BETWEEN_MS[feedback];
}

function minutesBetween(startedAt: string, endedAt?: string): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt ?? new Date().toISOString()).getTime();
  return Math.max(0, Math.round((end - start) / 60_000));
}

function ProgressDots({ total, filled }: { total: number; filled: number }) {
  return (
    <div className="flex gap-2" aria-label={`Puzzle ${Math.min(filled + 1, total)} of about ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i < filled ? "bg-teal-400" : "bg-teal-100"}`}
        />
      ))}
    </div>
  );
}

function BetweenScreen({ feedback, lastCorrect }: { feedback: LevelConfig["feedback"]; lastCorrect: boolean | null }) {
  if (feedback === "mark") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-8xl" aria-hidden>
          {lastCorrect ? "✅" : "❌"}
        </span>
      </div>
    );
  }
  // feedback === "none" (the only other value the runner ever passes here;
  // "reveal" is rendered directly by PlayRunner via RevealAnswerScreen /
  // FullScoreScreen below): neutral transition, no ticks/crosses/answers.
  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="font-bubble text-4xl text-ink">Next!</span>
    </div>
  );
}

function hasExplanation(item: unknown): item is { explanation: string } {
  return !!item && typeof (item as { explanation?: unknown }).explanation === "string";
}

// Level 2 ("reveal" feedback), full-score response: the "Yes!" look, shown
// for 1200ms (feedbackDelay) instead of the longer answer-reveal pause.
function FullScoreScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <span className="text-8xl" aria-hidden>
        ✅
      </span>
      <p className="font-bubble text-3xl text-ink">Yes!</p>
    </div>
  );
}

// A response worth less than full points (or a time-out): re-renders the
// same genre View, disabled, with `reveal` and `lastResponse` set so the
// view can show the correct answer against her own response. Shown for
// 4000ms (feedbackDelay). Used for Level 2's ("reveal" feedback) misses, and
// also for a missed teaching item on any level (see `teachingReveal`).
function RevealAnswerScreen({
  View,
  item,
  lastResponse,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  View: React.ComponentType<GenreViewProps<any, any>>;
  item: unknown;
  lastResponse: unknown;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-4 pb-4 text-center">
      <p className="font-bubble text-2xl text-ink">Here is the answer</p>
      <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg">
        <View item={item} disabled reveal lastResponse={lastResponse} onReady={() => {}} onRespond={() => {}} />
      </div>
      {hasExplanation(item) && <p className="max-w-md text-lg text-ink/80">{item.explanation}</p>}
    </div>
  );
}

function PlayRunner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initRef = useRef(false);
  const respondedRef = useRef(false);
  const blockEndedRef = useRef(false);
  const usedBankIdsRef = useRef<string[]>([]);

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [levelCfg, setLevelCfg] = useState<LevelConfig | null>(null);
  const [partCfg, setPartCfg] = useState<PartConfig | null>(null);
  // The part's blocks resolved against her profile once per part-start (see
  // adaptPart) — includes any repeat blocks a remedial level appends for a
  // weak genre. blockIndex indexes into this, not into partCfg.blocks.
  const [resolvedBlocks, setResolvedBlocks] = useState<ResolvedBlock[]>([]);
  const [blockIndex, setBlockIndex] = useState(0);
  const [session, setSession] = useState<SessionRecord | null>(null);

  const [stair, setStair] = useState<StairState | null>(null);
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  const [itemIdx, setItemIdx] = useState(0);
  // `startedAtMs` (performance.now()) is used to compute each item's elapsed
  // `ms` for its ItemRecord. `startedAtEpoch` (Date.now()) is the *separate*
  // timestamp base Countdown compares itself against internally (it does
  // `Date.now() - startedAt`), so it must never be fed a performance.now()
  // value (that reads as an already-huge elapsed time and fires instantly).
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [startedAtEpoch, setStartedAtEpoch] = useState<number | null>(null);
  const [blockStartMs, setBlockStartMs] = useState<number | null>(null);
  const [blockStartedAtIso, setBlockStartedAtIso] = useState<string | null>(null);
  const [records, setRecords] = useState<ItemRecord[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  // "reveal" feedback only: her own response to re-render alongside the
  // answer, and whether it scored full points (picks the "Yes!" vs.
  // answer-reveal screen — see feedbackDelay and the render below).
  const [lastResponse, setLastResponse] = useState<unknown>(null);
  const [fullScore, setFullScore] = useState(false);
  // True when the item just answered was a missed teaching item (see
  // ResolvedBlock.teachingItems) — forces the answer-reveal screen for this
  // one "between" pause even on a level whose own feedback is "none".
  const [teachingReveal, setTeachingReveal] = useState(false);

  // Stable across every render so views whose mount effect lists `onReady`
  // as a dependency (ChoiceView, ArithmeticView, PictureSpanView) never
  // re-fire it just because the parent re-rendered.
  const handleReady = useCallback(() => {
    setStartedAtMs(performance.now());
    setStartedAtEpoch(Date.now());
  }, []);

  // ---- Resolve where to start: URL params, else currentPosition; ?replay=1
  // starts a fresh session even if the part is already complete. ----
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // This effect reads browser-only state (localStorage sessions, the URL,
    // navigator/window) that isn't available during SSR and can't be derived
    // during render. Guarded by initRef so it runs exactly once; the several
    // setState calls below are one coherent initialization, not a per-render
    // synchronization, so the lint rule's general "avoid setState in effects"
    // guidance doesn't apply here.
    /* eslint-disable react-hooks/set-state-in-effect */
    void flushOutbox();

    const sessions = loadSessions();
    const replay = searchParams.get("replay") === "1";
    const levelParam = searchParams.get("level");
    const partParam = searchParams.get("part");

    let level: number;
    let part: string;
    if (levelParam !== null && partParam !== null) {
      level = Number(levelParam);
      part = partParam;
    } else {
      const pos = currentPosition(RELEASED_LEVELS, sessions);
      level = pos.level;
      part = pos.part;
    }

    const levelCfgFound = LEVELS.find((l) => l.id === level);
    const partCfgFound = levelCfgFound?.parts.find((p) => p.id === part);
    if (!levelCfgFound || !partCfgFound) {
      router.replace("/");
      return;
    }

    const partSessions = sessions.filter((s) => s.level === level && s.part === part);
    const hasComplete = partSessions.some((s) => s.complete);
    if (hasComplete && !replay) {
      router.replace("/");
      return;
    }

    // Resolved once per part-start (fresh again on a reload or a replay):
    // her profile drives each block's actual start/reps, and a remedial
    // level can append repeat blocks for a weak genre. See adaptPart.
    const blocksForPart = adaptPart(partCfgFound, levelCfgFound, computeProfile(sessions));

    const device = { ua: navigator.userAgent, w: window.innerWidth, h: window.innerHeight };
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

    let activeSession: SessionRecord;
    let startBlockIndex: number;

    if (replay) {
      activeSession = { id: ulid(), level, part, startedAt: new Date().toISOString(), device, blocks: [], complete: false, appVersion };
      startBlockIndex = 0;
    } else {
      const incomplete = partSessions.filter((s) => !s.complete);
      const latest = incomplete.length ? incomplete.reduce((a, b) => (a.startedAt > b.startedAt ? a : b)) : null;
      if (latest) {
        activeSession = latest;
        startBlockIndex = latest.blocks.length;
      } else {
        activeSession = { id: ulid(), level, part, startedAt: new Date().toISOString(), device, blocks: [], complete: false, appVersion };
        startBlockIndex = 0;
      }
    }

    setLevelCfg(levelCfgFound);
    setPartCfg(partCfgFound);
    setResolvedBlocks(blocksForPart);
    setSession(activeSession);
    setBlockIndex(startBlockIndex);

    if (startBlockIndex >= blocksForPart.length) {
      // Defensive: every block already recorded but the session was never
      // flagged complete (shouldn't normally happen). Finish it now.
      const endedAtIso = activeSession.endedAt ?? new Date().toISOString();
      const doneSession: SessionRecord = { ...activeSession, complete: true, endedAt: endedAtIso };
      saveSessionLocal(doneSession);
      enqueue(doneSession);
      void flushOutbox();
      setSession(doneSession);
      setPhase("done");
    } else {
      setPhase("sample");
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginBlockItems() {
    const cfg = resolvedBlocks[blockIndex];
    if (!cfg) return;
    const genre = GENRES[cfg.genre];

    usedBankIdsRef.current = [];
    respondedRef.current = false;
    blockEndedRef.current = false;
    setRecords([]);
    setLastCorrect(null);
    setLastResponse(null);
    setFullScore(false);
    setTeachingReveal(false);
    setBlockStartedAtIso(new Date().toISOString());

    const newSeed = randomSeed();
    setSeed(newSeed);

    if (genre.mode === "staircase") {
      const st = startStair(cfg.start, cfg.maxItems, cfg.teachingItems);
      setStair(st);
      setItem(genre.generate(newSeed, st.d, { excludeBankIds: [] }));
      setBlockStartMs(null);
    } else {
      setStair(null);
      setItem(genre.generate(newSeed, 1));
      setBlockStartMs(Date.now());
    }
    setStartedAtMs(null);
    setStartedAtEpoch(null);
    setItemIdx((i) => i + 1);
    setPhase("item");
  }

  function generateNextItem(d: number) {
    const cfg = resolvedBlocks[blockIndex];
    if (!cfg) return;
    const genre = GENRES[cfg.genre];
    const newSeed = randomSeed();
    respondedRef.current = false;
    setSeed(newSeed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem(genre.generate(newSeed, d as any, { excludeBankIds: usedBankIdsRef.current }));
    setStartedAtMs(null);
    setStartedAtEpoch(null);
    setItemIdx((i) => i + 1);
    setPhase("item");
  }

  function endBlock(finalRecords: ItemRecord[]) {
    const cfg = resolvedBlocks[blockIndex];
    if (blockEndedRef.current || !cfg || !session) return;
    blockEndedRef.current = true;

    const genre = GENRES[cfg.genre];
    const endedAtIso = new Date().toISOString();
    const blockRecord: BlockRecord = {
      genre: cfg.genre,
      mode: genre.mode,
      startedAt: blockStartedAtIso ?? endedAtIso,
      endedAt: endedAtIso,
      items: finalRecords,
      summary: summarize(finalRecords, genre.mode),
    };

    const isLastBlock = blockIndex + 1 >= resolvedBlocks.length;
    const updated: SessionRecord = {
      ...session,
      blocks: [...session.blocks, blockRecord],
      ...(isLastBlock ? { complete: true, endedAt: endedAtIso } : {}),
    };

    setSession(updated);
    saveSessionLocal(updated);
    enqueue(updated);
    void flushOutbox();

    if (isLastBlock) {
      setPhase("done");
    } else {
      setBlockIndex((b) => b + 1);
      setPhase("sample");
    }
  }

  function finishItem(response: unknown, timedOut: boolean, meta?: { replayed?: boolean; audioFallback?: boolean }) {
    const cfg = resolvedBlocks[blockIndex];
    if (respondedRef.current || blockEndedRef.current || !cfg || !levelCfg) return;
    respondedRef.current = true;

    const genre = GENRES[cfg.genre];
    const ms = startedAtMs !== null ? performance.now() - startedAtMs : 0;
    const finalScore = genre.score(item, timedOut ? null : response);
    const scoredFull = finalScore.points >= finalScore.max;

    let fast: boolean | undefined;
    if (genre.timing.kind === "item") {
      const cap = genre.timing.ms(stair!.d) * (cfg.timeScale ?? 1);
      fast = ms < cap * 0.5;
    }
    const bankId: string | undefined = genre.bankId?.(item);

    // Teaching items (ResolvedBlock.teachingItems / lib/engine/staircase.ts):
    // the first `cfg.teachingItems` items of a staircase block reveal the
    // answer if missed, like the real test's teaching items — independent of
    // the level's own `feedback` (Level 1 is otherwise "none").
    const isTeachingMiss = genre.mode === "staircase" && records.length < cfg.teachingItems && (timedOut || !scoredFull);

    const record: ItemRecord = {
      idx: records.length,
      seed,
      d: stair ? stair.d : 1,
      points: finalScore.points,
      max: finalScore.max,
      correct: finalScore.correct,
      ms,
      timedOut,
      response: timedOut ? null : response ?? null,
    };
    if (bankId !== undefined) record.bankId = bankId;
    if (fast !== undefined) record.fast = fast;
    if (meta?.replayed !== undefined) record.replayed = meta.replayed;
    if (meta?.audioFallback !== undefined) record.audioFallback = meta.audioFallback;
    if (isTeachingMiss) record.teaching = true;

    const newRecords = [...records, record];
    setRecords(newRecords);
    if (bankId) usedBankIdsRef.current = [...usedBankIdsRef.current, bankId];

    if (genre.mode === "speedBlock") {
      generateNextItem(1);
      return;
    }

    const newStair = stepStair(stair!, finalScore.correct);
    setStair(newStair);
    setLastCorrect(finalScore.correct);
    setLastResponse(timedOut ? null : (response ?? null));
    setFullScore(scoredFull);
    setTeachingReveal(isTeachingMiss);
    setPhase("between");

    const delay = feedbackDelay(levelCfg.feedback, scoredFull, isTeachingMiss);
    window.setTimeout(() => {
      if (newStair.done) endBlock(newRecords);
      else generateNextItem(newStair.d);
    }, delay);
  }

  // Not memoized: none of the views read `onRespond` inside an effect
  // dependency array (only `onReady` needs a stable identity, see above), so
  // a plain closure recreated every render is simplest and always current.
  function handleRespond(r: unknown, meta?: { replayed?: boolean; audioFallback?: boolean }) {
    finishItem(r, false, meta);
  }

  if (!ready || phase === "loading" || !levelCfg || !partCfg) {
    return <div className="flex flex-1 bg-cream" />;
  }

  if (phase === "done") {
    const minutes = session ? minutesBetween(session.startedAt, session.endedAt) : 0;
    return (
      <PartDone part={partCfg} minutes={minutes} synced={syncState() === "synced"} onHome={() => router.push("/")} />
    );
  }

  const cfg = resolvedBlocks[blockIndex];
  if (!cfg) {
    return <div className="flex flex-1 bg-cream" />;
  }
  const genre = GENRES[cfg.genre];
  const View = VIEWS[cfg.genre];

  if (phase === "sample") {
    return <SampleScreen genre={genre} View={View} onStart={beginBlockItems} />;
  }

  return (
    <div className="flex flex-1 flex-col bg-cream">
      <div className="flex items-center justify-between gap-4 px-4 pt-4">
        <span className="font-bubble text-lg text-ink/70">{partCfg.title}</span>
        {genre.mode === "staircase" && <ProgressDots total={cfg.maxItems} filled={records.length} />}
        <span aria-hidden className="w-0" />
      </div>

      {genre.timing.kind === "block" && (
        <div className="px-4 pt-2">
          <Countdown totalMs={genre.timing.ms} startedAt={blockStartMs} onExpire={() => endBlock(records)} />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center">
        {phase === "item" ? (
          <>
            {genre.timing.kind === "item" && (
              <div className="w-full max-w-md px-4 pb-2">
                <Countdown
                  totalMs={genre.timing.ms(stair!.d) * (cfg.timeScale ?? 1)}
                  startedAt={startedAtEpoch}
                  onExpire={() => finishItem(null, true)}
                />
              </div>
            )}
            <View
              key={`${blockIndex}-${itemIdx}`}
              item={item}
              disabled={false}
              display={cfg.display}
              onReady={handleReady}
              onRespond={handleRespond}
            />
          </>
        ) : levelCfg.feedback === "reveal" ? (
          fullScore ? (
            <FullScoreScreen />
          ) : (
            <RevealAnswerScreen View={View} item={item} lastResponse={lastResponse} />
          )
        ) : teachingReveal ? (
          // A missed teaching item on a level whose own feedback is "none"
          // (Level 1): still show the answer, just this once.
          <RevealAnswerScreen View={View} item={item} lastResponse={lastResponse} />
        ) : (
          <BetweenScreen feedback={levelCfg.feedback} lastCorrect={lastCorrect} />
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 bg-cream" />}>
      <PlayRunner />
    </Suspense>
  );
}
