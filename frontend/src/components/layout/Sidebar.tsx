import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const DESKTOP_NAV_ITEMS = [
  { path: "/headmaster", label: "Dashboard", icon: "🏠" },
  { path: "/headmaster/classes", label: "Classes", icon: "🏫" },
  { path: "/headmaster/subjects", label: "Subjects", icon: "📚" },
  { path: "/headmaster/teacher-assignments", label: "Teacher Assignments", icon: "👨‍🏫" },
  { path: "/headmaster/students", label: "Students", icon: "👦" },
  { path: "/headmaster/academic-settings", label: "Academic Settings", icon: "⚙️" },
];

export function Sidebar({ onToggle }: { onToggle: () => void }) {
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-16 h-full w-280 bg-card border-r border-divider shadow-card z-40 transform transition-transform duration-200"
      style={{ transform: "translateX(0)" }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
            FL
          </div>
          <span className="font-bold text-brand-blue text-lg sentence-case">Future Leaders</span>
        </div>

        <nav className="space-y-1">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: active }) =>
                  `sidebar-item ${active ? "active" : ""} flex w-full`
                }
              >
                <div className="icon-circle w-8 h-8 text-xs">
                  {item.icon}
                </div>
                <span className="text-sm font-500 sentence-case">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-divider">
          <button
            onClick={onToggle}
            className="btn-secondary w-full text-xs h-36"
          >
            Collapse sidebar
          </button>
        </div>
      </div>
    </aside>
  );
}
