-- Phase 1: Initial Turso schema for Eagle International School
-- Matches AGENTS.md §6 exactly, with idempotency keys for offline sync.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Firebase UID
  role TEXT NOT NULL CHECK(role IN ('admin', 'headmaster', 'teacher', 'parent')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  school_name TEXT NOT NULL DEFAULT 'Eagle International School',
  motto TEXT,
  address TEXT,
  logo_url TEXT,
  headmaster_signature_url TEXT,
  current_academic_year TEXT NOT NULL,
  current_term TEXT NOT NULL,
  next_reopening_date TEXT,
  canteen_daily_rate REAL DEFAULT 20.00,
  grading_format TEXT DEFAULT 'numeric' CHECK(grading_format IN ('numeric', 'letter')),
  maintenance_mode INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL CHECK(department IN ('Creche', 'Nursery', 'KG', 'Lower Primary', 'Upper Primary', 'JHS')),
  name TEXT NOT NULL,
  form_master_id TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_group TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES users(id),
  class_id TEXT NOT NULL REFERENCES classes(id),
  subject_id TEXT REFERENCES subjects(id),
  UNIQUE(teacher_id, class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  admission_no TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  photo_url TEXT,
  class_id TEXT NOT NULL REFERENCES classes(id),
  medical_notes TEXT,
  blood_group TEXT,
  address_gps TEXT,
  pickup_contacts_json TEXT,
  credit_balance REAL DEFAULT 0.00,
  canteen_paid_until TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parent_students (
  parent_id TEXT NOT NULL REFERENCES users(id),
  student_id TEXT NOT NULL REFERENCES students(id),
  relationship TEXT,
  is_primary INTEGER DEFAULT 1,
  PRIMARY KEY (parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS fee_ledger (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(id),
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('school_fees', 'printing_fees', 'books', 'canteen', 'dues')),
  description TEXT NOT NULL,
  amount_billed REAL NOT NULL,
  amount_paid REAL DEFAULT 0.00,
  status TEXT GENERATED ALWAYS AS (
    CASE WHEN amount_paid >= amount_billed THEN 'paid'
         WHEN amount_paid > 0 THEN 'partial'
         ELSE 'owing' END
  ) STORED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(id),
  ledger_id TEXT REFERENCES fee_ledger(id),
  amount REAL NOT NULL,
  payment_source TEXT NOT NULL CHECK(payment_source IN ('cash', 'momo', 'bank', 'credit_offset')),
  recorded_by TEXT NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canteen_collections (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(id),
  teacher_id TEXT NOT NULL REFERENCES users(id),
  plan_type TEXT NOT NULL CHECK(plan_type IN ('1_day', '1_week', '1_month')),
  days_covered INTEGER NOT NULL,
  amount REAL NOT NULL,
  reconciliation_status TEXT DEFAULT 'pending' CHECK(reconciliation_status IN ('pending', 'reconciled')),
  reconciled_by TEXT REFERENCES users(id),
  reconciled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(id),
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
  canteen_credit_awarded INTEGER DEFAULT 0,
  recorded_by TEXT NOT NULL REFERENCES users(id),
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  student_id TEXT NOT NULL REFERENCES students(id),
  class_id TEXT NOT NULL REFERENCES classes(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  class_score REAL DEFAULT 0,
  exam_score REAL DEFAULT 0,
  teacher_remarks TEXT,
  updated_by TEXT REFERENCES users(id),
  UNIQUE(student_id, subject_id, academic_year, term)
);

CREATE TABLE IF NOT EXISTS terminal_reports (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  class_id TEXT NOT NULL REFERENCES classes(id),
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  days_present INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  conduct TEXT,
  attitude TEXT,
  interest TEXT,
  class_teacher_remarks TEXT,
  headmaster_remarks TEXT,
  is_published INTEGER DEFAULT 0,
  published_at DATETIME,
  UNIQUE(student_id, academic_year, term)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  link_path TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default school settings row
INSERT OR IGNORE INTO school_settings (
  id, school_name, current_academic_year, current_term, canteen_daily_rate
) VALUES (
  1, 'Eagle International School', '2025-2026', 'Term 1', 20.00
);
