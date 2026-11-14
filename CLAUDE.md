# CLAUDE.md: Eagle International School Management System

Guidance for Claude (and any coding agent) working in this repo. `AGENTS.md` is the product spec; this file is the **working plan and rules**.

## Working agreement
- Work **one phase at a time**. Finish a phase, report what changed and what was verified, then **stop and wait for the owner's approval** before starting the next.
- Never commit secrets. `.env` files stay local; only `.env.example` (placeholders) is committed. Production secrets go in `wrangler secret put`.
- Prefer small, verified changes. After any change run `npm run typecheck` (frontend and worker) and `npm run build --workspace=frontend`.
- Status markers below: ✅ done, 🔜 next, ⬜ not started.

## Stack and layout
- `frontend/` React + Vite + Tailwind + Dexie (PWA). `worker/` Cloudflare Worker (Hono) + Turso (libSQL). Auth/live pulse/push: Firebase. Images: Cloudinary (signed browser uploads).
- Monorepo using npm workspaces: run `npm install --legacy-peer-deps` at the repo root.
- Commands: `npm run dev` (both), `npm run typecheck --workspace=frontend|worker`, `npm run build --workspace=frontend`, `npx wrangler deploy --dry-run` (bundle check).
- Migrations: `worker/migrations/001_init.sql`, `002_phase5.sql`, `003_phase2_auth.sql`. Apply with `npm run migrate` (tracked in `schema_migrations`).
- Tests: `npm test` (worker; uses Node 22 built-in SQLite, no network).

## Design rules (Facebook-inspired light UI)
Tokens live in `frontend/src/index.css` and `tailwind.config.js`; reference: `school-ui-palette-guide/guide/school-ui-design-guide.md` (suggestions, not strict). Brand blue `#1877F2`, page `#F0F2F5`, cards white, 52px inputs, 48px buttons, 56px top bar. Use sentence case; never rely on colour alone for status.

## Engineering rules
1. **Identity comes from the verified token**, never from the request body (`recorded_by`, `teacher_id`, `reconciled_by` must be derived server-side).
2. Role checks happen in the Worker, not just in the UI. Admin must never see school income or parent contact lists.
3. Every write used offline must go through `saveOrQueue` (Dexie queue + `Idempotency-Key`).
4. Money is GHS; canteen defaults GHS 20/day, 100/week, 400/month; only the Headmaster applies surplus credit, with parent consent.
5. Keep Workers-safe code: no Node-only SDKs, no `process.env` (use the `env` binding).

---

## Development phases

### Phase 1: Foundation and build health ✅ (done)
Goal: the project installs, type-checks, builds and the schema applies, so later phases stand on solid ground.
- ✅ Root workspace installs cleanly (`npm install --legacy-peer-deps`).
- ✅ Added `tsconfig.json` + `typecheck` scripts to `frontend/` and `worker/`; added TypeScript.
- ✅ Worker: type-checks clean; bundles with `wrangler deploy --dry-run`.
- ✅ Frontend: type-checks clean; `vite build` succeeds.
- ✅ Fixed real bugs found: broken syntax in `CanteenReconciliation.tsx`; broken state in `Classes.tsx`; missing `signInWithEmailAndPassword` import and wrong claims call in `useAuth.ts`; duplicate `className` and missing `rows` support in `Input.tsx`; toast id typing; pdfmake footer (`pageNumber`/`totalPages`) not valid; `TopBar` default export; wrong handler name in teacher reports.
- ✅ Replaced the Node-only Cloudinary SDK helper (used `process.env`/`Buffer`, unusable on Workers) with a WebCrypto signing helper (`worker/src/lib/cloudinary.ts`) and removed the dependency.
- ✅ Verified `001_init.sql` + `002_phase5.sql` apply cleanly on SQLite 3.45 (including the generated `fee_ledger.status` column).
- ✅ Hardcoded placeholder IDs (`headmaster_uid`) in the Fee and Reconciliation pages replaced with the signed-in user's UID (server-side enforcement is Phase 2).
- Not verified yet (needs real Firebase/Turso credentials): live login, real database calls. These start in Phase 2.

