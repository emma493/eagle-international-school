import Dexie, { Table } from "dexie";

export interface SyncQueueEntry {
  id?: string;
  idempotency_key: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body: any;
  created_at: number;
  attempts: number;
  /** Firebase uid of the user who queued it; only that user may replay it. */
  owner_uid?: string;
}

export interface CachedStudent {
  id: string;
  admission_no: string;
  full_name: string;
  class_id: string;
  photo_url?: string;
  credit_balance: number;
  canteen_paid_until?: string;
  status: string;
  updated_at: number;
}

export interface CachedClass {
  id: string;
  department: string;
  name: string;
  form_master_id?: string;
  updated_at: number;
}

export interface CachedSubject {
  id: string;
  name: string;
  department_group: string;
  updated_at: number;
}

/** Local (mock) users table: Firebase UID -> role, name, email. */
export interface LocalUser {
  id: string; // Firebase UID
  role: "admin" | "headmaster" | "teacher" | "parent";
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: number;
  updated_at: number;
}

/** Local school settings (singleton row, id = 1). */
export interface LocalSchoolSetting {
  id: number;
  school_name: string;
  motto?: string;
  address?: string;
  logo_url?: string;
  headmaster_signature_url?: string;
  current_academic_year: string;
  current_term: string;
  next_reopening_date?: string;
  canteen_daily_rate: number;
  grading_format: "numeric" | "letter";
  maintenance_mode: number;
  updated_at: number;
}

/** Local classes. */
export interface LocalClass {
  id: string;
  department: string;
  name: string;
  form_master_id?: string;
  updated_at: number;
}

/** Local subjects. */
export interface LocalSubject {
  id: string;
  name: string;
  department_group: string;
  updated_at: number;
}

/** Local teacher assignments. */
export interface LocalTeacherAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id?: string;
  updated_at: number;
}

/** Local students. */
export interface LocalStudent {
  id: string;
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
  credit_balance: number;
  canteen_paid_until?: string;
  status: string;
  updated_at: number;
}

/** Local parent-student links. */
export interface LocalParentStudent {
  parent_id: string;
  student_id: string;
  relationship: string;
  is_primary: number;
  updated_at: number;
}

/** Local fee ledger entries. */
export interface LocalFeeLedger {
  id: string;
  idempotency_key: string;
  student_id: string;
  academic_year: string;
  term: string;
  category: "school_fees" | "printing_fees" | "books" | "canteen" | "dues";
  description: string;
  amount_billed: number;
  amount_paid: number;
  status: "paid" | "partial" | "owing";
  created_at: number;
  updated_at: number;
}

/** Local fee payments. */
export interface LocalFeePayment {
  id: string;
  idempotency_key: string;
  student_id: string;
  ledger_id?: string;
  amount: number;
  payment_source: "cash" | "momo" | "bank" | "credit_offset";
  recorded_by: string;
  notes?: string;
  created_at: number;
  updated_at: number;
}

/** Local canteen collections. */
export interface LocalCanteenCollection {
  id: string;
  idempotency_key: string;
  student_id: string;
  teacher_id: string;
  plan_type: "1_day" | "1_week" | "1_month";
  days_covered: number;
  amount: number;
  reconciliation_status: "pending" | "reconciled";
  reconciled_by?: string;
  reconciled_at?: number;
  created_at: number;
  updated_at: number;
}

/** Local attendance records. */
export interface LocalAttendance {
  id: string;
  idempotency_key: string;
  student_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  canteen_credit_awarded: number;
  recorded_by: string;
  updated_at: number;
}

/** Local assessment scores. */
export interface LocalAssessment {
  id: string;
  idempotency_key: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  academic_year: string;
  term: string;
  class_score: number;
  exam_score: number;
  teacher_remarks?: string;
  updated_by?: string;
  updated_at: number;
}

/** Local rubric scores. */
export interface LocalRubricScore {
  id: string;
  idempotency_key: string;
  student_id: string;
  academic_year: string;
  term: string;
  competency: string;
  rating: number;
  updated_by?: string;
  updated_at: number;
}

