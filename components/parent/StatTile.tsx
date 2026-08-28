"use client";

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[84px] flex-1 flex-col items-center gap-0.5 rounded-2xl bg-white/60 px-3 py-2 text-center">
      <span className="font-bubble text-xl text-teal-600">{value}</span>
      <span className="text-[11px] leading-tight text-ink/60">{label}</span>
    </div>
  );
}

export default StatTile;
