# MASTER SYSTEM SPECIFICATION: BASIC SCHOOL MANAGEMENT SYSTEM (CRECHE – JHS)

## 1. PROJECT OVERVIEW & ARCHITECTURE
Build a complete, offline-first, real-time Progressive Web App (PWA) for a Ghanaian basic school covering **Creche, Nursery, Kindergarten (KG), Lower Primary (Basic 1–3), Upper Primary (Basic 4–6), and Junior High School (JHS 1–3)**.

### Core Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Dexie.js (IndexedDB) + PWA Service Worker (plus lightweight Vanilla JS/HTML/CSS utilities where optimal for instant rendering and offline caching).
- **Backend API:** Cloudflare Workers (using Hono framework for clean routing, middleware, and JWT verification).
- **Primary Relational Database:** Turso (libSQL / SQLite at the edge). Source of truth for all relational records, financial ledgers, grades, and canteen reconciliations.
- **Auth, Live Pulse & Push Notifications:** Firebase Free Spark Plan:
  - **Firebase Auth:** Email/Phone + Password login with Custom Claims (`role`: `admin` | `headmaster` | `teacher` | `parent`).
  - **Firebase Realtime Database / Firestore (Minimal Pulse Node):** Used *only* as a lightweight real-time signal bus (`live_signals/{entity_id}`) so connected clients auto-refresh state without manual page reloads.
  - **Firebase Cloud Messaging (FCM):** Push notifications with offline queuing.
- **Media Storage:** Cloudinary (Unsigned/Signed uploads with `f_auto,q_auto` transformations) for Student Passport Photos, Authorized Pickup Photos, School Crest/Logo, and Headmaster Signature PNGs.
- **Client-Side PDF Generation:** `pdfmake` or `pdf-lib` generating crisp, high-resolution A4 vector Terminal Report PDFs directly in the browser (works 100% offline; zero cloud PDF storage needed).

---

## 2. ROLE-BASED ACCESS CONTROL (RBAC) & PORTAL BOUNDARIES

### Single Unified Login Screen
- One login entry point for all users (`Email OR Phone Number` + `Password`).
- If input has no `@`, normalize Ghanaian phone format (`024XXXXXXX` -> `23324XXXXXXX@school.local`) behind the scenes for Firebase Auth while storing the real phone number in Turso.
- Upon login, read Firebase Custom Claim `role` and route immediately:
  - `admin` -> `/admin`
  - `headmaster` -> `/headmaster`
  - `teacher` -> `/teacher`
  - `parent` -> `/parent`

### Strict Role Separation
1. **Admin (System Engineer — 100% System Access, Isolated from Private School Finances/Parent Info):**
   - Bootstraps the empty system by creating the initial Headmaster and Staff accounts.
   - Manages global branding: School Name, Logo/Crest, Motto, Theme colors.
   - **Live Infrastructure Telemetry Console:** Queries Turso Platform API (`/v1/organizations/{org}/databases/{db}/usage`) and Cloudflare Worker metrics to monitor live database storage size, row counts, API latency, and error logs.
   - System controls: Toggle Maintenance Mode, manage system-wide permissions, and perform **Emergency Account Recovery / Password Resets** if the Headmaster is locked out or standard reset fails.
   - *Privacy Boundary:* Admin dashboard does NOT display school income figures or private parent contact lists.

2. **Headmaster (School Owner — 100% School Operations Access):**
   - Full CRUD over Students, Parents, Teachers, Classes, and Subjects.
   - Assigns classes to Primary teachers and assigns specific subjects across classes to JHS teachers (GES/NaCCA model).
   - Configures Academic Settings: Term dates, next reopening date, Canteen daily rate (default: `GHS 20.00/day`), and Grading Format (`Numeric 1–9` vs `Letter A–F`).
   - Issues fees, printing fees, dues, and textbooks/exercise books to students.
   - Records fee payments (updating parent screens in real time) and **approves applying a student's Surplus Credit toward debts** (with parent consent).
   - Verifies and reconciles daily physical canteen cash handed over by teachers.
   - Reviews, adds remarks/signature to, and **Publishes** End-of-Term Report PDFs.
   - Handles standard password resets for Teachers and Parents.

