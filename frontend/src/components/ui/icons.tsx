import React from "react";

/**
 * Single SVG icon set for the whole app (FRONTEND.md Phase 2).
 * 24x24 grid, outline style, round caps and joins, stroke = currentColor.
 * Use <Icon name="home" /> everywhere. Sizes: 16 inline, 20 nav and buttons,
 * 24 tab bar and empty states. Decorative by default (aria-hidden); pass
 * `title` for a standalone icon that needs an accessible name.
 */

const P = (d: string, key?: string | number) => <path key={key} d={d} />;
const dot = (cx: number, cy: number, r = 1) => (
  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
);

const AVATAR_BODY = "M4 21c0-4 3.6-7 8-7s8 3 8 7";

export const ICONS = {
  // navigation
  home: <>{P("M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z")}</>,
  "layout-dashboard": (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  palette: (
    <>
      {P("M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.8 1.7-1.7 0-.5-.2-.8-.5-1.2-.3-.4-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.2-9-7.2z")}
      {dot(7.5, 11)}
      {dot(10.5, 7)}
      {dot(15.5, 7.5)}
    </>
  ),
  activity: <>{P("M22 12h-4l-3 9L9 3l-3 9H2")}</>,
  "key-round": (
    <>
      <circle cx="8" cy="15" r="4" />
      {P("M10.8 12.2L20 3M16 7l3 3M14 9l2 2")}
    </>
  ),
  "graduation-cap": (
    <>
      {P("M2 9l10-5 10 5-10 5z")}
      {P("M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5")}
      {P("M22 9v6")}
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      {P("M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6")}
      {P("M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.3c2.2.7 3.5 2.6 3.5 5.7")}
    </>
  ),
  school: (
    <>
      {P("M3 21h18")}
      {P("M5 21V10l7-6 7 6v11")}
      {P("M10 21v-5h4v5")}
      {P("M12 10v.01")}
    </>
  ),
  "book-open": (
    <>
      {P("M2 5.5C4.5 4.3 8.5 4.5 12 6.8c3.5-2.3 7.5-2.5 10-1.3V19c-2.5-1.2-6.5-1-10 1.3C8.5 18 4.5 17.8 2 19z")}
      {P("M12 6.8V20.3")}
    </>
  ),
  "user-check": (
    <>
      <circle cx="9" cy="8" r="3.5" />
      {P("M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6")}
      {P("M16 11l2 2 4-4")}
    </>
  ),
  wallet: (
    <>
      {P("M4 7a2 2 0 0 1 2-2h12v4")}
      {P("M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2z")}
      {dot(16.5, 14.5)}
    </>
  ),
  utensils: (
    <>
      {P("M5 3v7a2 2 0 0 0 2 2v9M9 3v7a2 2 0 0 1-2 2M7 3v7")}
      {P("M17 21V3c-2.5 1.5-3.5 4-3.5 7 0 2 1 3 3.5 3")}
    </>
  ),
  "file-text": (
    <>
      {P("M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z")}
      {P("M14 3v5h5M9 13h6M9 17h6")}
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      {P("M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z")}
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      {P("M3 10h18M8 3v4M16 3v4")}
    </>
  ),
  "chevron-up": <>{P("M6 15l6-6 6 6")}</>,
  "arrow-up-down": <>{P("M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4")}</>,
  inbox: (
    <>
      {P("M3 13l3-8h12l3 8")}
      {P("M3 13v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6h-5l-1.5 2h-5L8 13z")}
    </>
  ),
  "calendar-check": (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      {P("M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4")}
    </>
  ),
  "bar-chart": <>{P("M5 21V11M12 21V4M19 21v-7")}</>,
  "clipboard-list": (
    <>
      <rect x="8" y="2.5" width="8" height="4" rx="1" />
      {P("M8 4.5H6a2 2 0 0 0-2 2V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2")}
      {P("M9 12h6M9 16h6")}
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      {P(AVATAR_BODY)}
    </>
  ),
  // connectivity and system
  wifi: (
    <>
      {P("M2 8.8a15 15 0 0 1 20 0")}
      {P("M5 12.5a10 10 0 0 1 14 0")}
      {P("M8.5 16a5 5 0 0 1 7 0")}
      {dot(12, 19.5)}
    </>
  ),
  "wifi-off": (
    <>
      {P("M5 12.5a10 10 0 0 1 3.2-2.2M12 8.5c2.7 0 5.2 1.1 7 3M8.5 16a5 5 0 0 1 7 0")}
      {P("M2 8.8a15 15 0 0 1 4-2.8M10 5.2a15 15 0 0 1 12 3.6")}
      {dot(12, 19.5)}
      {P("M3 3l18 18")}
    </>
  ),
  bell: (
    <>
      {P("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9")}
      {P("M10.3 21a1.94 1.94 0 0 0 3.4 0")}
    </>
  ),
  refresh: <>{P("M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4")}</>,
  loader: <>{P("M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8")}</>,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      {P("M12 7v5l3 2")}
    </>
  ),
  // actions
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      {P("M21 21l-4.3-4.3")}
    </>
  ),
  menu: <>{P("M3 6h18M3 12h18M3 18h18")}</>,
  close: <>{P("M18 6L6 18M6 6l12 12")}</>,
  plus: <>{P("M12 5v14M5 12h14")}</>,
  check: <>{P("M20 6L9 17l-5-5")}</>,
  "chevron-down": <>{P("M6 9l6 6 6-6")}</>,
  "chevron-right": <>{P("M9 6l6 6-6 6")}</>,
  "chevron-left": <>{P("M15 6l-6 6 6 6")}</>,
  camera: (
    <>
      {P("M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z")}
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  upload: <>{P("M12 16V4M7 9l5-5 5 5M4 20h16")}</>,
  download: <>{P("M12 4v12M7 11l5 5 5-5M4 20h16")}</>,
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      {P("M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8")}
    </>
  ),
  print: (
    <>
      {P("M7 9V3h10v6")}
      <rect x="3" y="9" width="18" height="8" rx="2" />
      {P("M7 14h10v7H7z")}
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      {P("M8 11V7a4 4 0 0 1 8 0v4")}
    </>
  ),
  logout: <>{P("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9")}</>,
  edit: <>{P("M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4")}</>,
  trash: <>{P("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3")}</>,
  filter: <>{P("M3 5h18l-7 8v6l-4 2v-8z")}</>,
  phone: <>{P("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z")}</>,
  "map-pin": (
    <>
      {P("M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z")}
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  "credit-card": (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      {P("M3 10h18M7 15h3")}
    </>
  ),
  eye: (
    <>
      {P("M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z")}
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      {P("M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4M6.3 6.8C3.6 8.6 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1")}
      {P("M9.9 9.9a3 3 0 0 0 4.2 4.2")}
      {P("M3 3l18 18")}
    </>
  ),
  // status
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      {P("M8 12.5l2.7 2.7L16 9.5")}
    </>
  ),
  "alert-triangle": (
    <>
      {P("M12 3.5L2.8 19.5h18.4L12 3.5z")}
      {P("M12 10v4.5M12 17.5v.01")}
    </>
  ),
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      {P("M9 9l6 6M15 9l-6 6")}
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      {P("M12 11v5.5M12 7.5v.01")}
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** 16 inline, 20 nav and buttons, 24 tab bar and empty states */
  size?: 16 | 20 | 24 | number;
  /** Accessible name for a standalone icon. Omit when a text label sits beside it. */
  title?: string;
}

