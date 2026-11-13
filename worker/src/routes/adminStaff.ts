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

// POST /api/admin/staff — create a staff account (Turso record only;
// Firebase Auth user creation happens via Firebase Console or client SDK)
app.post("/", async (c) => {
  // Only admin or headmaster can create staff
  const role = c.get("userRole");
  if (role !== "admin" && role !== "headmaster") {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  const { id, full_name, email, phone, role: staff_role, avatar_url } =
    await c.req.json<{
      id: string; // Firebase UID
      full_name: string;
      email?: string;
      phone?: string;
      role: "admin" | "headmaster" | "teacher" | "parent";
      avatar_url?: string;
    }>();

  if (!id || !full_name || !staff_role) {
    return c.json({ error: "id (Firebase UID), full_name, and role are required" }, 400);
  }

  const db = getTursoClient(c.env);

  // Check if user already exists
  const existing = await db.execute("SELECT id FROM users WHERE id = ?", [id]);
  if (existing.rows.length > 0) {
    return c.json({ error: "User already exists" }, 409);
  }

  await db.execute(
    `INSERT INTO users (id, role, full_name, email, phone, avatar_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [id, staff_role, full_name, email || null, phone || null, avatar_url || null]
  );

  return c.json({
    id,
    role: staff_role,
    full_name,
    email,
    phone,
    message: "Staff account created. Set the Firebase custom claim 'role' in Firebase Console.",
  }, 201);
});

export default app;
