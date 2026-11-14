import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useDismiss } from "@/hooks/useDismiss";
import { db } from "@/dexie/db";
import { getStudentsCached } from "@/lib/api";
import { studentProfilePath } from "./nav";

interface RosterStudent {
  id: string;
  full_name: string;
  admission_no: string;
  class_name?: string;
  photo_url?: string;
}

const MAX_RESULTS = 8;

/** Match every typed word against name + student ID. Names that start with the query rank first. */
export function searchRoster(roster: RosterStudent[], query: string): RosterStudent[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { s: RosterStudent; score: number }[] = [];
  for (const s of roster) {
    const name = (s.full_name || "").toLowerCase();
    const id = (s.admission_no || "").toLowerCase();
    const hay = `${name} ${id}`;
    if (!words.every((w) => hay.includes(w))) continue;
    const score = name.startsWith(words[0]) || id.startsWith(words[0]) ? 0 : name.split(/\s+/).some((p) => p.startsWith(words[0])) ? 1 : 2;
    scored.push({ s, score });
  }
  scored.sort((a, b) => a.score - b.score || a.s.full_name.localeCompare(b.s.full_name));
  return scored.slice(0, MAX_RESULTS).map((x) => x.s);
}

interface GlobalSearchProps {
  /** "bar": inline field in the top bar (768px and up). "overlay": full-width field that covers the top bar on phones. */
  variant: "bar" | "overlay";
  onClose?: (reason: "dismiss" | "select") => void;
}

/**
 * Student search for the headmaster and teachers. Reads the Dexie roster first (works offline),
 * then refreshes it from the network when online. Choosing a result opens that student's profile.
 */
export default function GlobalSearch({ variant, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listId = `${uid}-results`;
  const optionId = (i: number) => `${uid}-option-${i}`;

  const loadRoster = useCallback(async () => {
    try {
      setRoster((await db.students.toArray()) as RosterStudent[]);
    } catch { /* cache unavailable */ }
    setLoaded(true);
    if (navigator.onLine) {
      getStudentsCached().then((fresh) => setRoster(fresh as RosterStudent[])).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (variant === "overlay") inputRef.current?.focus();
  }, [variant]);

  const results = useMemo(() => searchRoster(roster, query), [roster, query]);
  const hasQuery = query.trim().length > 0;
  const showPanel = open && hasQuery;

  useEffect(() => setActive(0), [query]);
  useDismiss(wrapRef, open && variant === "bar", () => setOpen(false));

  const choose = (s: RosterStudent) => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    navigate(studentProfilePath(role || "headmaster", s.id));
    onClose?.("select");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      if (results.length) setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (showPanel && results[active]) { e.preventDefault(); choose(results[active]); }
    } else if (e.key === "Escape") {
      if (open && hasQuery && variant === "bar") { setOpen(false); }
      else { setQuery(""); setOpen(false); if (variant === "overlay") onClose?.("dismiss"); else inputRef.current?.blur(); }
    }
  };

  const isOverlay = variant === "overlay";

  return (
    <div
      ref={wrapRef}
      role="search"
      className={isOverlay ? "absolute inset-0 z-10 flex items-center gap-1 bg-card px-2" : "relative w-full"}
    >
      {isOverlay && (
        <button type="button" className="icon-btn" aria-label="Close search" onClick={() => onClose?.("dismiss")}>
          <Icon name="chevron-left" size={20} />
        </button>
      )}
      <div className="relative min-w-0 flex-1">
        <Icon name="search" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search students by name or ID"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? optionId(active) : undefined}
          autoComplete="off"
          placeholder="Search students"
          value={query}
          onFocus={() => { setOpen(true); if (!loaded) loadRoster(); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-full border border-transparent bg-neutral-page pl-10 pr-4 text-body text-text-primary placeholder:text-text-placeholder focus:border-brand-blue focus:bg-card focus:shadow-focus focus:outline-none"
        />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {showPanel ? (results.length === 0 ? "No students found" : `${results.length} student${results.length === 1 ? "" : "s"} found`) : ""}
      </p>

      {showPanel && (
        <div
          className={`absolute z-40 max-h-96 overflow-y-auto rounded-card border border-divider bg-card shadow-login ${
            isOverlay ? "inset-x-2 top-full mt-1" : "left-0 right-0 top-full mt-2"
          }`}
        >
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Matching students" className="p-2">
              {results.map((s, i) => (
                <li
                  key={s.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(s)}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-card px-3 py-2 ${i === active ? "bg-neutral-hover" : ""}`}
                >
                  <Avatar name={s.full_name} src={s.photo_url} size={40} />
                  <span className="min-w-0">
                    <span className="block truncate text-body font-semibold text-text-primary">{s.full_name}</span>
                    <span className="block truncate text-meta text-text-secondary">
                      {s.admission_no}{s.class_name ? ` \u00B7 ${s.class_name}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p id={listId} className="px-4 py-4 text-body text-text-secondary">
              {!loaded
                ? "Loading students"
                : roster.length === 0
                  ? "No students are saved on this device yet. Connect to the internet once to download the list."
                  : `No students match "${query.trim()}".`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
