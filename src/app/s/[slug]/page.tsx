import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BarChart } from "@/components/BarChart";
import { BreakdownCard } from "@/components/BreakdownCard";
import { CopyButton } from "@/components/CopyButton";
import { capitalize, formatCount, formatCountry, formatDate, getOrigin } from "@/lib/format";
import { getLinkStats } from "@/lib/links";

export const metadata: Metadata = { title: "Link stats" };

export default function StatsPage({ params }: PageProps<"/s/[slug]">) {
  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Dashboard
      </Link>
      <Suspense fallback={<StatsSkeleton />}>
        {params.then(({ slug }) => (
          <Stats slug={slug} />
        ))}
      </Suspense>
    </div>
  );
}

async function Stats({ slug }: { slug: string }) {
  const [stats, origin] = await Promise.all([getLinkStats(slug), getOrigin()]);
  if (!stats) notFound();

  const { link, total, daily } = stats;
  const shortUrl = `${origin}/${link.slug}`;
  const week = daily.slice(-7).reduce((sum, d) => sum + d.count, 0);
  const month = daily.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {new URL(origin).host}/{link.slug}
          </h1>
          <CopyButton value={shortUrl} />
        </div>
        <p className="mt-2 truncate text-sm text-muted">
          → <a href={link.url} className="hover:underline">{link.url}</a>
        </p>
        <p className="mt-1 text-xs text-muted">Created {formatDate(link.created_at)}</p>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile label="Total clicks" value={formatCount(total)} />
        <Tile label="Last 30 days" value={formatCount(month)} />
        <Tile label="Last 7 days" value={formatCount(week)} />
        <Tile label="Top country" value={stats.countries[0] ? formatCountry(stats.countries[0].label) : "–"} />
      </dl>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-5 text-sm font-medium">Clicks per day (UTC)</h2>
        <BarChart data={daily} />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <BreakdownCard title="Referrers" rows={stats.referrers} total={total} />
        <BreakdownCard title="Countries" rows={stats.countries} total={total} formatLabel={formatCountry} />
        <BreakdownCard title="Devices" rows={stats.devices} total={total} formatLabel={capitalize} />
        <BreakdownCard title="Browsers" rows={stats.browsers} total={total} />
      </div>
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading stats">
      <div className="h-12 w-72 animate-pulse rounded-lg bg-surface" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}