/** Local terminal reports. */
export interface LocalTerminalReport {
  id: string;
  idempotency_key: string;
  student_id: string;
  class_id: string;
  academic_year: string;
  term: string;
  days_present: number;
  total_days: number;
  conduct?: string;
  attitude?: string;
  interest?: string;
  class_teacher_remarks?: string;
  headmaster_remarks?: string;
  is_published: number;
  published_at?: number;
  created_by?: string;
  updated_at: number;
}

/** Local notifications. */
export interface LocalNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  link_path?: string;
  is_read: number;
  created_at: number;
  updated_at: number;
}

export class EagleDB extends Dexie {
  // Offline sync queue (kept for future backend restoration)
  sync_queue!: Table<SyncQueueEntry, string>;

  // Cached rosters (legacy)
  students!: Table<CachedStudent, string>;
  classes!: Table<CachedClass, string>;
  subjects!: Table<CachedSubject, string>;

  // ---- Local mock data tables (v3) ----
  users!: Table<LocalUser, string>;
  school_settings!: Table<LocalSchoolSetting, number>;
  local_classes!: Table<LocalClass, string>;
  local_subjects!: Table<LocalSubject, string>;
  teacher_assignments!: Table<LocalTeacherAssignment, string>;
  local_students!: Table<LocalStudent, string>;
  parent_students!: Table<LocalParentStudent, [string, string]>;
  fee_ledger!: Table<LocalFeeLedger, string>;
  fee_payments!: Table<LocalFeePayment, string>;
  canteen_collections!: Table<LocalCanteenCollection, string>;
  attendance!: Table<LocalAttendance, string>;
  assessments!: Table<LocalAssessment, string>;
  rubric_scores!: Table<LocalRubricScore, string>;
  terminal_reports!: Table<LocalTerminalReport, string>;
  notifications!: Table<LocalNotification, string>;

  constructor() {
    super("EagleSchoolDB");
    this.version(1).stores({
      sync_queue: "++id, idempotency_key, created_at",
      students: "id, admission_no, class_id, updated_at",
      classes: "id, department, updated_at",
      subjects: "id, department_group, updated_at",
    });
    this.version(2).stores({
      sync_queue: "++id, idempotency_key, created_at",
      students: "id, admission_no, class_id, updated_at",
      classes: "id, department, updated_at",
      subjects: "id, department_group, updated_at",
    });
    this.version(3).stores({
      sync_queue: "++id, idempotency_key, created_at",
      students: "id, admission_no, class_id, updated_at",
      classes: "id, department, updated_at",
      subjects: "id, department_group, updated_at",
      users: "id, role, email",
      school_settings: "++id",
      local_classes: "id, department, updated_at",
      local_subjects: "id, department_group, updated_at",
      teacher_assignments: "id, teacher_id, class_id, subject_id",
      local_students: "id, admission_no, class_id, updated_at",
      parent_students: "[parent_id+student_id], student_id",
      fee_ledger: "id, idempotency_key, student_id, category, status",
      fee_payments: "id, idempotency_key, student_id, ledger_id, created_at",
      canteen_collections: "id, idempotency_key, student_id, teacher_id, reconciliation_status",
      attendance: "id, idempotency_key, student_id, date",
      assessments: "id, idempotency_key, student_id, subject_id, academic_year, term",
      rubric_scores: "id, idempotency_key, student_id, academic_year, term, competency",
      terminal_reports: "id, idempotency_key, student_id, class_id, academic_year, term, is_published",
      notifications: "id, user_id, is_read, created_at",
    });
  }

  async enqueueSync(entry: Omit<SyncQueueEntry, "id">) {
    return this.sync_queue.add({
      ...entry,
      created_at: Date.now(),
      attempts: 0,
    });
  }

  async getPendingSync() {
    return this.sync_queue.toCollection().sortBy("created_at");
  }

  async removeSync(id: string) {
    return this.sync_queue.delete(id);
  }

  /** Wipe cached school data (rosters etc.) on sign-out so the next person on a shared device can't see it. The sync queue is kept. */
  async clearCaches() {
    await Promise.all([
      this.students.clear(),
      this.classes.clear(),
      this.subjects.clear(),
    ]);
  }

  async clearSync() {
    return this.sync_queue.clear();
  }
}

export const db = new EagleDB();
