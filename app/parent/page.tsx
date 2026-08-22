"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Profile } from "@/lib/engine/profile";
import type { SessionRecord } from "@/lib/engine/types";
import { LEVELS } from "@/lib/levels";
import { classifyGenres } from "@/lib/engine/adapt";
import { ParentTable } from "@/components/ParentTable";

const KEY_STORAGE = "aoife-puzzles:parent-key";

function isProfileShape(v: unknown): v is Profile {
  return !!v && typeof v === "object" && "domains" in v && "genres" in v && "bundles" in v;
}

function durationLabel(s: SessionRecord): string {
  if (!s.endedAt) return "—";
  const mins = Math.max(0, Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60_000));
  return `${mins} min`;
}

export default function ParentPage() {
  const [key, setKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // First visit: read whatever key was already entered, if any. localStorage
  // isn't available during SSR, so this can only happen after mount.
  useEffect(() => {
    const stored = localStorage.getItem(KEY_STORAGE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setKey(stored);
  }, []);

  // Fetches /api/profile and /api/sessions whenever the key changes. This is
  // the standard "fetch data in an effect" pattern (React's own docs use
  // setState this way for loading/error/result), not a per-render sync.
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    // (the setState calls inside the async callback below run after fetch
    // resolves, which is the rule's own sanctioned pattern, not a
    // synchronous effect-body call, so they don't need the disable.)

    (async () => {
      try {
        const [profileRes, sessionsRes] = await Promise.all([
          fetch("/api/profile", { headers: { "x-parent-key": key } }),
          fetch("/api/sessions", { headers: { "x-parent-key": key } }),
        ]);

        if (profileRes.status === 401 || sessionsRes.status === 401) {
          if (cancelled) return;
          localStorage.removeItem(KEY_STORAGE);
          setKey(null);
          setProfile(null);
          setSessions([]);
          setError("That key did not work. Try again.");
          setLoading(false);
          return;
        }

        const profileJson: unknown = await profileRes.json();
        const sessionsJson: unknown = await sessionsRes.json();
        if (cancelled) return;

        setProfile(isProfileShape(profileJson) ? profileJson : null);
        setSessions(Array.isArray(sessionsJson) ? (sessionsJson as SessionRecord[]) : []);
        if (!isProfileShape(profileJson)) {
          setError("No data available yet.");
        }
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Could not reach the server. Try again.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  function submitKey(e: FormEvent) {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    localStorage.setItem(KEY_STORAGE, trimmed);
    setKeyInput("");
    setKey(trimmed);
  }

  function copyJson() {
    if (!profile) return;
    void navigator.clipboard.writeText(JSON.stringify(profile, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!key) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-cream p-8 text-center">
        <h1 className="font-bubble text-3xl text-ink">Parent Page</h1>
        {error && <p className="text-rose-500">{error}</p>}
        <form onSubmit={submitKey} className="flex flex-col items-center gap-4">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Parent key"
            autoFocus
            className="min-h-[64px] w-64 rounded-2xl border-4 border-teal-100 px-4 text-lg text-ink"
          />
          <button
            type="submit"
            className="min-h-[64px] rounded-full bg-teal-400 px-10 text-xl font-bubble text-white disabled:opacity-40"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-cream">
        <p className="text-ink">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 bg-cream p-6">
      <h1 className="font-bubble text-3xl text-ink">Parent Page</h1>
      {error && <p className="text-rose-500">{error}</p>}

      {profile ? (
        <ParentTable profile={profile} strengths={classifyGenres(profile)} />
      ) : (
        <p className="text-ink/70">No profile data yet — play a part first.</p>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 className="font-bubble text-2xl text-ink">Sessions</h2>
          <button
            type="button"
            onClick={copyJson}
            disabled={!profile}
            className="min-h-[48px] rounded-full bg-teal-100 px-4 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm text-ink">
            <thead>
              <tr className="border-b border-teal-100">
                <th className="py-2 pr-4 font-semibold">Date</th>
                <th className="py-2 pr-4 font-semibold">Level</th>
                <th className="py-2 pr-4 font-semibold">Part</th>
                <th className="py-2 pr-4 font-semibold">Duration</th>
                <th className="py-2 font-semibold">Complete</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td className="py-3 text-ink/60" colSpan={5}>
                    No sessions yet.
                  </td>
                </tr>
              )}
              {[...sessions]
                .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
                .map((s) => (
                  <tr key={s.id} className="border-b border-teal-50">
                    <td className="py-2 pr-4">{new Date(s.startedAt).toLocaleString()}</td>
                    <td className="py-2 pr-4">{s.level}</td>
                    <td className="py-2 pr-4">{s.part}</td>
                    <td className="py-2 pr-4">{durationLabel(s)}</td>
                    <td className="py-2">{s.complete ? "Yes" : "No"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-bubble text-2xl text-ink">Replay a part</h2>
        <div className="flex flex-wrap gap-3">
          {LEVELS.flatMap((level) =>
            level.parts.map((part) => (
              <a
                key={`${level.id}-${part.id}`}
                href={`/play?level=${level.id}&part=${part.id}&replay=1`}
                className="min-h-[48px] rounded-full bg-teal-100 px-4 py-3 text-sm font-semibold text-ink"
              >
                {part.sticker} Level {level.id} · {part.title}
              </a>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
