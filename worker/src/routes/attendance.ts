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

// GET /api/attendance — list attendance records (optionally filter by student or date)
app.get("/", async (c) => {
  const studentId = c.req.query("student_id");
  const date = c.req.query("date");
  const classId = c.req.query("class_id");
  const db = getTursoClient(c.env);

  let sql = `
    SELECT a.*, s.full_name as student_name, s.admission_no, c.name as class_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON s.class_id = c.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (studentId) {
    conditions.push("a.student_id = ?");
    params.push(studentId);
  }
  if (date) {
    conditions.push("a.date = ?");
    params.push(date);
  }
  if (classId) {
    conditions.push("s.class_id = ?");
    params.push(classId);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY a.date DESC, s.full_name";

  const result = await db.execute(sql, params);
  return c.json({ attendance: result.rows });
});

// POST /api/attendance — mark daily attendance
app.post("/", async (c) => {
  const {
    student_id,
    date,
    status,
    recorded_by,
    idempotency_key,
    canteen_daily_rate = 20.00,
  } = await c.req.json<{
    student_id: string;
    date: string; // YYYY-MM-DD
    status: "present" | "absent" | "late" | "excused";
    recorded_by: string;
    idempotency_key?: string;
    canteen_daily_rate?: number;
  }>();

  if (!student_id || !date || !status || !recorded_by) {
    return c.json({ error: "student_id, date, status, and recorded_by are required" }, 400);
  }

  const db = getTursoClient(c.env);

  // Verify student exists
  const studentResult = await db.execute("SELECT id, canteen_paid_until, credit_balance FROM students WHERE id = ?", [student_id]);
  if (studentResult.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  const student = studentResult.rows[0];

  const id = `att_${crypto.randomUUID()}`;
  const key = idempotency_key || `att_${crypto.randomUUID()}`;
  let canteen_credit_awarded = 0;

  try {
    await db.execute(
      `INSERT INTO attendance (id, idempotency_key, student_id, date, status, recorded_by, canteen_credit_awarded)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, key, student_id, date, status, recorded_by]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE") && err.message?.includes("idempotency_key")) {
      return c.json({ error: "Duplicate attendance record (idempotency key already exists)" }, 409);
    }
    throw err;
  }

  // Absentee credit logic: if absent and has prepaid canteen credit, award GHS 20 credit
  if (status === "absent" && student.canteen_paid_until && student.canteen_paid_until >= date) {
    canteen_credit_awarded = 1;
    await db.execute(
      "UPDATE students SET credit_balance = credit_balance + ? WHERE id = ?",
      [canteen_daily_rate, student_id]
    );
    await db.execute(
      "UPDATE attendance SET canteen_credit_awarded = 1 WHERE id = ?",
      [id]
    );
  }

  return c.json({
    id, idempotency_key: key, student_id, date, status,
    canteen_credit_awarded, credit_awarded_amount: canteen_credit_awarded * canteen_daily_rate
  }, 201);
});

export default app;
