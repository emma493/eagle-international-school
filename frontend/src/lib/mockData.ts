/**
 * Mock data seed for Eagle International School frontend (offline-first, no backend).
 *
 * Populates Dexie with realistic demo data so all portals work without a worker.
 * Run seedMockData() once on app initialisation (see main.tsx or AuthProvider).
 */

import { db } from "@/dexie/db";
import type {
  LocalUser,
  LocalSchoolSetting,
  LocalClass,
  LocalSubject,
  LocalTeacherAssignment,
  LocalStudent,
  LocalParentStudent,
  LocalFeeLedger,
  LocalFeePayment,
  LocalCanteenCollection,
  LocalAttendance,
  LocalAssessment,
  LocalRubricScore,
  LocalTerminalReport,
  LocalNotification,
} from "@/dexie/db";

const now = Date.now();
const DAY = 86_400_000;

/** Deterministic UUID-like ids for mock data. */
function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

/** ------------------------------------------------------------------ */
/** 1. USERS (Firebase UID -> role)                                    */
/** ------------------------------------------------------------------ */

export const MOCK_USERS: LocalUser[] = [
  // Admin
  {
    id: "admin_uid_001",
    role: "admin",
    full_name: "Administrator",
    email: "peprahe893@gmail.com",
    phone: undefined,
    avatar_url: undefined,
    is_active: 1,
    updated_at: now,
  },
  // Headmaster
  {
    id: "hm_uid_001",
    role: "headmaster",
    full_name: "Headmaster Owusu",
    email: "headmaster@eis.edu.gh",
    phone: "0240000001",
    avatar_url: undefined,
    is_active: 1,
    updated_at: now,
  },
  // Teachers
  {
    id: "t_uid_001",
    role: "teacher",
    full_name: "Ms. Akosua Mensah",
    email: "akosua@eis.edu.gh",
    phone: "0240000002",
    avatar_url: undefined,
    is_active: 1,
    updated_at: now,
  },
  {
    id: "t_uid_002",
    role: "teacher",
    full_name: "Mr. Kwame Asare",
    email: "kwame@eis.edu.gh",
    phone: "0240000003",
    avatar_url: undefined,
    is_active: 1,
    updated_at: now,
  },
  // Parents
  {
    id: "p_uid_001",
    role: "parent",
    full_name: "Mrs. Esi Arthur",
    email: "esi@example.com",
    phone: "0240000010",
    avatar_url: undefined,
    is_active: 1,
    updated_at: now,
  },
  {
    id: "p_uid_002",
    role: "parent",
    full_name: "Mr. Kofi Boateng",
    email: "kofi@example.com",
    phone: "0240000011",
    avatar_url: undefined,
    is_active: 1,
    updated_at: now,
  },
];

/** ------------------------------------------------------------------ */
/** 2. SCHOOL SETTINGS                                                 */
/** ------------------------------------------------------------------ */

export const MOCK_SETTINGS: LocalSchoolSetting = {
  id: 1,
  school_name: "Eagle International School",
  motto: "A place to grow, learn, and lead.",
  address: "Accra, Ghana",
  logo_url: undefined,
  headmaster_signature_url: undefined,
  current_academic_year: "2025-2026",
  current_term: "Term 1",
  next_reopening_date: "2026-01-05",
  canteen_daily_rate: 20.00,
  grading_format: "numeric",
  maintenance_mode: 0,
  updated_at: now,
};

/** ------------------------------------------------------------------ */
/** 3. CLASSES                                                         */
/** ------------------------------------------------------------------ */

