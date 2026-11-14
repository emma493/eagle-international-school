import React, { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Badge, CountBadge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/Input";
import { ListRow } from "@/components/ui/ListRow";
import { Modal } from "@/components/ui/Modal";
import { Money } from "@/components/ui/Money";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { StatusPill } from "@/components/ui/StatusPill";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup } from "@/components/ui/Radio";
import { DatePicker } from "@/components/ui/DatePicker";
import { Stepper } from "@/components/ui/Stepper";
import { Skeleton, SkeletonCard, SkeletonList, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState, OfflineBanner, OfflineState } from "@/components/ui/StateViews";
import { Table, type Column } from "@/components/ui/Table";
import { LoadMore, Pagination } from "@/components/ui/Pagination";
import { FilterBar, FilterChip } from "@/components/ui/FilterBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Alert } from "@/components/ui/Alert";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useToast } from "@/hooks/useToast";

/**
 * Dev-only visual review page (route /__styleguide, not in production builds).
 * Phase 4 part 1: buttons, fields, display primitives, dialogs.
 * Phase 4 part 2: tabs, selection controls, stepper, toasts, loading and empty states, table, pagination, filters, confirm dialog.
 */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mb-8">
      <h2 id={id} className="mb-3 text-title font-bold text-text-primary">
        {title}
      </h2>
      <Card padding="sm">{children}</Card>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-caption font-semibold text-text-secondary">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const VARIANTS: ButtonVariant[] = ["primary", "success", "secondary", "ghost", "danger"];
const PEOPLE = [{ name: "Ama Mensah" }, { name: "Kofi Boateng" }, { name: "Esi Owusu" }, { name: "Yaw Darko" }, { name: "Abena Asare" }, { name: "Kwame Nkrumah" }];

