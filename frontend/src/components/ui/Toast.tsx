import React, { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icons";
export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  body?: string;
  duration?: number;
}

// Accent classes (border-l = 4px left accent, dot = small marker).
const ACCENT: Record<Toast["type"], { border: string; dot: string }> = {
  success: { border: "border-l-success-green", dot: "bg-success-green" },
  error: { border: "border-l-alert-red", dot: "bg-alert-red" },
  info: { border: "border-l-brand-blue", dot: "bg-brand-blue" },
  warning: { border: "border-l-warning-amber", dot: "bg-warning-amber" },
};

export function Toast({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(true);
  const accent = ACCENT[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 300);
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 top-4 right-4 w-full max-w-md p-4 pointer-events-none"
    >
      <div
        className={`card p-4 shadow-lg pointer-events-auto flex gap-3 transform transition-all duration-200 border-l-4 ${accent.border}`}
      >
        <div className={`flex-shrink-0 w-2 h-2 rounded-full ${accent.dot}`}></div>
        <div className="flex-1 min-w-0">
          <h4 className="text-text-primary font-semibold text-sm leading-tight">{toast.title}</h4>
          {toast.body && (
            <p className="text-text-secondary text-xs mt-0.5 leading-snug">{toast.body}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 hover:bg-neutral-hover rounded hover:text-text-secondary"
          aria-label="Dismiss"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
