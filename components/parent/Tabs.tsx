"use client";

export interface TabDef {
  id: string;
  label: string;
  emoji?: string;
}

/**
 * Sticky floating glass capsule nav for the parent dashboard. Horizontal-
 * scrolls on a narrow viewport instead of wrapping, so it stays one row.
 */
export function Tabs({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="sticky top-4 z-20 flex justify-center sm:justify-start">
      <div className="pd-glass flex w-fit max-w-full gap-1 overflow-x-auto p-1.5" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => onChange(t.id)}
            className={`pd-pill min-h-[38px] shrink-0 ${active === t.id ? "pd-pill-active" : "hover:text-white"}`}
          >
            {t.emoji ? `${t.emoji} ` : ""}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Tabs;
