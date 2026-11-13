import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  return c.json({ status: "ok", service: "eagle-school-worker" });
});

export default app;
