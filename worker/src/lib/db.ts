import { createClient } from "@libsql/client";

let client: any = null;

export function getTursoClient(env: any) {
  if (client) return client;

  const url = env.DB?.url || env.TURSO_DATABASE_URL || "";
  const authToken = env.DB?.authToken || env.TURSO_AUTH_TOKEN || "";

  client = createClient({ url, authToken });
  return client;
}

export async function runMigration(sql: string, env: any) {
  const db = getTursoClient(env);
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await db.execute(stmt);
  }
  return { applied: statements.length };
}
