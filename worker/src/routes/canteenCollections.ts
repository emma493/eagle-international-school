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

// GET /api/canteen-collections — list collections (optionally filter by teacher or reconciliation status)
app.get("/", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const reconciliationStatus = c.req.query("reconciliation_status");
  const db = getTursoClient(c.env);

  let sql = `
    SELECT cc.*, s.full_name as student_name, s.admission_no, u.full_name as teacher_name
    FROM canteen_collections cc
    JOIN students s ON cc.student_id = s.id
    JOIN users u ON cc.teacher_id = u.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (teacherId) {
    conditions.push("cc.teacher_id = ?");
    params.push(teacherId);
  }
  if (reconciliationStatus) {
    conditions.push("cc.reconciliation_status = ?");
    params.push(reconciliationStatus);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY cc.created_at DESC";

  const result = await db.execute(sql, params);
  return c.json({ collections: result.rows });
});

// POST /api/canteen-collections — record a canteen collection
app.post("/", async (c) => {
  const {
    student_id,
    teacher_id,
    plan_type,
    days_covered,
    amount,
    idempotency_key,
  } = await c.req.json<{
    student_id: string;
    teacher_id: string;
    plan_type: "1_day" | "1_week" | "1_month";
    days_covered: number;
    amount: number;
    idempotency_key?: string;
  }>();

  if (!student_id || !teacher_id || !plan_type || days_covered == null || amount == null) {
    return c.json({ error: "student_id, teacher_id, plan_type, days_covered, and amount are required" }, 400);
  }

  const db = getTursoClient(c.env);

  // Verify student exists
  const studentResult = await db.execute("SELECT id FROM students WHERE id = ?", [student_id]);
  if (studentResult.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  const id = `cc_${crypto.randomUUID()}`;
  const key = idempotency_key || `cc_${crypto.randomUUID()}`;

  try {
    await db.execute(
      `INSERT INTO canteen_collections (id, idempotency_key, student_id, teacher_id, plan_type, days_covered, amount, reconciliation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, key, student_id, teacher_id, plan_type, days_covered, amount]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE") && err.message?.includes("idempotency_key")) {
      return c.json({ error: "Duplicate collection (idempotency key already exists)" }, 409);
    }
    throw err;
  }

  return c.json({
    id, idempotency_key: key, student_id, teacher_id, plan_type, days_covered, amount,
    reconciliation_status: "pending"
  }, 201);
});

// PUT /api/canteen-collections/:id/reconcile — headmaster confirms cash received
app.put("/:id/reconcile", async (c) => {
  const { id } = c.req.param();
  const { reconciled_by } = await c.req.json<{ reconciled_by: string }>();

  if (!reconciled_by) {
    return c.json({ error: "reconciled_by is required" }, 400);
  }

  const db = getTursoClient(c.env);
  const existing = await db.execute(
    "SELECT id, reconciliation_status FROM canteen_collections WHERE id = ?",
    [id]
  );
  if (existing.rows.length === 0) {
    return c.json({ error: "Canteen collection not found" }, 404);
  }

  if (existing.rows[0].reconciliation_status === "reconciled") {
    return c.json({ error: "Collection already reconciled" }, 409);
  }

  await db.execute(
    `UPDATE canteen_collections SET reconciliation_status = 'reconciled', reconciled_by = ?, reconciled_at = datetime('now')
     WHERE id = ?`,
    [reconciled_by, id]
  );

  return c.json({ success: true, reconciliation_status: "reconciled" });
});

// GET /api/canteen-collections/reconcile/pending — get pending reconciliation total for a teacher
app.get("/reconcile/pending", async (c) => {
  const teacherId = c.req.query("teacher_id");
  const db = getTursoClient(c.env);

  let sql = `
    SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount
    FROM canteen_collections
    WHERE reconciliation_status = 'pending'
  `;
  const params: any[] = [];

  if (teacherId) {
    sql += " AND teacher_id = ?";
    params.push(teacherId);
  }

  const result = await db.execute(sql, params);
  return c.json({ pending: result.rows[0] });
});

export default app;
