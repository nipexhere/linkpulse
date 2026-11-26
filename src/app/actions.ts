"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { countRecentLinksByIp, deleteLink, insertLink, type Creator } from "@/lib/links";
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, createSessionToken, verifySessionToken } from "@/lib/session";
import { generateSlug, normalizeUrl, validateSlug } from "@/lib/validate";
import { RATE_LIMIT, ensureOwnerId, getIpHash, getOwnerId } from "@/lib/visitor";

export type FormState = { error?: string; created?: string } | undefined;

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) return { error: "Wrong password." };

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Only follow same-site paths so the login form can't be used as an open redirect.
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

// Anyone can create links. Visitors are rate limited per IP and their links are tied
// to an anonymous browser cookie; links created by the signed-in admin have no owner.
export async function createLink(_state: FormState, formData: FormData): Promise<FormState> {
  const url = normalizeUrl(String(formData.get("url") ?? ""));
  if (!url.ok) return { error: url.error };

  const customSlug = String(formData.get("slug") ?? "").trim();
  const slug = customSlug ? validateSlug(customSlug) : null;
  if (slug && !slug.ok) return { error: slug.error };

  let creator: Creator = { ownerId: null, ipHash: null };
  if (!(await isAdmin())) {
    const ipHash = await getIpHash();
    if ((await countRecentLinksByIp(ipHash, RATE_LIMIT.windowMinutes)) >= RATE_LIMIT.links) {
      return { error: `You've made ${RATE_LIMIT.links} links in the last hour. Try again a little later.` };
    }
    creator = { ownerId: await ensureOwnerId(), ipHash };
  }

  if (slug) {
    if ((await insertLink(slug.value, url.value, creator)) === "taken") {
      return { error: `"${slug.value}" is already in use. Pick another.` };
    }
    refresh();
    return { created: slug.value };
  }

  // Random slugs rarely collide, but retry a few times just in case.
  for (let attempt = 0; attempt < 5; attempt++) {
    const random = generateSlug();
    if ((await insertLink(random, url.value, creator)) === "ok") {
      refresh();
      return { created: random };
    }
  }
  return { error: "Couldn't generate a free short code. Try again." };
}

// The admin can delete any link; visitors can delete only links their browser created.
export async function removeLink(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  if (await isAdmin()) {
    await deleteLink(id);
  } else {
    const ownerId = await getOwnerId();
    if (ownerId) await deleteLink(id, ownerId);
  }
  refresh();
}
