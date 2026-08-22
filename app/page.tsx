"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RELEASED_LEVELS as LEVELS } from "@/lib/levels";
import { loadSessions, currentPosition, syncState, flushOutbox, fetchServerState, mergeSessions } from "@/lib/engine/storage";
import type { LevelConfig, SessionRecord } from "@/lib/engine/types";
import { BigButton } from "@/components/BigButton";

function isPartComplete(sessions: SessionRecord[], level: number, part: string): boolean {
  return sessions.some((s) => s.level === level && s.part === part && s.complete);
}

function allComplete(sessions: SessionRecord[]): boolean {
  return LEVELS.every((l) => l.parts.every((p) => isPartComplete(sessions, l.id, p.id)));
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [levelCfg, setLevelCfg] = useState<LevelConfig | null>(null);
  const [earned, setEarned] = useState<Record<string, boolean>>({});
  const [synced, setSynced] = useState(true);
  // True once we've asked the server and it did NOT answer in time — the
  // page is running on local storage alone. See AGENTS.md §2/§5: the server
  // is the source of truth for position; local is a mirror/offline fallback.
  const [serverOffline, setServerOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void flushOutbox().then(async () => {
      if (cancelled) return;
      const local = loadSessions();
      const state = await fetchServerState();
      if (cancelled) return;
      const sessions = state ? mergeSessions(local, state.completed) : local;
      const pos = currentPosition(LEVELS, sessions);
      const cfg = LEVELS.find((l) => l.id === pos.level) ?? null;
      const earnedMap: Record<string, boolean> = {};
      if (cfg) {
        for (const p of cfg.parts) earnedMap[p.id] = isPartComplete(sessions, cfg.id, p.id);
      }
      setFinished(allComplete(sessions));
      setLevelCfg(cfg);
      setEarned(earnedMap);
      setSynced(syncState() === "synced");
      setServerOffline(!state);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <main className="flex flex-1 bg-cream" />;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream p-8 text-center">
      <h1 className="font-bubble text-5xl text-ink">Aoife Puzzles</h1>

      {finished ? (
        <p className="max-w-md text-xl text-ink">You finished everything! More puzzles are coming.</p>
      ) : (
        <>
          {levelCfg && <p className="font-bubble text-2xl text-ink">{levelCfg.title}</p>}

          <BigButton onClick={() => router.push("/play")} tone="teal">
            Play
          </BigButton>

          {levelCfg && (
            <div className="flex gap-4">
              {levelCfg.parts.map((p) => (
                <div
                  key={p.id}
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl text-4xl transition ${
                    earned[p.id] ? "bg-white shadow-lg" : "bg-white/60 opacity-50 grayscale"
                  }`}
                  aria-label={`${p.title}: ${earned[p.id] ? "earned" : "not earned yet"}`}
                >
                  {p.sticker}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-1">
        <span className="text-2xl" aria-label={synced ? "Saved" : "Will save when back online"}>
          {synced ? "☁️" : "⏳"}
        </span>
        {serverOffline && (
          <span className="text-xs text-ink/50" aria-label="Couldn't reach the server; showing what's saved on this device">
            offline
          </span>
        )}
      </div>
    </main>
  );
}
