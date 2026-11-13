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

// GET /api/teacher-assignments — list all assignments
app.get("/", async (c) => {
  const db = getTursoClient(c.env);
  const result = await db.execute(`
    SELECT ta.*, u.full_name as teacher_name, c.name as class_name, s.name as subject_name
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    JOIN classes c ON ta.class_id = c.id
    LEFT JOIN subjects s ON ta.subject_id = s.id
    ORDER BY c.name, s.name
  `);
  return c.json({ assignments: result.rows });
});

// GET /api/teacher-assignments/teacher/:teacherId — assignments for a teacher
app.get("/teacher/:teacherId", async (c) => {
  const { teacherId } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute(`
    SELECT ta.*, c.name as class_name, c.department, s.name as subject_name
    FROM teacher_assignments ta
    JOIN classes c ON ta.class_id = c.id
    LEFT JOIN subjects s ON ta.subject_id = s.id
    WHERE ta.teacher_id = ?
    ORDER BY c.name, s.name
  `, [teacherId]);
  return c.json({ assignments: result.rows });
});

// GET /api/teacher-assignments/class/:classId — assignments for a class
app.get("/class/:classId", async (c) => {
  const { classId } = c.req.param();
  const db = getTursoClient(c.env);
  const result = await db.execute(`
    SELECT ta.*, u.full_name as teacher_name, u.role, s.name as subject_name
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    LEFT JOIN subjects s ON ta.subject_id = s.id
    WHERE ta.class_id = ?
    ORDER BY u.full_name, s.name
  `, [classId]);
  return c.json({ assignments: result.rows });
});

// POST /api/teacher-assignments — create an assignment
app.post("/", async (c) => {
  const { teacher_id, class_id, subject_id } = await c.req.json<{
    teacher_id: string;
    class_id: string;
    subject_id?: string;
  }>();

  if (!teacher_id || !class_id) {
    return c.json({ error: "teacher_id and class_id are required" }, 400);
  }

  const id = `ta_${crypto.randomUUID()}`;
  const db = getTursoClient(c.env);

  try {
    await db.execute(
      "INSERT INTO teacher_assignments (id, teacher_id, class_id, subject_id) VALUES (?, ?, ?, ?)",
      [id, teacher_id, class_id, subject_id || null]
    );
  } catch (err: any) {
    if (err.message?.includes("UNIQUE")) {
      return c.json({ error: "Teacher already assigned to this class-subject pair" }, 409);
    }
    throw err;
  }

  return c.json({ id, teacher_id, class_id, subject_id }, 201);
});

// DELETE /api/teacher-assignments/:id — delete an assignment
app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM teacher_assignments WHERE id = ?", [id]);
  if (existing.rows.length === 0) {
    return c.json({ error: "Assignment not found" }, 404);
  }

  await db.execute("DELETE FROM teacher_assignments WHERE id = ?", [id]);
  return c.json({ success: true });
});

export default app;
