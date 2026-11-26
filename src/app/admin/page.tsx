import type { Metadata } from "next";
import { Suspense } from "react";
import { logout } from "@/app/actions";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkList, LinkListSkeleton } from "@/components/LinkList";
import { formatCount, getOrigin } from "@/lib/format";
import { listLinks } from "@/lib/links";

export const metadata: Metadata = { title: "Admin" };

// Owner-only view of every link anyone has created, for moderation.
export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Every link on the site, including ones visitors made. Delete anything that looks like spam.
          </p>
        </div>
        <form action={logout}>
          <button className="text-sm text-muted hover:text-foreground">Sign out</button>
        </form>
      </div>

      <CreateLinkForm />

      <Suspense fallback={<LinkListSkeleton />}>
        <AllLinks />
      </Suspense>
    </div>
  );
}

async function AllLinks() {
  const [links, origin] = await Promise.all([listLinks(), getOrigin()]);

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
      <LinkList links={links} origin={origin} />
    </section>
  );
}
