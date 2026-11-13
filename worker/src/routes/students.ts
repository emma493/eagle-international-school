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

// GET /api/students — list all students (optionally filter by class)
app.get("/", async (c) => {
  const classId = c.req.query("class_id");
  const db = getTursoClient(c.env);

  let result;
  if (classId) {
    result = await db.execute(
      `SELECT s.*, c.name as class_name, c.department
       FROM students s
       JOIN classes c ON s.class_id = c.id
       WHERE s.class_id = ?
       ORDER BY s.full_name`,
      [classId]
    );
  } else {
    result = await db.execute(
      `SELECT s.*, c.name as class_name, c.department
       FROM students s
       JOIN classes c ON s.class_id = c.id
       ORDER BY c.department, c.name, s.full_name`
    );
  }

  return c.json({ students: result.rows });
});

// GET /api/students/:id — get a single student
app.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute(
    `SELECT s.*, c.name as class_name, c.department
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?`,
    [id]
  );
  if (result.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  const student = result.rows[0];
  // Parse pickup_contacts_json
  if (student.pickup_contacts_json) {
    try {
      student.pickup_contacts = JSON.parse(student.pickup_contacts_json);
    } catch {
      student.pickup_contacts = [];
    }
  }

  return c.json({ student });
});

// POST /api/students — register a new student
app.post("/", async (c) => {
  const {
    admission_no,
    full_name,
    dob,
    gender,
    photo_url,
    class_id,
    medical_notes,
    blood_group,
    address_gps,
    pickup_contacts_json,
  } = await c.req.json<{
    admission_no: string;
    full_name: string;
    dob?: string;
    gender?: string;
    photo_url?: string;
    class_id: string;
    medical_notes?: string;
    blood_group?: string;
    address_gps?: string;
    pickup_contacts_json?: string;
  }>();

  if (!admission_no || !full_name || !class_id) {
    return c.json({ error: "admission_no, full_name, and class_id are required" }, 400);
  }

  const id = `stu_${crypto.randomUUID()}`;
  const db = getTursoClient(c.env);

  // Verify class exists
  const classResult = await db.execute("SELECT id FROM classes WHERE id = ?", [class_id]);
  if (classResult.rows.length === 0) {
    return c.json({ error: "Class not found" }, 404);
  }

  await db.execute(
    `INSERT INTO students (
      id, admission_no, full_name, dob, gender, photo_url, class_id,
      medical_notes, blood_group, address_gps, pickup_contacts_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, admission_no, full_name, dob || null, gender || null, photo_url || null, class_id,
      medical_notes || null, blood_group || null, address_gps || null,
      pickup_contacts_json || null
    ]
  );

  return c.json({
    id, admission_no, full_name, class_id
  }, 201);
});

// PUT /api/students/:id — update a student
app.put("/:id", async (c) => {
  const { id } = c.req.param();
  const {
    full_name, dob, gender, photo_url, class_id, medical_notes,
    blood_group, address_gps, pickup_contacts_json, status,
  } = await c.req.json<{
    full_name?: string;
    dob?: string;
    gender?: string;
    photo_url?: string;
    class_id?: string;
    medical_notes?: string;
    blood_group?: string;
    address_gps?: string;
    pickup_contacts_json?: string;
    status?: string;
  }>();

  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM students WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  await db.execute(
    `UPDATE students SET
      full_name = COALESCE(?, full_name),
      dob = COALESCE(?, dob),
      gender = COALESCE(?, gender),
      photo_url = COALESCE(?, photo_url),
      class_id = COALESCE(?, class_id),
      medical_notes = COALESCE(?, medical_notes),
      blood_group = COALESCE(?, blood_group),
      address_gps = COALESCE(?, address_gps),
      pickup_contacts_json = COALESCE(?, pickup_contacts_json),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [
      full_name || null, dob || null, gender || null, photo_url || null,
      class_id || null, medical_notes || null, blood_group || null,
      address_gps || null, pickup_contacts_json || null, status || null, id
    ]
  );

  return c.json({ success: true });
});

// DELETE /api/students/:id — delete a student
app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM students WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Student not found" }, 404);
  }

  await db.execute("DELETE FROM students WHERE id = ?", [id]);
  return c.json({ success: true });
});

export default app;
