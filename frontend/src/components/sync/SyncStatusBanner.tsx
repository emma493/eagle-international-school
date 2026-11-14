import React from "react";
import { WiFiStatusIndicator } from "./WiFiStatusIndicator";

export function SyncStatusBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2 text-xs font-medium text-center bg-neutral-page border-b border-divider">
      <WiFiStatusIndicator />
    </div>
  );
}
