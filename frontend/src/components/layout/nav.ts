import type { IconName } from "@/components/ui/icons";
import type { Notification } from "@/hooks/useNotifications";

export type NavItem = {
  path: string;
  label: string;
  icon: IconName;
  /** Sidebar section label. Items with the same group must be next to each other. */
  group?: string;
  /** Shown in the mobile bottom tab bar (teacher and parent). Everything is in the drawer. */
  tab?: boolean;
  /** Show an unread dot when an unread notification of this type exists. */
  notifyType?: Notification["type"];
};

export const NAV: Record<string, NavItem[]> = {
  admin: [
    { path: "/admin", label: "Overview", icon: "layout-dashboard" },
    { path: "/admin/branding", label: "Branding", icon: "palette" },
    { path: "/admin/telemetry", label: "Telemetry", icon: "activity" },
    { path: "/admin/accounts", label: "Accounts", icon: "key-round" },
  ],
  headmaster: [
    { path: "/headmaster", label: "Dashboard", icon: "layout-dashboard" },
    { path: "/headmaster/students", label: "Students", icon: "graduation-cap", group: "People" },
    { path: "/headmaster/accounts", label: "Teachers & parents", icon: "users", group: "People" },
    { path: "/headmaster/classes", label: "Classes", icon: "school", group: "School" },
    { path: "/headmaster/subjects", label: "Subjects", icon: "book-open", group: "School" },
    { path: "/headmaster/teacher-assignments", label: "Assignments", icon: "user-check", group: "School" },
    { path: "/headmaster/fee-management", label: "Fees", icon: "wallet", group: "Money" },
    { path: "/headmaster/canteen-reconciliation", label: "Canteen cash", icon: "utensils", group: "Money" },
    { path: "/headmaster/terminal-reports", label: "Reports", icon: "file-text", group: "Academics" },
    { path: "/headmaster/academic-settings", label: "Settings", icon: "settings", group: "Academics" },
  ],
  teacher: [
    { path: "/teacher", label: "Home", icon: "home", tab: true },
    { path: "/teacher/attendance", label: "Attendance", icon: "calendar-check", group: "Daily", tab: true },
    { path: "/teacher/canteen-collection", label: "Canteen", icon: "utensils", group: "Daily", tab: true },
    { path: "/teacher/terminal-reports", label: "Reports", icon: "file-text", group: "Academics", tab: true },
    { path: "/teacher/assessments", label: "Scores", icon: "bar-chart", group: "Academics", tab: true },
    { path: "/teacher/rubric-entry", label: "Rubrics", icon: "clipboard-list", group: "Academics" },
  ],
  parent: [
    { path: "/parent", label: "My child", icon: "user", tab: true },
    { path: "/parent/terminal-reports", label: "Reports", icon: "file-text", tab: true, notifyType: "report" },
  ],
};

/** Roles that get the bottom tab bar on phones (the others use the drawer only). */
export const TAB_BAR_ROLES = ["teacher", "parent"];

/** Roles that get the global student search. */
export const SEARCH_ROLES = ["headmaster", "teacher"];

export const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  headmaster: "/headmaster",
  teacher: "/teacher",
  parent: "/parent",
};

/** Where a student profile lives for each role. */
export function studentProfilePath(role: string, studentId: string): string {
  return `/${role}/students/${encodeURIComponent(studentId)}`;
}
