import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const MOBILE_TAB_ITEMS = [
  { path: "/headmaster", label: "Dashboard", icon: "🏠" },
  { path: "/headmaster/classes", label: "Classes", icon: "🏫" },
  { path: "/headmaster/students", label: "Students", icon: "👦" },
  { path: "/headmaster/academic-settings", label: "Settings", icon: "⚙️" },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-divider flex justify-around items-center px-4 z-50 shadow-card"
    >
      {MOBILE_TAB_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive: active }) =>
              `flex flex-col items-center justify-center gap-1 p-2 text-xs transition-colors duration-100 ${
                active ? "text-brand-blue" : "text-text-secondary"
              } hover:text-brand-blue`
            }
          >
            <span>{item.icon}</span>
            <span className={active ? "font-600 sentence-case" : "font-500 sentence-case"}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
