import { Hono } from "hono";

const app = new Hono<{
  Bindings: {
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
}>();

// POST /api/live-signals/:entityId — update a live signal timestamp (Firebase Realtime DB via REST)
// Called after any Turso mutation so connected clients auto-refresh
app.post("/:entityId", async (c) => {
  const { entityId } = c.req.param();
  const { timestamp, data } = await c.req.json<{
    timestamp?: number;
    data?: any;
  }>();

  const projectId = c.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    return c.json({ error: "FIREBASE_PROJECT_ID not configured" }, 500);
  }

  // Firebase Realtime DB REST API endpoint
  const rtdbUrl = `https://${projectId}-default-rtdb.firebaseio.com/live_signals/${entityId}.json`;

  try {
    const res = await fetch(rtdbUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updated_at: timestamp || Date.now(),
        data: data || null,
      }),
    });

    if (!res.ok) {
      return c.json({ error: "Failed to update live signal" }, 502);
    }

    return c.json({ success: true, entityId });
  } catch (err: any) {
    return c.json({ error: err.message }, 502);
  }
});

// GET /api/live-signals/:entityId — get current live signal
app.get("/:entityId", async (c) => {
  const { entityId } = c.req.param();
  const projectId = c.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    return c.json({ error: "FIREBASE_PROJECT_ID not configured" }, 500);
  }

  const rtdbUrl = `https://${projectId}-default-rtdb.firebaseio.com/live_signals/${entityId}.json`;

  try {
    const res = await fetch(rtdbUrl);
    if (!res.ok) {
      return c.json({ error: "Failed to fetch live signal" }, 502);
    }
    const data = await res.json();
    return c.json({ entityId, data });
  } catch (err: any) {
    return c.json({ error: err.message }, 502);
  }
});

// POST /api/fcm/send — send a push notification via FCM HTTP v1 API
app.post("/fcm/send", async (c) => {
  const {
    token,
    title,
    body,
    data,
  } = await c.req.json<{
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }>();

  if (!token || !title || !body) {
    return c.json({ error: "token, title, and body are required" }, 400);
  }

  const projectId = c.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    return c.json({ error: "FIREBASE_PROJECT_ID not configured" }, 500);
  }

  // FCM HTTP v1 API
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  // In production, you'd use an OAuth2 access token from the service account.
  // For now, this is a placeholder structure — the actual implementation
  // requires an access token obtained via the service account credentials.
  try {
    const res = await fetch(fcmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${accessToken}` — obtained from service account
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: data || {},
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return c.json({ error: `FCM error: ${errorText}` }, 502);
    }

    const result = await res.json();
    return c.json({ success: true, fcm_response: result });
  } catch (err: any) {
    return c.json({ error: err.message }, 502);
  }
});

export default app;
