import { auth } from "../firebase/config";
import { db } from "@/dexie/db";
import { markServerContact } from "@/lib/syncStatus";
import {
  MOCK_USERS,
  MOCK_SETTINGS,
  MOCK_CLASSES,
  MOCK_SUBJECTS,
  MOCK_ASSIGNMENTS,
  MOCK_STUDENTS,
  MOCK_PARENT_STUDENTS,
  MOCK_FEE_LEDGER,
  MOCK_FEE_PAYMENTS,
  MOCK_CANTEEN_COLLECTIONS,
  MOCK_ATTENDANCE,
  MOCK_ASSESSMENTS,
  MOCK_RUBRIC_SCORES,
  MOCK_TERMINAL_REPORTS,
  MOCK_NOTIFICATIONS,
  seedMockData,
} from "@/lib/mockData";

/** Events the AuthProvider listens to. */
export const SESSION_EXPIRED_EVENT = "eagle:session-expired";
export const MAINTENANCE_EVENT = "eagle:maintenance";

/** ------------------------------------------------------------------ */
/** Mock helpers                                                       */
/** ------------------------------------------------------------------ */

const now = Date.now();

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function mockResponse(body: any, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status < 400 ? "OK" : "Error",
    headers: { "Content-Type": "application/json" },
  });
}

function mockError(message: string, status = 400, code?: string): Response {
  const body: any = { error: message };
  if (code) body.code = code;
  return mockResponse(body, status);
}

/** ------------------------------------------------------------------ */
/** Current user (from Firebase Auth + local users table)              */
/** ------------------------------------------------------------------ */

