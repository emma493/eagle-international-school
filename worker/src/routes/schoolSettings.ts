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

// GET /api/school-settings — get school settings
app.get("/", async (c) => {
  const db = getTursoClient(c.env);
  const result = await db.execute("SELECT * FROM school_settings WHERE id = 1");
  if (result.rows.length === 0) {
    return c.json({ error: "School settings not found" }, 404);
  }
  return c.json({ settings: result.rows[0] });
});

// PUT /api/school-settings — update school settings
app.put("/", async (c) => {
  const {
    school_name, motto, address, logo_url, headmaster_signature_url,
    current_academic_year, current_term, next_reopening_date,
    canteen_daily_rate, grading_format, maintenance_mode,
  } = await c.req.json<{
    school_name?: string;
    motto?: string;
    address?: string;
    logo_url?: string;
    headmaster_signature_url?: string;
    current_academic_year?: string;
    current_term?: string;
    next_reopening_date?: string;
    canteen_daily_rate?: number;
    grading_format?: "numeric" | "letter";
    maintenance_mode?: number;
  }>();

  const db = getTursoClient(c.env);
  const existing = await db.execute("SELECT id FROM school_settings WHERE id = 1");
  if (existing.rows.length === 0) {
    return c.json({ error: "School settings not found" }, 404);
  }

  await db.execute(
    `UPDATE school_settings SET
      school_name = COALESCE(?, school_name),
      motto = COALESCE(?, motto),
      address = COALESCE(?, address),
      logo_url = COALESCE(?, logo_url),
      headmaster_signature_url = COALESCE(?, headmaster_signature_url),
      current_academic_year = COALESCE(?, current_academic_year),
      current_term = COALESCE(?, current_term),
      next_reopening_date = COALESCE(?, next_reopening_date),
      canteen_daily_rate = COALESCE(?, canteen_daily_rate),
      grading_format = COALESCE(?, grading_format),
      maintenance_mode = COALESCE(?, maintenance_mode)
     WHERE id = 1`,
    [
      school_name || null, motto || null, address || null, logo_url || null,
      headmaster_signature_url || null, current_academic_year || null,
      current_term || null, next_reopening_date || null,
      canteen_daily_rate ?? null, grading_format || null,
      maintenance_mode ?? null
    ]
  );

  return c.json({ success: true });
});

export default app;
