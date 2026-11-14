import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MQ_MD, useMediaQuery } from "@/hooks/useMediaQuery";
import { Icon } from "@/components/ui/icons";
import { BrandMark } from "@/components/ui/BrandMark";
import { SyncIndicator } from "@/components/sync/SyncIndicator";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import AccountMenu from "./AccountMenu";
import GlobalSearch from "./GlobalSearch";
import { ROLE_HOME, SEARCH_ROLES } from "./nav";

interface TopBarProps {
  onMenuClick: () => void;
}

/**
 * 56px top bar. Left: menu (phones), logo and school name. Centre: rounded student search
 * (768px and up; an icon that opens a full-width field on phones). Right: sync status, bell, avatar menu.
 */
export default function TopBar({ onMenuClick }: TopBarProps) {
  const { profile, role } = useAuth();
  const isMd = useMediaQuery(MQ_MD);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const canSearch = !!role && SEARCH_ROLES.includes(role);
  const schoolName = profile?.school_name || "Eagle International School";

  useEffect(() => {
    if (isMd) setSearchOpen(false);
  }, [isMd]);

  const closeSearch = (reason: "dismiss" | "select") => {
    setSearchOpen(false);
    if (reason === "dismiss") requestAnimationFrame(() => searchButtonRef.current?.focus());
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-topbar border-b border-divider bg-card shadow-card">
      <div className="relative flex h-full items-center gap-2 px-2 md:px-4">
        <div className="flex flex-none items-center gap-1">
          <button
            type="button"
            onClick={onMenuClick}
            className="icon-btn md:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <Icon name="menu" size={20} />
          </button>
          <Link
            to={ROLE_HOME[role || ""] || "/"}
            aria-label={`${schoolName}, home`}
            className="flex min-w-0 items-center gap-2 rounded-card py-1 pr-2"
          >
            <BrandMark size={32} logoUrl={profile?.logo_url} title="" />
            <span className="hidden truncate text-body-lg font-bold text-brand-blue lg:block">{schoolName}</span>
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          {canSearch && isMd && (
            <div className="mx-auto w-full max-w-md">
              <GlobalSearch variant="bar" />
            </div>
          )}
        </div>

        <div className="flex flex-none items-center gap-1 md:gap-2">
          {canSearch && !isMd && (
            <button
              ref={searchButtonRef}
              type="button"
              className="icon-btn"
              aria-label="Search students"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={20} />
            </button>
          )}
          <SyncIndicator />
          <NotificationBell />
          <AccountMenu />
        </div>

        {canSearch && !isMd && searchOpen && <GlobalSearch variant="overlay" onClose={closeSearch} />}
      </div>
    </header>
  );
}