async function currentUid(): Promise<string | null> {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

async function currentRole(): Promise<string | null> {
  const uid = await currentUid();
  if (!uid) return null;
  const row = await db.users.get(uid);
  return row?.role ?? null;
}

/** ------------------------------------------------------------------ */
/** Generic mock fetch: route path + method to Dexie                   */
/** ------------------------------------------------------------------ */

async function mockFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  const url = new URL("http://localhost" + path);
  const pathname = url.pathname;

  // Seed mock data on first use
  await seedMockData();

  const uid = await currentUid();
  const role = await currentRole();

  // Helper: parse id from path like /api/students/:id
  function idFromPath(prefix: string): string | null {
    const m = pathname.match(new RegExp(`^${prefix}/([^/]+)$`));
    return m ? m[1] : null;
  }

  // ---- /api/me ----
  if (pathname === "/api/me" && method === "GET") {
    if (!uid) return mockError("Not signed in", 401, "not_authenticated");
    const row = await db.users.get(uid);
    if (!row) return mockError("Account not ready", 403, "no_role");
    const settings = await db.school_settings.get(1);
    return mockResponse({
      id: row.id,
      role: row.role,
      full_name: row.full_name,
      maintenance: Number(settings?.maintenance_mode) === 1 && row.role !== "admin",
      school_name: settings?.school_name ?? null,
      logo_url: settings?.logo_url ?? null,
    });
  }

  // ---- /api/dashboard ----
  if (pathname === "/api/dashboard" && method === "GET") {
    if (role === "headmaster") {
      const students = await db.local_students.count();
      const teachers = await db.users.where("role").equals("teacher").filter((u) => u.is_active === 1).count();
      const owing = await db.fee_ledger.where("status").equals("owing").toArray();
      const feesOwing = owing.reduce((sum, l) => sum + (l.amount_billed - l.amount_paid), 0);
      const pending = await db.canteen_collections.where("reconciliation_status").equals("pending").toArray();
      const cashPending = pending.reduce((sum, c) => sum + c.amount, 0);
      return mockResponse({ students, teachers, fees_owing: feesOwing, cash_to_reconcile: cashPending });
    }
    if (role === "teacher") {
      const pending = await db.canteen_collections
        .where("teacher_id")
        .equals(uid ?? "")
        .filter((c) => c.reconciliation_status === "pending")
        .toArray();
      const cashInHand = pending.reduce((sum, c) => sum + c.amount, 0);
      return mockResponse({ cash_in_hand: cashInHand });
    }
    return mockResponse({});
  }

  // ---- /api/accounts ----
  if (pathname === "/api/accounts" && method === "GET") {
    if (!["admin", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const roleFilter = url.searchParams.get("role");
    const allowed = role === "admin" ? ["admin", "headmaster", "teacher", "parent"] : ["headmaster", "teacher", "parent"];
    const roles = roleFilter && allowed.includes(roleFilter) ? [roleFilter] : allowed;
    const rows = await db.users.where("role").anyOf(roles).filter((u) => u.is_active === 1).toArray();
    return mockResponse({ accounts: rows.map((r) => ({ id: r.id, role: r.role, full_name: r.full_name, email: r.email, phone: r.phone, is_active: r.is_active })) });
  }
  if (pathname === "/api/accounts" && method === "POST") {
    if (!["admin", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.full_name || !body.role || !body.password || body.password.length < 6 || !(body.email || body.phone)) {
      return mockError("full_name, role, password (6+ chars) and email or phone are required", 400);
    }
    const newId = id("user");
    await db.users.add({
      id: newId,
      role: body.role,
      full_name: body.full_name,
      email: body.email || undefined,
      phone: body.phone || undefined,
      avatar_url: undefined,
      is_active: 1,
      updated_at: now,
    });
    return mockResponse({ id: newId, role: body.role, full_name: body.full_name }, 201);
  }

  // ---- /api/accounts/:id/reset-password ----
  const resetPwdMatch = pathname.match(/^\/api\/accounts\/([^/]+)\/reset-password$/);
  if (resetPwdMatch && method === "POST") {
    if (!["admin", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.password || body.password.length < 6) return mockError("Password must be 6+ characters", 400);
    return mockResponse({ ok: true });
  }

  // ---- /api/accounts/:id/active ----
  const activeMatch = pathname.match(/^\/api\/accounts\/([^/]+)\/active$/);
  if (activeMatch && method === "PATCH") {
    if (!["admin", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    return mockResponse({ ok: true });
  }

  // ---- /api/admin/staff ----
  if (pathname === "/api/admin/staff" && method === "POST") {
    if (!["admin", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.id || !body.full_name || !body.role) return mockError("id (Firebase UID), full_name, and role are required", 400);
    const existing = await db.users.get(body.id);
    if (existing) return mockError("User already exists", 409);
    await db.users.add({
      id: body.id,
      role: body.role,
      full_name: body.full_name,
      email: body.email || undefined,
      phone: body.phone || undefined,
      avatar_url: body.avatar_url || undefined,
      is_active: 1,
      updated_at: now,
    });
    return mockResponse({ id: body.id, role: body.role, full_name: body.full_name }, 201);
  }

  // ---- /api/classes ----
  if (pathname === "/api/classes" && method === "GET") {
    const rows = await db.local_classes.toArray();
    return mockResponse({ classes: rows });
  }
  if (pathname === "/api/classes" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.department || !body.name) return mockError("department and name are required", 400);
    const newId = id("cls");
    await db.local_classes.add({ id: newId, department: body.department, name: body.name, form_master_id: body.form_master_id || undefined, updated_at: now });
    return mockResponse({ id: newId, department: body.department, name: body.name, form_master_id: body.form_master_id }, 201);
  }
  const classId = idFromPath("/api/classes");
  if (classId && method === "GET") {
    const row = await db.local_classes.get(classId);
    if (!row) return mockError("Class not found", 404);
    return mockResponse({ class: row });
  }
  if (classId && method === "PUT") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  if (classId && method === "DELETE") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }

  // ---- /api/subjects ----
  if (pathname === "/api/subjects" && method === "GET") {
    const rows = await db.local_subjects.toArray();
    return mockResponse({ subjects: rows });
  }
  if (pathname === "/api/subjects" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.name || !body.department_group) return mockError("name and department_group are required", 400);
    const newId = id("subj");
    await db.local_subjects.add({ id: newId, name: body.name, department_group: body.department_group, updated_at: now });
    return mockResponse({ id: newId, name: body.name, department_group: body.department_group }, 201);
  }
  const subjId = idFromPath("/api/subjects");
  if (subjId && method === "GET") {
    const row = await db.local_subjects.get(subjId);
    if (!row) return mockError("Subject not found", 404);
    return mockResponse({ subject: row });
  }
  if (subjId && method === "PUT") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  if (subjId && method === "DELETE") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }

  // ---- /api/teacher-assignments ----
  if (pathname === "/api/teacher-assignments" && method === "GET") {
    const rows = await db.teacher_assignments.toArray();
    return mockResponse({ assignments: rows });
  }
  if (pathname === "/api/teacher-assignments" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.teacher_id || !body.class_id) return mockError("teacher_id and class_id are required", 400);
    const newId = id("ta");
    await db.teacher_assignments.add({ id: newId, teacher_id: body.teacher_id, class_id: body.class_id, subject_id: body.subject_id || undefined, updated_at: now });
    return mockResponse({ id: newId, teacher_id: body.teacher_id, class_id: body.class_id, subject_id: body.subject_id }, 201);
  }
  const taId = idFromPath("/api/teacher-assignments");
  if (taId && method === "DELETE") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  const taTeacherMatch = pathname.match(/^\/api\/teacher-assignments\/teacher\/([^/]+)$/);
  if (taTeacherMatch && method === "GET") {
    const rows = await db.teacher_assignments.where("teacher_id").equals(taTeacherMatch[1]).toArray();
    return mockResponse({ assignments: rows });
  }
  const taClassMatch = pathname.match(/^\/api\/teacher-assignments\/class\/([^/]+)$/);
  if (taClassMatch && method === "GET") {
    const rows = await db.teacher_assignments.where("class_id").equals(taClassMatch[1]).toArray();
    return mockResponse({ assignments: rows });
  }

  // ---- /api/students ----
  if (pathname === "/api/students" && method === "GET") {
    const classIdParam = url.searchParams.get("class_id");
    let rows: any[] = await db.local_students.toArray();
    if (classIdParam) rows = rows.filter((s) => s.class_id === classIdParam);
    if (role === "teacher") {
      const myClasses = await db.teacher_assignments.where("teacher_id").equals(uid ?? "").toArray();
      const classIds = new Set(myClasses.map((a) => a.class_id));
      const formClasses = await db.local_classes.where("form_master_id").equals(uid ?? "").toArray();
      formClasses.forEach((c) => classIds.add(c.id));
      rows = rows.filter((s) => classIds.has(s.class_id));
    }
    const classMap = new Map((await db.local_classes.toArray()).map((c) => [c.id, c] as [string, any]));
    rows = rows.map((s) => ({ ...s, class_name: classMap.get(s.class_id)?.name, department: classMap.get(s.class_id)?.department }));
    return mockResponse({ students: rows });
  }
  if (pathname === "/api/students" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.admission_no || !body.full_name || !body.class_id) return mockError("admission_no, full_name, and class_id are required", 400);
    const newId = id("stu");
    await db.local_students.add({
      id: newId,
      admission_no: body.admission_no,
      full_name: body.full_name,
      dob: body.dob || undefined,
      gender: body.gender || undefined,
      photo_url: body.photo_url || undefined,
      class_id: body.class_id,
      medical_notes: body.medical_notes || undefined,
      blood_group: body.blood_group || undefined,
      address_gps: body.address_gps || undefined,
      pickup_contacts_json: body.pickup_contacts_json || undefined,
      credit_balance: 0,
      canteen_paid_until: undefined,
      status: "active",
      updated_at: now,
    });
    return mockResponse({ id: newId, admission_no: body.admission_no, full_name: body.full_name, class_id: body.class_id }, 201);
  }
  const studentId = idFromPath("/api/students");
  if (studentId && method === "GET") {
    const row = await db.local_students.get(studentId);
    if (!row) return mockError("Student not found", 404);
    if (role === "teacher") {
      const hasAccess = await db.teacher_assignments.where("teacher_id").equals(uid ?? "").and((a) => a.class_id === row.class_id).count() > 0;
      const isFormMaster = await db.local_classes.where("id").equals(row.class_id).and((c) => c.form_master_id === uid).count() > 0;
      if (!hasAccess && !isFormMaster) return mockError("Student not found", 404);
    }
    let pickup: any[] = [];
    if (row.pickup_contacts_json) {
      try { pickup = JSON.parse(row.pickup_contacts_json); } catch { pickup = []; }
    }
    return mockResponse({ student: { ...row, pickup_contacts: pickup } });
  }
  if (studentId && method === "PUT") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  if (studentId && method === "DELETE") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }

  // ---- /api/school-settings ----
  if (pathname === "/api/school-settings" && method === "GET") {
    const row = await db.school_settings.get(1);
    return mockResponse({ settings: row });
  }
  if (pathname === "/api/school-settings" && method === "PUT") {
    if (!["admin", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    const ADMIN_FIELDS = ["school_name", "motto", "address", "logo_url", "headmaster_signature_url", "maintenance_mode"];
    const HEADMASTER_FIELDS = ["headmaster_signature_url", "current_academic_year", "current_term", "next_reopening_date", "canteen_daily_rate", "grading_format"];
    const allowed = role === "admin" ? ADMIN_FIELDS : HEADMASTER_FIELDS;
    const sets = allowed.filter((k) => body[k] !== undefined && body[k] !== null && body[k] !== "");
    if (sets.length) {
      const updates: any = { updated_at: now };
      for (const k of sets) updates[k] = body[k];
      await db.school_settings.update(1, updates);
    }
    return mockResponse({ success: true, updated: sets });
  }

  // ---- /api/fee-ledger ----
  if (pathname === "/api/fee-ledger" && method === "GET") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const studentId = url.searchParams.get("student_id");
    const category = url.searchParams.get("category");
    let rows = await db.fee_ledger.toArray();
    if (studentId) rows = rows.filter((l) => l.student_id === studentId);
    if (category) rows = rows.filter((l) => l.category === category);
    const studentMap = new Map((await db.local_students.toArray()).map((s) => [s.id, s] as [string, any]));
    rows = rows.map((l) => ({ ...l, student_name: studentMap.get(l.student_id)?.full_name, admission_no: studentMap.get(l.student_id)?.admission_no }));
    return mockResponse({ ledger: rows });
  }
  if (pathname === "/api/fee-ledger" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.student_id || !body.academic_year || !body.term || !body.category || !body.description || body.amount_billed == null) {
      return mockError("student_id, academic_year, term, category, description, and amount_billed are required", 400);
    }
    const newId = id("fl");
    const key = body.idempotency_key || id("idem");
    await db.fee_ledger.add({
      id: newId,
      idempotency_key: key,
      student_id: body.student_id,
      academic_year: body.academic_year,
      term: body.term,
      category: body.category,
      description: body.description,
      amount_billed: body.amount_billed,
      amount_paid: 0,
      status: "owing",
      created_at: now,
      updated_at: now,
    });
    return mockResponse({ id: newId, idempotency_key: key, student_id: body.student_id, category: body.category, amount_billed: body.amount_billed, status: "owing" }, 201);
  }
  const flId = idFromPath("/api/fee-ledger");
  if (flId && method === "PUT") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }

  // ---- /api/fee-payments ----
  if (pathname === "/api/fee-payments" && method === "GET") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const rows = await db.fee_payments.toArray();
    return mockResponse({ payments: rows });
  }
  if (pathname === "/api/fee-payments" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.student_id || body.amount == null || !body.payment_source) return mockError("student_id, amount and payment_source are required", 400);
    if (!["cash", "momo", "bank"].includes(body.payment_source)) return mockError("payment_source must be cash, momo or bank", 400);
    const newId = id("fp");
    const key = body.idempotency_key || id("idem");
    await db.fee_payments.add({
      id: newId,
      idempotency_key: key,
      student_id: body.student_id,
      ledger_id: body.ledger_id || undefined,
      amount: body.amount,
      payment_source: body.payment_source,
      recorded_by: uid || "hm_uid_001",
      notes: body.notes || undefined,
      created_at: now,
      updated_at: now,
    });
    return mockResponse({ id: newId, idempotency_key: key, student_id: body.student_id, ledger_id: body.ledger_id, amount: body.amount, payment_source: body.payment_source, status: "recorded" }, 201);
  }

  // ---- /api/canteen-collections ----
  if (pathname === "/api/canteen-collections" && method === "GET") {
    const teacherId = role === "teacher" ? uid : url.searchParams.get("teacher_id");
    const reconciliationStatus = url.searchParams.get("reconciliation_status");
    let rows = await db.canteen_collections.toArray();
    if (teacherId) rows = rows.filter((c) => c.teacher_id === teacherId);
    if (reconciliationStatus) rows = rows.filter((c) => c.reconciliation_status === reconciliationStatus);
    const studentMap = new Map((await db.local_students.toArray()).map((s) => [s.id, s] as [string, any]));
    const userMap = new Map((await db.users.toArray()).map((u) => [u.id, u] as [string, any]));
    rows = rows.map((c) => ({
      ...c,
      student_name: studentMap.get(c.student_id)?.full_name,
      admission_no: studentMap.get(c.student_id)?.admission_no,
      teacher_name: userMap.get(c.teacher_id)?.full_name,
    }));
    return mockResponse({ collections: rows });
  }
  if (pathname === "/api/canteen-collections" && method === "POST") {
    if (role !== "teacher") return mockError("Only teachers record canteen collections", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.student_id || !body.plan_type || body.days_covered == null || body.amount == null) {
      return mockError("student_id, plan_type, days_covered, and amount are required", 400);
    }
    const newId = id("cc");
    const key = body.idempotency_key || id("idem");
    await db.canteen_collections.add({
      id: newId,
      idempotency_key: key,
      student_id: body.student_id,
      teacher_id: uid || "t_uid_001",
      plan_type: body.plan_type,
      days_covered: body.days_covered,
      amount: body.amount,
      reconciliation_status: "pending",
      reconciled_by: undefined,
      reconciled_at: undefined,
      created_at: now,
      updated_at: now,
    });
    return mockResponse({ id: newId, idempotency_key: key, student_id: body.student_id, teacher_id: uid, plan_type: body.plan_type, days_covered: body.days_covered, amount: body.amount, reconciliation_status: "pending" }, 201);
  }
  const ccReconcileMatch = pathname.match(/^\/api\/canteen-collections\/([^/]+)\/reconcile$/);
  if (ccReconcileMatch && method === "PUT") {
    if (role !== "headmaster") return mockError("Only the headmaster confirms cash received", 403);
    return mockResponse({ success: true, reconciliation_status: "reconciled" });
  }
  if (pathname === "/api/canteen-collections/reconcile/pending" && method === "GET") {
    const teacherId = role === "teacher" ? uid : url.searchParams.get("teacher_id");
    let rows = await db.canteen_collections.where("reconciliation_status").equals("pending").toArray();
    if (teacherId) rows = rows.filter((c) => c.teacher_id === teacherId);
    const total_amount = rows.reduce((sum, c) => sum + c.amount, 0);
    return mockResponse({ pending: { count: rows.length, total_amount } });
  }

  // ---- /api/attendance ----
  if (pathname === "/api/attendance" && method === "GET") {
    const studentId = url.searchParams.get("student_id");
    const date = url.searchParams.get("date");
    const classId = url.searchParams.get("class_id");
    let rows = await db.attendance.toArray();
    if (studentId) rows = rows.filter((a) => a.student_id === studentId);
    if (date) rows = rows.filter((a) => a.date === date);
    if (role === "teacher") {
      const myClassIds = new Set((await db.teacher_assignments.where("teacher_id").equals(uid ?? "").toArray()).map((a) => a.class_id));
      const formClasses = await db.local_classes.where("form_master_id").equals(uid ?? "").toArray();
      formClasses.forEach((c) => myClassIds.add(c.id));
      const filtered: any[] = [];
      for (const a of rows) {
        const s = await db.local_students.get(a.student_id);
        if (s && myClassIds.has(s.class_id)) filtered.push(a);
      }
      rows = filtered;
    }
    return mockResponse({ attendance: rows });
  }
  if (pathname === "/api/attendance" && method === "POST") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.student_id || !body.date || !body.status) return mockError("student_id, date and status are required", 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !["present", "absent", "late", "excused"].includes(body.status)) {
      return mockError("date must be YYYY-MM-DD and status present, absent, late or excused", 400);
    }
    const newId = id("att");
    const key = body.idempotency_key || id("idem");
    let canteenCredit = 0;
    if (body.status === "absent") {
      canteenCredit = 1;
      await db.local_students.update(body.student_id, (s) => { if (s) s.credit_balance = (s.credit_balance || 0) + 20; });
    }
    await db.attendance.add({
      id: newId,
      idempotency_key: key,
      student_id: body.student_id,
      date: body.date,
      status: body.status,
      canteen_credit_awarded: canteenCredit,
      recorded_by: uid || "t_uid_001",
      updated_at: now,
    });
    return mockResponse({ id: newId, idempotency_key: key, student_id: body.student_id, date: body.date, status: body.status, canteen_credit_awarded: canteenCredit, credit_awarded_amount: canteenCredit * 20 }, 201);
  }

  // ---- /api/credit-offset ----
  if (pathname === "/api/credit-offset" && method === "POST") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true, id: id("co") });
  }
  const coStudentMatch = pathname.match(/^\/api\/credit-offset\/student\/([^/]+)$/);
  if (coStudentMatch && method === "GET") {
    const row = await db.local_students.get(coStudentMatch[1]);
    if (!row) return mockError("Student not found", 404);
    return mockResponse({ id: row.id, full_name: row.full_name, admission_no: row.admission_no, credit_balance: row.credit_balance });
  }

  // ---- /api/notifications ----
  if (pathname === "/api/notifications" && method === "GET") {
    if (!uid) return mockError("Not signed in", 401);
    const unreadOnly = url.searchParams.get("unread_only") === "1";
    let rows = await db.notifications.where("user_id").equals(uid).toArray();
    if (unreadOnly) rows = rows.filter((n) => n.is_read === 0);
    rows.sort((a, b) => b.created_at - a.created_at);
    return mockResponse({ notifications: rows.slice(0, 50) });
  }
  if (pathname === "/api/notifications/unread" && method === "GET") {
    if (!uid) return mockError("Not signed in", 401);
    const count = await db.notifications.where("user_id").equals(uid).filter((n) => n.is_read === 0).count();
    return mockResponse({ unread_count: count });
  }
  const notifReadMatch = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === "PUT") {
    await db.notifications.update(notifReadMatch[1], { is_read: 1 });
    return mockResponse({ success: true });
  }
  if (pathname === "/api/notifications" && method === "POST") {
    if (!["headmaster", "admin"].includes(role ?? "")) return mockError("Insufficient permissions", 403);
    return mockResponse({ id: id("notif") }, 201);
  }

  // ---- /api/terminal-reports ----
  if (pathname === "/api/terminal-reports" && method === "GET") {
    let rows = await db.terminal_reports.toArray();
    if (role === "teacher") {
      const myClassIds = new Set((await db.teacher_assignments.where("teacher_id").equals(uid ?? "").toArray()).map((a) => a.class_id));
      const formClasses = await db.local_classes.where("form_master_id").equals(uid ?? "").toArray();
      formClasses.forEach((c) => myClassIds.add(c.id));
      rows = rows.filter((r) => myClassIds.has(r.class_id));
    }
    if (role === "parent") {
      const linked = await db.parent_students.where("parent_id").equals(uid ?? "").toArray();
      const studentIds = new Set(linked.map((p) => p.student_id));
      rows = rows.filter((r) => r.is_published === 1 && studentIds.has(r.student_id));
    }
    const studentMap = new Map((await db.local_students.toArray()).map((s) => [s.id, s] as [string, any]));
    const classMap = new Map((await db.local_classes.toArray()).map((c) => [c.id, c] as [string, any]));
    rows = rows.map((r) => ({ ...r, student_name: studentMap.get(r.student_id)?.full_name, admission_no: studentMap.get(r.student_id)?.admission_no, class_name: classMap.get(r.class_id)?.name, department: classMap.get(r.class_id)?.department }));
    return mockResponse({ reports: rows });
  }
  if (pathname === "/api/terminal-reports" && method === "POST") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (!body.student_id || !body.class_id || !body.academic_year || !body.term) return mockError("student_id, class_id, academic_year, and term are required", 400);
    const newId = id("tr");
    const key = body.idempotency_key || id("idem");
    await db.terminal_reports.add({
      id: newId,
      idempotency_key: key,
      student_id: body.student_id,
      class_id: body.class_id,
      academic_year: body.academic_year,
      term: body.term,
      days_present: body.days_present || 0,
      total_days: body.total_days || 0,
      conduct: body.conduct || undefined,
      attitude: body.attitude || undefined,
      interest: body.interest || undefined,
      class_teacher_remarks: body.class_teacher_remarks || undefined,
      headmaster_remarks: body.headmaster_remarks || undefined,
      is_published: 0,
      published_at: undefined,
      created_by: uid || "t_uid_001",
      updated_at: now,
    });
    return mockResponse({ id: newId, student_id: body.student_id, class_id: body.class_id, academic_year: body.academic_year, term: body.term, is_published: 0 }, 201);
  }
  const trId = idFromPath("/api/terminal-reports");
  if (trId && method === "PUT") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  const trPublishMatch = pathname.match(/^\/api\/terminal-reports\/([^/]+)\/publish$/);
  if (trPublishMatch && method === "POST") {
    if (role !== "headmaster") return mockError("Only headmaster can publish reports", 403);
    await db.terminal_reports.update(trPublishMatch[1], { is_published: 1, published_at: now });
    return mockResponse({ success: true, is_published: 1, published_at: new Date().toISOString() });
  }

  // ---- /api/assessments ----
  if (pathname === "/api/assessments" && method === "GET") {
    let rows = await db.assessments.toArray();
    if (role === "teacher") {
      const myClassIds = new Set((await db.teacher_assignments.where("teacher_id").equals(uid ?? "").toArray()).map((a) => a.class_id));
      const formClasses = await db.local_classes.where("form_master_id").equals(uid ?? "").toArray();
      formClasses.forEach((c) => myClassIds.add(c.id));
      rows = rows.filter((a) => myClassIds.has(a.class_id));
    }
    return mockResponse({ assessments: rows });
  }
  if (pathname === "/api/assessments" && method === "POST") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    return mockResponse({ id: id("assess") }, 201);
  }
  const assessId = idFromPath("/api/assessments");
  if (assessId && method === "PUT") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  if (assessId && method === "DELETE") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }

  // ---- /api/rubric-scores ----
  if (pathname === "/api/rubric-scores" && method === "GET") {
    const rows = await db.rubric_scores.toArray();
    return mockResponse({ rubricScores: rows });
  }
  if (pathname === "/api/rubric-scores" && method === "POST") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    return mockResponse({ id: id("rubric") }, 201);
  }
  const rubricId = idFromPath("/api/rubric-scores");
  if (rubricId && method === "PUT") {
    if (!["teacher", "headmaster"].includes(role ?? "")) return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }
  if (rubricId && method === "DELETE") {
    if (role !== "headmaster") return mockError("Forbidden", 403);
    return mockResponse({ success: true });
  }

  // ---- /api/parent/children ----
  if (pathname === "/api/parent/children" && method === "GET") {
    if (role !== "parent") return mockError("Parents only", 403);
    const rows = await db.parent_students.where("parent_id").equals(uid ?? "").toArray();
    const studentIds = rows.map((p) => p.student_id);
    const students = await Promise.all(studentIds.map((sid) => db.local_students.get(sid)));
    const classMap = new Map((await db.local_classes.toArray()).map((c) => [c.id, c] as [string, any]));
    const children = students.filter(Boolean).map((s) => ({
      id: s!.id,
      full_name: s!.full_name,
      admission_no: s!.admission_no,
      photo_url: s!.photo_url,
      credit_balance: s!.credit_balance,
      canteen_paid_until: s!.canteen_paid_until,
      class_name: classMap.get(s!.class_id)?.name,
    }));
    return mockResponse({ children });
  }

  // ---- /api/parent/overview/:id ----
  const parentOverviewMatch = pathname.match(/^\/api\/parent\/overview\/([^/]+)$/);
  if (parentOverviewMatch && method === "GET") {
    if (role !== "parent") return mockError("Parents only", 403);
    const studentId = parentOverviewMatch[1];
    const linked = await db.parent_students.where("parent_id").equals(uid ?? "").and((p) => p.student_id === studentId).count();
    if (!linked) return mockError("Forbidden", 403);
    const ledger = await db.fee_ledger.where("student_id").equals(studentId).toArray();
    const total_debt = ledger.reduce((a, r) => a + Math.max(0, r.amount_billed - r.amount_paid), 0);
    const by_category: Record<string, number> = {};
    ledger.forEach((r) => { const d = Math.max(0, r.amount_billed - r.amount_paid); if (d > 0) by_category[r.category] = (by_category[r.category] || 0) + d; });
    const stu = await db.local_students.get(studentId);
    const reports = await db.terminal_reports.where("student_id").equals(studentId).and((r) => r.is_published === 1).toArray();
    return mockResponse({
      total_debt,
      by_category,
      surplus_credit: stu?.credit_balance || 0,
      canteen_paid_until: stu?.canteen_paid_until || undefined,
      books: ledger.filter((r) => r.category === "books"),
      ledger,
      attendance: [],
      payments: [],
      reports,
    });
  }

  // ---- /api/live-signals ----
  if (pathname.match(/^\/api\/live-signals\//) && method === "GET") {
    return mockResponse({ entityId: pathname.split("/").pop(), data: { updated_at: now } });
  }
  if (pathname.match(/^\/api\/live-signals\//) && method === "POST") {
    return mockResponse({ success: true, entityId: pathname.split("/").pop() });
  }
  if (pathname === "/api/live-signals/fcm/register" && method === "POST") {
    return mockResponse({ success: true });
  }
  if (pathname === "/api/live-signals/fcm/send" && method === "POST") {
    return mockResponse({ success: true });
  }

  // ---- /api/sync/batch ----
  if (pathname === "/api/sync/batch" && method === "POST") {
    return mockResponse({ success: true, processed: 0, failed: 0, results: [] });
  }

  // ---- fallback ----
  return mockError("Not found", 404);
}

/** ------------------------------------------------------------------ */
/** Exported API                                                       */
/** ------------------------------------------------------------------ */

let lastServerContact = 0;

/**
 * Authenticated fetch (mock): routes to local Dexie storage.
 * No network call is made; the "server" is always reachable.
 */
export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;

  const res = await mockFetch(path, { ...options, headers });
  if (res.status < 500) {
    lastServerContact = Date.now();
    markServerContact();
  }
  return res;
}

