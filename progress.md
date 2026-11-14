# progress.md: frontend build log

Shared log for every session working on `frontend/`. Read this first, then `Frontend.md` (plan) and `CLAUDE.md` (rules).
Add a new section at the bottom for each piece of work. Keep entries short and factual.

Context: the app currently runs on **browser storage (Dexie) and mock data** (`src/lib/mockData.ts`), because the frontend is being completed before the backend is connected.

## Phase status (from Frontend.md)
| Phase | Status |
|---|---|
| 1 Foundation, tokens | done (earlier session) |
| 2 Icons, emoji removal | done (earlier session) |
| 3 App shell, navigation | done (earlier session) |
| 4 Core component library, part 1 | done (earlier session) |
| 4 Core component library, part 2 | **done (this session), awaiting owner approval** |
| 5 Login, maintenance, shared screens | not started |
| 6 to 10 | not started |

## Phase 4 part 1 (earlier session; found in the repo)
Button, Input, Select, Textarea, SearchInput, PhoneInput, MoneyInput, Money, Card, ListRow, Divider, Avatar, AvatarStack, Badge and CountBadge, StatusPill, Modal, BottomSheet (shared `Dialog.tsx`), Spinner, Field helpers, and the first style guide sections.

## Phase 4 part 2 (this session)
All files are in `frontend/src/components/ui/`. Import with `@/components/ui/<File>`.

| Component | File | Notes |
|---|---|---|
| Tabs, TabPanel | `Tabs.tsx` | Underline tabs, 44px, optional icon and count badge, arrow/Home/End keys, scrolls inside its own box on phones. Pair with `TabPanel` using the same `idBase`. |
| SegmentedControl | `SegmentedControl.tsx` | Radio group, 44px (`size="compact"` 36px), per-option `tone` (good/attention/problem/brand), selected option shows its icon or a check. For Present/Absent/Late and grading format. |
| Toggle | `Toggle.tsx` | `role="switch"`, 44px hit area, label plus description, spoken On/Off. |
| Checkbox | `Checkbox.tsx` | Native input, custom look, 44px row, helper and error text. |
| RadioGroup | `Radio.tsx` | Native radios in a fieldset, `inline` option, error/helper. |
| DatePicker | `DatePicker.tsx` | Native `type="date"` in the 52px field look, ISO `value` and `onValueChange`, `min`/`max`. |
| Stepper | `Stepper.tsx` | Numbered steps with check on done steps (wide screens); "Step x of y" plus progress bar on phones; `onStepClick` to jump back. |
| Toast | `Toast.tsx`, `ToastContainer.tsx` | Rewritten: white card, 8px radius, 4px coloured left border, SVG icon, 4s auto-dismiss, pauses on hover and focus, errors `role="alert"`, others `role="status"`. Container stacks them (max 4), top-centre on phones, top-right from 768px. `useToast().showToast(type, title, body?, duration?)` is unchanged. |
| Skeleton family | `Skeleton.tsx` | `Skeleton`, `SkeletonCircle`, `SkeletonText`, `SkeletonRow`, `SkeletonList` (announces "Loading"), `SkeletonCard`. |
| EmptyState, ErrorState, OfflineState, OfflineBanner | `StateViews.tsx` | One layout with inline SVG illustration, title, text, action. ErrorState has a retry button; OfflineBanner is a slim strip for cached screens. |
| Table | `Table.tsx` | Generic `Table<T>` with `Column<T>`: sticky header, row hover, sortable headers (`aria-sort`), numeric columns right-aligned with tabular numerals, row click. Below 640px it renders stacked cards. Built-in `loading`, `error`, empty states. |
| Pagination, LoadMore | `Pagination.tsx` | Page list with ellipses (Previous / "Page x of y" / Next on phones); "Showing x of y" with Load more. |
| FilterBar, FilterChip | `FilterBar.tsx` | Search plus filter controls, "Clear filters (n)", live result count. Chip shows a check when selected. |
| ConfirmDialog | `ConfirmDialog.tsx` | Modal for destructive actions; `tone` danger/success/primary; `requireAcknowledgement` adds a consent checkbox that gates the confirm button (for the credit offset flow). |

Also changed:
- `icons.tsx`: added `calendar`, `chevron-up`, `arrow-up-down`, `inbox`.
- `pages/Styleguide.tsx` (route `/__styleguide`, dev only): added sections for Tabs and SegmentedControl, Toggle/Checkbox/Radio/DatePicker, Stepper, Toast, states, Table/FilterBar/Pagination, ConfirmDialog.

### How it was verified
- `npm run lint:tokens`: passes (113 files).
- Loose typecheck of `components/ui/*` and `Styleguide.tsx` with stubbed React types: no errors other than stub artefacts.
- **Not verified:** `npm run typecheck` and `npm run build` (no `node_modules` and no network for installs in that session), and no Playwright screenshots at 360/768/1280. The next session that has dependencies installed should run `npm install --legacy-peer-deps`, then typecheck, build, and open `/__styleguide` to check every state visually.

### Notes for the next session
- Not yet used by any page. Phase 5 onwards should build screens from these components, and old one-off markup in pages should be replaced as each screen is reworked (Frontend.md Phase 4 acceptance: "no one-off styles remain").
- `Stepper` has one inline `style` (progress bar width), like the drag offset in `Dialog.tsx`, because the value is dynamic.
- Phase 4 acceptance still open: the style guide must render with no console errors (needs a real browser run).
