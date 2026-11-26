"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createLink } from "@/app/actions";
import { CopyButton } from "./CopyButton";

const input =
  "w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25";

export function CreateLinkForm() {
  const [state, action, pending] = useActionState(createLink, undefined);
  const shortUrl = state?.created ? `${window.location.origin}/${state.created}` : null;

  return (
    <form action={action} className="rounded-xl border border-line bg-surface p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Destination URL</span>
          <input name="url" required placeholder="https://example.com/a/very/long/page" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Custom ending (optional)</span>
          <input name="slug" placeholder="my-link" className={input} />
        </label>
        <button
          disabled={pending}
          className="self-end rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Shortening…" : "Shorten"}
        </button>
      </div>
      <div aria-live="polite" className="text-sm">
        {state?.error && <p className="mt-3 text-red-600 dark:text-red-400">{state.error}</p>}
        {shortUrl && (
          <p className="mt-3 flex flex-wrap items-center gap-2">
            Your short link: <span className="font-mono font-medium text-accent">{shortUrl}</span>
            <CopyButton value={shortUrl} />
            <Link href={`/s/${state?.created}`} className="text-xs font-medium text-muted underline hover:text-foreground">
              View stats
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
