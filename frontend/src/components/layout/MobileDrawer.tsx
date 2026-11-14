import React, { useRef } from "react";
import { Icon } from "@/components/ui/icons";
import { BrandMark } from "@/components/ui/BrandMark";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { NavList } from "./NavList";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  role: string;
}

/** Slide-in navigation for phones. Traps focus, closes on Escape, the scrim or a link, and locks page scroll. */
export default function MobileDrawer({ open, onClose, role }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { profile, signOut } = useAuth();
  useFocusTrap(panelRef, open, onClose);
  if (!open) return null;

  const schoolName = profile?.school_name || "Eagle International School";

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        tabIndex={-1}
        className="absolute bottom-0 left-0 top-0 flex w-sidebar max-w-full animate-slide-in-left flex-col bg-card shadow-login"
      >
        <div className="flex h-topbar flex-shrink-0 items-center justify-between gap-2 border-b border-divider px-3">
          <div className="flex min-w-0 items-center gap-2">
            <BrandMark size={32} logoUrl={profile?.logo_url} title="" />
            <span className="truncate text-body-lg font-bold text-brand-blue">{schoolName}</span>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close menu">
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav aria-label="Pages" className="flex-1 overflow-y-auto p-3">
          <NavList role={role} onNavigate={onClose} />
        </nav>

        <div className="flex-shrink-0 border-t border-divider p-3 pb-safe">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <Avatar name={profile?.full_name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-body font-semibold text-text-primary">{profile?.full_name}</p>
              <p className="text-meta capitalize text-text-secondary">{role}</p>
            </div>
          </div>
          <button type="button" className="sidebar-item" onClick={() => { onClose(); signOut(); }}>
            <Icon name="logout" size={20} />
            <span className="text-body">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
