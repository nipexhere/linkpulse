import Link from "next/link";
import { Suspense } from "react";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkList, LinkListSkeleton } from "@/components/LinkList";
import { getOrigin } from "@/lib/format";
import { listLinks } from "@/lib/links";
import { getOwnerId } from "@/lib/visitor";

const STEPS = [
  {
    title: "1. Paste a long link",
    body: "Drop in any web address and, if you like, choose a custom ending such as /my-cv. No account or sign-up needed.",
  },
  {
    title: "2. Share the short one",
    body: "Copy your short link and put it in your bio, a message, a flyer or a QR code. Visitors go straight to your page.",
  },
  {
    title: "3. See who clicked",
    body: "Every link gets a free stats page: clicks per day, where people came from, their country, device and browser.",
  },
];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="space-y-14">
      <Suspense>
        <MissingNotice searchParams={searchParams} />
      </Suspense>

      <section className="space-y-6 pt-2">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Shorten a link. See who clicks it.</h1>
          <p className="mt-4 text-lg text-muted">
            Free short links with click stats built in. No account needed: paste a URL below and you&apos;re done.
          </p>
        </div>
        <CreateLinkForm />
      </section>

      <Suspense fallback={<LinkListSkeleton />}>
        <YourLinks />
      </Suspense>

      <section className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <article key={step.title} className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-medium">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </article>
        ))}
      </section>

      <p className="text-sm text-muted">
        Curious what the stats look like?{" "}
        <Link href="/s/portfolio" className="font-medium text-accent hover:underline">
          See an example stats page →
        </Link>
      </p>
    </div>
  );
}

// The links this browser has created, identified by an anonymous cookie.
async function YourLinks() {
  const ownerId = await getOwnerId();
  if (!ownerId) return null;

  const [links, origin] = await Promise.all([listLinks(ownerId), getOrigin()]);
  if (links.length === 0) return null;

  return (
    <section id="your-links" className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Your links</h2>
        <p className="mt-1 text-sm text-muted">
          Saved in this browser, so you can come back to check your clicks. Open it on another device and they
          won&apos;t show up there.
        </p>
      </div>
      <LinkList links={links} origin={origin} />
    </section>
  );
}

// Shown when the redirect handler sends a visitor here for an unknown slug.
async function MissingNotice({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { missing } = await searchParams;
  if (typeof missing !== "string") return null;
  return (
    <p role="status" className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
      There&apos;s no short link called <span className="font-mono font-medium">/{missing}</span>. You can create it
      below.
    </p>
  );
}
