import React from "react";
import { useSync } from "@/hooks/useSync";
import { Icon } from "@/components/ui/icons";

export function WiFiStatusIndicator() {
  const { isOnline, pendingCount } = useSync();

  if (isOnline) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-success-green font-medium">
        <Icon name="wifi" size={16} /> Online, synced
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-alert-red font-medium animate-pulse">
      <Icon name="wifi-off" size={16} /> Offline, saving locally ({pendingCount} pending)
    </span>
  );
}
