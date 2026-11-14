import React, { useEffect, useState } from "react";
import { applyUpdate, hasWaitingUpdate, UPDATE_READY_EVENT } from "@/lib/swUpdate";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";

/** "New version ready" with a Refresh button. Appears when a new service worker is waiting. */
export default function UpdateSnackbar() {
  const [ready, setReady] = useState(hasWaitingUpdate);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const on = () => {
      setReady(true);
      setDismissed(false);
    };
    window.addEventListener(UPDATE_READY_EVENT, on);
    return () => window.removeEventListener(UPDATE_READY_EVENT, on);
  }, []);

  if (!ready || dismissed) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-tabbar-safe z-[70] flex justify-center p-4 md:bottom-0">
      <div role="status" className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-card border-l-4 border-l-brand-blue bg-card p-3 shadow-login animate-slide-up">
        <Icon name="refresh" size={20} className="text-brand-blue" />
        <p className="min-w-0 flex-1 text-body font-semibold text-text-primary">New version ready</p>
        <Button size="compact" onClick={applyUpdate}>
          Refresh
        </Button>
        <button type="button" className="icon-btn" aria-label="Dismiss update message" onClick={() => setDismissed(true)}>
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
