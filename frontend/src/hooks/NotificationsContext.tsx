import React, { createContext, useContext } from "react";
import { useNotifications } from "./useNotifications";

type NotificationsValue = ReturnType<typeof useNotifications>;
const Ctx = createContext<NotificationsValue | null>(null);

/**
 * One notifications fetch + 30s poll shared by the bell and the tab/sidebar unread dots.
 * Mounted once inside the app shell.
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const value = useNotifications();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotificationsContext(): NotificationsValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNotificationsContext must be used inside <NotificationsProvider>");
  return v;
}