3. **Teacher (Classroom & Subject Operations — Mobile-First):**
   - Sees only assigned classes (Primary) or assigned class-subject pairs (JHS).
   - **Canteen Collection:** Taps students to record `1 Day (GHS 20)`, `1 Week (GHS 100)`, or `1 Month (GHS 400)`. Displays a live **"Cash in Hand to Reconcile"** counter until handed to the Headmaster.
   - **Daily Attendance:** Marks Present/Absent/Late. Marking a student **Absent** on a prepaid canteen day automatically transfers `GHS 20` into that student's **Surplus Credit**.
   - **Examination & Terminal Reports:** Enters Class Scores (50%) and Exam Scores (50%), attendance totals, conduct, attitude, interest, and teacher remarks. Can generate **Draft PDF Reports** offline.

4. **Parent (Mobile-First PWA Experience):**
   - **Facebook-Style Child Switcher:** Top header displays `[Avatar] Child Name ▾`. Tapping opens a bottom sheet to switch seamlessly between multiple children linked to the parent's phone/email.
   - **Real-Time Balance Cards:** Displays **Total Debt** (itemized across School Fees, Printing Fees, Books, Canteen, Dues) and **Surplus Credit** (accumulated from absent prepaid canteen days). Updates live without page reload when payments or adjustments occur.
   - Views issued books, attendance history, canteen balance, and downloads/shares published **Terminal Report PDFs**.

---

## 3. CORE BUSINESS LOGIC & WORKFLOWS

### A. Canteen Collection, Absentee Credit Rollover & Reconciliation
1. **Collection:** Teacher selects a student and logs payment (`1_day`, `1_week`, `1_month`) based on the Headmaster's configured daily rate (`GHS 20/day`). Record is created with `reconciliation_status = 'pending'`.
2. **Absentee Credit Logic:** When a student is marked `absent` during daily attendance, check if they have an active prepaid canteen credit for that date. If yes, deduct 1 day from canteen coverage and credit `GHS 20.00` to `students.credit_balance`. Notify parent.
3. **Credit Usage Rule:** Teachers and Parents CANNOT auto-deduct from `credit_balance`. Only the **Headmaster** can apply `credit_balance` to offset an item in `fee_ledger` after obtaining parent consent.
4. **Reconciliation:** Teacher hands physical cash to Headmaster. Headmaster opens *Canteen Reconciliations*, reviews the teacher's pending batch total, and clicks **Confirm Cash Received**, flipping records to `reconciled` and locking them.

### B. GES / NaCCA Class & Subject Structure
- **Creche / Nursery / KG:** Competency & developmental rubrics (*Always, Sometimes, Needs Help* / 1–4 scale) + Care/Attendance summary.
- **Lower & Upper Primary (Basic 1–6):** One Class Teacher assigned to a class manages all subjects for that class.
- **JHS (JHS 1–3):** Home classes (e.g., `JHS 1A`) have one **Form Master** (handles attendance & general remarks) and multiple **Subject Teachers** (e.g., Math Teacher assigned strictly to `JHS 1A Mathematics` and `JHS 2A Mathematics`).
- **Terminal Report Calculation:** `Total (100%) = Class Score (50%) + Exam Score (50%)`. Automatically computes subject grade (`1–9` or `A–F` based on Headmaster setting), subject rank, overall total, overall average, and class position.

### C. Rich Student & Guardian Data Capture
- When registering a student, search existing guardians by phone number first to link siblings to one parent login.
- Capture: Auto-generated Student ID (`SCH-YYYY-XXXX`), Full Name, DOB, Gender, Passport Photo (Cloudinary), Department & Class, Medical/Allergy notes, Blood Group, Authorized Pickup Persons (Name, Relation, Phone, Photo), Primary & Secondary Guardians, Emergency Contact, and Residential/GhanaPost GPS Address.

---

## 4. OFFLINE-FIRST SYNC & REAL-TIME ENGINE

### Offline Storage (Dexie.js / IndexedDB)
- Cache assigned class rosters, students, subjects, and grading scales locally.
- **Wi-Fi Status Indicator (Top Bar):**
  - `🟢 Online • Synced` (Green Wi-Fi icon)
  - `🔴 Offline • Saving Locally (X pending)` (Red/Amber Wi-Fi icon)
- If internet drops mid-entry (e.g., entering exam scores or canteen payments), automatically save mutations to Dexie `sync_queue` with a client-generated UUID `idempotency_key`.
- When connection restores, flush `sync_queue` to `POST /api/sync/batch` in chronological order. Turso uses `INSERT OR IGNORE` on `idempotency_key` to guarantee zero duplicate entries.

