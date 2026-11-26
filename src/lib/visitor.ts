// Anonymous visitor identity for public link creation: no accounts, just a random ID
// in an httpOnly cookie so each browser can list and delete the links it made.
import { createHmac, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { clientIp, isOwnerId } from "./validate";

export const OWNER_COOKIE = "linkpulse_owner";
const OWNER_MAX_AGE = 60 * 60 * 24 * 365 * 2; // two years, in seconds

// Rate limit for public link creation.
export const RATE_LIMIT = { links: 10, windowMinutes: 60 };

// Read-only: safe to call while rendering a Server Component.
export async function getOwnerId(): Promise<string | null> {
  const value = (await cookies()).get(OWNER_COOKIE)?.value;
  return isOwnerId(value) ? value : null;
}

// Returns the visitor's ID, creating the cookie if needed. Server Actions only.
export async function ensureOwnerId(): Promise<string> {
  const existing = await getOwnerId();
  if (existing) return existing;
  const id = randomBytes(16).toString("hex");
  (await cookies()).set(OWNER_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_MAX_AGE,
  });
  return id;
}

// A keyed hash of the visitor's IP, so raw IP addresses are never stored.
export async function getIpHash(): Promise<string> {
  const list = await headers();
  const ip = clientIp(list.get("x-forwarded-for"), list.get("x-real-ip"));
  const key = process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "linkpulse";
  return createHmac("sha256", key).update(`ip:${ip}`).digest("hex").slice(0, 32);
}
