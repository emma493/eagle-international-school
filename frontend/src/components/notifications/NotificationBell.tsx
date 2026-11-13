import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const TYPE_ICONS: Record<string, string> = {
  payment: "💰",
  canteen: "🍱",
  credit: "💳",
  report: "📄",
  system: "⚙️",
};

export function NotificationBell() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, refresh } = useNotifications();

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 hover:bg-neutral-hover rounded-input"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-alert-red rounded-full text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-divider shadow-lg rounded-input z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-divider">
            <div className="flex items-center justify-between">
              <h3 className="text-text-primary font-600 text-sm sentence-case">Notifications</h3>
              <button
                onClick={refresh}
                className="text-xs text-brand-blue hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-text-secondary text-sm">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-text-secondary text-sm">
              No new notifications
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    setDropdownOpen(false);
                    if (n.link_path) {
                      window.location.href = n.link_path;
                    }
                  }}
                  className={`p-3 border-b border-divider/50 hover:bg-neutral-hover cursor-pointer transition-colors ${
                    n.is_read === 0 ? "bg-brand-blue/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 text-sm">
                      {TYPE_ICONS[n.type] || "📢"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary font-500 text-sm leading-tight">{n.title}</div>
                      <div className="text-text-secondary text-[11px] leading-snug mt-0.5">{n.body}</div>
                      <div className="text-text-secondary text-[10px] mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-2 border-t border-divider">
            <button
              onClick={() => {
                setDropdownOpen(false);
              }}
              className="w-full py-2 text-xs text-brand-blue font-500 hover:bg-neutral-hover"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
