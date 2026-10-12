"use client";

import { useEffect, useState } from "react";
import { Lock, Gift, CalendarHeart, DollarSign, Eye, LogOut, RefreshCw, Search, Copy, Check } from "lucide-react";
import GiftCardVisual from "./GiftCardVisual";

type GiftRow = {
  id: string;
  orderCode: string;
  design: string;
  amountCents: number;
  quantity: number;
  totalCents: number;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string | null;
  recipientName: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  message: string | null;
  deliveryMethod: string;
  scheduledDate: string | null;
  paymentMethod: string;
  paymentRef: string | null;
  paymentStatus: string;
  giftStatus: string;
  createdAt: string;
};

type BookingRow = {
  id: string;
  bookingCode: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

function money(c: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);
}

export default function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ revenueCents: number; totalGifts: number; activeGifts: number; totalBookings: number; newBookings: number } | null>(null);
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [daily, setDaily] = useState<{ day: string; total: number }[]>([]);
  const [tab, setTab] = useState<"overview" | "gifts" | "bookings">("overview");
  const [query, setQuery] = useState("");
  const [selectedGift, setSelectedGift] = useState<GiftRow | null>(null);
  const [copied, setCopied] = useState("");

  async function checkMe() {
    const r = await fetch("/api/admin/me");
    const d = await r.json();
    setAuthed(!!d.authed);
  }

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/data");
      const d = await r.json();
      if (!r.ok) {
        setAuthed(false);
        return;
      }
      setStats(d.stats);
      setGifts(d.gifts);
      setBookings(d.bookings);
      setDaily(d.daily ?? []);
      setAuthed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkMe();
  }, []);

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function login() {
    setLoginError("");
    setLoggingIn(true);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Login failed");
      setAuthed(true);
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setPasscode("");
  }

  async function updateStatus(kind: "gift" | "booking", id: string, status: string) {
    const r = await fetch("/api/admin/update", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, status }) });
    if (r.ok) {
      if (kind === "gift") setGifts((g) => g.map((x) => (x.id === id ? { ...x, giftStatus: status } : x)));
      else setBookings((b) => b.map((x) => (x.id === id ? { ...x, status } : x)));
      if (selectedGift && selectedGift.id === id && kind === "gift") setSelectedGift({ ...selectedGift, giftStatus: status });
    }
  }

  const filteredGifts = gifts.filter((g) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [g.orderCode, g.purchaserName, g.purchaserEmail, g.recipientName, g.recipientEmail ?? "", g.paymentRef ?? ""].join(" ").toLowerCase().includes(q);
  });
  const filteredBookings = bookings.filter((b) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [b.bookingCode, b.clientName, b.clientEmail, b.service, b.preferredDate].join(" ").toLowerCase().includes(q);
  });

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0d070d] p-6">
        <p className="text-white/50">Checking owner session...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0d070d] px-4">
        <div className="pointer-events-none absolute -left-24 top-10 h-[380px] w-[380px] rounded-full bg-[#ff4d8d]/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-60px] bottom-10 h-[380px] w-[380px] rounded-full bg-[#d4af37]/15 blur-[120px]" />
        <div className="relative w-full max-w-md rounded-[28px] border border-white/12 bg-[#140b14]/90 p-8 shadow-2xl backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d8d] to-[#7a1e4a] text-2xl">🔒</div>
          <h1 className="mt-4 text-center font-display text-3xl font-bold">Owner Inbox Only</h1>
          <p className="mt-2 text-center text-sm text-white/55">Hi Kasey 💋 — this private dashboard shows every gift purchase, message, payment & booking. Clients can never see this page.</p>
          <label className="mt-6 block text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/50">Owner passcode</label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Enter your private passcode"
            className="mt-2 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-bold outline-none placeholder:text-white/25 focus:border-[#ff4d8d]"
          />
          {loginError && <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200">{loginError}</p>}
          <button onClick={login} disabled={loggingIn} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-6 py-4 font-black disabled:opacity-60">
            <Lock className="h-4 w-4" /> {loggingIn ? "Unlocking..." : "Unlock Private Inbox"}
          </button>
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center text-[12px] text-white/45">
            Default passcode is <span className="font-mono font-bold text-white/70">kasey-kai-2026</span> — change it anytime by setting <span className="font-mono">ADMIN_PASSCODE</span> in your environment.
          </p>
          <a href="/" className="mt-4 block text-center text-sm font-bold text-white/50 hover:text-white">← Back to boutique</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d070d] text-[#fff7f2]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d8d] to-[#7a1e4a]">👑</span>
            <div className="leading-none">
              <p className="font-display text-xl font-bold">Kasey Kai <span className="gold-text">• Owner</span></p>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Private inbox</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 px-3.5 py-2 text-[13px] font-bold text-white/70 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <a href="/" className="hidden rounded-xl border border-white/12 px-3.5 py-2 text-[13px] font-bold text-white/70 hover:text-white sm:block">View Boutique</a>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-[13px] font-bold hover:bg-white/15">
              <LogOut className="h-4 w-4" /> Lock
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "gifts", label: `Gift Inbox (${gifts.length})`, icon: Gift },
            { id: "bookings", label: `Bookings (${bookings.length})`, icon: CalendarHeart },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-extrabold transition ${tab === t.id ? "border-[#ff4d8d] bg-[#ff4d8d] text-white" : "border-white/12 bg-white/5 text-white/60 hover:text-white"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <div className="relative ml-auto hidden min-w-[240px] sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search codes, names, emails..." className="w-full rounded-full border border-white/12 bg-white/5 py-2 pl-9 pr-4 text-[13px] font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative mb-4 sm:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search codes, names, emails..." className="w-full rounded-2xl border border-white/12 bg-white/5 py-3 pl-9 pr-4 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
        </div>

        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: DollarSign, label: "Gift Revenue", value: money(stats.revenueCents), sub: `${stats.totalGifts} gifts sold`, pink: true },
                { icon: Gift, label: "Active Gifts", value: String(stats.activeGifts), sub: "awaiting redemption", pink: false },
                { icon: CalendarHeart, label: "New Bookings", value: String(stats.newBookings), sub: `${stats.totalBookings} total requests`, pink: false },
                { icon: Eye, label: "Privacy", value: "Locked", sub: "Only you can see this", pink: false },
              ].map((s) => (
                <div key={s.label} className={`rounded-3xl border p-6 ${s.pink ? "border-[#ff4d8d]/30 bg-gradient-to-b from-[#ff4d8d]/15 to-transparent" : "border-white/10 bg-white/[0.03]"}`}>
                  <s.icon className={`h-6 w-6 ${s.pink ? "text-[#ff8fb8]" : "text-white/60"}`} />
                  <p className="mt-3 font-display text-4xl font-bold">{s.value}</p>
                  <p className="text-sm font-extrabold">{s.label}</p>
                  <p className="text-[12px] text-white/45">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/50">Recent revenue</p>
                {daily.length === 0 ? (
                  <p className="mt-4 text-sm text-white/45">No sales yet — share your boutique link to get your first gift order. 💖</p>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {daily.map((d) => {
                      const max = Math.max(...daily.map((x) => x.total), 1);
                      return (
                        <div key={d.day} className="flex items-center gap-3 text-sm">
                          <span className="w-16 shrink-0 font-bold text-white/60">{d.day}</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#d4af37]" style={{ width: `${Math.max(6, (d.total / max) * 100)}%` }} />
                          </div>
                          <span className="w-20 text-right font-black">{money(d.total)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/50">Latest activity</p>
                <div className="mt-4 space-y-3 text-sm">
                  {[...gifts.slice(0, 3).map((g) => ({ t: `💝 ${money(g.totalCents)} gift from ${g.purchaserName} → ${g.recipientName} (${g.orderCode})`, d: new Date(g.createdAt).toLocaleString() })),
                    ...bookings.slice(0, 3).map((b) => ({ t: `📅 ${b.clientName} requested ${b.service} — ${b.preferredDate} ${b.preferredTime}`, d: new Date(b.createdAt).toLocaleString() }))].slice(0, 5).map((a, i) => (
                    <div key={i} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="font-semibold">{a.t}</p>
                      <p className="text-[12px] text-white/40">{a.d}</p>
                    </div>
                  ))}
                  {gifts.length === 0 && bookings.length === 0 && <p className="text-white/45">Nothing yet — your private inbox is ready.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "gifts" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {filteredGifts.length === 0 && <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/45">No gift orders found.</p>}
              {filteredGifts.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGift(g)}
                  className={`w-full rounded-3xl border p-5 text-left transition ${selectedGift?.id === g.id ? "border-[#ff4d8d] bg-[#ff4d8d]/8" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black tracking-widest text-[#ff8fb8]">{g.orderCode}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${g.giftStatus === "active" ? "bg-emerald-400/15 text-emerald-200" : g.giftStatus === "redeemed" ? "bg-[#d4af37]/15 text-[#f7e7a3]" : g.giftStatus === "cancelled" ? "bg-red-500/15 text-red-200" : "bg-white/10 text-white/60"}`}>{g.giftStatus}</span>
                      <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/55">{g.paymentMethod} • {g.paymentRef}</span>
                    </div>
                    <span className="font-display text-2xl font-bold">{money(g.totalCents)}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{g.purchaserName} <span className="text-white/40">({g.purchaserEmail})</span> → <span className="text-[#f7e7a3]">{g.recipientName}</span></p>
                  {g.message && <p className="mt-1 truncate font-display text-[15px] italic text-white/55">&ldquo;{g.message}&rdquo;</p>}
                  <p className="mt-1.5 text-[12px] text-white/35">{new Date(g.createdAt).toLocaleString()} • {g.design} • {money(g.amountCents)} × {g.quantity} • via {g.deliveryMethod}{g.scheduledDate ? ` (${g.scheduledDate})` : ""}</p>
                </button>
              ))}
            </div>
            <div className="lg:sticky lg:top-[140px] lg:self-start">
              {selectedGift ? (
                <div className="rounded-3xl border border-white/12 bg-[#140b14] p-5">
                  <GiftCardVisual design={selectedGift.design} amountCents={selectedGift.amountCents} recipientName={selectedGift.recipientName} orderCode={selectedGift.orderCode} compact />
                  <div className="mt-4 space-y-2 text-[13px]">
                    <Detail label="Purchaser" value={`${selectedGift.purchaserName} — ${selectedGift.purchaserEmail}${selectedGift.purchaserPhone ? ` — ${selectedGift.purchaserPhone}` : ""}`} />
                    <Detail label="Recipient" value={`${selectedGift.recipientName}${selectedGift.recipientEmail ? ` — ${selectedGift.recipientEmail}` : ""}${selectedGift.recipientPhone ? ` — ${selectedGift.recipientPhone}` : ""}`} />
                    <Detail label="Payment" value={`${selectedGift.paymentMethod} • ${selectedGift.paymentRef} • ${selectedGift.paymentStatus}`} />
                    <Detail label="Delivery" value={`${selectedGift.deliveryMethod}${selectedGift.scheduledDate ? ` — ${selectedGift.scheduledDate}` : ""}`} />
                    {selectedGift.message && <Detail label="Message" value={`"${selectedGift.message}"`} />}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/gift/${selectedGift.orderCode}`); setCopied(selectedGift.id); setTimeout(() => setCopied(""), 1800); }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black hover:bg-white/85"
                  >
                    {copied === selectedGift.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === selectedGift.id ? "Copied!" : "Copy gift link"}
                  </button>
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {["active", "viewed", "redeemed", "cancelled"].map((s) => (
                      <button key={s} onClick={() => updateStatus("gift", selectedGift.id, s)} className={`rounded-lg border px-1 py-2 text-[10px] font-black uppercase tracking-wide ${selectedGift.giftStatus === s ? "border-[#ff4d8d] bg-[#ff4d8d] text-white" : "border-white/12 text-white/50 hover:text-white"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">Select a gift order to see full private details, payment ref & message.</div>
              )}
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="space-y-3">
            {filteredBookings.length === 0 && <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/45">No booking requests yet.</p>}
            {filteredBookings.map((b) => (
              <div key={b.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black tracking-widest text-[#f7e7a3]">{b.bookingCode}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${b.status === "new" ? "bg-[#ff4d8d]/20 text-[#ff8fb8]" : b.status === "confirmed" ? "bg-emerald-400/15 text-emerald-200" : b.status === "completed" ? "bg-[#d4af37]/15 text-[#f7e7a3]" : "bg-white/10 text-white/50"}`}>{b.status}</span>
                  </div>
                  <span className="text-sm font-black">📅 {b.preferredDate} • {b.preferredTime}</span>
                </div>
                <p className="mt-2 font-extrabold">{b.clientName} <span className="font-medium text-white/45">— {b.clientEmail}{b.clientPhone ? ` — ${b.clientPhone}` : ""}</span></p>
                <p className="mt-1 text-sm font-semibold text-[#ff8fb8]">{b.service}</p>
                {b.notes && <p className="mt-2 rounded-2xl border border-white/8 bg-black/25 p-3 text-sm italic text-white/65">&ldquo;{b.notes}&rdquo;</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {["new", "confirmed", "completed", "declined"].map((s) => (
                    <button key={s} onClick={() => updateStatus("booking", b.id, s)} className={`rounded-xl border px-4 py-2 text-[12px] font-black uppercase tracking-wider ${b.status === s ? "border-[#ff4d8d] bg-[#ff4d8d] text-white" : "border-white/12 text-white/50 hover:text-white"}`}>{s}</button>
                  ))}
                  <span className="ml-auto text-[12px] text-white/35">{new Date(b.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 px-3.5 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-0.5 break-words font-semibold text-white/85">{value}</p>
    </div>
  );
}
