# FRONTEND.md: Eagle International School, UI/UX Plan (target: 98% match)

Companion to `AGENTS.md` (product spec) and `CLAUDE.md` (working rules). This file is the **frontend-only plan**. It covers `frontend/` and does not touch `worker/`, the database or the API contracts.

Reference design: `school-ui-palette-guide/guide/school-ui-design-guide.md`. Style: Facebook-inspired light mode.

Status markers: ✅ done, 🔜 next, ⬜ not started.

---

## 0. Ground rules (apply to every phase)

1. **Work one phase at a time.** Finish the phase, run the checks, report what changed and what was verified, then **stop and wait for the owner's approval**.
2. **No emoji anywhere in the UI.** This covers labels, buttons, nav, toasts, empty states and PDF text. Every icon is a real inline SVG from one icon set (see Phase 2). Status is never shown by colour alone: pair colour with an icon and a text label.
3. **Frontend only.** No changes to `worker/`, migrations, routes or response shapes. If a screen needs data the API doesn't return, note it under "Backend asks" in the phase report and design around it with what exists.
4. **Use design tokens, never magic numbers.** Every size, colour, shadow and radius comes from Tailwind theme tokens or CSS variables defined in `index.css`. No arbitrary class names that Tailwind doesn't generate.
5. **Mobile first.** Design at 360px wide, then scale up to 768px and 1280px. Teacher and parent screens are mobile-first; headmaster and admin are desktop-first but must work on a tablet.
6. **Offline and real-time behaviour must not regress.** All writes still go through `saveOrQueue`. Live signal refresh, sync indicator, toasts and the notification bell keep working.
7. After every change run: `npm run typecheck --workspace=frontend`, then `npm run build --workspace=frontend`. Both must pass.
8. **Render it, don't just read it.** Each phase ends with screenshots at 360, 768 and 1280px (Playwright), checked against the acceptance list. A score is only claimed from rendered output.
9. Never commit `.env`. Only `.env.example` with placeholders.

### Definition of "98%"
A screen counts as matching when all of these hold:
- Sizes, spacing, weights, radii and shadows equal the design tokens below.
- Colours come only from the palette; status uses background, text colour and icon together.
- Icons are SVG, with consistent stroke width and size per context.
- It has designed loading, empty, error and offline states.
- It passes the accessibility checks in Phase 8.
- Nothing overflows horizontally at 360px.

---

## 1. Design tokens (single source of truth)

### Colour
| Token | Value | Use |
|---|---|---|
| `brand-blue` | `#1877F2` | Primary actions, links, active nav |
| `brand-blue-hover` | `#166FE5` | Primary hover |
| `brand-blue-tint` | `#E7F3FF` | Active nav background, info chips |
| `brand-green` | `#42B72A` | Success actions (Create, Confirm) |
| `brand-green-hover` | `#36A420` | Success hover |
| `brand-red` | `#FA383E` | Errors, unread badge |
| `brand-amber` | `#F7B928` | Offline and warning accents |
| `page` | `#F0F2F5` | App background |
| `card` | `#FFFFFF` | Surfaces |
| `text-primary` | `#1C1E21` | Body and headings |
| `text-secondary` | `#65676B` | Meta, captions |
| `placeholder` | `#8A8D91` | Input placeholders |
| `border` | `#DDDFE2` | Input borders |
| `divider` | `#CED0D4` | Dividers |
| `hover` | `#F2F2F2` | Row and item hover |
| `secondary` | `#E4E6EB` | Secondary buttons, avatar fallback |

Status pairs (background / text): good `#E6F4EA / #1E7B34`, attention `#FFF4D6 / #8A6100`, problem `#FFE5E6 / #C2262B`, info `#E7F3FF / #1877F2`.

