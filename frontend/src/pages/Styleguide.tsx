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

/**
 * Dev-only visual review page (route /__styleguide, not in production builds).
 * Phase 4 part 1: buttons, fields, display primitives, dialogs.
 * Part 2 adds tabs, toggles, toasts, states, tables and the rest.
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

export default function Styleguide() {
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
