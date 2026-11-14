import React from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@/components/ui/icons";
import { useNotificationsContext } from "@/hooks/NotificationsContext";
import { NAV, ROLE_HOME } from "./nav";

/**
 * Phone tab bar for teacher and parent: up to five tabs, 24px icons, 12px labels,
 * blue active tab with a top indicator, device safe-area padding, unread dot where relevant.
 */
export function BottomTabBar({ role }: { role: string }) {
  const items = (NAV[role] || []).filter((i) => i.tab).slice(0, 5);
  const { notifications } = useNotificationsContext();
  const home = ROLE_HOME[role];
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 h-tabbar-safe border-t border-divider bg-card pb-safe shadow-card md:hidden"
    >
      <ul className="flex h-tabbar">
        {items.map((item) => {
          const hasDot = !!item.notifyType && notifications.some((n) => n.type === item.notifyType && n.is_read === 0);
          return (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                end={item.path === home}
                className={({ isActive }) =>
                  `relative flex h-full min-h-11 flex-col items-center justify-center gap-0.5 text-caption font-semibold ${
                    isActive ? "text-brand-blue" : "text-text-secondary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span aria-hidden="true" className="absolute left-1/2 top-0 h-0.5 w-10 -translate-x-1/2 rounded-b-input bg-brand-blue" />}
                    <span className="relative inline-flex">
                      <Icon name={item.icon} size={24} />
                      {hasDot && <span aria-hidden="true" className="absolute -right-0.5 top-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-alert-red" />}
                    </span>
                    <span>{item.label}</span>
                    {hasDot && <span className="sr-only">, new updates</span>}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomTabBar;
