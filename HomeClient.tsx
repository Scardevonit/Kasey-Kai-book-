"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Gift,
  Lock,
  ShieldCheck,
  Crown,
  Heart,
  CreditCard,
  Smartphone,
  Zap,
  CalendarHeart,
  Copy,
  Check,
  ChevronRight,
  BadgeCheck,
  EyeOff,
  Mail,
  Link2,
  Clock,
  Star,
  Menu,
  X,
} from "lucide-react";
import GiftCardVisual from "./GiftCardVisual";
import { GIFT_AMOUNTS, GIFT_DESIGNS, BOOKING_SERVICES } from "@/lib/constants";

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}
function moneyFull(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function HomeClient() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // ---- gift shop state ----
  const [design, setDesign] = useState<string>("gold");
  const [amount, setAmount] = useState<number>(150);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [giftError, setGiftError] = useState("");
  const [giftSuccess, setGiftSuccess] = useState<{ code: string; link: string; total: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaserPhone, setPurchaserPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [message, setMessage] = useState("Thinking of you — enjoy a private luxury experience with Kasey Kai. 💋");
  const [deliveryMethod, setDeliveryMethod] = useState("private_link");
  const [scheduledDate, setScheduledDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [altPay, setAltPay] = useState("");

  const effectiveAmountCents = useMemo(() => {
    if (customAmount) {
      const v = Math.round(parseFloat(customAmount) * 100);
      if (!isNaN(v) && v >= 1000) return v;
    }
    return amount * 100;
  }, [amount, customAmount]);

  const totalCents = effectiveAmountCents * quantity;

  // ---- booking state ----
  const [bName, setBName] = useState("");
  const [bEmail, setBEmail] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bService, setBService] = useState(BOOKING_SERVICES[0].name);
  const [bDate, setBDate] = useState("");
  const [bTime, setBTime] = useState("");
  const [bNotes, setBNotes] = useState("");
  const [bSubmitting, setBSubmitting] = useState(false);
  const [bError, setBError] = useState("");
  const [bSuccess, setBSuccess] = useState<{ code: string; service: string; date: string; time: string } | null>(null);

  // ---- track ----
  const [trackCode, setTrackCode] = useState("");
  const [trackResult, setTrackResult] = useState<null | { error?: string; gift?: { orderCode: string; design: string; amountCents: number; recipientName: string; message: string; giftStatus: string } }>(null);
  const [tracking, setTracking] = useState(false);

  async function submitGift() {
    setGiftError("");
    if (!purchaserName.trim() || !purchaserEmail.trim() || !recipientName.trim()) {
      setGiftError("Please add your name, your email, and the recipient's name.");
      setStep(2);
      return;
    }
    if (paymentMethod === "card") {
      if (cardNumber.replace(/\D/g, "").length < 12 || !cardExp || cardCvc.length < 3 || !cardName.trim()) {
        setGiftError("Please complete your card details (number, expiry, CVC, name). This is a secure gift checkout.");
        return;
      }
    } else if (!altPay.trim()) {
      setGiftError(`Please add your ${paymentMethod === "cashapp" ? "Cash App tag" : paymentMethod === "zelle" ? "Zelle name / number" : "payment handle"} so Kasey can verify payment.`);
      return;
    }
    setSubmitting(true);
    try {
      const last4 = cardNumber.replace(/\D/g, "").slice(-4);
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design,
          amountCents: effectiveAmountCents,
          quantity,
          purchaserName,
          purchaserEmail,
          purchaserPhone,
          recipientName,
          recipientEmail,
          recipientPhone,
          message,
          deliveryMethod,
          scheduledDate,
          paymentMethod,
          cardLast4: last4,
          paymentRef: paymentMethod === "card" ? `card ****${last4}` : `${paymentMethod}:${altPay}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setGiftSuccess({ code: data.order.orderCode, link: `${window.location.origin}/gift/${data.order.orderCode}`, total: data.order.totalCents });
      window.scrollTo({ top: document.getElementById("gift-success")?.offsetTop ? (document.getElementById("gift-success")!.offsetTop - 100) : 0, behavior: "smooth" });
    } catch (e: unknown) {
      setGiftError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitBooking() {
    setBError("");
    if (!bName.trim() || !bEmail.trim() || !bDate || !bTime) {
      setBError("Please complete name, email, date and time.");
      return;
    }
    setBSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: bName,
          clientEmail: bEmail,
          clientPhone: bPhone,
          service: bService,
          preferredDate: bDate,
          preferredTime: bTime,
          notes: bNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setBSuccess({ code: data.booking.bookingCode, service: data.booking.service, date: data.booking.preferredDate, time: data.booking.preferredTime });
    } catch (e: unknown) {
      setBError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBSubmitting(false);
    }
  }

  async function trackGift() {
    if (!trackCode.trim()) return;
    setTracking(true);
    setTrackResult(null);
    try {
      const res = await fetch(`/api/gifts/track?code=${encodeURIComponent(trackCode.trim())}`);
      const data = await res.json();
      if (!res.ok) setTrackResult({ error: data.error || "Not found" });
      else setTrackResult({ gift: data.gift });
    } catch {
      setTrackResult({ error: "Could not look up gift." });
    } finally {
      setTracking(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0d070d] text-[#fff7f2]">
      {/* announcement */}
      <div className="relative z-50 bg-gradient-to-r from-[#ff4d8d] via-[#b3123a] to-[#d4af37] px-4 py-2 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-white">
        <span className="mr-2 inline-block animate-sparkle">✦</span> Official Kasey Kai Gift Boutique — Private • Secure • Only Kasey Kai <span className="ml-2 inline-block animate-sparkle">✦</span>
      </div>

      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d070d]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d8d] to-[#7a1e4a] text-xl shadow-lg">👑</span>
            <span className="leading-none">
              <span className="block font-display text-[26px] font-bold tracking-wide">KASEY <span className="gold-text">KAI</span></span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.32em] text-white/60">Gift Boutique</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/80 lg:flex">
            <a href="#gifts" className="transition hover:text-white">Gift Cards</a>
            <a href="#send" className="transition hover:text-white">Send a Gift</a>
            <a href="#private" className="transition hover:text-white">Private</a>
            <a href="#track" className="transition hover:text-white">Track Gift</a>
            <a href="/admin" className="inline-flex items-center gap-1.5 text-white/50 transition hover:text-white"><Lock className="h-3.5 w-3.5" /> Owner</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <a href="#send" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/5">
              <Gift className="h-4 w-4 text-[#ff8fb8]" /> Buy Gift
            </a>
            <a href="#book" className="animate-glowpulse inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#ff7ab0] px-6 py-2.5 text-sm font-extrabold text-white">
              <CalendarHeart className="h-4 w-4" /> Book Kasey Kai Today
            </a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-xl border border-white/15 p-2.5 lg:hidden" aria-label="menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#140b14] px-4 py-4 lg:hidden">
            <div className="grid gap-2 text-sm font-bold">
              <a href="#gifts" onClick={() => setMobileOpen(false)} className="rounded-xl bg-white/5 px-4 py-3">Gift Cards</a>
              <a href="#send" onClick={() => setMobileOpen(false)} className="rounded-xl bg-white/5 px-4 py-3">Send a Gift</a>
              <a href="#book" onClick={() => setMobileOpen(false)} className="rounded-xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-4 py-3 text-white">Book Kasey Kai Today</a>
              <a href="#track" onClick={() => setMobileOpen(false)} className="rounded-xl bg-white/5 px-4 py-3">Track Gift</a>
              <a href="/admin" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/10 px-4 py-3 text-white/60">🔒 Owner Login</a>
            </div>
          </div>
        )}
      </header>

      {/* hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[#ff4d8d]/25 blur-[120px]" />
          <div className="absolute right-[-80px] top-[220px] h-[420px] w-[420px] rounded-full bg-[#d4af37]/18 blur-[120px]" />
          <div className="absolute left-1/2 top-[480px] h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#6d4aa3]/20 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:26px_26px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-20">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live</span>
              Only Kasey Kai • No other names listed
            </div>
            <h1 className="mt-6 font-display text-[clamp(2.8rem,6vw,5.2rem)] font-bold leading-[0.95]">
              Purchase & Send <span className="italic text-[#ff8fb8]">Luxury Gifts</span> in One <span className="gold-text italic">Private Place.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/70">
              Welcome to the official <strong className="text-white">Kasey Kai gift card boutique</strong>. Clients can buy a gift card and send it instantly — discreetly, securely, and privately. <strong className="text-white">Only Kasey Kai can see full order details.</strong>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#send" className="animate-glowpulse inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] via-[#e7548a] to-[#b3123a] px-8 py-4 text-[15px] font-extrabold text-white">
                <Gift className="h-5 w-5" /> Shop & Send Gift Cards
              </a>
              <a href="#book" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-b from-white/10 to-white/[0.02] px-8 py-4 text-[15px] font-extrabold text-[#f7e7a3]">
                <Crown className="h-5 w-5" /> Book Kasey Kai Today
              </a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure Checkout", sub: "Discreet billing" },
                { icon: EyeOff, label: "100% Private", sub: "Only Kasey sees it" },
                { icon: Zap, label: "Instant Send", sub: "Private gift link" },
              ].map((b) => (
                <div key={b.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center backdrop-blur sm:p-4">
                  <b.icon className="mx-auto h-5 w-5 text-[#ff8fb8]" />
                  <p className="mt-2 text-[12px] font-extrabold sm:text-[13px]">{b.label}</p>
                  <p className="text-[11px] text-white/50">{b.sub}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">
              <Lock className="h-3.5 w-3.5" /> Payments included only for the gift card boutique — no public directory, no other ladies.
            </p>
          </div>

          <div className="relative">
            <div className="animate-floaty">
              <GiftCardVisual design={design} amountCents={effectiveAmountCents} recipientName={recipientName || "Someone Special"} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {GIFT_DESIGNS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDesign(d.id)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold transition ${design === d.id ? "border-[#ff4d8d] bg-[#ff4d8d]/15 text-white" : "border-white/12 bg-white/5 text-white/60 hover:text-white"}`}
                >
                  <span>{d.emoji}</span> {d.name}
                </button>
              ))}
            </div>
            <div className="glass mt-4 flex items-center justify-between rounded-2xl px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Today&apos;s private offer</p>
                <p className="font-display text-xl italic">Every $250+ gift gets a personal thank-you message 💋</p>
              </div>
              <div className="flex items-center gap-1 text-[#f7e7a3]">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* marquee */}
      <div className="overflow-hidden border-y border-white/10 bg-gradient-to-r from-[#1a0d1a] via-[#2b0f1c] to-[#1a0d1a] py-3.5">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap pr-8 text-[13px] font-extrabold uppercase tracking-[0.24em] text-white/80">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-8">
              <span>✦ Book Kasey Kai Today</span><span className="text-[#ff8fb8]">✦ Luxury Gift Cards</span><span className="gold-text">✦ Private & Discreet</span><span>✦ Instant Delivery</span><span className="text-[#ff8fb8]">✦ Only Kasey Kai</span><span className="gold-text">✦ Secure Payment</span>
            </div>
          ))}
        </div>
      </div>

      {/* gift shop */}
      <section id="gifts" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ff4d8d]/30 bg-[#ff4d8d]/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff8fb8]"><Gift className="h-3.5 w-3.5" /> Step 1 — Choose your gift</p>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">The Gift Card <span className="italic text-[#ff8fb8]">Collection</span></h2>
            <p className="mt-3 max-w-2xl text-white/60">Pick a value, pick a design, add your message. Payment is built right in — checkout and send without leaving this page.</p>
          </div>
          <div className="glass rounded-2xl px-5 py-3 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Your gift total</p>
            <p className="font-display text-3xl font-bold">{moneyFull(totalCents)} <span className="text-sm font-body font-semibold text-white/50">× {quantity}</span></p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-7">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/60">Select amount</p>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {GIFT_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`rounded-2xl border px-2 py-4 text-center font-display text-xl font-bold transition ${!customAmount && amount === a ? "border-[#ff4d8d] bg-gradient-to-b from-[#ff4d8d] to-[#b3123a] text-white shadow-lg" : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:text-white"}`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-white/40">$</span>
                  <input value={customAmount} onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Custom amount (min $10)" inputMode="decimal" className="w-full rounded-2xl border border-white/12 bg-[#140b14] py-3.5 pl-9 pr-4 font-bold outline-none placeholder:font-medium placeholder:text-white/30 focus:border-[#ff4d8d]" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-[#140b14] px-4 py-2.5">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-white/50">Qty</span>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 font-black hover:bg-white/20">−</button>
                  <span className="w-6 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 font-black hover:bg-white/20">+</button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/60">Select design — tap to preview</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {GIFT_DESIGNS.map((d) => (
                  <button key={d.id} onClick={() => setDesign(d.id)} className={`group overflow-hidden rounded-2xl border-2 text-left transition ${design === d.id ? "border-[#ff4d8d] shadow-[0_0_30px_rgba(255,77,141,.35)]" : "border-white/10 hover:border-white/25"}`}>
                    <div className="p-4" style={{ background: d.cardBg }}>
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-bold italic text-white">Kasey Kai</p>
                        <span className="text-xl">{d.emoji}</span>
                      </div>
                      <p className="mt-3 font-display text-3xl font-bold text-white">{money(effectiveAmountCents)}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">●●●● {d.name}</p>
                    </div>
                    <div className="flex items-center justify-between bg-[#140b14] px-4 py-3">
                      <div>
                        <p className="text-sm font-extrabold">{d.name}</p>
                        <p className="text-[12px] text-white/50">{d.tagline}</p>
                      </div>
                      {design === d.id ? <span className="inline-flex items-center gap-1 rounded-full bg-[#ff4d8d] px-3 py-1 text-[11px] font-black uppercase"><Check className="h-3 w-3" /> Selected</span> : <ChevronRight className="h-4 w-4 text-white/40" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-[92px] lg:self-start">
            <GiftCardVisual design={design} amountCents={effectiveAmountCents} recipientName={recipientName || "Someone Special"} />
            <div className="mt-4 rounded-3xl border border-[#d4af37]/25 bg-gradient-to-b from-[#d4af37]/12 to-transparent p-5">
              <div className="flex items-center gap-2 text-[#f7e7a3]"><Crown className="h-4 w-4" /><p className="text-[12px] font-extrabold uppercase tracking-[0.2em]">Kasey&apos;s promise</p></div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Every gift is handled personally by Kasey Kai. No assistants, no public lists, no other names — just one private boutique.</p>
              <a href="#send" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#f7e7a3] px-5 py-3 text-sm font-black text-black transition hover:bg-white">Continue to Send <ChevronRight className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* send / checkout */}
      <section id="send" className="relative border-y border-white/10 bg-gradient-to-b from-[#160b16] to-[#0d070d] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#f7e7a3]"><Zap className="h-3.5 w-3.5" /> Step 2 & 3 — Send + Pay in one place</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold sm:text-5xl">Send Your Gift <span className="gold-text italic">& Checkout Securely</span></h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/60">Fill in sender + recipient, write a sweet message, and pay — all on this same page. You&apos;ll get a private gift link instantly.</p>
          </div>

          {/* stepper */}
          <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 sm:gap-3">
            {[
              { n: 1, label: "Gift" },
              { n: 2, label: "Sender & Recipient" },
              { n: 3, label: "Payment" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => !giftSuccess && setStep(s.n)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-extrabold uppercase tracking-wider transition ${step === s.n ? "border-[#ff4d8d] bg-[#ff4d8d] text-white" : step > s.n ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200" : "border-white/12 bg-white/5 text-white/50"}`}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-[11px]">{step > s.n ? "✓" : s.n}</span> {s.label}
                </button>
                {i < 2 && <span className="hidden h-px w-8 bg-white/15 sm:block" />}
              </div>
            ))}
          </div>

          <div id="gift-success" className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-3xl border border-white/10 bg-[#140b14]/80 p-6 backdrop-blur sm:p-8">
              {giftSuccess ? (
                <div className="py-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-3xl">🎉</div>
                  <h3 className="mt-4 font-display text-3xl font-bold">Gift Sent & Paid! 💖</h3>
                  <p className="mx-auto mt-2 max-w-md text-white/60">Your {moneyFull(giftSuccess.total)} gift for <strong className="text-white">{recipientName}</strong> is ready. Share this private link — and don&apos;t worry, full details stay visible to <strong className="text-white">Kasey Kai only</strong>.</p>
                  <div className="mx-auto mt-5 max-w-md rounded-2xl border border-emerald-400/25 bg-emerald-400/8 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">Private gift link</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-emerald-200">{giftSuccess.link}</p>
                    <p className="mt-1 font-mono text-[12px] tracking-[0.2em] text-white/50">CODE: {giftSuccess.code}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(giftSuccess.link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black hover:bg-emerald-100"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy Link"}
                      </button>
                      <a href={giftSuccess.link} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-black hover:bg-white/5">View Gift</a>
                    </div>
                  </div>
                  <div className="mx-auto mt-4 flex max-w-md gap-2">
                    <button onClick={() => { setGiftSuccess(null); setStep(1); }} className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/70 hover:text-white">Send another gift</button>
                    <a href="#book" className="flex-1 rounded-xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-4 py-3 text-center text-sm font-black">Book Kasey Kai Today</a>
                  </div>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <div>
                      <h3 className="font-display text-2xl font-bold">Confirm your gift</h3>
                      <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
                        <div className="flex justify-between"><span className="text-white/55">Design</span><strong>{GIFT_DESIGNS.find((d) => d.id === design)?.name}</strong></div>
                        <div className="flex justify-between"><span className="text-white/55">Value each</span><strong>{moneyFull(effectiveAmountCents)}</strong></div>
                        <div className="flex justify-between"><span className="text-white/55">Quantity</span><strong>× {quantity}</strong></div>
                        <div className="flex justify-between border-t border-white/10 pt-3 text-base"><span className="text-white/55">Total due today</span><strong className="font-display text-2xl">{moneyFull(totalCents)}</strong></div>
                      </div>
                      <label className="mt-5 block text-[12px] font-extrabold uppercase tracking-[0.18em] text-white/60">How should Kasey deliver it?</label>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {[
                          { id: "private_link", icon: Link2, title: "Private Link", desc: "You share it yourself" },
                          { id: "email_now", icon: Mail, title: "Email Now", desc: "Kasey emails recipient" },
                          { id: "scheduled", icon: Clock, title: "Scheduled", desc: "Pick a date" },
                        ].map((o) => (
                          <button key={o.id} onClick={() => setDeliveryMethod(o.id)} className={`rounded-2xl border p-4 text-left transition ${deliveryMethod === o.id ? "border-[#ff4d8d] bg-[#ff4d8d]/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                            <o.icon className={`h-5 w-5 ${deliveryMethod === o.id ? "text-[#ff8fb8]" : "text-white/40"}`} />
                            <p className="mt-2 text-sm font-extrabold">{o.title}</p>
                            <p className="text-[12px] text-white/50">{o.desc}</p>
                          </button>
                        ))}
                      </div>
                      {deliveryMethod === "scheduled" && (
                        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="mt-3 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none focus:border-[#ff4d8d]" />
                      )}
                      <button onClick={() => setStep(2)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-6 py-4 font-extrabold">Continue <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="font-display text-2xl font-bold">Who&apos;s it from & to?</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white/45"><EyeOff className="h-3.5 w-3.5" /> Only Kasey Kai can see sender details</p>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#f7e7a3]">From — Purchaser (you)</div>
                        <input value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} placeholder="Your full name *" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                        <input value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} placeholder="Your email *" type="email" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                        <input value={purchaserPhone} onChange={(e) => setPurchaserPhone(e.target.value)} placeholder="Your phone (optional)" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d] sm:col-span-2" />
                        <div className="sm:col-span-2 rounded-2xl border border-[#ff4d8d]/20 bg-[#ff4d8d]/5 px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#ff8fb8]">To — Recipient</div>
                        <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient name *" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                        <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Recipient email (for email delivery)" type="email" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                        <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="Recipient phone (optional)" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d] sm:col-span-2" />
                        <div className="sm:col-span-2">
                          <label className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-white/60">Gift message 💌</label>
                          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={500} placeholder="Write something sweet..." className="mt-2 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-medium outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                          <p className="mt-1 text-right text-[11px] text-white/35">{message.length}/500</p>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button onClick={() => setStep(1)} className="rounded-2xl border border-white/15 px-6 py-4 font-bold text-white/70 hover:text-white">Back</button>
                        <button onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-6 py-4 font-extrabold">Continue to Payment <ChevronRight className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="font-display text-2xl font-bold">Secure gift payment</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-white/50"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Encrypted checkout • Discreet statement as &quot;KK Boutique&quot; • Gift cards only</p>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { id: "card", icon: CreditCard, label: "Card" },
                          { id: "cashapp", icon: Smartphone, label: "Cash App" },
                          { id: "zelle", icon: Zap, label: "Zelle" },
                          { id: "applepay", icon: Heart, label: "Apple Pay" },
                        ].map((m) => (
                          <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-[13px] font-extrabold transition ${paymentMethod === m.id ? "border-[#ff4d8d] bg-[#ff4d8d]/15 text-white" : "border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>
                            <m.icon className="h-4 w-4" /> {m.label}
                          </button>
                        ))}
                      </div>

                      {paymentMethod === "card" ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card *" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d] sm:col-span-2" />
                          <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, "").slice(0, 19))} placeholder="Card number  •••• •••• •••• ••••" inputMode="numeric" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-mono font-bold tracking-wider outline-none placeholder:font-body placeholder:font-medium placeholder:text-white/30 focus:border-[#ff4d8d] sm:col-span-2" />
                          <input value={cardExp} onChange={(e) => setCardExp(e.target.value.slice(0, 7))} placeholder="MM / YY" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                          <input value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVC" inputMode="numeric" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <p className="text-sm font-bold">Pay with {paymentMethod === "cashapp" ? "Cash App" : paymentMethod === "zelle" ? "Zelle" : "Apple Pay"}</p>
                          <p className="mt-1 text-[13px] text-white/55">Complete your {moneyFull(totalCents)} payment to <strong className="text-white">$KaseyKaiBoutique</strong>, then add your tag below so Kasey can verify instantly. Your gift activates right after.</p>
                          <input value={altPay} onChange={(e) => setAltPay(e.target.value)} placeholder={paymentMethod === "cashapp" ? "$your-cashtag *" : "Your name / phone / confirmation *"} className="mt-3 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                        </div>
                      )}

                      {giftError && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{giftError}</p>}

                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                        <div className="flex justify-between text-white/60"><span>{moneyFull(effectiveAmountCents)} × {quantity} — {recipientName || "Recipient"}</span><span>{moneyFull(totalCents)}</span></div>
                        <div className="flex justify-between text-white/60"><span>Delivery</span><span className="font-bold text-emerald-300">FREE • Instant</span></div>
                        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-black"><span>Total</span><span>{moneyFull(totalCents)}</span></div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button onClick={() => setStep(2)} className="rounded-2xl border border-white/15 px-6 py-4 font-bold text-white/70 hover:text-white">Back</button>
                        <button onClick={submitGift} disabled={submitting} className="animate-glowpulse flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-6 py-4 font-black disabled:opacity-60">
                          <Lock className="h-4 w-4" /> {submitting ? "Processing..." : `Pay ${moneyFull(totalCents)} & Send Gift`}
                        </button>
                      </div>
                      <p className="mt-3 text-center text-[11px] text-white/40">By paying you agree gifts are redeemable with Kasey Kai only. Non-refundable, transferable with code.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              <GiftCardVisual design={design} amountCents={effectiveAmountCents} recipientName={recipientName || "Someone Special"} compact />
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm">
                <p className="flex items-center gap-2 font-extrabold"><BadgeCheck className="h-4 w-4 text-emerald-300" /> What happens next?</p>
                <ol className="mt-3 space-y-2.5 text-white/65">
                  <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4d8d]/20 text-[11px] font-black text-[#ff8fb8]">1</span> Payment confirms instantly & gift activates.</li>
                  <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4d8d]/20 text-[11px] font-black text-[#ff8fb8]">2</span> You get a private gift link + code to share.</li>
                  <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4d8d]/20 text-[11px] font-black text-[#ff8fb8]">3</span> Only Kasey Kai sees the full private inbox.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* private promise */}
      <section id="private" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#ff4d8d]/12 to-transparent p-7">
            <EyeOff className="h-8 w-8 text-[#ff8fb8]" />
            <h3 className="mt-4 font-display text-2xl font-bold">Only Kasey Can See It</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">Sender names, messages and payments go to a locked owner inbox. No public feed, no shared lists — ever.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#d4af37]/12 to-transparent p-7">
            <Crown className="h-8 w-8 text-[#f7e7a3]" />
            <h3 className="mt-4 font-display text-2xl font-bold">Only One Name Listed</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">This boutique lists <strong className="text-white">Kasey Kai only</strong>. All other names removed. One button: <strong className="text-white">Book Kasey Kai Today</strong>.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-400/10 to-transparent p-7">
            <ShieldCheck className="h-8 w-8 text-emerald-300" />
            <h3 className="mt-4 font-display text-2xl font-bold">Gift Payments Built-In</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">Card, Cash App, Zelle & Apple Pay — checkout lives inside the gift flow. No separate payment site needed.</p>
          </div>
        </div>
      </section>

      {/* booking */}
      <section id="book" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-b from-[#1d0d1d] via-[#120812] to-[#0d070d] py-16 lg:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-[#ff4d8d]/15 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ff4d8d]/30 bg-[#ff4d8d]/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff8fb8]"><Crown className="h-3.5 w-3.5" /> Exclusive booking</p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.02]">Book <span className="italic text-[#ff8fb8]">Kasey Kai</span> Today</h2>
            <p className="mt-4 max-w-lg text-white/60">The <em>only</em> name on this site. Choose your experience, pick a time, and Kasey will personally confirm. Gift cards can be applied to any booking.</p>
            <div className="mt-6 space-y-3">
              {BOOKING_SERVICES.slice(0, 4).map((s) => (
                <button key={s.id} onClick={() => { setBService(s.name); document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${bService === s.name ? "border-[#ff4d8d] bg-[#ff4d8d]/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                  <div>
                    <p className="text-sm font-extrabold">{s.name}</p>
                    <p className="text-[12px] text-white/50">{s.duration} • {s.price}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] font-semibold text-white/55">
              <Sparkles className="h-4 w-4 text-[#f7e7a3]" /> Have a gift card? Add the code in notes — Kasey will apply it.
            </div>
          </div>

          <div id="booking-form" className="rounded-[28px] border border-white/12 bg-[#140b14]/90 p-6 shadow-2xl backdrop-blur sm:p-8">
            {bSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4d8d] to-[#b3123a] text-3xl">💋</div>
                <h3 className="mt-4 font-display text-3xl font-bold">Request Received!</h3>
                <p className="mx-auto mt-2 max-w-sm text-white/60">Thank you — Kasey Kai will personally confirm your <strong className="text-white">{bSuccess.service}</strong> for <strong className="text-white">{bSuccess.date} at {bSuccess.time}</strong>.</p>
                <p className="mx-auto mt-4 inline-block rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-5 py-3 font-mono text-sm font-black tracking-[0.2em] text-[#f7e7a3]">CODE: {bSuccess.code}</p>
                <p className="mt-3 text-[12px] text-white/45">Keep this code — it&apos;s your private confirmation. Only Kasey can see your details.</p>
                <button onClick={() => setBSuccess(null)} className="mt-5 rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-white/70 hover:text-white">Make another request</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold">Request your time</h3>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-200">● Available</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="Your name *" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                  <input value={bEmail} onChange={(e) => setBEmail(e.target.value)} placeholder="Email *" type="email" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d]" />
                  <input value={bPhone} onChange={(e) => setBPhone(e.target.value)} placeholder="Phone (optional)" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-semibold outline-none placeholder:text-white/30 focus:border-[#ff4d8d] sm:col-span-2" />
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/50">Experience with Kasey Kai</label>
                    <select value={bService} onChange={(e) => setBService(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-bold outline-none focus:border-[#ff4d8d]">
                      {BOOKING_SERVICES.map((s) => <option key={s.id} value={s.name}>{s.name} — {s.duration} — {s.price}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/50">Preferred date *</label>
                    <input type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-bold outline-none focus:border-[#ff4d8d]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/50">Preferred time *</label>
                    <select value={bTime} onChange={(e) => setBTime(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-bold outline-none focus:border-[#ff4d8d]">
                      <option value="">Select time</option>
                      {["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <textarea value={bNotes} onChange={(e) => setBNotes(e.target.value)} rows={3} placeholder="Notes for Kasey (gift code, preferences, occasion...) — private, only Kasey sees this" className="rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-medium outline-none placeholder:text-white/30 focus:border-[#ff4d8d] sm:col-span-2" />
                </div>
                {bError && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{bError}</p>}
                <button onClick={submitBooking} disabled={bSubmitting} className="animate-glowpulse mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-6 py-4 font-black disabled:opacity-60">
                  <CalendarHeart className="h-5 w-5" /> {bSubmitting ? "Sending..." : "Book Kasey Kai Today"}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40"><Lock className="h-3 w-3" /> Private request — only Kasey Kai receives it. No other ladies listed.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* track + faq */}
      <section id="track" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <h3 className="font-display text-3xl font-bold">Received a gift? <span className="italic text-[#ff8fb8]">View it here</span></h3>
            <p className="mt-2 text-sm text-white/55">Enter your private gift code (example: KKG-XXXXXX) to see your gift value and message.</p>
            <div className="mt-4 flex gap-2">
              <input value={trackCode} onChange={(e) => setTrackCode(e.target.value.toUpperCase())} placeholder="KKG-XXXXXX" className="flex-1 rounded-2xl border border-white/12 bg-[#0d070d] px-4 py-3.5 font-mono font-black tracking-[0.18em] outline-none placeholder:text-white/25 focus:border-[#ff4d8d]" />
              <button onClick={trackGift} disabled={tracking} className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-black hover:bg-[#ff8fb8] hover:text-white disabled:opacity-60">{tracking ? "..." : "View"}</button>
            </div>
            {trackResult?.error && <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{trackResult.error}</p>}
            {trackResult?.gift && (
              <div className="mt-4">
                <GiftCardVisual design={trackResult.gift.design} amountCents={trackResult.gift.amountCents} recipientName={trackResult.gift.recipientName} orderCode={trackResult.gift.orderCode} compact />
                {trackResult.gift.message && <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-display text-lg italic text-white/85">&ldquo;{trackResult.gift.message}&rdquo;</p>}
                <a href={`/gift/${trackResult.gift.orderCode}`} className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-5 py-3 text-sm font-black">Open Full Gift Page</a>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <h3 className="font-display text-3xl font-bold">Questions, <span className="gold-text italic">answered</span></h3>
            <div className="mt-4 space-y-3 text-sm">
              {[
                { q: "Is payment really on this same site?", a: "Yes — checkout is built into the gift flow above. Pay by card, Cash App, Zelle or Apple Pay and your gift activates instantly." },
                { q: "Who can see my gift or booking?", a: "Only Kasey Kai. Sender details, messages and payments go to a locked owner-only inbox. Recipients only see their own gift page." },
                { q: "Are there other ladies listed?", a: "No. This site lists Kasey Kai only — every other name has been removed. One boutique, one button: Book Kasey Kai Today." },
                { q: "How does the recipient get the gift?", a: "You get a private link + code instantly. Share it yourself, or choose Email/Scheduled and Kasey will deliver it privately." },
                { q: "How do I redeem a gift?", a: "Book Kasey Kai Today and add your gift code in the notes. Kasey verifies it in her private inbox and applies the value." },
              ].map((f) => (
                <details key={f.q} className="group rounded-2xl border border-white/10 bg-[#0d070d]/60 px-5 py-4">
                  <summary className="cursor-pointer font-extrabold text-white/90 marker:hidden">{f.q}</summary>
                  <p className="mt-2 leading-relaxed text-white/60">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/10 bg-[#080408] px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <p className="font-display text-3xl font-bold">KASEY <span className="gold-text">KAI</span></p>
            <p className="mt-2 max-w-sm text-sm text-white/50">The private gift card boutique + exclusive booking page for Kasey Kai. Purchase, send and pay in one discreet place.</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/55"><EyeOff className="h-3.5 w-3.5" /> Only Kasey Kai can see private details</p>
          </div>
          <div className="text-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/40">Boutique</p>
            <div className="mt-3 grid gap-2 font-semibold text-white/70">
              <a href="#gifts" className="hover:text-white">Gift Cards</a>
              <a href="#send" className="hover:text-white">Send a Gift + Pay</a>
              <a href="#track" className="hover:text-white">Track / View Gift</a>
              <a href="#book" className="font-black text-[#ff8fb8] hover:text-white">Book Kasey Kai Today</a>
            </div>
          </div>
          <div className="text-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/40">Private</p>
            <div className="mt-3 grid gap-2 font-semibold text-white/70">
              <a href="/admin" className="hover:text-white">🔒 Owner Inbox Login</a>
              <p className="text-white/40">Discreet billing as &quot;KK Boutique&quot;</p>
              <p className="text-white/40">Gifts valid 12 months</p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-[12px] text-white/35">© {new Date().getFullYear()} Kasey Kai Gift Boutique • Kasey Kai only • All gifts & bookings are private.</p>
      </footer>

      {/* floating book */}
      <a href="#book" className="animate-glowpulse fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#b3123a] px-5 py-3 text-[13px] font-black shadow-2xl">
        <Heart className="h-4 w-4 fill-current" /> Book Kasey Kai Today
      </a>
    </div>
  );
}
