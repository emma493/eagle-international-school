import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useDismiss } from "@/hooks/useDismiss";

/** Avatar button with a menu: profile and sign out. Arrow keys move between items, Escape returns focus. */
export default function AccountMenu() {
  const { profile, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(wrapRef, open, () => setOpen(false));

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const toggle = () => {
    setOpen((o) => !o);
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); list[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); list[list.length - 1]?.focus(); }
    else if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  };

  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => items()[0]?.focus());
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${profile?.full_name || "you"}`}
        className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-transparent hover:ring-neutral-secondary aria-expanded:ring-brand-blue"
      >
        <Avatar name={profile?.full_name} size={40} tone="brand" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-40 mt-2 w-64 animate-pop-in rounded-card border border-divider bg-card p-2 shadow-login"
        >
          <div className="mb-1 flex items-center gap-3 border-b border-divider px-3 pb-3 pt-2">
            <Avatar name={profile?.full_name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-body font-semibold text-text-primary">{profile?.full_name}</p>
              <p className="text-meta capitalize text-text-secondary">{role}</p>
            </div>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex h-btn items-center gap-3 rounded-card px-3 text-body font-semibold text-text-primary hover:bg-neutral-hover"
          >
            <Icon name="user" size={20} /> Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); signOut(); }}
            className="flex h-btn w-full items-center gap-3 rounded-card px-3 text-left text-body font-semibold text-text-primary hover:bg-neutral-hover"
          >
            <Icon name="logout" size={20} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
