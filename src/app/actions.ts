"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteLink, insertLink } from "@/lib/links";
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, createSessionToken, verifySessionToken } from "@/lib/session";
import { generateSlug, normalizeUrl, validateSlug } from "@/lib/validate";

export type FormState = { error?: string; created?: string } | undefined;

async function requireSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/login");
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
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function createLink(_state: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const url = normalizeUrl(String(formData.get("url") ?? ""));
  if (!url.ok) return { error: url.error };

  const customSlug = String(formData.get("slug") ?? "").trim();
  if (customSlug) {
    const slug = validateSlug(customSlug);
    if (!slug.ok) return { error: slug.error };
    if ((await insertLink(slug.value, url.value)) === "taken") {
      return { error: `"${slug.value}" is already in use.` };
    }
    refresh();
    return { created: slug.value };
  }

  // Random slugs rarely collide, but retry a few times just in case.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    if ((await insertLink(slug, url.value)) === "ok") {
      refresh();
      return { created: slug };
    }
  }
  return { error: "Couldn't generate a free short code. Try again." };
}

export async function removeLink(formData: FormData) {
  await requireSession();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await deleteLink(id);
  refresh();
}
