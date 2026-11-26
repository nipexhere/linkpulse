// Postgres access. Uses Neon over HTTP when DATABASE_URL is set (production),
// and an embedded PGlite database in ./.pglite otherwise (local development).

type Row = Record<string, unknown>;
type Query = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS clicks (
    id BIGSERIAL PRIMARY KEY,
    link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    referrer TEXT,
    country TEXT,
    device TEXT,
    browser TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS clicks_link_time ON clicks (link_id, created_at)`,
];

async function connect(): Promise<Query> {
  const url = process.env.DATABASE_URL;
  let query: Query;

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    query = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite(process.env.PGLITE_DIR ?? "./.pglite");
    query = async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }

  // Neon's HTTP driver runs one statement per call, so apply the schema step by step.
  for (const statement of SCHEMA) await query(statement);
  return query;
}

const globalForDb = globalThis as unknown as { linkpulseDb?: Promise<Query> };

export async function sql<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  // Reuse one connection across hot reloads in development.
  globalForDb.linkpulseDb ??= connect().catch((error) => {
    globalForDb.linkpulseDb = undefined;
    throw error;
  });
  const query = await globalForDb.linkpulseDb;
  return (await query(text, params)) as T[];
}