export function Icon({ name, size = 20, title, className = "", ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={size <= 16 ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {ICONS[name]}
    </svg>
  );
}

// ---- Backwards-compatible named exports (existing imports keep working) ----
type LegacyProps = { className?: string };
const make = (name: IconName) => {
  const C = ({ className = "" }: LegacyProps) => <Icon name={name} className={className} />;
  C.displayName = `${name}Icon`;
  return C;
};
export const HomeIcon = make("home");
export const BrandingIcon = make("palette");
export const TelemetryIcon = make("activity");
export const KeyIcon = make("key-round");
export const SchoolIcon = make("school");
export const BookIcon = make("book-open");
export const TeacherIcon = make("user-check");
export const MoneyIcon = make("wallet");
export const CanteenIcon = make("utensils");
export const ReportIcon = make("file-text");
export const SettingsIcon = make("settings");
export const GearIcon = make("settings");
export const CheckIcon = make("check");
export const ChartIcon = make("bar-chart");
export const ClipboardIcon = make("clipboard-list");
export const BellIcon = make("bell");
export const PaymentIcon = make("wallet");
export const FoodIcon = make("utensils");
export const DocumentIcon = make("file-text");
export const MenuIcon = make("menu");
export const AvatarIcon = make("user");
export const ProcessIcon = make("loader");
export const UserIcon = make("user");
export const WifiIcon = make("wifi");
export const WifiOffIcon = make("wifi-off");
export const RefreshIcon = make("refresh");
export const CreditIcon = make("credit-card");
export const AlertIcon = make("alert-triangle");
