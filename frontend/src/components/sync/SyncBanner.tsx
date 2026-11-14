import React, { useState } from "react";
import { WiFiStatusIndicator } from "./WiFiStatusIndicator";
import { ConflictAlert } from "./ConflictAlert";
import { useSync } from "@/hooks/useSync";

export default function SyncBanner() {
  const { pendingCount } = useSync();
  const [showConflict, setShowConflict] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md pointer-events-none">
      <WiFiStatusIndicator />
      {pendingCount > 0 && (
        <ConflictAlert conflictCount={pendingCount} onResolve={() => setShowConflict(false)} />
      )}
    </div>
  );
}
