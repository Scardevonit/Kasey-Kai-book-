export const GIFT_DESIGNS = [
  {
    id: "blush",
    name: "Blush Romance",
    tagline: "Soft pink & pearl",
    gradient: "from-[#ff6fa5] via-[#ff8fb8] to-[#ffd1e3]",
    cardBg: "linear-gradient(135deg,#2b0f1c 0%,#7a1e4a 35%,#e7548a 65%,#ffb3cd 100%)",
    accent: "#ffd1e3",
    emoji: "💗",
  },
  {
    id: "gold",
    name: "Golden Luxe",
    tagline: "Black & 24k gold",
    gradient: "from-[#8a6a1f] via-[#d4af37] to-[#f7e7a3]",
    cardBg: "linear-gradient(135deg,#0c0a06 0%,#2a2110 30%,#8a6a1f 60%,#e9c767 85%,#f7e7a3 100%)",
    accent: "#f7e7a3",
    emoji: "👑",
  },
  {
    id: "noir",
    name: "Midnight Noir",
    tagline: "Private & mysterious",
    gradient: "from-[#0f0a14] via-[#2a1b3d] to-[#6d4aa3]",
    cardBg: "linear-gradient(135deg,#07040d 0%,#1a1030 40%,#3b2566 70%,#8b6fd8 100%)",
    accent: "#c4b5fd",
    emoji: "🌙",
  },
  {
    id: "cherry",
    name: "Cherry Glam",
    tagline: "Bold red velvet",
    gradient: "from-[#5c0a1e] via-[#b3123a] to-[#ff5d7e]",
    cardBg: "linear-gradient(135deg,#1a0208 0%,#5c0a1e 35%,#b3123a 65%,#ff5d7e 100%)",
    accent: "#fecdd3",
    emoji: "🍒",
  },
] as const;

export const GIFT_AMOUNTS = [50, 100, 150, 250, 500, 1000];

export const BOOKING_SERVICES = [
  { id: "signature", name: "Signature Experience with Kasey Kai", duration: "60 min", price: "From $150" },
  { id: "vip", name: "VIP Luxury Session with Kasey Kai", duration: "90 min", price: "From $250" },
  { id: "virtual", name: "Private Virtual Call with Kasey Kai", duration: "30 min", price: "From $75" },
  { id: "event", name: "Event / Appearance Booking", duration: "Custom", price: "Custom quote" },
  { id: "gift-redeem", name: "Redeem Gift Card Session", duration: "Per gift value", price: "Gift card" },
];

export type GiftDesignId = (typeof GIFT_DESIGNS)[number]["id"];

export function getDesign(id: string) {
  return GIFT_DESIGNS.find((d) => d.id === id) ?? GIFT_DESIGNS[0];
}