export const MOCK_CLASSES: LocalClass[] = [
  { id: id("cls"), department: "Creche", name: "Creche A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "Nursery", name: "Nursery A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "KG", name: "KG A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "Lower Primary", name: "Basic 1A", form_master_id: "t_uid_001", updated_at: now },
  { id: id("cls"), department: "Lower Primary", name: "Basic 2A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "Lower Primary", name: "Basic 3A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "Upper Primary", name: "Basic 4A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "Upper Primary", name: "Basic 5A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "Upper Primary", name: "Basic 6A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "JHS", name: "JHS 1A", form_master_id: "t_uid_002", updated_at: now },
  { id: id("cls"), department: "JHS", name: "JHS 2A", form_master_id: undefined, updated_at: now },
  { id: id("cls"), department: "JHS", name: "JHS 3A", form_master_id: undefined, updated_at: now },
];

/** ------------------------------------------------------------------ */
/** 4. SUBJECTS                                                        */
/** ------------------------------------------------------------------ */

export const MOCK_SUBJECTS: LocalSubject[] = [
  { id: id("subj"), name: "Mathematics", department_group: "Lower Primary", updated_at: now },
  { id: id("subj"), name: "English Language", department_group: "Lower Primary", updated_at: now },
  { id: id("subj"), name: "Science", department_group: "Lower Primary", updated_at: now },
  { id: id("subj"), name: "Mathematics", department_group: "JHS", updated_at: now },
  { id: id("subj"), name: "English Language", department_group: "JHS", updated_at: now },
  { id: id("subj"), name: "Integrated Science", department_group: "JHS", updated_at: now },
  { id: id("subj"), name: "Social Studies", department_group: "JHS", updated_at: now },
];

/** ------------------------------------------------------------------ */
/** 5. TEACHER ASSIGNMENTS                                             */
/** ------------------------------------------------------------------ */

const clsLower1 = MOCK_CLASSES.find((c) => c.name === "Basic 1A")!;
const clsJHS1 = MOCK_CLASSES.find((c) => c.name === "JHS 1A")!;
const subjMathLP = MOCK_SUBJECTS.find((s) => s.name === "Mathematics" && s.department_group === "Lower Primary")!;
const subjMathJHS = MOCK_SUBJECTS.find((s) => s.name === "Mathematics" && s.department_group === "JHS")!;

export const MOCK_ASSIGNMENTS: LocalTeacherAssignment[] = [
  { id: id("ta"), teacher_id: "t_uid_001", class_id: clsLower1.id, subject_id: subjMathLP.id, updated_at: now },
  { id: id("ta"), teacher_id: "t_uid_002", class_id: clsJHS1.id, subject_id: subjMathJHS.id, updated_at: now },
];

/** ------------------------------------------------------------------ */
/** 6. STUDENTS                                                        */
/** ------------------------------------------------------------------ */

const clsKG = MOCK_CLASSES.find((c) => c.name === "KG A")!;
const clsB1 = MOCK_CLASSES.find((c) => c.name === "Basic 1A")!;
const clsB4 = MOCK_CLASSES.find((c) => c.name === "Basic 4A")!;
const clsJHS1B = MOCK_CLASSES.find((c) => c.name === "JHS 1A")!;

export const MOCK_STUDENTS: LocalStudent[] = [
  {
    id: id("stu"),
    admission_no: "SCH-2025-0001",
    full_name: "Ama Serwaa",
    dob: "2019-03-15",
    gender: "female",
    photo_url: undefined,
    class_id: clsKG.id,
    medical_notes: "None",
    blood_group: "O+",
    address_gps: "GA-123-4567",
    pickup_contacts_json: JSON.stringify([
      { name: "Mrs. Arthur", relation: "Mother", phone: "0240000010", photo_url: undefined },
    ]),
    credit_balance: 40.00,
    canteen_paid_until: "2026-02-15",
    status: "active",
    updated_at: now,
  },
  {
    id: id("stu"),
    admission_no: "SCH-2025-0002",
    full_name: "Kojo Mensah",
    dob: "2018-07-22",
    gender: "male",
    photo_url: undefined,
    class_id: clsKG.id,
    medical_notes: "Allergic to peanuts",
    blood_group: "A+",
    address_gps: "GA-234-5678",
    pickup_contacts_json: JSON.stringify([]),
    credit_balance: 0.00,
    canteen_paid_until: undefined,
    status: "active",
    updated_at: now,
  },
  {
    id: id("stu"),
    admission_no: "SCH-2025-0003",
    full_name: "Esinam Boateng",
    dob: "2017-11-10",
    gender: "female",
    photo_url: undefined,
    class_id: clsB1.id,
    medical_notes: "Asthma - carries inhaler",
    blood_group: "B+",
    address_gps: "GA-345-6789",
    pickup_contacts_json: JSON.stringify([]),
    credit_balance: 20.00,
    canteen_paid_until: "2026-01-20",
    status: "active",
    updated_at: now,
  },
  {
    id: id("stu"),
    admission_no: "SCH-2025-0004",
    full_name: "Kwame Nkrumah",
    dob: "2016-05-05",
    gender: "male",
    photo_url: undefined,
    class_id: clsB4.id,
    medical_notes: "None",
    blood_group: "O-",
    address_gps: "GA-456-7890",
    pickup_contacts_json: JSON.stringify([]),
    credit_balance: 60.00,
    canteen_paid_until: "2026-03-01",
    status: "active",
    updated_at: now,
  },
  {
    id: id("stu"),
    admission_no: "SCH-2025-0005",
    full_name: "Afia Osei",
    dob: "2013-09-18",
    gender: "female",
    photo_url: undefined,
    class_id: clsJHS1B.id,
    medical_notes: "None",
    blood_group: "AB+",
    address_gps: "GA-567-8901",
    pickup_contacts_json: JSON.stringify([]),
    credit_balance: 0.00,
    canteen_paid_until: undefined,
    status: "active",
    updated_at: now,
  },
];

/** ------------------------------------------------------------------ */
/** 7. PARENT-STUDENT LINKS                                            */
/** ------------------------------------------------------------------ */

const stuAma = MOCK_STUDENTS.find((s) => s.admission_no === "SCH-2025-0001")!;
const stuEsinam = MOCK_STUDENTS.find((s) => s.admission_no === "SCH-2025-0003")!;
const stuKwame = MOCK_STUDENTS.find((s) => s.admission_no === "SCH-2025-0004")!;

export const MOCK_PARENT_STUDENTS: LocalParentStudent[] = [
  { parent_id: "p_uid_001", student_id: stuAma.id, relationship: "Mother", is_primary: 1, updated_at: now },
  { parent_id: "p_uid_002", student_id: stuEsinam.id, relationship: "Father", is_primary: 1, updated_at: now },
  { parent_id: "p_uid_002", student_id: stuKwame.id, relationship: "Father", is_primary: 1, updated_at: now },
];

/** ------------------------------------------------------------------ */
/** 8. FEE LEDGER                                                      */
/** ------------------------------------------------------------------ */

export const MOCK_FEE_LEDGER: LocalFeeLedger[] = [
  {
    id: id("fl"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    academic_year: "2025-2026",
    term: "Term 1",
    category: "school_fees",
    description: "Term 1 School Fees",
    amount_billed: 1200.00,
    amount_paid: 1200.00,
    status: "paid",
    created_at: now - 30 * DAY,
    updated_at: now - 30 * DAY,
  },
  {
    id: id("fl"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    academic_year: "2025-2026",
    term: "Term 1",
    category: "books",
    description: "Textbooks & Exercise Books",
    amount_billed: 150.00,
    amount_paid: 0.00,
    status: "owing",
    created_at: now - 25 * DAY,
    updated_at: now - 25 * DAY,
  },
  {
    id: id("fl"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    academic_year: "2025-2026",
    term: "Term 1",
    category: "school_fees",
    description: "Term 1 School Fees",
    amount_billed: 1200.00,
    amount_paid: 800.00,
    status: "partial",
    created_at: now - 30 * DAY,
    updated_at: now - 30 * DAY,
  },
  {
    id: id("fl"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    academic_year: "2025-2026",
    term: "Term 1",
    category: "printing_fees",
    description: "Printing & Photocopying",
    amount_billed: 50.00,
    amount_paid: 50.00,
    status: "paid",
    created_at: now - 25 * DAY,
    updated_at: now - 25 * DAY,
  },
  {
    id: id("fl"),
    idempotency_key: id("idem"),
    student_id: stuKwame.id,
    academic_year: "2025-2026",
    term: "Term 1",
    category: "school_fees",
    description: "Term 1 School Fees",
    amount_billed: 1200.00,
    amount_paid: 0.00,
    status: "owing",
    created_at: now - 30 * DAY,
    updated_at: now - 30 * DAY,
  },
  {
    id: id("fl"),
    idempotency_key: id("idem"),
    student_id: stuKwame.id,
    academic_year: "2025-2026",
    term: "Term 1",
    category: "dues",
    description: "PTA Dues",
    amount_billed: 100.00,
    amount_paid: 0.00,
    status: "owing",
    created_at: now - 20 * DAY,
    updated_at: now - 20 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 9. FEE PAYMENTS                                                    */
/** ------------------------------------------------------------------ */

export const MOCK_FEE_PAYMENTS: LocalFeePayment[] = [
  {
    id: id("fp"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    ledger_id: MOCK_FEE_LEDGER[0].id,
    amount: 1200.00,
    payment_source: "cash",
    recorded_by: "hm_uid_001",
    notes: "Term 1 fees paid in full",
    created_at: now - 30 * DAY,
    updated_at: now - 30 * DAY,
  },
  {
    id: id("fp"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    ledger_id: MOCK_FEE_LEDGER[2].id,
    amount: 800.00,
    payment_source: "momo",
    recorded_by: "hm_uid_001",
    notes: "Partial fee payment",
    created_at: now - 28 * DAY,
    updated_at: now - 28 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 10. CANTEEN COLLECTIONS                                            */
/** ------------------------------------------------------------------ */

export const MOCK_CANTEEN_COLLECTIONS: LocalCanteenCollection[] = [
  {
    id: id("cc"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    teacher_id: "t_uid_001",
    plan_type: "1_week",
    days_covered: 5,
    amount: 100.00,
    reconciliation_status: "pending",
    reconciled_by: undefined,
    reconciled_at: undefined,
    created_at: now - 5 * DAY,
    updated_at: now - 5 * DAY,
  },
  {
    id: id("cc"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    teacher_id: "t_uid_001",
    plan_type: "1_day",
    days_covered: 1,
    amount: 20.00,
    reconciliation_status: "reconciled",
    reconciled_by: "hm_uid_001",
    reconciled_at: now - 3 * DAY,
    created_at: now - 4 * DAY,
    updated_at: now - 3 * DAY,
  },
  {
    id: id("cc"),
    idempotency_key: id("idem"),
    student_id: stuKwame.id,
    teacher_id: "t_uid_002",
    plan_type: "1_month",
    days_covered: 20,
    amount: 400.00,
    reconciliation_status: "pending",
    reconciled_by: undefined,
    reconciled_at: undefined,
    created_at: now - 2 * DAY,
    updated_at: now - 2 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 11. ATTENDANCE                                                     */
/** ------------------------------------------------------------------ */

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - DAY).toISOString().slice(0, 10);

export const MOCK_ATTENDANCE: LocalAttendance[] = [
  {
    id: id("att"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    date: today,
    status: "present",
    canteen_credit_awarded: 0,
    recorded_by: "t_uid_001",
    updated_at: now,
  },
  {
    id: id("att"),
    idempotency_key: id("idem"),
    student_id: stuKwame.id,
    date: today,
    status: "absent",
    canteen_credit_awarded: 1,
    recorded_by: "t_uid_002",
    updated_at: now,
  },
  {
    id: id("att"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    date: yesterday,
    status: "late",
    canteen_credit_awarded: 0,
    recorded_by: "t_uid_001",
    updated_at: now - DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 12. ASSESSMENTS                                                    */
/** ------------------------------------------------------------------ */

const subjEngLP = MOCK_SUBJECTS.find((s) => s.name === "English Language" && s.department_group === "Lower Primary")!;
const subjSciLP = MOCK_SUBJECTS.find((s) => s.name === "Science" && s.department_group === "Lower Primary")!;

export const MOCK_ASSESSMENTS: LocalAssessment[] = [
  {
    id: id("assess"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    class_id: clsKG.id,
    subject_id: subjMathLP.id,
    academic_year: "2025-2026",
    term: "Term 1",
    class_score: 42,
    exam_score: 38,
    teacher_remarks: "Good progress",
    updated_by: "t_uid_001",
    updated_at: now - 10 * DAY,
  },
  {
    id: id("assess"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    class_id: clsB1.id,
    subject_id: subjEngLP.id,
    academic_year: "2025-2026",
    term: "Term 1",
    class_score: 45,
    exam_score: 40,
    teacher_remarks: "Excellent reading",
    updated_by: "t_uid_001",
    updated_at: now - 10 * DAY,
  },
  {
    id: id("assess"),
    idempotency_key: id("idem"),
    student_id: stuKwame.id,
    class_id: clsB4.id,
    subject_id: subjSciLP.id,
    academic_year: "2025-2026",
    term: "Term 1",
    class_score: 30,
    exam_score: 25,
    teacher_remarks: "Needs more practice",
    updated_by: undefined,
    updated_at: now - 10 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 13. RUBRIC SCORES                                                  */
/** ------------------------------------------------------------------ */

export const MOCK_RUBRIC_SCORES: LocalRubricScore[] = [
  {
    id: id("rubric"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    academic_year: "2025-2026",
    term: "Term 1",
    competency: "Listening & Speaking",
    rating: 1,
    updated_by: undefined,
    updated_at: now - 8 * DAY,
  },
  {
    id: id("rubric"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    academic_year: "2025-2026",
    term: "Term 1",
    competency: "Reading",
    rating: 2,
    updated_by: undefined,
    updated_at: now - 8 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 14. TERMINAL REPORTS                                               */
/** ------------------------------------------------------------------ */

export const MOCK_TERMINAL_REPORTS: LocalTerminalReport[] = [
  {
    id: id("tr"),
    idempotency_key: id("idem"),
    student_id: stuAma.id,
    class_id: clsKG.id,
    academic_year: "2025-2026",
    term: "Term 1",
    days_present: 45,
    total_days: 50,
    conduct: "Good",
    attitude: "Positive",
    interest: "High",
    class_teacher_remarks: "Ama is a joyful learner who participates well.",
    headmaster_remarks: undefined,
    is_published: 1,
    published_at: now - 2 * DAY,
    created_by: "t_uid_001",
    updated_at: now - 2 * DAY,
  },
  {
    id: id("tr"),
    idempotency_key: id("idem"),
    student_id: stuEsinam.id,
    class_id: clsB1.id,
    academic_year: "2025-2026",
    term: "Term 1",
    days_present: 42,
    total_days: 50,
    conduct: "Satisfactory",
    attitude: "Good",
    interest: "Medium",
    class_teacher_remarks: "Esinam is improving steadily.",
    headmaster_remarks: undefined,
    is_published: 0,
    published_at: undefined,
    created_by: "t_uid_001",
    updated_at: now - 5 * DAY,
  },
  {
    id: id("tr"),
    idempotency_key: id("idem"),
    student_id: stuKwame.id,
    class_id: clsB4.id,
    academic_year: "2025-2026",
    term: "Term 1",
    days_present: 38,
    total_days: 50,
    conduct: "Needs attention",
    attitude: "Variable",
    interest: "Low",
    class_teacher_remarks: "Kwame needs support with focus.",
    headmaster_remarks: undefined,
    is_published: 0,
    published_at: undefined,
    created_by: undefined,
    updated_at: now - 3 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** 15. NOTIFICATIONS                                                  */
/** ------------------------------------------------------------------ */

export const MOCK_NOTIFICATIONS: LocalNotification[] = [
  {
    id: id("notif"),
    user_id: "p_uid_001",
    title: "Fee Payment Recorded",
    body: "Term 1 school fees for Ama Serwaa have been paid in full.",
    type: "payment",
    link_path: "/parent/balance",
    is_read: 0,
    created_at: now - 30 * DAY,
    updated_at: now - 30 * DAY,
  },
  {
    id: id("notif"),
    user_id: "p_uid_001",
    title: "Report Published",
    body: "Ama Serwaa's end-of-term report is now available for download.",
    type: "report",
    link_path: "/parent/terminal-reports",
    is_read: 0,
    created_at: now - 2 * DAY,
    updated_at: now - 2 * DAY,
  },
  {
    id: id("notif"),
    user_id: "p_uid_002",
    title: "Canteen Credit",
    body: "Kwame Nkrumah was absent today. GHS 20.00 credited to surplus balance.",
    type: "credit",
    link_path: "/parent/balance",
    is_read: 1,
    created_at: now - 1 * DAY,
    updated_at: now - 1 * DAY,
  },
];

/** ------------------------------------------------------------------ */
/** SEED FUNCTION                                                      */
/** ------------------------------------------------------------------ */

export async function seedMockData() {
  // Only seed if empty (idempotent)
  const existing = await db.users.count();
  if (existing > 0) return;

  await db.users.bulkAdd(MOCK_USERS);
  await db.school_settings.add(MOCK_SETTINGS);
  await db.local_classes.bulkAdd(MOCK_CLASSES);
  await db.local_subjects.bulkAdd(MOCK_SUBJECTS);
  await db.teacher_assignments.bulkAdd(MOCK_ASSIGNMENTS);
  await db.local_students.bulkAdd(MOCK_STUDENTS);
  await db.parent_students.bulkAdd(MOCK_PARENT_STUDENTS);
  await db.fee_ledger.bulkAdd(MOCK_FEE_LEDGER);
  await db.fee_payments.bulkAdd(MOCK_FEE_PAYMENTS);
  await db.canteen_collections.bulkAdd(MOCK_CANTEEN_COLLECTIONS);
  await db.attendance.bulkAdd(MOCK_ATTENDANCE);
  await db.assessments.bulkAdd(MOCK_ASSESSMENTS);
  await db.rubric_scores.bulkAdd(MOCK_RUBRIC_SCORES);
  await db.terminal_reports.bulkAdd(MOCK_TERMINAL_REPORTS);
  await db.notifications.bulkAdd(MOCK_NOTIFICATIONS);
}
