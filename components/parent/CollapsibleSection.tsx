"use client";

import { useEffect, useRef, useState } from "react";

// QoL (2026-08-28 glass revamp, per Jalal's playbook — "short sections,
// expandable at will" with remembered state): a plain <details> so it's
// keyboard/accessible for free, styled as a glass panel, with open/closed
// persisted in localStorage per storageKey so a parent's preference sticks
// across visits instead of resetting every load.
export function CollapsibleSection({
  title,
  subtitle,
  storageKey,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  storageKey: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`pd-collapse:${storageKey}`);
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount, same pattern as app/parent/page.tsx's key restore */
      if (stored !== null) setOpen(stored === "1");
    } catch {
      // localStorage unavailable — keep the default
    }
    hydrated.current = true;
  }, [storageKey]);

  return (
    <details
      className="pd-glass pd-details p-5"
      open={open}
      onToggle={(e) => {
        const next = (e.target as HTMLDetailsElement).open;
        setOpen(next);
        if (hydrated.current) {
          try {
            localStorage.setItem(`pd-collapse:${storageKey}`, next ? "1" : "0");
          } catch {
            // ignore
          }
        }
      }}
    >
      <summary className="flex items-center gap-2">
        <span className="pd-chevron text-white/40">▸</span>
        <span className="text-sm font-bold text-white/90">{title}</span>
        {subtitle && <span className="text-xs text-white/40">{subtitle}</span>}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export default CollapsibleSection;
