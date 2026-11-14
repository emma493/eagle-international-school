import React from "react";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * StatusPill: colour + icon + text, so status is never shown by colour alone.
 * Use <StatusPill status="paid" /> for known statuses, or pass variant + label.
 */
export type PillVariant = "good" | "attention" | "problem" | "info";

const VARIANT_CLASS: Record<PillVariant, string> = {
  good: "bg-status-good-bg text-status-good-text",
  attention: "bg-status-attention-bg text-status-attention-text",
  problem: "bg-status-problem-bg text-status-problem-text",
  info: "bg-status-info-bg text-status-info-text",
};

type Spec = { variant: PillVariant; label: string };

// Known statuses used across fees, attendance, reports and canteen.
export const STATUS_MAP: Record<string, Spec> = {
  paid: { variant: "good", label: "Paid" },
  partial: { variant: "attention", label: "Partial" },
  owing: { variant: "problem", label: "Owing" },
  present: { variant: "good", label: "Present" },
  absent: { variant: "problem", label: "Absent" },
  late: { variant: "attention", label: "Late" },
  draft: { variant: "attention", label: "Draft" },
  published: { variant: "good", label: "Published" },
  pending: { variant: "attention", label: "Pending" },
  reconciled: { variant: "good", label: "Reconciled" },
};

const PILL_ICON: Record<PillVariant, IconName> = {
  good: "check-circle",
  attention: "alert-triangle",
  problem: "x-circle",
  info: "info",
};

export interface StatusPillProps {
  status?: string;
  variant?: PillVariant;
  label?: string;
  className?: string;
}

export function StatusPill({ status, variant, label, className = "" }: StatusPillProps) {
  const known = status ? STATUS_MAP[status.toLowerCase()] : undefined;
  const v: PillVariant = variant ?? known?.variant ?? "info";
  const text = label ?? known?.label ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : "");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-meta font-bold ${VARIANT_CLASS[v]} ${className}`}
    >
      <Icon name={PILL_ICON[v]} size={16} />
      {text}
    </span>
  );
}

export default StatusPill;
