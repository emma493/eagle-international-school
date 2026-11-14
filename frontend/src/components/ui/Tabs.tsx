import React, { useId, useRef } from "react";
import { Icon, type IconName } from "@/components/ui/icons";
import { CountBadge } from "@/components/ui/Badge";

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  /** Unread or item count shown as a red badge. */
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tab list, for example "Student sections". */
  label: string;
  className?: string;
}

/** Id helpers so a panel can point back at its tab. */
export function tabId(base: string, id: string) {
  return `${base}-tab-${id}`;
}
export function panelId(base: string, id: string) {
  return `${base}-panel-${id}`;
}

/**
 * Underlined tab list (student profile, child profile). Scrolls sideways inside its own box on
 * narrow screens, so the page never overflows. Arrow keys, Home and End move between tabs.
 * Pair with <TabPanel>. Pass `idBase` to link panels; one is generated when omitted.
 */
export function Tabs({ items, value, onChange, label, className = "", idBase }: TabsProps & { idBase?: string }) {
  const auto = useId();
  const base = idBase ?? auto;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (from: number, step: 1 | -1 | "first" | "last") => {
    const enabled = items.filter((t) => !t.disabled);
    if (enabled.length === 0) return;
    const current = enabled.findIndex((t) => t.id === items[from].id);
    let next = 0;
    if (step === "first") next = 0;
    else if (step === "last") next = enabled.length - 1;
    else next = (current + step + enabled.length) % enabled.length;
    const target = enabled[next];
    onChange(target.id);
    refs.current[target.id]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") move(index, 1);
    else if (e.key === "ArrowLeft") move(index, -1);
    else if (e.key === "Home") move(index, "first");
    else if (e.key === "End") move(index, "last");
    else return;
    e.preventDefault();
  };

  return (
    <div className={`overflow-x-auto border-b border-divider ${className}`}>
      <div role="tablist" aria-label={label} className="flex min-w-max gap-1 px-1">
        {items.map((t, i) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={tabId(base, t.id)}
              aria-selected={active}
              aria-controls={panelId(base, t.id)}
              tabIndex={active ? 0 : -1}
              disabled={t.disabled}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative inline-flex h-touch items-center gap-2 whitespace-nowrap rounded-input px-3 text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? "text-brand-blue" : "text-text-secondary enabled:hover:bg-neutral-hover"
              }`}
            >
              {t.icon ? <Icon name={t.icon} size={20} /> : null}
              {t.label}
              {t.count ? <CountBadge count={t.count} label="items" /> : null}
              <span aria-hidden="true" className={`absolute inset-x-2 -bottom-px h-1 rounded-t-full ${active ? "bg-brand-blue" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface TabPanelProps {
  idBase: string;
  id: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Content for one tab. Hidden (not unmounted) is not used: inactive panels render nothing. */
export function TabPanel({ idBase, id, active, children, className = "" }: TabPanelProps) {
  if (!active) return null;
  return (
    <div role="tabpanel" id={panelId(idBase, id)} aria-labelledby={tabId(idBase, id)} tabIndex={0} className={`focus-visible:rounded-card ${className}`}>
      {children}
    </div>
  );
}

export default Tabs;