### Type scale (px, line-height, weight)
| Token | Size | Use |
|---|---|---|
| `text-caption` | 12 / 16 | Timestamps, helper text |
| `text-meta` | 13 / 17 | Secondary rows |
| `text-body` | 15 / 20 | Default |
| `text-body-lg` | 17 / 22 | Buttons, card titles |
| `text-title` | 20 / 24 | Section titles |
| `text-display` | 28 / 34 | Page titles, big money figures |

Weights: 400 body, 600 labels and nav, 700 buttons and headings. Use Tailwind's real `font-normal`, `font-semibold`, `font-bold`.

### Size, space and shape
- Top bar 56px. Bottom tab bar 56px plus safe-area inset. Sidebar 280px on desktop (collapses to icon rail 72px at tablet, drawer on mobile).
- Inputs 52px tall. Buttons 48px tall (compact 36px). Minimum touch target 44px.
- Radius: card 8px, input 6px, pill 12px, avatar full.
- Spacing scale on a 4px base: 4, 8, 12, 16, 20, 24, 32.
- Shadows: `shadow-card` `0 1px 2px rgba(0,0,0,.12)`, `shadow-login` `0 2px 4px rgba(0,0,0,.10), 0 8px 16px rgba(0,0,0,.10)`, `shadow-focus` `0 0 0 2px rgba(24,119,242,.20)`.
- Toast: white, 8px radius, 4px coloured left border, 4s auto-dismiss, top-right on desktop and top-centre on mobile.

---

## Phase 1: Fix the foundation (broken sizing and undefined tokens) ✅
**Why first:** a code read found classes that Tailwind does not generate and CSS variables that are never defined. Until this is fixed, every later screen is built on a layout that does not render as intended. This phase is the largest single score gain.

**Tasks**
1. **Extend `tailwind.config.js`** so the intended classes exist, or replace them with real ones. Preferred: add named tokens (`height: { topbar: '56px', input: '52px', btn: '48px' }`, `width: { sidebar: '280px', rail: '72px' }`, `fontSize` scale above, `fontWeight` map) and use those names. Do not use bare numerals like `h-56`, which Tailwind reads as 224px.
2. **Replace every broken class** (about 180 uses across `src/`):
   | Broken | Meant | Replace with |
   |---|---|---|
   | `h-56`, `pt-56` | 56px | `h-topbar`, `pt-topbar` |
   | `h-52` | 52px | `h-input` |
   | `w-280` | 280px | `w-sidebar` |
   | `text-28` | 28px | `text-display` |
   | `text-20` | 20px | `text-title` |
   | `text-17` | 17px | `text-body-lg` |
   | `text-15` | 15px | `text-body` |
   | `font-500` | medium | `font-medium` |
   | `font-600` | semibold | `font-semibold` |
   Find them all with `grep -rnE "\b(h|pt|pb|w|text|font)-(52|56|280|28|20|17|15|500|600)\b" src`.
3. **Define the missing CSS variables** in `index.css` `:root`: `--shadow-card`, `--shadow-focus`, `--shadow-login`, `--status-good-bg/text`, `--status-attention-bg/text`, `--status-problem-bg/text`, `--status-info-bg/text`. Add a build-time check: `grep -rho "var(--[a-z-]*)" src | sort -u` and confirm each is defined.
4. **Create a status pill component** (`StatusPill`) with variants `good | attention | problem | info`, each with an SVG icon and a text label. Replace ad hoc coloured spans (paid, owing, partial, present, absent, late, draft, published, pending, reconciled).
5. Replace the stray inline `style={{...}}` values that duplicate tokens.
6. Add `lint:tokens` npm script that fails if it finds banned patterns (bare numeric size classes, emoji code points, undefined CSS variables). Run it in the phase checks.

**Acceptance**
- Top bar measures 56px, content starts directly below it, login inputs are 52px, sidebar is 280px, headings and money figures are the intended size.
- Cards show a shadow, inputs show a focus glow, status pills show colour.
- `lint:tokens`, typecheck and build all pass.

---

