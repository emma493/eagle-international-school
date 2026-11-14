import React from "react";
import { Icon, type IconName } from "@/components/ui/icons";

export type BadgeVariant = "neutral" | "info" | "good" | "attention" | "problem";

const VARIANT: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-secondary text-text-primary",
  info: "bg-status-info-bg text-status-info-text",
  good: "bg-status-good-bg text-status-good-text",
  attention: "bg-status-attention-bg text-status-attention-text",
  problem: "bg-status-problem-bg text-status-problem-text",
};

export interface BadgeProps {
  variant?: BadgeVariant;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
}

/** Small text chip for labels such as a class name or a department. For status, use StatusPill. */
export function Badge({ variant = "neutral", icon, children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-meta font-semibold ${VARIANT[variant]} ${className}`}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </span>
  );
}

export interface CountBadgeProps {
  count: number;
  /** Counts above this show as "99+". */
  max?: number;
  /** Spoken name, for example "unread notifications". */
  label?: string;
  /** Draw a plain dot (no number) for "something new". */
  dot?: boolean;
  className?: string;
}

/** Red unread badge. Renders nothing at zero. The count is real text, so it is not colour only. */
export function CountBadge({ count, max = 99, label = "unread", dot = false, className = "" }: CountBadgeProps) {
  if (count <= 0) return null;
  const text = count > max ? `${max}+` : String(count);
  if (dot) {
    return (
      <span className={`inline-block h-2.5 w-2.5 rounded-full bg-brand-red ${className}`}>
        <span className="sr-only">{`${count} ${label}`}</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-caption font-bold tabular-nums text-white ${className}`}
      aria-label={`${count} ${label}`}
    >
      {text}
    </span>
  );
}

export default Badge;
