import { createMiddleware } from "hono/factory";
import { verifyIdToken } from "../lib/jwt";

export const firebaseAuthMiddleware = createMiddleware<{
  Bindings: {
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await verifyIdToken(c.env, token);
    c.set("userId", decoded.uid);
    c.set("userRole", (decoded as any).role || "parent");
    await next();
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});