## Phase 2: Icon system and emoji removal ✅
**Tasks**
1. Standardise on **one SVG icon set**: either keep and complete `components/ui/icons.tsx`, or adopt `lucide-react` (tree-shaken). Do not mix sets. Stroke 1.75 to 2, round caps and joins, `currentColor`.
2. Build a single `<Icon name="..." size={16|20|24} />` wrapper with `aria-hidden` by default and an optional `title` for icon-only buttons. Sizes: 16 inline, 20 nav and buttons, 24 tab bar and empty states.
3. **Rewrite `components/layout/nav.ts`** so it no longer uses emoji spans. Use icon names, one per route:
   - Admin: overview (layout-dashboard), branding (palette), telemetry (activity), accounts (key-round)
   - Headmaster: dashboard, students (graduation-cap), accounts (users), classes (school), subjects (book-open), assignments (user-check), fees (wallet), canteen cash (utensils), reports (file-text), settings (settings)
   - Teacher: home, attendance (calendar-check), canteen (utensils), reports, scores (bar-chart), rubrics (clipboard-list)
   - Parent: my child (user), reports (file-text)
4. Add icons for: wifi online and offline, bell, search, menu, close, chevron-down, check-circle, alert-triangle, info, x-circle, camera, upload, download, share, print, lock, logout, plus, edit, trash, filter, phone, map-pin.
5. Remove emoji from **everything**: the sync indicator text (`🟢`, `🔴`), toasts, empty states, buttons, headings, PDF templates. Sweep with a Unicode-range search (`\p{Extended_Pictographic}`) across `src/` and `index.html`. Also remove symbols like `✓`, `⚙`, `▾` used as icons and use SVG instead.
6. Brand mark: SVG eagle crest placeholder used when no school logo is uploaded; the uploaded Cloudinary logo replaces it when set. Generate PWA icons (192, 512, maskable) from the same mark.

**Acceptance**
- Zero emoji and zero pictograph characters in `src/`, `index.html` and the manifest.
- Every nav item, button and status has an SVG icon with consistent size and stroke.
- Icon-only buttons have an accessible name.

---

## Phase 3: App shell and navigation ✅ (built; awaiting install, build and screenshot check)
**Tasks**
1. **Top bar (56px):** left logo and school name, centre a rounded search field (desktop; collapses to an icon on mobile), right sync indicator, notification bell with red badge, avatar menu (profile, sign out). Facebook-style hover circles (40px, `secondary` background) on icon buttons.
2. **Sidebar (desktop 280px):** icon plus label rows 48px high, rounded 8px, active row `brand-blue-tint` with blue text and icon, hover `hover`. Section group labels in `text-secondary`. Collapses to a 72px icon rail at tablet width and a slide-in drawer on mobile.
3. **Bottom tab bar (mobile, teacher and parent):** four to five tabs, 24px icons with 12px labels, active tab in blue with a top indicator, safe-area padding, unread dot where relevant.
4. **Global search** (headmaster and teacher): searches students by name or ID and navigates to the student profile. Client-side over cached Dexie data so it works offline.
5. **Page header pattern:** title (`text-display`), optional subtitle, right-aligned primary action, breadcrumb on desktop.
6. **Layout components:** `PageContainer` (max width 1200px, 16px gutters on mobile, 24px desktop), `SectionCard`, `TwoColumn` (feed plus right rail at 1280px).
7. Route transitions: no layout shift, skeleton on first load, focus moved to the page heading on navigation.
8. Sync indicator text and style per spec, with SVG Wi-Fi icon: "Online, synced" (green) and "Offline, saving locally (X pending)" (amber or red). Tooltip with last sync time.

**Acceptance**
- Shell matches the guide at 360, 768 and 1280px with no overflow.
- Keyboard: tab order is logical, skip-to-content link works, drawer traps focus and closes on Escape.

---

## Phase 4: Core component library 🔜 (part 1 of 2 done: buttons, fields, display primitives, dialogs)
Build once, reuse everywhere. Each component gets all states (default, hover, focus, active, disabled, loading, error) and lives under `components/ui/`.