type Fee = { id: string; name: string; cls: string; owing: number; status: string };
const FEES: Fee[] = [
  { id: "1", name: "Ama Mensah", cls: "Basic 4", owing: 320.5, status: "owing" },
  { id: "2", name: "Kofi Boateng", cls: "Creche", owing: 0, status: "paid" },
  { id: "3", name: "Esi Owusu", cls: "JHS 2", owing: 150, status: "partial" },
];
const FEE_COLS: Column<Fee>[] = [
  { key: "name", header: "Student", sortable: true, primary: true },
  { key: "cls", header: "Class", sortable: true },
  { key: "owing", header: "Owing", numeric: true, sortValue: (r) => r.owing, render: (r) => <Money amount={r.owing} kind={r.owing > 0 ? "owing" : "neutral"} /> },
  { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
];

export default function Styleguide() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("overview");
  const [att, setAtt] = useState("");
  const [grading, setGrading] = useState("numeric");
  const [on, setOn] = useState(true);
  const [chk, setChk] = useState(true);
  const [method, setMethod] = useState("cash");
  const [date, setDate] = useState("2026-11-14");
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(3);
  const [shown, setShown] = useState(20);
  const [fq, setFq] = useState("");
  const [chips, setChips] = useState<string[]>(["owing"]);
  const [confirm, setConfirm] = useState<"" | "danger" | "ack">("");
  const [phone, setPhone] = useState("");
  const [phoneBad, setPhoneBad] = useState("0991234567");
  const [phoneOk, setPhoneOk] = useState("0241234567");
  const [amount, setAmount] = useState("150");
  const [capped, setCapped] = useState("500");
  const [query, setQuery] = useState("");
  const [query2, setQuery2] = useState("Ama");
  const [picked, setPicked] = useState("c1");
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <main className="mx-auto max-w-page px-4 py-6 md:px-6">
      <h1 className="mb-1 text-display font-bold text-text-primary">Style guide</h1>
      <p className="mb-6 text-body text-text-secondary">Core components, every state. Development only.</p>

      <Section id="sg-buttons" title="Button">
        {VARIANTS.map((v) => (
          <Row key={v} label={`${v}: default, leading icon, loading, disabled, compact`}>
            <Button variant={v}>Save changes</Button>
            <Button variant={v} leadingIcon="plus">
              Add student
            </Button>
            <Button variant={v} loading>
              Saving
            </Button>
            <Button variant={v} disabled>
              Disabled
            </Button>
            <Button variant={v} size="compact">
              Compact
            </Button>
            <Button variant={v} size="compact" leadingIcon="download">
              Compact icon
            </Button>
          </Row>
        ))}
        <Row label="Full width">
          <Button fullWidth>Log in</Button>
        </Row>
        <Row label="Spinner sizes">
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={24} />
          <Spinner size={40} label="Loading" />
        </Row>
      </Section>

      <Section id="sg-inputs" title="Input, Select, Textarea, Search">
        <div className="grid gap-x-6 md:grid-cols-2">
          <Input label="Full name" placeholder="Ama Mensah" helper="As it appears on the birth certificate." />
          <Input label="Email" type="email" defaultValue="ama@" error="Enter a full email address." />
          <Input label="Disabled" defaultValue="SCH-2026-0042" disabled />
          <Input label="Required field" required placeholder="Required" />
          <Input label="Password" type="password" defaultValue="secret123" trailing={<button type="button" className="icon-btn" aria-label="Show password"><Icon name="eye" size={20} /></button>} />
          <Input label="With success" defaultValue="Looks good" success="Saved on this device." />
          <Select label="Class" placeholder="Choose a class" defaultValue="" helper="Classes for this term.">
            <option>Creche</option>
            <option>Basic 1</option>
            <option>JHS 2</option>
          </Select>
          <Select label="Department" defaultValue="Primary" error="Pick a department.">
            <option>Primary</option>
            <option>JHS</option>
          </Select>
          <Textarea label="Medical notes" placeholder="Allergies, conditions, medicines" helper="Only the headmaster and class teacher see this." />
          <Textarea label="Remarks" defaultValue="Needs to practise reading." error="Keep remarks under 200 characters." />
          <SearchInput label="Search students" value={query} onValueChange={setQuery} placeholder="Name or ID" />
          <SearchInput label="Search with text" value={query2} onValueChange={setQuery2} placeholder="Name or ID" />
        </div>
      </Section>

      <Section id="sg-phone" title="Phone input">
        <div className="grid gap-x-6 md:grid-cols-3">
          <PhoneInput value={phone} onValueChange={setPhone} />
          <PhoneInput label="Guardian phone (wrong prefix)" value={phoneBad} onValueChange={setPhoneBad} />
          <PhoneInput label="Guardian phone (valid)" value={phoneOk} onValueChange={setPhoneOk} />
        </div>
      </Section>

      <Section id="sg-money" title="Money display and input">
        <Row label="Display sizes">
          <Money amount={1250} size="body" />
          <Money amount={1250} size="lg" />
          <Money amount={1250} size="title" />
          <Money amount={1250} size="display" />
        </Row>
        <Row label="Neutral, owing, credit, negative">
          <Money amount={320.5} />
          <Money amount={320.5} kind="owing" size="lg" />
          <Money amount={40} kind="credit" size="lg" />
          <Money amount={-75} size="lg" />
        </Row>
        <div className="mt-2 grid gap-x-6 md:grid-cols-3">
          <MoneyInput value={amount} onValueChange={setAmount} />
          <MoneyInput label="Offset (max GHS 300.00)" value={capped} onValueChange={setCapped} max={300} helper="Capped at what is owed." />
          <MoneyInput label="Disabled" value="20" onValueChange={() => {}} disabled />
        </div>
      </Section>

      <Section id="sg-display" title="Card, ListRow, Divider, Avatar, Badge, StatusPill">
        <Row label="Avatar sizes and fallbacks">
          <Avatar name="Ama Mensah" size={24} />
          <Avatar name="Ama Mensah" size={32} />
          <Avatar name="Ama Mensah" size={40} />
          <Avatar name="Ama Mensah" size={56} tone="brand" />
          <Avatar name="Ama Mensah" size={80} />
          <Avatar name="Broken photo" src="https://example.invalid/missing.jpg" size={56} />
        </Row>
        <Row label="AvatarStack (6 people, max 4) and (2 people)">
          <AvatarStack people={PEOPLE} />
          <AvatarStack people={PEOPLE.slice(0, 2)} size={40} />
          <AvatarStack people={PEOPLE} size={24} max={3} />
        </Row>
        <Row label="Badge and CountBadge">
          <Badge>Basic 4</Badge>
          <Badge variant="info" icon="info">
            JHS
          </Badge>
          <Badge variant="good">Active</Badge>
          <Badge variant="attention">Allergy</Badge>
          <Badge variant="problem">Disabled</Badge>
          <CountBadge count={3} />
          <CountBadge count={120} />
          <CountBadge count={5} dot />
        </Row>
        <Row label="StatusPill">
          {["paid", "partial", "owing", "present", "absent", "late", "draft", "published", "pending", "reconciled"].map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </Row>
        <p className="mb-2 mt-4 text-caption font-semibold text-text-secondary">ListRow: plain, link-style with chevron, selectable, disabled</p>
        <div className="rounded-card border border-divider">
          <ListRow leading={<Avatar name="Ama Mensah" />} title="Ama Mensah" subtitle="Basic 4, SCH-2026-0042" meta="08:15" trailing={<StatusPill status="paid" />} />
          <Divider inset />
          <ListRow onClick={() => {}} leading={<Avatar name="Kofi Boateng" />} title="Kofi Boateng" subtitle="Creche" trailing={<CountBadge count={2} label="new updates" />} chevron />
          <Divider inset />
          {[
            ["c1", "Ama Mensah", "Basic 4, owes GHS 320.50"],
            ["c2", "Kofi Boateng", "Creche, no balance"],
          ].map(([id, name, sub]) => (
            <ListRow key={id} onClick={() => setPicked(id)} selected={picked === id} leading={<Avatar name={name} />} title={name} subtitle={sub} />
          ))}
          <Divider inset />
          <ListRow disabled onClick={() => {}} leading={<Avatar name="Esi Owusu" />} title="Esi Owusu" subtitle="Disabled row" />
        </div>
      </Section>

      <Section id="sg-dialogs" title="Modal and BottomSheet">
        <Row label="Modal is a sheet below 768px and a centred card above. BottomSheet is always a sheet.">
          <Button onClick={() => setModal(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>
            Open bottom sheet
          </Button>
        </Row>
      </Section>

      <Section id="sg-alert" title="Alert and PasswordInput">
        <div className="grid gap-3 md:grid-cols-2">
          <Alert tone="error" title="Wrong email, phone or password">Check what you typed and try again.</Alert>
          <Alert tone="warning" title="You are offline">Connect to the internet to sign in.</Alert>
          <Alert tone="info" title="Ask the school to reset it">Contact the headmaster or the school office.</Alert>
          <Alert tone="success">Password changed.</Alert>
        </div>
        <div className="mt-4 max-w-sm">
          <PasswordInput label="Password" defaultValue="secret123" />
        </div>
      </Section>

      <Section id="sg-tabs" title="Tabs and SegmentedControl">
        <Tabs
          idBase="sg"
          label="Student sections"
          value={tab}
          onChange={setTab}
          items={[
            { id: "overview", label: "Overview", icon: "user" },
            { id: "guardians", label: "Guardians", icon: "users" },
            { id: "fees", label: "Fees", icon: "wallet", count: 2 },
            { id: "attendance", label: "Attendance", icon: "calendar-check" },
            { id: "reports", label: "Reports", icon: "file-text" },
            { id: "health", label: "Health", icon: "info", disabled: true },
          ]}
        />
        <TabPanel idBase="sg" id={tab} active className="py-4 text-body text-text-secondary">
          Content for the {tab} tab.
        </TabPanel>
        <Row label="Attendance (44px). Nothing chosen, then chosen with the arrow keys">
          <SegmentedControl
            label="Attendance for Ama Mensah"
            value={att}
            onChange={setAtt}
            options={[
              { value: "present", label: "Present", icon: "check-circle", tone: "good" },
              { value: "absent", label: "Absent", icon: "x-circle", tone: "problem" },
              { value: "late", label: "Late", icon: "clock", tone: "attention" },
            ]}
          />
        </Row>
        <Row label="Compact, not full width">
          <SegmentedControl label="Grading format" size="compact" fullWidth={false} value={grading} onChange={setGrading} options={[{ value: "numeric", label: "1 to 9" }, { value: "letter", label: "A to F" }]} />
          <SegmentedControl label="Disabled" size="compact" fullWidth={false} value="a" onChange={() => {}} disabled options={[{ value: "a", label: "One" }, { value: "b", label: "Two" }]} />
        </Row>
      </Section>

      <Section id="sg-select" title="Toggle, Checkbox, Radio, DatePicker">
        <div className="grid gap-x-6 md:grid-cols-2">
          <div>
            <Toggle checked={on} onChange={setOn} label="Maintenance mode" description="Staff and parents see a maintenance screen." />
            <Toggle checked={false} onChange={() => {}} label="Disabled toggle" disabled />
            <Checkbox checked={chk} onChange={(e) => setChk(e.target.checked)} label="Parent has agreed to apply this credit" description="Recorded with the offset." />
            <Checkbox defaultChecked={false} onChange={() => {}} label="Unchecked with an error" error="Tick this to continue." />
            <Checkbox checked disabled onChange={() => {}} label="Disabled" />
          </div>
          <div>
            <RadioGroup label="Payment method" value={method} onChange={setMethod} options={[{ value: "cash", label: "Cash" }, { value: "momo", label: "Mobile money", description: "MTN, Vodafone, AirtelTigo" }, { value: "bank", label: "Bank transfer", disabled: true }]} />
            <DatePicker label="Reopening date" value={date} onValueChange={setDate} helper="Shown to parents." />
            <DatePicker label="Term end" value="" onValueChange={() => {}} error="Choose a date." />
          </div>
        </div>
      </Section>

      <Section id="sg-stepper" title="Stepper">
        <Stepper
          current={step}
          onStepClick={setStep}
          steps={[
            { id: "s", label: "Student", hint: "Name and class" },
            { id: "g", label: "Guardians", hint: "Phone first" },
            { id: "p", label: "Pickup persons" },
            { id: "h", label: "Health and address" },
            { id: "r", label: "Review" },
          ]}
        />
        <Row label="Move through the steps">
          <Button variant="secondary" size="compact" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
          <Button size="compact" disabled={step === 4} onClick={() => setStep(step + 1)}>
            Next
          </Button>
        </Row>
      </Section>

      <Section id="sg-toast" title="Toast">
        <Row label="White card, 4px coloured border, icon, 4s, pauses on hover, errors use role=alert">
          <Button variant="success" size="compact" onClick={() => showToast("success", "Payment recorded", "GHS 150.00 from Ama Mensah.")}>
            Success
          </Button>
          <Button variant="danger" size="compact" onClick={() => showToast("error", "Could not save", "Check your connection and try again.")}>
            Error
          </Button>
          <Button size="compact" onClick={() => showToast("info", "You have 3 new updates while you were away.")}>
            Info
          </Button>
          <Button variant="secondary" size="compact" onClick={() => showToast("warning", "Saved on this device", "It will sync when you are back online.")}>
            Warning
          </Button>
        </Row>
      </Section>

      <Section id="sg-states" title="Skeleton, EmptyState, ErrorState, OfflineState">
        <Row label="Skeleton">
          <div className="w-full max-w-md">
            <Skeleton className="mb-3 h-6 w-1/3" />
            <SkeletonText lines={3} />
          </div>
          <SkeletonCard className="w-48" />
        </Row>
        <SkeletonList rows={3} className="rounded-card border border-divider" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-divider">
            <EmptyState compact title="No students yet" description="Add the first student to get started." actionLabel="Add student" onAction={() => {}} />
          </div>
          <div className="rounded-card border border-divider">
            <ErrorState compact onRetry={() => {}} />
          </div>
          <div className="rounded-card border border-divider">
            <OfflineState compact onRetry={() => {}} />
          </div>
        </div>
        <OfflineBanner pending={3} className="mt-4" />
      </Section>

      <Section id="sg-table" title="Table, FilterBar, Pagination">
        <FilterBar
          search={{ value: fq, onChange: setFq, placeholder: "Search students" }}
          activeCount={chips.length}
          onClear={() => setChips([])}
          resultLabel={`${FEES.length} students`}
        >
          {["owing", "partial", "paid"].map((c) => (
            <FilterChip key={c} label={c.charAt(0).toUpperCase() + c.slice(1)} selected={chips.includes(c)} onToggle={() => setChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))} />
          ))}
        </FilterBar>
        <Table className="mt-3" caption="Fee balances" columns={FEE_COLS} rows={FEES} rowKey={(r) => r.id} onRowClick={() => {}} />
        <p className="mb-2 mt-4 text-caption font-semibold text-text-secondary">Loading, empty and error</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Table caption="Loading" columns={FEE_COLS} rows={[]} rowKey={(r) => r.id} loading />
          <Table caption="Empty" columns={FEE_COLS} rows={[]} rowKey={(r) => r.id} emptyTitle="No matching students" emptyDescription="Try clearing a filter." />
          <Table caption="Error" columns={FEE_COLS} rows={[]} rowKey={(r) => r.id} error onRetry={() => {}} />
        </div>
        <Pagination className="mt-4" page={page} pageCount={12} onChange={setPage} />
        <LoadMore shown={shown} total={84} noun="students" onLoadMore={() => setShown((n) => Math.min(84, n + 20))} />
      </Section>

      <Section id="sg-confirm" title="ConfirmDialog">
        <Row label="Destructive, and with a consent checkbox">
          <Button variant="danger" onClick={() => setConfirm("danger")}>
            Disable account
          </Button>
          <Button variant="success" onClick={() => setConfirm("ack")}>
            Apply credit
          </Button>
        </Row>
      </Section>

      <ConfirmDialog open={confirm === "danger"} onClose={() => setConfirm("")} onConfirm={() => setConfirm("")} tone="danger" title="Disable this account?" description="Kofi Mensah will be signed out and cannot log in until you enable the account again." confirmLabel="Disable account" />
      <ConfirmDialog
        open={confirm === "ack"}
        onClose={() => setConfirm("")}
        onConfirm={() => setConfirm("")}
        tone="success"
        title="Apply surplus credit?"
        description="GHS 100.00 moves from credit to school fees."
        confirmLabel="Apply credit"
        requireAcknowledgement="The parent has agreed to this."
      />

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Record payment"
        description="Cash received at the school office."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={() => setModal(false)}>
              Confirm payment
            </Button>
          </>
        }
      >
        <MoneyInput value={amount} onValueChange={setAmount} />
        <Select label="Method" defaultValue="cash">
          <option value="cash">Cash</option>
          <option value="momo">Mobile money</option>
        </Select>
      </Modal>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Choose a child">
        <ListRow onClick={() => setSheet(false)} selected leading={<Avatar name="Ama Mensah" />} title="Ama Mensah" subtitle="Basic 4" />
        <ListRow onClick={() => setSheet(false)} leading={<Avatar name="Kofi Boateng" />} title="Kofi Boateng" subtitle="Creche" meta="GHS 0.00" />
      </BottomSheet>
    </main>
  );
}
