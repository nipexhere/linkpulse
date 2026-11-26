import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logout, removeLink } from "@/app/actions";
import { CopyButton } from "@/components/CopyButton";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { formatCount, formatDate, getOrigin, timeAgo } from "@/lib/format";
import { listLinks } from "@/lib/links";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your links</h1>
          <p className="mt-1 text-sm text-muted">Create short links and follow how they perform.</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-muted hover:text-foreground">Sign out</button>
        </form>
      </div>

      <CreateLinkForm />

      <Suspense fallback={<TableSkeleton />}>
        <LinksTable />
      </Suspense>
    </div>
  );
}

async function LinksTable() {
  const [links, origin] = await Promise.all([listLinks(), getOrigin()]);
  const host = new URL(origin).host;

  if (links.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
        No links yet. Shorten your first URL above.
      </p>
    );
  }

  const totalClicks = links.reduce((sum, link) => sum + link.total_clicks, 0);

  return (
    <section className="space-y-3">
      <p className="text-sm text-muted">
        {links.length} {links.length === 1 ? "link" : "links"} · {formatCount(totalClicks)} total clicks
      </p>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {links.map((link) => {
          const shortUrl = `${origin}/${link.slug}`;
          return (
            <li key={link.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a href={shortUrl} className="font-mono text-sm font-medium text-accent hover:underline">
                    {host}/{link.slug}
                  </a>
                  <CopyButton value={shortUrl} />
                </div>
                <p className="mt-1 truncate text-sm text-muted" title={link.url}>
                  {link.url}
                </p>
                <p className="mt-1 text-xs text-muted">Created {formatDate(link.created_at)}</p>
              </div>
              <dl className="flex gap-6 text-sm">
                <Stat label="Clicks" value={formatCount(link.total_clicks)} />
                <Stat label="7 days" value={formatCount(link.week_clicks)} />
                <Stat label="Last click" value={timeAgo(link.last_click)} />
              </dl>
              <div className="flex gap-2">
                <Link
                  href={`/s/${link.slug}`}
                  className="rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-accent-soft"
                >
                  Stats
                </Link>
                <form action={removeLink}>
                  <input type="hidden" name="id" value={link.id} />
                  <button className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Loading links">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}
