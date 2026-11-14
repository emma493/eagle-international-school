import React, { useEffect, useState } from "react";
import { useSync } from "@/hooks/useSync";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";

import { Icon } from "@/components/ui/icons";
export default function OfflineCatchUpToast() {
  const { isOnline, pendingCount } = useSync();
  const { unreadCount, refresh } = useNotifications();
  const { showToast } = useToast();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!isOnline && !shown && pendingCount > 0) {
      setShown(true);
    }
  }, [isOnline, pendingCount, shown]);

  useEffect(() => {
    if (shown && isOnline) {
      const message = `You have ${unreadCount} new update${
        unreadCount !== 1 ? "s" : ""
      } while you were away.`;
      showToast("info", "Catch-up updates", message, 6000);
      refresh();
    }
  }, [isOnline, shown, unreadCount, showToast, refresh]);

  if (!shown || !isOnline) return null;

  return (
    <Card className="p-4 shadow-lg border border-brand-blue/20">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-sm">
          <Icon name="bell" size={16} />
        </div>
        <div className="flex-1">
          <h4 className="text-text-primary font-semibold text-sm">Catch-up updates</h4>
          <p className="text-text-secondary text-xs">
            You have {unreadCount} new update{unreadCount !== 1 ? "s" : ""} while you were away.
            Tap below to refresh.
          </p>
        </div>
        <Button variant="primary" onClick={() => { setShown(false); refresh(); }}>
          Refresh
        </Button>
        <button
          onClick={() => setShown(false)}
          aria-label="Dismiss"
          className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </Card>
  );
}
