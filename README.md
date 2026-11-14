# Eagle International School Management System

A complete, offline-first, real-time Progressive Web App (PWA) for a Ghanaian basic school covering **Creche, Nursery, Kindergarten (KG), Lower Primary (Basic 1–3), Upper Primary (Basic 4–6), and Junior High School (JHS 1–3)**.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Dexie.js (IndexedDB) + PWA Service Worker
- **Backend API:** Cloudflare Workers (Hono framework)
- **Database:** Turso (libSQL / SQLite at the edge)
- **Auth:** Firebase Auth (Email/Phone + Password) with Custom Claims
- **Real-time:** Firebase Realtime Database (live signals bus)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Media Storage:** Cloudinary
- **PDF Generation:** pdfmake (client-side, offline)

## Project Structure

```
eagle-international-school/
├── AGENTS.md              # Master system specification
├── CLAUDE.md              # Working plan and rules
├── frontend/              # Vite + React + Tailwind + Dexie.js + PWA
├── worker/                # Cloudflare Workers + Hono + Turso
├── school-ui-palette-guide/  # Facebook-inspired UI design guide
└── package.json           # Root workspace config
```

## Phases

- **Phase 1:** Foundation & Auth — Login, role-based routing, Turso schema, Dexie offline DB
- **Phase 2:** Admin & Headmaster Core — Branding, telemetry, classes, subjects, teacher assignments, student registration
- **Phase 3:** Financial Engine & Canteen Reconciliation — Fee ledger, payments, canteen collections, attendance + credit rollover, reconciliation, credit offset
- **Phase 4:** Offline Sync, Notifications & Terminal Reports — Sync queue, Wi-Fi indicator, notifications bell, FCM push, pdfmake Terminal Report PDFs

## Getting Started

### 1. Install dependencies

```powershell
npm install --legacy-peer-deps
```

### 2. Configure environment

Copy the example files and fill in your credentials:

```powershell
copy frontend\.env.example frontend\.env
copy worker\.env.example worker\.env
```

### 3. Run the frontend

```powershell
npm run dev --workspace=frontend
```

Open `http://localhost:5173` (or the port Vite reports).

### 4. Deploy the worker

```powershell
cd worker
npx wrangler deploy
```

### 5. Firebase Custom Claims

Set custom claims on Firebase Auth users via Firebase Console or Admin SDK:
- `admin`, `headmaster`, `teacher`, `parent`

## First-time setup (auth)

```powershell
npm install --legacy-peer-deps
npm run migrate                 # needs worker/.env (Turso + Firebase service account)
npm run create-admin -- --email you@school.com --name "Your Name"
firebase deploy --only database # live_signals rules (read: signed-in, write: Worker only)
npm test
```

Then sign in as the admin and create the Headmaster from Admin → Accounts.

## School Name

**Eagle International School** — configured in `worker/migrations/001_init.sql` and throughout the frontend.

## License

MIT

## Phase 5 additions (completion pass)
- **Accounts:** `/api/accounts` creates Firebase users (+ role claim) and Turso rows, password reset, enable/disable. Headmaster manages teachers/parents; Admin manages staff + emergency recovery (admin never sees parents).
- **Parent app:** `/api/parent/children` + `/api/parent/overview/:id`; child switcher bottom sheet; balance, attendance, books, canteen; live refresh.
- **Offline:** teacher screens save via `saveOrQueue` (Dexie `sync_queue` + `Idempotency-Key`); `/api/sync/batch` replays through normal routes.
- **Live pulse:** worker bumps `live_signals/student_{id}` / `teacher_{id}`; frontend `useLiveSignal` listens.
- **Telemetry:** real Turso size/row counts/latency; optional Turso Platform API usage.
- Fixed: Firebase token verification (x509 key + `sub` as uid), API base path doubling, teacher-scoped student list.

## Setup
1. `cp worker/.env.example worker/.env` and `cp frontend/.env.example frontend/.env`, fill in your own values (never commit them).
2. Apply `worker/migrations/001_init.sql` then `002_phase5.sql` to Turso.
3. Put worker secrets with `wrangler secret put` (FIREBASE_PRIVATE_KEY, TURSO_AUTH_TOKEN, etc.).
4. Create the first Admin in Firebase Console and give it the custom claim `{ "role": "admin" }`; add its row to `users`. Everyone else is created in-app.
5. `npm install` in `frontend/` and `worker/`, then `npm run dev` in each.
