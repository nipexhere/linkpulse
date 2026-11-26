# Linkpulse

A free link shortener with built-in click analytics, built with the Next.js App Router. Anyone can shorten a link without an account.

- **Fast redirects**: `/[slug]` is a route handler that returns a 307 immediately and records the click with `after()`, so logging never delays the visitor. Bots are skipped.
- **Analytics**: daily clicks for the last 30 days plus top referrers, countries, devices and browsers. Charts are SVG rendered on the server, with no chart library or client JavaScript.
- **No sign-up**: anyone can create links (random or custom slugs) from the home page. An anonymous, httpOnly cookie remembers which links a browser made, so visitors see a "Your links" list with click counts and can delete their own links.
- **Abuse limits**: each IP address can create 10 links per hour. IPs are stored only as a keyed hash.
- **Public stats pages**: `/s/[slug]` shows read-only stats for any link.
- **Admin**: `/admin` lists every link on the site so the owner can delete spam. It is protected by `proxy.ts` and signed, expiring session cookies, and every server action checks the session again. Links made while signed in skip the rate limit.
- **Cache Components / Partial Prerendering**: each page ships a static shell and streams its data in behind `<Suspense>`.

## Stack

Next.js 16 (App Router, Server Actions, Proxy, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Postgres ([Neon](https://neon.tech) in production, embedded [PGlite](https://pglite.dev) locally) · `node:test`

## Run locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and SESSION_SECRET
npm run seed                 # optional: sample links and 30 days of clicks
npm run dev
```

Without `DATABASE_URL`, data lives in an embedded Postgres in `./.pglite`, so you don't need a database server. Stop the dev server before running `npm run seed`, because PGlite allows one process at a time.

```bash
npm test          # unit tests for validation and session signing
npm run typecheck
npm run lint
```

## Deploy to Vercel

1. Create a free Postgres database on [Neon](https://neon.tech) and copy its connection string.
2. Import this repository in Vercel.
3. Add environment variables: `DATABASE_URL`, `ADMIN_PASSWORD` and `SESSION_SECRET` (a long random string).
4. Deploy. Tables and new columns are created automatically on the first request.

Country data comes from Vercel's `x-vercel-ip-country` header, so it shows as "Unknown" when running locally.

## Project layout

```
src/
  proxy.ts                 redirects signed-out visitors away from /admin
  app/
    [slug]/route.ts        redirect + click logging
    s/[slug]/page.tsx      public stats page
    page.tsx               home: public create form and "Your links"
    admin/page.tsx         owner view of all links
    login/page.tsx
    actions.ts             server actions: login, logout, create (public, rate limited), delete
  lib/
    db.ts                  Neon / PGlite adapter and schema
    links.ts               queries
    session.ts             HMAC-signed session tokens (Web Crypto)
    visitor.ts             anonymous visitor cookie and hashed IP for rate limiting
    validate.ts            URL and slug validation
scripts/seed.ts            local demo data
```
