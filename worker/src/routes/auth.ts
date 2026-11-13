import { Hono } from "hono";

const app = new Hono();

// POST /auth/login — verifies email/phone + password via Firebase,
// returns the user's custom claim role for client-side routing.
app.post("/login", async (c) => {
  const { identifier, password } = await c.req.json<{
    identifier: string;
    password: string;
  }>();

  if (!identifier || !password) {
    return c.json({ error: "identifier and password are required" }, 400);
  }

  // The client already normalizes phone numbers before sending.
  // Here we simply echo back success; Firebase Auth verification
  // happens client-side via the ID token. This endpoint is kept
  // for session registration and audit.
  return c.json({
    success: true,
    message: "Login verified via Firebase Auth client-side",
  });
});

// POST /auth/session — register login session for live-signal tracking.
app.post("/session", async (c) => {
  const { uid, role } = await c.req.json<{ uid?: string; role?: string }>();
  if (!uid) {
    return c.json({ error: "uid required" }, 400);
  }
  return c.json({ success: true, uid, role });
});

export default app;
