import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  body?: string;
  /** Milliseconds before it closes. Default 4000. */
  duration?: number;
}

const DEFAULT_MS = 4000;

// 4px coloured left border + SVG icon + text title: never colour only.
const ACCENT: Record<Toast["type"], { border: string; icon: string; name: IconName }> = {
  success: { border: "border-l-success-green", icon: "text-status-good-text", name: "check-circle" },
  error: { border: "border-l-alert-red", icon: "text-status-problem-text", name: "x-circle" },
  info: { border: "border-l-brand-blue", icon: "text-brand-blue", name: "info" },
  warning: { border: "border-l-warning-amber", icon: "text-status-attention-text", name: "alert-triangle" },
};

/**
 * One toast card: white, 8px radius, 4px coloured left border. Closes after 4s; the timer pauses
 * while the pointer or keyboard focus is on it. Errors use role="alert", the rest role="status".
 * Position and stacking come from <ToastContainer>.
 */
export function Toast({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const accent = ACCENT[toast.type];
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(toast.duration ?? DEFAULT_MS);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const removeRef = useRef(onRemove);
  removeRef.current = onRemove;

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => removeRef.current(), 150);
  }, []);

  const start = useCallback(() => {
    clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = setTimeout(close, remaining.current);
  }, [close]);

  const pause = useCallback(() => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = undefined;
    remaining.current = Math.max(1000, remaining.current - (Date.now() - startedAt.current));
  }, []);

  useEffect(() => {
    start();
    return () => clearTimeout(timer.current);
  }, [start]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
      className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card border-l-4 bg-card p-4 shadow-login transition-opacity duration-150 ${accent.border} ${
        leaving ? "opacity-0" : "animate-pop-in"
      }`}
    >
      <Icon name={accent.name} size={20} className={`mt-px ${accent.icon}`} />
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-text-primary">{toast.title}</p>
        {toast.body ? <p className="mt-0.5 text-meta text-text-secondary">{toast.body}</p> : null}
      </div>
      <button type="button" onClick={close} className="icon-btn -m-2 h-touch w-touch" aria-label="Dismiss notification">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export default Toast;
