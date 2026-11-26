import Link from "next/link";
import { Suspense } from "react";

const FEATURES = [
  {
    title: "Fast redirects",
    body: "A route handler answers with a 307 straight away and logs the click with after(), so analytics never slow the visitor down.",
  },
  {
    title: "Click analytics",
    body: "Daily clicks for the last 30 days plus top referrers, countries, devices and browsers, charted on the server with no client JavaScript.",
  },
  {
    title: "Public stats pages",
    body: "Open /s/your-slug for read-only stats you can share, while creating and deleting links stays behind the owner login.",
  },
];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="space-y-16">
      <Suspense>
        <MissingNotice searchParams={searchParams} />
      </Suspense>

      <section className="max-w-2xl pt-6">
        <p className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          Next.js App Router · Postgres
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Short links that show who&apos;s clicking.</h1>
        <p className="mt-5 text-lg text-muted">
          Linkpulse turns long URLs into short ones and tracks every visit: when, where from and on what device.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
            Open dashboard
          </Link>
          <Link href="/s/portfolio" className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium hover:bg-surface">
            See example stats
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-medium">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

// Shown when the redirect handler sends a visitor here for an unknown slug.
async function MissingNotice({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { missing } = await searchParams;
  if (typeof missing !== "string") return null;
  return (
    <p role="status" className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
      There&apos;s no short link called <span className="font-mono font-medium">/{missing}</span>.
    </p>
  );
}
