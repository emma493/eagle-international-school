import React from "react";
import { useSync } from "@/hooks/useSync";

export function WiFiStatusIndicator() {
  const { isOnline, pendingCount } = useSync();

  if (isOnline) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-success-green font-500">
        🟢 Online • Synced
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-alert-red font-500 animate-pulse">
      🔴 Offline • Saving Locally ({pendingCount} pending)
    </span>
  );
}