### Phase 2: Auth, identity and admin bootstrap ✅ (built; needs live smoke test)
- ✅ `npm run create-admin -- --email … --name "…"` (worker/scripts/create-admin.mjs): Firebase user + `role` claim + `users` row; idempotent; refuses a second admin without `--force`. `npm run migrate` applies migrations in order.
- ✅ Auth middleware: role claim must be valid (no more silent "parent" default); user must exist and be active in Turso; claim must match DB role (else 403 `claims_stale`, client refreshes token and retries once); disabled users are cut off immediately.
- ✅ Actor IDs come from the token on fee payments, canteen collections, attendance, reconciliation, credit offset and reports (`created_by`/`published_by` added). Body-supplied identity fields are ignored and no longer sent by the UI. Attendance credit rate now comes from `school_settings`, not the request.
- ✅ Role guards on every route. Admin has no access to finance, students, canteen, attendance or reports; credit offset is headmaster-only; teachers are scoped to their own classes (students, attendance, canteen, reports); parents see only published reports of linked children; `/api/school-settings` PUT is split by field (admin: branding + maintenance; headmaster: academics).
- ✅ `maintenance_mode` enforced in the Worker (503 `maintenance`, admin exempt, `/api/me` stays open) with a friendly screen + auto-recheck; admin toggle added to Branding.
- ✅ Frontend: shared `AuthProvider` (was per-component state with forced token refresh each time), `onIdTokenChanged`, friendly sign-in errors, sign-out menu in the top bar (clears cached rosters), login page shows Eagle International School (was "Future Leaders"), removed the dead "Create account" button.
- ✅ Offline queue entries are stamped with the owner uid and only replayed by that user (identity is token-derived now). CORS now allows the `Idempotency-Key` header.
- ✅ Rate limiting (Turso fixed windows, `rate_limits` table): bad-token attempts per IP, `/api/me`, account creation, password resets. Firebase itself throttles password guessing on sign-in.
- ✅ Realtime DB: `firebase/database.rules.json` (`live_signals` read = signed-in, write = none) + Worker now writes with a service-account token. Deploy: `firebase deploy --only database`.
- ✅ Also fixed: `terminal_reports` had no `idempotency_key` column (inserts would fail); publish notification went to the student id instead of linked parents; branding save sent an empty body; credit offset is now atomic and capped at the amount owing; payments/offsets must be positive.
- ✅ Removed `/api/admin/staff` and `StaffCreation.tsx` (superseded by `/api/accounts`; the old route let a headmaster insert an admin row).
- Verified: 5 SQLite-backed tests (migrations, session rules, rate limiter, teacher/parent scoping, atomic offset) pass; stubbed typecheck of worker and frontend shows no real errors. NOT verified (no network/deps in this environment): `npm run typecheck`, `npm run build`, `wrangler deploy --dry-run`, and live Firebase/Turso login for all four roles.
- Open for the owner: an account created with both email and phone signs in with the email only (Firebase identity = email); phone login works only for phone-only accounts.

### Phase 3: School setup and people ⬜
- Classes, subjects, teacher assignments (Primary class teacher vs JHS form master + subject teachers).
- Student and guardian registration: search guardian by phone first, link siblings, auto ID `SCH-YYYY-XXXX`, medical notes, blood group, GhanaPost address.
- Authorized pickup persons UI (name, relation, phone, photo).
- Cloudinary signed-upload route (`/api/uploads/sign`) + upload widgets (student photo, pickup photos, crest, headmaster signature).

### Phase 4: Finance and canteen ⬜
- Fee ledger and payments verified end to end (cash, momo, bank, credit offset).
- Credit offset interface for the Headmaster (replace the "Coming soon" card), with a recorded parent-consent note.
- Canteen collection, absentee credit rollover (+GHS 20), reconciliation and locking verified with tests.
- Parent balance breakdown matches ledger totals.

### Phase 5: Academics and terminal reports ⬜
- Daily attendance flows; class and exam score entry (50/50); grading `1–9` / `A–F` per Headmaster setting; subject rank, overall total/average, class position.
- Creche/Nursery/KG rubric entry UI (table `rubric_scores` exists).
- Terminal report PDF (pdfmake, offline) with crest, signature, remarks; draft, review, publish workflow; parent download.

### Phase 6: Offline, real-time and notifications ⬜
- Verify offline queue and `/api/sync/batch` replay for every teacher write path; conflict and failure handling UI.
- FCM service worker + permission prompt; write a `notifications` row and send push for every critical event.
- Offline catch-up toast ("You have X new updates while you were away").
- PWA install, caching strategy, and update prompt.

### Phase 7: UI/UX polish and performance ⬜
- Audit every screen against the design guide; empty/loading/error states; mobile-first teacher and parent views.
- Code-split heavy bundles (pdfmake makes the main chunk about 2.3 MB).
- Accessibility pass (focus, contrast, touch targets, labels).

### Phase 8: Testing, security and deployment ⬜
- Automated tests for business logic (grading, ranking, credit rollover, idempotency) and API role checks.
- Security review (CORS, secrets, input validation, SQL parameterization, RBAC matrix).
- Deploy: Worker (Wrangler) + frontend (Cloudflare Pages), production env/secrets, backups.
- Seed/demo data and a short admin/headmaster/teacher/parent user guide.

## Known backlog (from the Phase 1 review)
- Bundle size warning (about 2.3 MB) is expected until Phase 7.
