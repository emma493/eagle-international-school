import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { Icon } from "@/components/ui/icons";
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShown(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShown(false);
      setDeferredPrompt(null);
    }
  };

  if (!shown || !deferredPrompt) return null;

  return (
    <Card className="p-4 shadow-lg border border-brand-blue/20">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white text-sm">
          <Icon name="download" size={16} />
        </div>
        <div className="flex-1">
          <h4 className="text-text-primary font-semibold text-sm">Install Eagle International School</h4>
          <p className="text-text-secondary text-xs">
            Install the app for faster access and offline use.
          </p>
        </div>
        <Button variant="primary" onClick={install}>
          Install
        </Button>
        <button
          onClick={() => setShown(false)}
          aria-label="Dismiss install prompt"
          className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </Card>
  );
}
