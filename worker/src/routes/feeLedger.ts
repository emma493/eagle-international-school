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

// GET /api/fee-ledger — list fee ledger entries (optionally filter by student)
app.get("/", async (c) => {
  const studentId = c.req.query("student_id");
  const category = c.req.query("category");
  const db = getTursoClient(c.env);

  let sql = `
    SELECT fl.*, s.full_name as student_name, s.admission_no
    FROM fee_ledger fl
    JOIN students s ON fl.student_id = s.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (studentId) {
    conditions.push("fl.student_id = ?");
    params.push(studentId);
  }
  if (category) {
    conditions.push("fl.category = ?");
    params.push(category);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY fl.created_at DESC";

  const result = await db.execute(sql, params);
  return c.json({ ledger: result.rows });
});

// GET /api/fee-ledger/:id — get a single ledger entry
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute(
    `SELECT fl.*, s.full_name as student_name, s.admission_no
     FROM fee_ledger fl
     JOIN students s ON fl.student_id = s.id
     WHERE fl.id = ?`,
    [id]
  );
  if (result.rows.length === 0) {
    return c.json({ error: "Fee ledger entry not found" }, 404);
  }
  return c.json({ entry: result.rows[0] });
});

// POST /api/fee-ledger — issue a new fee (billing)
app.post("/", async (c) => {
  const {
    student_id,
    academic_year,
    term,
    category,
    description,
    amount_billed,
    idempotency_key,
  } = await c.req.json<{
    student_id: string;
    academic_year: string;
    term: string;
    category: "school_fees" | "printing_fees" | "books" | "canteen" | "dues";
    description: string;
    amount_billed: number;
    idempotency_key?: string;
  }>();

  if (!student_id || !academic_year || !term || !category || !description || amount_billed == null) {
    return c.json({ error: "student_id, academic_year, term, category, description, and amount_billed are required" }, 400);
  }

  const db = getTursoClient(c.env);

  // Verify student exists
  const studentResult = await db.execute("SELECT id FROM students WHERE id = ?", [student_id]);
  if (studentResult.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  const id = `fl_${crypto.randomUUID()}`;
  const key = idempotency_key || `fl_${crypto.randomUUID()}`;

  try {
    await db.execute(
      `INSERT INTO fee_ledger (id, idempotency_key, student_id, academic_year, term, category, description, amount_billed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, key, student_id, academic_year, term, category, description, amount_billed]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE") && err.message?.includes("idempotency_key")) {
      return c.json({ error: "Duplicate fee entry (idempotency key already exists)" }, 409);
    }
    throw err;
  }

  return c.json({ id, idempotency_key: key, student_id, category, amount_billed, status: "owing" }, 201);
});

// PUT /api/fee-ledger/:id — update a ledger entry
app.put("/:id", async (c) => {
  const { id } = c.req.param();
  const { description, amount_billed } = await c.req.json<{
    description?: string;
    amount_billed?: number;
  }>();

  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM fee_ledger WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Fee ledger entry not found" }, 404);
  }

  await db.execute(
    "UPDATE fee_ledger SET description = COALESCE(?, description), amount_billed = COALESCE(?, amount_billed) WHERE id = ?",
    [description || null, amount_billed ?? null, id]
  );

  return c.json({ success: true });
});

export default app;
