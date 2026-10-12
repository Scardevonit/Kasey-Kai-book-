import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "kk_admin_session";

export function getAdminPasscode() {
  return process.env.ADMIN_PASSCODE || "kasey-kai-2026";
}

function getSalt() {
  return process.env.ADMIN_SESSION_SALT || "kasey-kai-salt-private-2026";
}

export function buildSessionToken() {
  const pass = getAdminPasscode();
  return createHmac("sha256", getSalt()).update(`kasey-kai:${pass}`).digest("hex");
}

export function verifyToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = buildSessionToken();
  try {
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminServer(): Promise<boolean> {
  try {
    const store = await cookies();
    const v = store.get(ADMIN_COOKIE)?.value;
    return verifyToken(v);
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  const v = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyToken(v);
}

export function generateOrderCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  // use crypto random
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 6; i++) s += chars[bytes[i] % chars.length];
  return `${prefix}-${s}`;
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