/**
 * Parsed JSON from apiRequest. Throws on non-ok status.
 */
export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiRequest(path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Offline-first write: writes directly to local Dexie storage.
 * Since there is no backend, everything is applied immediately.
 */
export async function saveOrQueue(method: "POST" | "PUT" | "PATCH" | "DELETE", path: string, body: any) {
  const key = crypto.randomUUID();
  try {
    const res = await mockFetch(path, { method, body: JSON.stringify(body), headers: { "Content-Type": "application/json", "Idempotency-Key": key } });
    if (!res.ok) throw new Error(await readError(res));
    return { queued: false };
  } catch (e) {
    throw e;
  }
}

/** Pulls a human message out of a mock error response. */
export async function readError(res: Response): Promise<string> {
  try { const j = await res.clone().json(); if (j?.error) return String(j.error); } catch { /* not JSON */ }
  return (await res.text().catch(() => "")) || `Request failed (${res.status})`;
}

/** Student roster from local Dexie storage (with cache fallback). */
export async function getStudentsCached(): Promise<any[]> {
  try {
    let rows = await db.local_students.toArray();
    const classMap = new Map((await db.local_classes.toArray()).map((c) => [c.id, c] as [string, any]));
    rows = rows.map((s) => ({ ...s, class_name: classMap.get(s.class_id)?.name, department: classMap.get(s.class_id)?.department }));
    return rows;
  } catch {
    return [];
  }
}

/** Returns the timestamp of last successful server contact (mock: always recent). */
export function getLastServerContact() {
  return lastServerContact || Date.now();
}
