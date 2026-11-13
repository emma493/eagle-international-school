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

// GET /api/subjects — list all subjects
app.get("/", async (c) => {
  const db = getTursoClient(c.env);
  const result = await db.execute(
    "SELECT * FROM subjects ORDER BY department_group, name"
  );
  return c.json({ subjects: result.rows });
});

// GET /api/subjects/:id — get a single subject
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute("SELECT * FROM subjects WHERE id = ?", [id]);
  if (result.rows.length === 0) {
    return c.json({ error: "Subject not found" }, 404);
  }
  return c.json({ subject: result.rows[0] });
});

// POST /api/subjects — create a new subject
app.post("/", async (c) => {
  const { name, department_group } = await c.req.json<{
    name: string;
    department_group: string;
  }>();

  if (!name || !department_group) {
    return c.json({ error: "name and department_group are required" }, 400);
  }

  const id = `subj_${crypto.randomUUID()}`;
  const db = getTursoClient(c.env);
  await db.execute(
    "INSERT INTO subjects (id, name, department_group) VALUES (?, ?, ?)",
    [id, name, department_group]
  );

  return c.json({ id, name, department_group }, 201);
});

// PUT /api/subjects/:id — update a subject
app.put("/:id", async (c) => {
  const { id } = c.req.param();
  const { name, department_group } = await c.req.json<{
    name?: string;
    department_group?: string;
  }>();

  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM subjects WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Subject not found" }, 404);
  }

  await db.execute(
    "UPDATE subjects SET name = COALESCE(?, name), department_group = COALESCE(?, department_group) WHERE id = ?",
    [name || null, department_group || null, id]
  );

  return c.json({ success: true });
});

// DELETE /api/subjects/:id — delete a subject
app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM subjects WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Subject not found" }, 404);
  }

  await db.execute("DELETE FROM subjects WHERE id = ?", [id]);
  return c.json({ success: true });
});

export default app;
