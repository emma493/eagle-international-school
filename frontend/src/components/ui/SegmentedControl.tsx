import React, { useRef } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

export interface SegmentOption<V extends string = string> {
  value: V;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  /** Colour of the selected segment. Defaults to blue. Icon and label always show too. */
  tone?: "brand" | "good" | "attention" | "problem";
}

export interface SegmentedControlProps<V extends string = string> {
  options: SegmentOption<V>[];
  value: V | "";
  onChange: (value: V) => void;
  /** Accessible name for the group, for example "Attendance for Ama Mensah". */
  label: string;
  /** md = 44px (touch), compact = 36px. */
  size?: "md" | "compact";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const TONE = {
  brand: "bg-brand-blue text-white",
  good: "bg-status-good-bg text-status-good-text",
  attention: "bg-status-attention-bg text-status-attention-text",
  problem: "bg-status-problem-bg text-status-problem-text",
} as const;

/**
 * Pick-one control with joined segments (Present / Absent / Late, grading format).
 * A radio group: arrow keys move the choice. Selected state is colour plus a check or the
 * option's own icon, so it is never colour only.
 */
export function SegmentedControl<V extends string = string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  fullWidth = true,
  disabled = false,
  className = "",
}: SegmentedControlProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabledIdx = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!forward && !back) return;
    e.preventDefault();
    const pos = enabledIdx.indexOf(i);
    const next = enabledIdx[(pos + (forward ? 1 : -1) + enabledIdx.length) % enabledIdx.length];
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const h = size === "compact" ? "h-btn-sm text-meta" : "h-touch text-body";
  const tabbable = options.findIndex((o) => o.value === value && !o.disabled);
  const firstEnabled = enabledIdx[0];

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={`${fullWidth ? "flex w-full" : "inline-flex"} gap-0.5 rounded-input bg-neutral-secondary p-0.5 ${className}`}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        const tone = TONE[o.tone ?? "brand"];
        const icon: IconName | undefined = selected ? o.icon ?? "check" : o.icon;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={(tabbable === -1 ? i === firstEnabled : i === tabbable) ? 0 : -1}
            disabled={disabled || o.disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-input px-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${h} ${
              selected ? `${tone} shadow-card` : "text-text-primary enabled:hover:bg-neutral-secondary-hover"
            }`}
          >
            {icon ? <Icon name={icon} size={size === "compact" ? 16 : 20} /> : null}
            <span className="truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
