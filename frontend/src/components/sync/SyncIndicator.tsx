import React, { useId } from "react";
import { useSync } from "@/hooks/useSync";
import { useLastSyncAt } from "@/lib/syncStatus";
import { Icon, type IconName } from "@/components/ui/icons";

type Tone = "good" | "attention" | "info";
const TONE: Record<Tone, string> = {
  good: "bg-status-good-bg text-status-good-text",
  attention: "bg-status-attention-bg text-status-attention-text",
  info: "bg-status-info-bg text-status-info-text",
};

const formatTime = (t: number) => {
  const d = new Date(t);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString() ? time : `${d.toLocaleDateString([], { day: "numeric", month: "short" })}, ${time}`;
};

/**
 * Top bar sync status: Wi-Fi icon + text + colour, never colour alone.
 *  Online, synced (green) | Syncing (blue) | Online with queued saves (amber) | Offline, saving locally (amber).
 * Below 1024px only the icon (and a pending count) shows; the full text is announced to screen readers
 * and appears in the tooltip with the last sync time. Pressing it while online and waiting retries the queue.
 */
export function SyncIndicator() {
  const { isOnline, pendingCount, syncing, flushSyncQueue } = useSync();
  const lastSyncAt = useLastSyncAt();
  const tipId = useId();

  let tone: Tone = "good";
  let icon: IconName = "wifi";
  let label = "Online, synced";
  let hint = "Everything you entered is saved on the server.";
  if (syncing) {
    tone = "info"; icon = "refresh"; label = "Syncing"; hint = "Sending your saved changes to the server.";
  } else if (!isOnline) {
    tone = "attention"; icon = "wifi-off"; label = `Offline, saving locally (${pendingCount} pending)`;
    hint = "Your work is saved on this device and will sync when the connection returns.";
  } else if (pendingCount > 0) {
    tone = "attention"; icon = "clock"; label = `Online, ${pendingCount} waiting to sync`;
    hint = "Press to try syncing now.";
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={label}
        aria-describedby={tipId}
        onClick={() => { if (isOnline && pendingCount > 0) flushSyncQueue(); }}
        className={`inline-flex h-8 items-center gap-1.5 rounded-pill px-2 text-meta font-semibold lg:px-3 ${TONE[tone]}`}
      >
        <Icon name={icon} size={16} className={syncing ? "motion-safe:animate-spin" : ""} />
        <span className="hidden lg:inline">{label}</span>
        {pendingCount > 0 && <span aria-hidden="true" className="lg:hidden">{pendingCount}</span>}
      </button>
      <span role="status" aria-live="polite" className="sr-only">{label}</span>
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-56 rounded-card bg-text-primary px-3 py-2 text-caption text-white shadow-login group-focus-within:block group-hover:block"
      >
        <span className="block font-semibold">{label}</span>
        <span className="block">{hint}</span>
        <span className="mt-1 block">{lastSyncAt ? `Last synced ${formatTime(lastSyncAt)}` : "Not synced yet in this session"}</span>
      </span>
    </div>
  );
}

export default SyncIndicator;
