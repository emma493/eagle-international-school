import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/icons";

const KEY = "eagle:install-dismissed";
const DISMISS_DAYS = 30;

function wasDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(KEY));
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/** Non-blocking bottom card that offers to install the app. Dismissal is remembered for 30 days. */
export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [dismissed, setDismissed] = useState(wasDismissed);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* storage blocked: dismissal lasts until reload */
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome !== "accepted") dismiss();
  };

  if (!deferred || dismissed) return null;

  return (
    <section aria-label="Install the app" className="card shadow-login relative p-4">
      <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="icon-btn absolute right-1 top-1 h-touch w-touch">
        <Icon name="close" size={20} />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <BrandMark size={40} title="" />
        <div className="min-w-0">
          <h2 className="text-body-lg font-bold text-text-primary">Install Eagle International School</h2>
          <p className="text-meta text-text-secondary">Opens faster and keeps working when you are offline.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="compact" leadingIcon="download" onClick={install}>
          Install
        </Button>
        <Button size="compact" variant="secondary" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </section>
  );
}
