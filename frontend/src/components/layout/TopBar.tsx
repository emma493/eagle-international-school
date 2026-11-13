import React from "react";
import { Link, useLocation } from "react-router-dom";
import { WiFiStatusIndicator } from "@/components/sync/WiFiStatusIndicator";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();

  const isLogin = location.pathname === "/login";

  if (isLogin) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 h-56 bg-card border-b border-divider shadow-card z-30 flex items-center justify-between px-6 lg:px-12"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-neutral-hover rounded-input"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
            FL
          </div>
          <span className="font-bold text-brand-blue text-sm hidden lg:block sentence-case">
            Eagle International School
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <WiFiStatusIndicator />
        <NotificationBell />
        <div className="w-10 h-10 rounded-full bg-brand-blue-tint flex items-center justify-center text-brand-blue font-bold text-xs overflow-hidden">
          A
        </div>
      </div>
    </header>
  );
}
