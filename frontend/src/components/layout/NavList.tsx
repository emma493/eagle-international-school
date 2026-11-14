import React from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@/components/ui/icons";
import { useNotificationsContext } from "@/hooks/NotificationsContext";
import { NAV, ROLE_HOME } from "./nav";

interface NavListProps {
  role: string;
  /**
   * true: desktop sidebar. Below 1024px it shows icons only (72px rail) and labels become screen-reader text.
   * false: drawer, always icon + label.
   */
  responsive?: boolean;
  /** Called after a link is chosen (the drawer closes itself with this). */
  onNavigate?: () => void;
}

/** Icon + label rows shared by the sidebar, the icon rail and the mobile drawer. */
export function NavList({ role, responsive = false, onNavigate }: NavListProps) {
  const items = NAV[role] || [];
  const { notifications } = useNotificationsContext();
  const home = ROLE_HOME[role];
  let lastGroup: string | undefined;

  return (
    <ul className="space-y-1">
      {items.map((item, index) => {
        const showGroup = !!item.group && item.group !== lastGroup;
        lastGroup = item.group;
        const hasDot = !!item.notifyType && notifications.some((n) => n.type === item.notifyType && n.is_read === 0);
        return (
          <li key={item.path}>
            {showGroup && (
              <>
                {index > 0 && responsive && <div aria-hidden="true" className="my-2 border-t border-divider lg:hidden" />}
                <p className={`px-3 pb-1 pt-4 text-meta font-semibold text-text-secondary ${responsive ? "hidden lg:block" : "block"}`}>
                  {item.group}
                </p>
              </>
            )}
            <NavLink
              to={item.path}
              end={item.path === home}
              title={responsive ? item.label : undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""} ${responsive ? "justify-center px-0 lg:justify-start lg:px-3" : ""}`
              }
            >
              <span className="relative inline-flex">
                <Icon name={item.icon} size={20} />
                {hasDot && <span aria-hidden="true" className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-alert-red" />}
              </span>
              <span className={`text-body ${responsive ? "sr-only lg:not-sr-only" : ""}`}>{item.label}</span>
              {hasDot && <span className="sr-only">, new updates</span>}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

export default NavList;