### Zero-Refresh Live Updates
- After any Turso mutation (payment recorded, credit applied, canteen reconciled, report published), the Cloudflare Worker updates a lightweight timestamp in Firebase Realtime DB (`live_signals/student_{id}` or `live_signals/teacher_{id}`).
- Active clients subscribe to their relevant node and silently re-fetch updated JSON from the Worker, updating UI numbers in real time.

---

## 5. TWO-LAYER NOTIFICATION SYSTEM (TOASTS + OFFLINE WAIT ALERTS)

1. **In-App Toast Notifications (Top-Right Desktop / Top-Center Mobile):**
   - Floating white card (`#FFFFFF`), `8px` radius, `4px` colored left accent border, 4s auto-dismiss.
   - Triggers on every save, offline switch, sync completion, validation error, and cash reconciliation.
2. **Persistent Bell Inbox & Offline-Resilient Push Alerts:**
   - Prompt users on first login to enable Web Push Notifications (FCM).
   - Every critical event (fee paid, canteen paid, child absent -> `+GHS 20 Credit`, credit applied to debt, report published, reconciliation verified) writes a row to Turso `notifications` (`is_read = 0`) AND sends an FCM push.
   - **Offline Wait Catch-Up:** When a user has data off all day and comes back online, FCM delivers queued lock-screen alerts, and opening the app fetches `/api/notifications/unread`, displays the red badge count, and triggers a catch-up toast: *"You have X new updates while you were away."*

---

## 6. TURSO DATABASE SCHEMA (SQLITE / LIBSQL)

See `worker/migrations/001_init.sql` for the full schema.

---

## 7. UI/UX DESIGN SYSTEM (FACEBOOK-INSPIRED LIGHT MODE)
See `frontend/src/index.css` for design tokens and `school-ui-palette-guide/guide/school-ui-design-guide.md` for the full palette reference.

School name: **Eagle International School**

---

## 8. IMPLEMENTATION ROADMAP FOR OPENCODE
Build this project incrementally in clean, verifiable phases:

Phase 1 — Foundation & Auth: ✅ COMPLETE
- Monorepo scaffolded (frontend/ Vite+React+Tailwind+Dexie, worker/ Cloudflare Hono+Turso)
- Turso schema migration script applied (`worker/migrations/001_init.sql`)
- Cloudflare Worker Hono setup with auth middleware, sync batch endpoint, health endpoint
- Firebase Auth config with phone normalization (`024XXXXXXX` -> `23324XXXXXXX@school.local`)
- Facebook-style unified Login screen + Role Router (`/admin`, `/headmaster`, `/teacher`, `/parent`)
- Dexie.js local DB with sync_queue table
- PWA manifest + service worker skeleton
- Portal stubs for all four roles

Phase 2 — Admin & Headmaster Core: ✅ COMPLETE
- Admin: School branding console, infrastructure telemetry, staff creation
- Headmaster: Classes, subjects, teacher assignments, student/guardian registration
- Shared: Cloudinary image uploads, all API routes under /api/

Phase 3 — Financial Engine & Canteen Reconciliation: ✅ COMPLETE
- Fee ledger (issue fees, auto-compute paid/partial/owing status)
- Fee payments (cash, momo, bank, credit_offset with idempotency)
- Canteen collections (1 Day GHS 20 / 1 Week GHS 100 / 1 Month GHS 400)
- Attendance with absentee credit rollover (+GHS 20 credit)
- Canteen reconciliation (headmaster confirms cash received)
- Credit offset (headmaster applies surplus credit to fee debt with parent consent)

Phase 4 — Offline Sync, Notifications & Terminal Reports: ✅ COMPLETE
- Dexie.js sync queue with Wi-Fi status indicator (online/offline badge)
- Background sync flush on reconnection (POST /api/sync/batch)
- Notifications system (GET/POST/PUT /api/notifications, unread count)
- Notification Bell component with unread badge and dropdown
- Terminal Reports (teacher draft, headmaster publish, parent download)
- Live signals via Firebase Realtime DB REST API (/api/live-signals/:entityId)
- FCM push notification endpoint (/api/live-signals/fcm/send)
- pdfmake Terminal Report PDF generator (A4 vector, client-side, works offline)
- Report publish workflow with parent notifications
