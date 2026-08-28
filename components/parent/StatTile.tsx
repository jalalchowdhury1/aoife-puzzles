"use client";

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="pd-glass flex min-w-[92px] flex-1 flex-col items-center gap-0.5 px-3 py-3 text-center">
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-[11px] leading-tight text-white/45">{label}</span>
    </div>
  );
}

export default StatTile;
