// Fills the local PGlite database with sample links and 30 days of clicks
// so the dashboard and charts have something to show. Run: npm run seed
import { sql } from "../src/lib/db.ts";

if (process.env.DATABASE_URL) {
  console.error("Refusing to seed: DATABASE_URL is set. The seed is for the local demo database only.");
  process.exit(1);
}

const LINKS = [
  { slug: "portfolio", url: "https://nipexfolio.vercel.app", weight: 9 },
  { slug: "github", url: "https://github.com/nipexhere", weight: 5 },
  { slug: "resume", url: "https://nipexfolio.vercel.app/AdebayoResume.pdf", weight: 3 },
];

const pick = <T>(items: [T, number][]): T => {
  let roll = Math.random() * items.reduce((sum, [, w]) => sum + w, 0);
  for (const [item, weight] of items) if ((roll -= weight) < 0) return item;
  return items[0][0];
};

const REFERRERS: [string | null, number][] = [["linkedin.com", 5], ["github.com", 3], ["x.com", 2], [null, 4]];
const COUNTRIES: [string, number][] = [["NG", 8], ["GB", 3], ["US", 3], ["CA", 1], ["DE", 1]];
const DEVICES: [string, number][] = [["desktop", 5], ["mobile", 4], ["tablet", 1]];
const BROWSERS: [string, number][] = [["Chrome", 6], ["Safari", 3], ["Firefox", 1], ["Edge", 1]];

await sql("TRUNCATE clicks, links RESTART IDENTITY");

for (const link of LINKS) {
  const [{ id }] = await sql<{ id: number }>(
    "INSERT INTO links (slug, url, created_at) VALUES ($1, $2, now() - interval '32 days') RETURNING id",
    [link.slug, link.url],
  );
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const clicks = Math.round(Math.random() * link.weight * (1 + (29 - daysAgo) / 30));
    for (let i = 0; i < clicks; i++) {
      await sql(
        `INSERT INTO clicks (link_id, created_at, referrer, country, device, browser)
         VALUES ($1, now() - make_interval(days => $2, mins => $3), $4, $5, $6, $7)`,
        [id, daysAgo, Math.floor(Math.random() * 1440), pick(REFERRERS), pick(COUNTRIES), pick(DEVICES), pick(BROWSERS)],
      );
    }
  }
}

const [{ count }] = await sql<{ count: number }>("SELECT count(*)::int AS count FROM clicks");
console.log(`Seeded ${LINKS.length} links and ${count} clicks.`);
process.exit(0);
