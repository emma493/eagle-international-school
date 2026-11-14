import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFCM } from "@/hooks/useFCM";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/icons";

const BENEFITS: Record<string, { icon: IconName; text: string }[]> = {
  parent: [
    { icon: "wallet", text: "Fee payments and balance changes" },
    { icon: "file-text", text: "New terminal reports" },
    { icon: "bell", text: "Notices from the school" },
  ],
  teacher: [
    { icon: "calendar-check", text: "Attendance and canteen reminders" },
    { icon: "file-text", text: "Report review requests" },
    { icon: "bell", text: "Notices from the school" },
  ],
  headmaster: [
    { icon: "utensils", text: "Canteen cash waiting to be reconciled" },
    { icon: "file-text", text: "Reports waiting for review" },
    { icon: "bell", text: "Important school alerts" },
  ],
  admin: [{ icon: "bell", text: "System alerts" }],
};

const key = (uid: string) => `eagle:notif-prompt:${uid}`;

/**
 * Asks, in our own words, before the browser's permission prompt appears. Shown once per person on
 * first login ("Not now" is remembered). Mounted once for signed-in users; this is the only place
 * that starts push notifications (useFCM no longer asks on its own).
 */
export function NotificationPrompt() {
  const { user, role } = useAuth();
  const { isSupported, requestPermission, isLoading } = useFCM();
  const [open, setOpen] = useState(false);
  const uid = user?.uid ?? "";

  useEffect(() => {
    if (!uid || !isSupported || typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    let seen = false;
    try {
      seen = localStorage.getItem(key(uid)) === "1";
    } catch {
      /* storage blocked: show once per load */
    }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, [uid, isSupported]);

  const finish = () => {
    try {
      localStorage.setItem(key(uid), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const turnOn = async () => {
    await requestPermission();
    finish();
  };

  const items = BENEFITS[role || ""] ?? BENEFITS.admin;
  return (
    <BottomSheet
      open={open}
      onClose={finish}
      title="Turn on notifications?"
      description="Get a message on this device when something important happens, even when the app is closed."
      footer={
        <>
          <Button variant="secondary" onClick={finish} disabled={isLoading}>
            Not now
          </Button>
          <Button leadingIcon="bell" onClick={turnOn} loading={isLoading}>
            Turn on
          </Button>
        </>
      }
    >
      <ul className="space-y-2">
        {items.map((b) => (
          <li key={b.text} className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-tint text-brand-blue">
              <Icon name={b.icon} size={20} />
            </span>
            <span className="text-body text-text-primary">{b.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-meta text-text-secondary">You can change this later in your browser settings.</p>
    </BottomSheet>
  );
}

export default NotificationPrompt;
