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
npm install
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

## School Name

**Eagle International School** — configured in `worker/migrations/001_init.sql` and throughout the frontend.

## License

MIT