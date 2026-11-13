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

// POST /api/credit-offset — apply student's surplus credit toward a fee debt
// Only headmaster can do this, after obtaining parent consent
app.post("/", async (c) => {
  const role = c.get("userRole");
  if (role !== "headmaster" && role !== "admin") {
    return c.json({ error: "Only headmaster or admin can apply credit offset" }, 403);
  }

  const {
    student_id,
    ledger_id,
    amount,
    recorded_by,
    parent_consent,
    idempotency_key,
  } = await c.req.json<{
    student_id: string;
    ledger_id: string;
    amount: number;
    recorded_by: string;
    parent_consent: boolean;
    idempotency_key?: string;
  }>();

  if (!student_id || !ledger_id || amount == null || !recorded_by) {
    return c.json({ error: "student_id, ledger_id, amount, and recorded_by are required" }, 400);
  }

  if (!parent_consent) {
    return c.json({ error: "Parent consent is required to apply credit offset" }, 403);
  }

  const db = getTursoClient(c.env);

  // Verify student exists and has sufficient credit balance
  const studentResult = await db.execute(
    "SELECT id, credit_balance FROM students WHERE id = ?",
    [student_id]
  );
  if (studentResult.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  const student = studentResult.rows[0];
  if ((student.credit_balance || 0) < amount) {
    return c.json({ error: "Insufficient surplus credit balance" }, 400);
  }

  // Verify ledger exists and belongs to this student
  const ledgerResult = await db.execute(
    "SELECT id, amount_billed, amount_paid FROM fee_ledger WHERE id = ? AND student_id = ?",
    [ledger_id, student_id]
  );
  if (ledgerResult.rows.length === 0) {
    return c.json({ error: "Fee ledger entry not found for this student" }, 404);
  }

  const id = `co_${crypto.randomUUID()}`;
  const key = idempotency_key || `co_${crypto.randomUUID()}`;

  try {
    // Deduct from student's credit balance
    await db.execute(
      "UPDATE students SET credit_balance = credit_balance - ? WHERE id = ?",
      [amount, student_id]
    );

    // Record the payment as credit_offset
    await db.execute(
      `INSERT INTO fee_payments (id, idempotency_key, student_id, ledger_id, amount, payment_source, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, 'credit_offset', ?, ?)`,
      [id, key, student_id, ledger_id, amount, recorded_by, "Surplus credit offset applied with parent consent"]
    );

    // Update ledger's amount_paid
    await db.execute(
      "UPDATE fee_ledger SET amount_paid = amount_paid + ? WHERE id = ?",
      [amount, ledger_id]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE") && err.message?.includes("idempotency_key")) {
      return c.json({ error: "Duplicate credit offset (idempotency key already exists)" }, 409);
    }
    throw err;
  }

  return c.json({
    id, idempotency_key: key, student_id, ledger_id, amount,
    payment_source: "credit_offset", remaining_credit: (student.credit_balance || 0) - amount
  }, 201);
});

// GET /api/credit-offset/student/:studentId — get student's credit balance
app.get("/student/:studentId", async (c) => {
  const { studentId } = c.req.param();
  const db = getTursoClient(c.env);

  const result = await db.execute(
    "SELECT id, full_name, admission_no, credit_balance FROM students WHERE id = ?",
    [studentId]
  );
  if (result.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  return c.json(result.rows[0]);
});

export default app;
