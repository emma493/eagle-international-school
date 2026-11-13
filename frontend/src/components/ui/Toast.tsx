import React, { useEffect, useState } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  body?: string;
  duration?: number;
}

const ACCENT_COLORS: Record<Toast["type"], string> = {
  success: "#42B72A",
  error: "#FA383E",
  info: "#1877F2",
  warning: "#F7B928",
};

export function Toast({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(true);
  const accent = ACCENT_COLORS[toast.type];

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
      className="fixed z-50 w-full max-w-md p-4 pointer-events-none"
      style={{ top: "16px", right: "16px" }}
    >
      <div
        className="card p-4 shadow-lg pointer-events-auto flex gap-3 transform transition-all duration-200 border-l-4"
        style={{ borderLeftColor: accent }}
      >
        <div className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: accent }}></div>
        <div className="flex-1 min-w-0">
          <h4 className="text-text-primary font-600 text-sm leading-tight">{toast.title}</h4>
          {toast.body && (
            <p className="text-text-secondary text-xs mt-0.5 leading-snug">{toast.body}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 hover:bg-neutral-hover rounded hover:text-text-secondary"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
