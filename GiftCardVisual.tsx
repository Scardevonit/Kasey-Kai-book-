"use client";

import { getDesign } from "@/lib/constants";

export default function GiftCardVisual({
  design,
  amountCents,
  recipientName,
  orderCode,
  compact = false,
}: {
  design: string;
  amountCents: number;
  recipientName?: string;
  orderCode?: string;
  compact?: boolean;
}) {
  const d = getDesign(design);
  const dollars = (amountCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return (
    <div
      className={`card-shine relative w-full overflow-hidden rounded-3xl border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,.5)] ${compact ? "p-5" : "p-7 sm:p-8"}`}
      style={{ background: d.cardBg, minHeight: compact ? 190 : 250 }}
    >
      {/* decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/25 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">Kasey Kai</p>
          <p className="font-display text-2xl italic leading-none text-white drop-shadow">Gift Boutique</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur">{d.emoji}</div>
      </div>

      <div className={`relative ${compact ? "mt-4" : "mt-7"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Gift Value</p>
        <p className={`font-display font-bold text-white drop-shadow-lg ${compact ? "text-4xl" : "text-5xl sm:text-6xl"}`}>{dollars}</p>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-[0.2em] text-white/70">For</p>
          <p className="truncate text-sm font-semibold text-white">{recipientName?.trim() || "Someone Special"}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{orderCode ? "Gift Code" : "Design"}</p>
          <p className="font-mono text-sm font-bold tracking-widest text-white">{orderCode || d.name}</p>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2 border-t border-white/20 pt-3">
        <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-gradient-to-br from-yellow-200 to-yellow-500 text-[10px] font-black text-black">KK</span>
        <p className="text-[11px] font-medium tracking-wide text-white/85">●●●● Private • Only Kasey Kai can view full details</p>
      </div>
    </div>
  );
}
