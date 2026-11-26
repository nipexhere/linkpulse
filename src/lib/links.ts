import { sql } from "./db";

export type Link = {
  id: number;
  slug: string;
  url: string;
  created_at: Date;
};

export type LinkSummary = Link & {
  total_clicks: number;
  week_clicks: number;
  last_click: Date | null;
};

export type Click = {
  referrer: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
};

export type Breakdown = { label: string; count: number }[];

export type LinkStats = {
  link: Link;
  total: number;
  daily: { day: string; count: number }[];
  referrers: Breakdown;
  countries: Breakdown;
  devices: Breakdown;
  browsers: Breakdown;
};

export type Creator = { ownerId: string | null; ipHash: string | null };

export async function insertLink(
  slug: string,
  url: string,
  creator: Creator = { ownerId: null, ipHash: null },
): Promise<"ok" | "taken"> {
  const rows = await sql(
    `INSERT INTO links (slug, url, owner_id, creator_ip) VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug) DO NOTHING RETURNING id`,
    [slug, url, creator.ownerId, creator.ipHash],
  );
  return rows.length ? "ok" : "taken";
}

// Pass ownerId to delete only a link that this visitor created; omit it (admin) to delete any link.
export async function deleteLink(id: number, ownerId?: string): Promise<void> {
  if (ownerId === undefined) {
    await sql("DELETE FROM links WHERE id = $1", [id]);
  } else {
    await sql("DELETE FROM links WHERE id = $1 AND owner_id = $2", [id, ownerId]);
  }
}

export async function countRecentLinksByIp(ipHash: string, windowMinutes: number): Promise<number> {
  const [{ count }] = await sql<{ count: number }>(
    "SELECT count(*)::int AS count FROM links WHERE creator_ip = $1 AND created_at > now() - make_interval(mins => $2)",
    [ipHash, windowMinutes],
  );
  return count;
}

export async function getLinkBySlug(slug: string): Promise<Link | null> {
  const [link] = await sql<Link>("SELECT id, slug, url, created_at FROM links WHERE slug = $1", [slug]);
  return link ?? null;
}

// All links (admin), or only the links created by one anonymous visitor.
export async function listLinks(ownerId?: string): Promise<LinkSummary[]> {
  const filter = ownerId === undefined ? "" : "WHERE l.owner_id = $1";
  return sql<LinkSummary>(
    `SELECT l.id, l.slug, l.url, l.created_at,
      count(c.id)::int AS total_clicks,
      count(c.id) FILTER (WHERE c.created_at > now() - interval '7 days')::int AS week_clicks,
      max(c.created_at) AS last_click
    FROM links l
    LEFT JOIN clicks c ON c.link_id = l.id
    ${filter}
    GROUP BY l.id
    ORDER BY l.created_at DESC`,
    ownerId === undefined ? [] : [ownerId],
  );
}

export async function recordClick(linkId: number, click: Click): Promise<void> {
  await sql("INSERT INTO clicks (link_id, referrer, country, device, browser) VALUES ($1, $2, $3, $4, $5)", [
    linkId,
    click.referrer,
    click.country,
    click.device,
    click.browser,
  ]);
}

async function breakdown(linkId: number, column: keyof Click): Promise<Breakdown> {
  // `column` is a fixed column name from the Click type, never user input.
  return sql<{ label: string; count: number }>(
    `SELECT coalesce(${column}, 'Unknown') AS label, count(*)::int AS count
     FROM clicks WHERE link_id = $1
     GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 6`,
    [linkId],
  );
}

export async function getLinkStats(slug: string, days = 30): Promise<LinkStats | null> {
  const link = await getLinkBySlug(slug);
  if (!link) return null;

  const [daily, [{ total }], referrers, countries, devices, browsers] = await Promise.all([
    sql<{ day: string; count: number }>(
      `SELECT to_char(d, 'YYYY-MM-DD') AS day, coalesce(c.count, 0)::int AS count
       FROM generate_series(
         (now() AT TIME ZONE 'UTC')::date - ($2::int - 1),
         (now() AT TIME ZONE 'UTC')::date,
         interval '1 day'
       ) AS d
       LEFT JOIN (
         SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(*) AS count
         FROM clicks WHERE link_id = $1 GROUP BY 1
       ) c ON c.day = d::date
       ORDER BY d`,
      [link.id, days],
    ),
    sql<{ total: number }>("SELECT count(*)::int AS total FROM clicks WHERE link_id = $1", [link.id]),
    breakdown(link.id, "referrer"),
    breakdown(link.id, "country"),
    breakdown(link.id, "device"),
    breakdown(link.id, "browser"),
  ]);

  return { link, total, daily, referrers, countries, devices, browsers };
}
