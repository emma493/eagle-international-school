import React from "react";
import { Icon, type IconName } from "@/components/ui/icons";

export type AlertTone = "error" | "warning" | "info" | "success";

const TONE: Record<AlertTone, { box: string; icon: IconName }> = {
  error: { box: "bg-status-problem-bg text-status-problem-text", icon: "x-circle" },
  warning: { box: "bg-status-attention-bg text-status-attention-text", icon: "alert-triangle" },
  info: { box: "bg-status-info-bg text-status-info-text", icon: "info" },
  success: { box: "bg-status-good-bg text-status-good-text", icon: "check-circle" },
};

export interface AlertProps {
  tone?: AlertTone;
  /** Short bold line. */
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

/** Inline message with icon and text (never colour only). Errors use role="alert", the rest role="status". */
export function Alert({ tone = "info", title, children, className = "" }: AlertProps) {
  const t = TONE[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-card p-3 ${t.box} ${className}`}>
      <Icon name={t.icon} size={20} className="mt-px" />
      <div className="min-w-0 text-body">
        {title ? <p className="font-bold">{title}</p> : null}
        {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
      </div>
    </div>
  );
}

export default Alert;