**Tasks**
- **Button:** primary (blue), success (green), secondary (grey), ghost, danger. 48px (compact 36px), 6px radius, bold 17px label, loading spinner SVG, optional leading icon.
- **Input, Select, Textarea, Search:** 52px, 6px radius, `border` colour, `shadow-focus` and blue border on focus, floating or stacked label, helper and error text with icon, prefix and suffix icons.
- **Phone input:** Ghana format helper (`024XXXXXXX`), live validation.
- **Money input and display:** `GHS` prefix, tabular numerals, negative and credit styling.
- **Card, ListRow, Divider, Avatar (with initials fallback and Cloudinary `f_auto,q_auto`), AvatarStack, Badge, StatusPill.**
- **Modal and BottomSheet:** sheet on mobile (drag handle, 16px top radius), centred modal on desktop, focus trap, Escape to close, scroll lock.
- **Tabs, SegmentedControl, Toggle, Checkbox, Radio, DatePicker (native with styled wrapper), Stepper.**
- **Toast:** white card, 4px coloured left border, SVG icon, 4s auto-dismiss, pause on hover, stacked, `role="status"` (errors `role="alert"`).
- **Skeleton, Spinner, EmptyState (SVG illustration plus action), ErrorState (retry), OfflineState.**
- **Table:** sticky header, zebra off, row hover, sortable headers, becomes stacked cards below 640px.
- **Pagination or "Load more", FilterBar, ConfirmDialog (destructive actions).**
- A hidden **`/__styleguide`** dev route (dev builds only) showing every component and state for visual review.

**Acceptance**
- Every form and list in the app is built from these components; no one-off styles remain.
- The style guide page renders all states without console errors.

---

## Phase 5: Login, maintenance and shared screens ⬜
**Tasks**
1. **Login (desktop):** two columns on `page` background. Left: crest, "Eagle International School" in brand blue, motto line. Right: white card with `shadow-login`, 52px email-or-phone input, 52px password input with show and hide eye SVG, full-width blue **Log in** button (48px), "Forgot password?" link that explains to contact the headmaster (admin recovery path), no "Create account" button.
2. **Login (mobile):** stacked, logo above, card full width, safe-area aware, keyboard does not hide the button.
3. Friendly inline errors (wrong password, disabled account, offline) with icon and text, not alerts.
4. **Notification permission prompt** on first login: custom sheet explaining value, "Turn on" and "Not now".
5. **Maintenance screen:** brand mark, message, auto-recheck indicator.
6. **404, 403 and session-expired screens** with a clear route back.
7. **Install prompt (PWA):** non-blocking bottom card, dismissible, remembers dismissal.
8. **Update available** snackbar: "New version ready" with Refresh.
9. Splash and loading state while Firebase resolves the session (no flash of the login screen for signed-in users).

**Acceptance:** all states render at 360 and 1280px; no emoji; focus and labels correct.

---

