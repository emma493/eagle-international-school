import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Icon } from "@/components/ui/icons";

/** Shown to every non-admin while maintenance mode is on. Re-checks automatically every 30 seconds. */
export default function MaintenanceScreen() {
  const { refreshClaims, signOut, profile } = useAuth();
  const [checking, setChecking] = useState(false);
  const check = async () => { setChecking(true); try { await refreshClaims(); } finally { setChecking(false); } };

  return (
    <div className="bg-neutral-page min-h-screen flex items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md text-center shadow-login">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-blue-tint text-brand-blue flex items-center justify-center"><Icon name="settings" size={24} /></div>
        <h1 className="text-display font-bold text-text-primary mb-2">We'll be right back</h1>
        <p className="text-text-secondary mb-6">
          {profile?.school_name || "The school system"} is being updated. Your saved work is safe, and this page will
          reopen on its own when we're done.
        </p>
        <div className="space-y-3">
          <Button fullWidth onClick={check} disabled={checking}>{checking ? "Checking…" : "Check again"}</Button>
          <Button variant="secondary" fullWidth onClick={signOut}>Sign out</Button>
        </div>
      </Card>
    </div>
  );
}
