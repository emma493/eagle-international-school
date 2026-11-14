import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Icon } from "@/components/ui/icons";
import { StatusScreen } from "@/components/shared/StatusScreen";

const RECHECK_MS = 30_000;

/** Shown to every non-admin while maintenance mode is on. The AuthProvider re-checks every 30 seconds. */
export default function MaintenanceScreen() {
  const { refreshClaims, signOut, profile, lastChecked } = useAuth();
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const check = async () => {
    setChecking(true);
    try {
      await refreshClaims();
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const since = lastChecked ? Math.max(0, now - lastChecked) : 0;
  const secondsLeft = Math.max(0, Math.ceil((RECHECK_MS - (since % RECHECK_MS)) / 1000));

  return (
    <StatusScreen
      icon="settings"
      title="We'll be right back"
      description={`${profile?.school_name || "The school system"} is being updated. Your saved work is safe, and this page will reopen on its own when we're done.`}
      actions={
        <>
          <Button fullWidth onClick={check} loading={checking}>
            Check again
          </Button>
          <Button variant="secondary" fullWidth onClick={signOut}>
            Sign out
          </Button>
        </>
      }
    >
      <p role="status" className="inline-flex items-center gap-2 rounded-pill bg-neutral-hover px-3 py-1 text-meta font-semibold text-text-secondary">
        <Icon name="refresh" size={16} className={checking ? "animate-spin" : ""} />
        {checking ? "Checking now" : `Checking again in ${secondsLeft}s`}
      </p>
    </StatusScreen>
  );
}