## Phase 6: Headmaster portal ⬜
**Tasks**
1. **Dashboard:** greeting, four stat cards with icons (students, today's attendance, fees owing, canteen cash pending), a "Needs your attention" list (unreconciled batches, reports awaiting review, owing accounts) and quick actions. Right rail on desktop: upcoming term dates.
2. **Notices feed (Facebook-style):** post cards with author avatar, name, role, time, body, optional image, and a reach or read count. Composer card at top ("Write a notice for parents or staff"). Uses existing notification data; if no notices endpoint exists, show it as read-only from notifications and list a Backend ask.
3. **Students list:** search, filters (department, class), avatar rows, status pills for fee state, row opens the profile.
4. **Student profile (Facebook-style):** cover band in brand tint, large overlapping avatar, name, ID `SCH-YYYY-XXXX`, class chip, tabs: **Overview, Guardians, Pickup, Fees, Attendance, Reports, Health**. Medical and allergy notes use attention styling with an icon. Pickup persons shown as photo cards.
5. **Student registration:** multi-step stepper (Student, Guardians, Pickup persons, Health and address, Review). Guardian phone search first with link-existing-guardian result card. Photo upload with crop preview. Inline validation. Draft saved locally.
6. **Classes, Subjects, Teacher assignments:** list plus side panel editor; JHS form master and subject-teacher matrix as a grid with clear headers.
7. **Fees:** ledger table (stacked cards on mobile), status pills (paid, partial, owing), payment sheet (cash, MoMo, bank, credit offset), **credit offset flow** with parent-consent checkbox and note, amount capped to what is owed, confirmation dialog, receipt-style success state.
8. **Canteen reconciliation:** batches grouped by teacher, total in large display type, expandable line items, **Confirm cash received** with confirmation, reconciled batches shown locked with a lock icon.
9. **Terminal reports review:** queue with filters, preview, add remarks, upload and place signature, **Publish** with confirmation and a clear published state.
10. **Academic settings:** term dates, reopening date, canteen rate, grading format (segmented control), with save feedback.

**Acceptance:** every headmaster route has loading, empty, error and success states; tables become stacked cards at 360px; money figures use tabular numerals and `GHS` formatting.

---

## Phase 7: Teacher and parent portals (mobile-first) ⬜
### Teacher
1. **Home:** assigned classes as large tappable cards with student count and today's tasks (attendance not yet marked, canteen cash in hand).
2. **Attendance:** list of avatar rows with a three-way segmented control (Present, Absent, Late) 44px tall, "Mark all present" action, sticky save bar, visible note when absent triggers a canteen credit.
3. **Canteen collection:** student rows, one tap opens a bottom sheet with `1 day`, `1 week`, `1 month` options showing the rate-based amount; sticky **Cash in hand to reconcile** counter at the top; undo within the session.
4. **Scores (Assessments):** spreadsheet-like entry optimised for phones: one subject, rows of students, numeric keypad inputs, live total and grade, auto-save with queued indicator per row, validation of 0 to 50 limits.
5. **Rubric entry (Creche, Nursery, KG):** big segmented choices (Always, Sometimes, Needs help or 1 to 4), one skill at a time or list view.
6. **Terminal reports:** class list with completion progress bar, remark editor, **Draft PDF** generation with progress and offline-ready state.
7. Offline: each row shows a small "Saved on this device" icon until synced; failed sync items appear in a conflict list with retry.

### Parent
1. **Header with child switcher:** `[Avatar] Child name` with a chevron SVG; tap opens a bottom sheet listing children with avatar, class and balance; selected child has a check icon.
2. **Home feed for the selected child:** balance card (Total debt itemised: school fees, printing, books, canteen, dues; Surplus credit in green with an explanation that the headmaster applies it), live update without reload (subtle highlight when numbers change).
3. **Child profile:** cover and avatar header, tabs: Overview, Attendance, Books, Canteen, Reports.
4. **Attendance:** month calendar with present, absent and late markers (icon plus colour) and a summary.
5. **Reports:** list of published terminals, preview, **Download** and **Share** (Web Share API with fallback).
6. **Notifications page:** grouped by day, unread dot, tap navigates to the relevant item; catch-up toast "You have X new updates while you were away."
7. Pull-to-refresh and skeleton loading.

**Acceptance:** one-handed use at 360px, all touch targets at least 44px, works offline for cached data with a clear offline banner.

---

## Phase 8: Admin portal, accessibility and responsive audit ⬜
**Tasks**
1. **Admin overview, branding, telemetry, accounts:** branding preview showing logo, name, motto and theme live; telemetry as stat cards plus simple SVG charts (storage, rows, latency, errors) using the dataviz palette; accounts table with role pills, reset password and disable actions behind confirm dialogs; maintenance toggle with clear warning. Admin screens never display school income or parent contact lists.
2. **Accessibility pass (WCAG 2.1 AA):**
   - Contrast at least 4.5:1 for text, 3:1 for UI; verify `text-secondary` on `page`, white on brand-green.
   - Visible focus ring on every interactive element; no `outline: none` without replacement.
   - Labels on all inputs; errors linked with `aria-describedby`; `aria-live` regions for toasts and sync status.
   - Landmarks (`header`, `nav`, `main`), one `h1` per page, logical heading order.
   - Respect `prefers-reduced-motion`.
   - Keyboard operability for sheets, menus, tabs, tables.
3. **Responsive audit** at 360, 390, 768, 1024, 1280, 1536: no horizontal scroll, no clipped text, safe-area insets, landscape phone usable.
4. **Dark-mode readiness:** keep all colours behind tokens so a theme can be added later (no dark mode is required now).
5. Print stylesheet for fee statements and class lists.

**Acceptance:** Lighthouse accessibility at least 95 on login, headmaster dashboard, teacher attendance and parent home; zero keyboard traps.

---

## Phase 9: Performance and PWA polish ⬜
**Tasks**
1. **Code-split** by route with `React.lazy`; load `pdfmake` (and fonts/VFS) only when a report is generated. Target: initial JS under 250 KB gzipped (currently about 2.3 MB main chunk).
2. Preload the brand font stack (system fonts, so no web-font cost), `font-display: swap` for anything else.
3. Image handling: Cloudinary `f_auto,q_auto,w_...` sized per use, `loading="lazy"`, width and height set to avoid layout shift, blurred placeholder.
4. List virtualisation for long rosters (over 100 rows).
5. Service worker: app-shell precache, stale-while-revalidate for API reads, offline fallback page, update prompt (Phase 5 snackbar).
6. Reduce re-renders: memoise rows, debounce search, avoid layout thrash on live signal updates.
7. Budgets enforced in CI: main bundle size, LCP under 2.5s on a mid-range phone with throttled 4G, CLS under 0.1.

**Acceptance:** build output shows the split chunks; Lighthouse performance at least 90 on mobile for the login and parent home.

---

## Phase 10: Final visual QA and sign-off ⬜
**Tasks**
1. Capture screenshots of every route at 360, 768 and 1280px with Playwright for all four roles (use seeded demo data).
2. Walk the checklist per screen: tokens, icons (no emoji), states, spacing, alignment, copy in sentence case, status never colour-only.
3. Compare each screen against the design guide and record a per-screen score in `docs/frontend-qa.md`; fix anything under 95%.
4. Cross-browser: Chrome, Safari iOS, Firefox, Samsung Internet. PWA installed mode on Android and iOS.
5. Offline walkthrough: go offline mid-entry (scores, canteen, attendance), confirm indicator, queue, replay and toasts.
6. Final bundle and Lighthouse numbers recorded.
7. Remove the style guide route from production builds and any dead components (for example unused sync banners; keep one of `SyncBanner`, `SyncStatusBanner`, `SyncIndicator`).

**Acceptance:** overall match at least 98% on the rubric below, signed off by the owner.

---

## Scoring rubric (used in Phase 10; 100 points)
| Area | Points |
|---|---|
| Tokens: size, colour, type, shadow, radius correct | 20 |
| Layout and responsiveness (360 to 1536px) | 15 |
| Component consistency and states | 15 |
| Icons: all SVG, no emoji, consistent | 10 |
| Facebook-style patterns (switcher, feed, profile, search, bell) | 10 |
| Offline, sync and live-update feedback | 10 |
| Accessibility | 10 |
| Performance | 10 |

---

## Backend asks (collect during phases; do not build here)
- Notices or announcements endpoint for the feed (Phase 6).
- Student cover photo field, if wanted (Phase 6).
- Search endpoint, if client-side search over cached data is not enough (Phase 3).

## Known notes
- The build currently warns about a bundle of about 2.3 MB; Phase 9 resolves it.
- An account created with both email and phone signs in with email only; the login help text should say so until changed.
