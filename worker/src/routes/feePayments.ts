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

// GET /api/fee-payments — list payments (optionally filter by student or ledger)
app.get("/", async (c) => {
  const studentId = c.req.query("student_id");
  const ledgerId = c.req.query("ledger_id");
  const db = getTursoClient(c.env);

  let sql = `
    SELECT fp.*, s.full_name as student_name, s.admission_no, fl.description as ledger_description
    FROM fee_payments fp
    JOIN students s ON fp.student_id = s.id
    LEFT JOIN fee_ledger fl ON fp.ledger_id = fl.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (studentId) {
    conditions.push("fp.student_id = ?");
    params.push(studentId);
  }
  if (ledgerId) {
    conditions.push("fp.ledger_id = ?");
    params.push(ledgerId);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY fp.created_at DESC";

  const result = await db.execute(sql, params);
  return c.json({ payments: result.rows });
});

// POST /api/fee-payments — record a payment
app.post("/", async (c) => {
  const {
    student_id,
    ledger_id,
    amount,
    payment_source,
    recorded_by,
    notes,
    idempotency_key,
  } = await c.req.json<{
    student_id: string;
    ledger_id?: string;
    amount: number;
    payment_source: "cash" | "momo" | "bank" | "credit_offset";
    recorded_by: string;
    notes?: string;
    idempotency_key?: string;
  }>();

  if (!student_id || amount == null || !payment_source || !recorded_by) {
    return c.json({ error: "student_id, amount, payment_source, and recorded_by are required" }, 400);
  }

  const db = getTursoClient(c.env);

  // Verify student exists
  const studentResult = await db.execute("SELECT id FROM students WHERE id = ?", [student_id]);
  if (studentResult.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  // If ledger_id provided, verify it exists and belongs to this student
  if (ledger_id) {
    const ledgerResult = await db.execute(
      "SELECT id, amount_billed, amount_paid FROM fee_ledger WHERE id = ? AND student_id = ?",
      [ledger_id, student_id]
    );
    if (ledgerResult.rows.length === 0) {
      return c.json({ error: "Fee ledger entry not found for this student" }, 404);
    }
  }

  const id = `fp_${crypto.randomUUID()}`;
  const key = idempotency_key || `fp_${crypto.randomUUID()}`;

  try {
    await db.execute(
      `INSERT INTO fee_payments (id, idempotency_key, student_id, ledger_id, amount, payment_source, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, key, student_id, ledger_id || null, amount, payment_source, recorded_by, notes || null]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE") && err.message?.includes("idempotency_key")) {
      return c.json({ error: "Duplicate payment (idempotency key already exists)" }, 409);
    }
    throw err;
  }

  // Update the ledger's amount_paid if linked
  if (ledger_id) {
    await db.execute(
      `UPDATE fee_ledger SET amount_paid = amount_paid + ? WHERE id = ?`,
      [amount, ledger_id]
    );
  }

  return c.json({
    id, idempotency_key: key, student_id, ledger_id, amount, payment_source, status: "recorded"
  }, 201);
});

export default app;
