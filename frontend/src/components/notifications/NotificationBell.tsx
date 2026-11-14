import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, type IconName } from "@/components/ui/icons";
import { useNotificationsContext } from "@/hooks/NotificationsContext";
import { useDismiss } from "@/hooks/useDismiss";

const TYPE_ICONS: Record<string, IconName> = {
  payment: "wallet",
  canteen: "utensils",
  credit: "credit-card",
  report: "file-text",
  system: "alert-triangle",
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Bell with a red unread badge and a dropdown (full-width sheet under the top bar on phones). */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh } = useNotificationsContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useDismiss(wrapRef, open, () => setOpen(false));

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  const openItem = (id: string, isRead: number, link?: string) => {
    if (isRead === 0) markAsRead(id);
    setOpen(false);
    if (!link) return;
    if (link.startsWith("/")) navigate(link);
    else window.location.href = link;
  };

  return (
    <div className="relative" ref={wrapRef} onKeyDown={(e) => { if (e.key === "Escape" && open) { setOpen(false); buttonRef.current?.focus(); } }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="icon-btn"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && (
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-alert-red px-1 text-caption font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-2 top-topbar z-50 mt-2 animate-pop-in rounded-card border border-divider bg-card shadow-login sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-divider px-4 py-3">
            <h2 className="text-body-lg font-bold text-text-primary">Notifications</h2>
            <div className="flex items-center gap-3 text-meta font-semibold">
              <button type="button" onClick={refresh} className="rounded text-brand-blue hover:underline">Refresh</button>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllAsRead} className="rounded text-brand-blue hover:underline">Mark all as read</button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-center text-body text-text-secondary">Loading notifications</p>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-text-secondary">
              <Icon name="bell" size={24} />
              <p className="text-body">You are all caught up.</p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-divider last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openItem(n.id, n.is_read, n.link_path)}
                    className={`flex min-h-11 w-full items-start gap-3 px-4 py-3 text-left hover:bg-neutral-hover ${n.is_read === 0 ? "bg-brand-blue-tint" : ""}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-secondary text-text-primary">
                      <Icon name={TYPE_ICONS[n.type] || "file-text"} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-text-primary">{n.title}</span>
                      <span className="block text-meta text-text-secondary">{n.body}</span>
                      <span className="mt-1 block text-caption text-text-secondary">{formatWhen(n.created_at)}</span>
                    </span>
                    {n.is_read === 0 && (
                      <>
                        <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-blue" />
                        <span className="sr-only">Unread</span>
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
