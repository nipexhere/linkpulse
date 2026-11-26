// Pure helpers shared by server actions, the redirect handler and tests.

export const RESERVED_SLUGS = new Set(["admin", "api", "dashboard", "login", "logout", "s", "_next", "favicon.ico"]);

const SLUG_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
const SLUG_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function normalizeUrl(input: string): Result<string> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter a URL to shorten." };

  // Accept "example.com/page" by assuming https.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Only http and https links can be shortened." };
  }
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    return { ok: false, error: "The URL needs a full domain, like example.com." };
  }
  return { ok: true, value: url.toString() };
}

export function validateSlug(input: string): Result<string> {
  const slug = input.trim();
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, error: "Use 3–32 letters, numbers, dashes or underscores." };
  }
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return { ok: false, error: `"${slug}" is reserved. Pick another.` };
  }
  return { ok: true, value: slug };
}

export function generateSlug(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => SLUG_ALPHABET[byte % SLUG_ALPHABET.length]).join("");
}

export function referrerHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

// Anonymous visitor IDs are 128-bit random hex strings stored in a cookie.
export function isOwnerId(value: string | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
}

// The visitor's IP: the first entry of x-forwarded-for (set by Vercel), else x-real-ip.
export function clientIp(forwardedFor: string | null, realIp: string | null): string {
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || realIp?.trim() || "unknown";
}
