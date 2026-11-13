import { Hono } from "hono";
import { getTursoClient } from "../lib/db";

const app = new Hono<{
  Bindings: {
    DB: any;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
}>();

// GET /api/classes — list all classes
app.get("/", async (c) => {
  const db = getTursoClient(c.env);
  const result = await db.execute("SELECT * FROM classes ORDER BY department, name");
  return c.json({ classes: result.rows });
});

// GET /api/classes/:id — get a single class
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute("SELECT * FROM classes WHERE id = ?", [id]);
  if (result.rows.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }
  return c.json({ class: result.rows[0] });
});

// POST /api/classes — create a new class
app.post("/", async (c) => {
  const { department, name, form_master_id } = await c.req.json<{
    department: string;
    name: string;
    form_master_id?: string;
  }>();

  if (!department || !name) {
    return c.json({ error: "department and name are required" }, 400);
  }

  const id = `cls_${crypto.randomUUID()}`;
  const db = getTursoClient(c.env);
  await db.execute(
    "INSERT INTO classes (id, department, name, form_master_id) VALUES (?, ?, ?, ?)",
    [id, department, name, form_master_id || null]
  );

  return c.json({ id, department, name, form_master_id }, 201);
});

// PUT /api/classes/:id — update a class
app.put("/:id", async (c) => {
  const { id } = c.req.param();
  const { department, name, form_master_id } = await c.req.json<{
    department?: string;
    name?: string;
    form_master_id?: string;
  }>();

  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM classes WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }

  await db.execute(
    "UPDATE classes SET department = COALESCE(?, department), name = COALESCE(?, name), form_master_id = ? WHERE id = ?",
    [department || null, name || null, form_master_id ?? null, id]
  );

  return c.json({ success: true });
});

// DELETE /api/classes/:id — delete a class
app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM classes WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }

  await db.execute("DELETE FROM classes WHERE id = ?", [id]);
  return c.json({ success: true });
});

export default app;
