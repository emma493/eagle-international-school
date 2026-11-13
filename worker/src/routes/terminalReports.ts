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

// GET /api/terminal-reports — list reports (filter by student, class, term, published)
app.get("/", async (c) => {
  const studentId = c.req.query("student_id");
  const classId = c.req.query("class_id");
  const academicYear = c.req.query("academic_year");
  const term = c.req.query("term");
  const isPublished = c.req.query("is_published");
  const db = getTursoClient(c.env);

  let sql = `
    SELECT tr.*, s.full_name as student_name, s.admission_no, c.name as class_name
    FROM terminal_reports tr
    JOIN students s ON tr.student_id = s.id
    JOIN classes c ON tr.class_id = c.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (studentId) {
    conditions.push("tr.student_id = ?");
    params.push(studentId);
  }
  if (classId) {
    conditions.push("tr.class_id = ?");
    params.push(classId);
  }
  if (academicYear) {
    conditions.push("tr.academic_year = ?");
    params.push(academicYear);
  }
  if (term) {
    conditions.push("tr.term = ?");
    params.push(term);
  }
  if (isPublished !== undefined) {
    conditions.push("tr.is_published = ?");
    params.push(isPublished === "1" ? 1 : 0);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY tr.created_at DESC";

  const result = await db.execute(sql, params);
  return c.json({ reports: result.rows });
});

// GET /api/terminal-reports/:id — get a single report
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute(
    `SELECT tr.*, s.full_name as student_name, s.admission_no, c.name as class_name, c.department
     FROM terminal_reports tr
     JOIN students s ON tr.student_id = s.id
     JOIN classes c ON tr.class_id = c.id
     WHERE tr.id = ?`,
    [id]
  );
  if (result.rows.length === 0) {
    return c.json({ error: "Terminal report not found" }, 404);
  }
  return c.json({ report: result.rows[0] });
});

// POST /api/terminal-reports — create or update a draft report (teacher)
app.post("/", async (c) => {
  const {
    student_id,
    class_id,
    academic_year,
    term,
    days_present,
    total_days,
    conduct,
    attitude,
    interest,
    class_teacher_remarks,
    headmaster_remarks,
    idempotency_key,
  } = await c.req.json<{
    student_id: string;
    class_id: string;
    academic_year: string;
    term: string;
    days_present?: number;
    total_days?: number;
    conduct?: string;
    attitude?: string;
    interest?: string;
    class_teacher_remarks?: string;
    headmaster_remarks?: string;
    idempotency_key?: string;
  }>();

  if (!student_id || !class_id || !academic_year || !term) {
    return c.json({ error: "student_id, class_id, academic_year, and term are required" }, 400);
  }

  const db = getTursoClient(c.env);

  // Verify student and class exist
  const studentResult = await db.execute("SELECT id FROM students WHERE id = ?", [student_id]);
  if (studentResult.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  const classResult = await db.execute("SELECT id FROM classes WHERE id = ?", [class_id]);
  if (classResult.rows.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }

  const id = `tr_${crypto.randomUUID()}`;
  const key = idempotency_key || `tr_${crypto.randomUUID()}`;

  try {
    await db.execute(
      `INSERT INTO terminal_reports (
        id, idempotency_key, student_id, class_id, academic_year, term,
        days_present, total_days, conduct, attitude, interest,
        class_teacher_remarks, headmaster_remarks, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id, key, student_id, class_id, academic_year, term,
        days_present || 0, total_days || 0,
        conduct || null, attitude || null, interest || null,
        class_teacher_remarks || null, headmaster_remarks || null
      ]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE") && err.message?.includes("idempotency_key")) {
      return c.json({ error: "Duplicate report (idempotency key already exists)" }, 409);
    }
    throw err;
  }

  return c.json({
    id, student_id, class_id, academic_year, term, is_published: 0
  }, 201);
});

// PUT /api/terminal-reports/:id — update a report (teacher draft or headmaster remarks)
app.put("/:id", async (c) => {
  const { id } = c.req.param();
  const role = c.get("userRole");
  const {
    days_present, total_days, conduct, attitude, interest,
    class_teacher_remarks, headmaster_remarks,
  } = await c.req.json<{
    days_present?: number;
    total_days?: number;
    conduct?: string;
    attitude?: string;
    interest?: string;
    class_teacher_remarks?: string;
    headmaster_remarks?: string;
  }>();

  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id, is_published FROM terminal_reports WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Terminal report not found" }, 404);
  }

  // Teachers cannot edit published reports; headmaster can add remarks
  if (existing.rows[0].is_published === 1 && role !== "headmaster") {
    return c.json({ error: "Cannot edit a published report" }, 403);
  }

  await db.execute(
    `UPDATE terminal_reports SET
      days_present = COALESCE(?, days_present),
      total_days = COALESCE(?, total_days),
      conduct = COALESCE(?, conduct),
      attitude = COALESCE(?, attitude),
      interest = COALESCE(?, interest),
      class_teacher_remarks = COALESCE(?, class_teacher_remarks),
      headmaster_remarks = COALESCE(?, headmaster_remarks)
     WHERE id = ?`,
    [
      days_present ?? null, total_days ?? null, conduct || null,
      attitude || null, interest || null, class_teacher_remarks || null,
      headmaster_remarks || null, id
    ]
  );

  return c.json({ success: true });
});

// POST /api/terminal-reports/:id/publish — headmaster publishes a report
app.post("/:id/publish", async (c) => {
  const { id } = c.req.param();
  const role = c.get("userRole");
  const userId = c.get("userId");

  if (role !== "headmaster") {
    return c.json({ error: "Only headmaster can publish reports" }, 403);
  }

  const db = getTursoClient(c.env);
  const existing = await db.execute(
    "SELECT id, student_id, is_published FROM terminal_reports WHERE id = ?",
    [id]
  );
  if (existing.rows.length === 0) {
    return c.json({ error: "Terminal report not found" }, 404);
  }

  if (existing.rows[0].is_published === 1) {
    return c.json({ error: "Report already published" }, 409);
  }

  const studentId = existing.rows[0].student_id;

  await db.execute(
    `UPDATE terminal_reports SET
      is_published = 1,
      published_at = datetime('now')
     WHERE id = ?`,
    [id]
  );

  // Create notification for the parent
  await db.execute(
    `INSERT INTO notifications (id, user_id, title, body, type, link_path, is_read)
     VALUES (?, ?, ?, ?, 'report', ?, 0)`,
    [
      `notif_${crypto.randomUUID()}`,
      studentId, // In production, look up parent_id from parent_students
      "Terminal Report Published",
      "Your child's end-of-term report is now available for download.",
      `/parent/reports/${id}`
    ]
  );

  return c.json({ success: true, is_published: 1, published_at: new Date().toISOString() });
});

export default app;
