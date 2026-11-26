// Signed, expiring session tokens for the single dashboard owner.
// Uses Web Crypto so the same code runs in proxy.ts and in server actions.

export const SESSION_COOKIE = "linkpulse_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // one week, in seconds

const encoder = new TextEncoder();

function secret(): string {
  const value = process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("Set ADMIN_PASSWORD (and ideally SESSION_SECRET) in the environment.");
  return value;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return btoa(String.fromCharCode(...signature)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_MAX_AGE * 1000);
  return `${expires}.${await sign(expires)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < now) return false;
  return safeEqual(signature, await sign(expires));
}

export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare signatures rather than raw strings so timing doesn't leak the password length.
  return safeEqual(await sign(`pw:${input}`), await sign(`pw:${expected}`));
}
