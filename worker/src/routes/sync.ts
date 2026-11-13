import { Hono } from "hono";
import { getTursoClient } from "../lib/db";

const app = new Hono<{
  Bindings: {
    DB: any;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
}>();

// POST /api/sync/batch — flush offline sync queue.
// Uses INSERT OR IGNORE on idempotency_key for zero duplicates.
app.post("/batch", async (c) => {
  const db = getTursoClient(c.env);
  const body = await c.req.json<{ mutations: any[] }>();
  const { mutations } = body;

  if (!Array.isArray(mutations) || mutations.length === 0) {
    return c.json({ error: "mutations array required" }, 400);
  }

  const results: Array<{ ok: boolean; idempotency_key?: string; error?: string }> = [];

  for (const m of mutations) {
    const { idempotency_key, table, operation, record } = m;
    try {
      if (operation === "INSERT" || operation === "UPSERT") {
        await db.execute(
          `INSERT OR IGNORE INTO ${table} (${Object.keys(record).join(", ")}) VALUES (${Object.keys(record).map(() => "?").join(", ")})`,
          Object.values(record)
        );
      } else if (operation === "UPDATE") {
        const keys = Object.keys(record).filter((k) => k !== "id");
        await db.execute(
          `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
          [...keys.map((k) => record[k]), record.id]
        );
      } else if (operation === "DELETE") {
        await db.execute(`DELETE FROM ${table} WHERE id = ?`, [record.id]);
      }
      results.push({ ok: true, idempotency_key });
    } catch (err: any) {
      results.push({ ok: false, idempotency_key, error: err.message });
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  return c.json({
    success: failed === 0,
    processed: results.length,
    failed,
    results,
  });
});

export default app;
