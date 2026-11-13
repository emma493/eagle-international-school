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

// GET /api/notifications — list notifications for the authenticated user
app.get("/", async (c) => {
  const userId = c.get("userId");
  const unreadOnly = c.req.query("unread_only") === "1";
  const db = getTursoClient(c.env);

  let sql = `
    SELECT * FROM notifications
    WHERE user_id = ?
  `;
  const params: any[] = [userId];

  if (unreadOnly) {
    sql += " AND is_read = 0";
  }

  sql += " ORDER BY created_at DESC LIMIT 50";

  const result = await db.execute(sql, params);
  return c.json({ notifications: result.rows });
});

// GET /api/notifications/unread — unread count
app.get("/unread", async (c) => {
  const userId = c.get("userId");
  const db = getTursoClient(c.env);
  const result = await db.execute(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return c.json({ unread_count: result.rows[0].count });
});

// PUT /api/notifications/:id/read — mark as read
app.put("/:id/read", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const db = getTursoClient(c.env);

  const existing = await db.execute(
    "SELECT id FROM notifications WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  if (existing.rows.length === 0) {
    return c.json({ error: "Notification not found" }, 404);
  }

  await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return c.json({ success: true });
});

// POST /api/notifications — create a notification (internal, called by other routes)
app.post("/", async (c) => {
  const role = c.get("userRole");
  if (role !== "headmaster" && role !== "admin") {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  const {
    user_id,
    title,
    body,
    type,
    link_path,
  } = await c.req.json<{
    user_id: string;
    title: string;
    body: string;
    type: "payment" | "canteen" | "credit" | "report" | "system";
    link_path?: string;
  }>();

  if (!user_id || !title || !body || !type) {
    return c.json({ error: "user_id, title, body, and type are required" }, 400);
  }

  const id = `notif_${crypto.randomUUID()}`;
  const db = getTursoClient(c.env);

  await db.execute(
    `INSERT INTO notifications (id, user_id, title, body, type, link_path, is_read)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [id, user_id, title, body, type, link_path || null]
  );

  return c.json({ id, user_id, title, body, type, link_path, is_read: 0 }, 201);
});

export default app;
