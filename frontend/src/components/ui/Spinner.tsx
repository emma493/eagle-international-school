import React from "react";
import { Icon } from "@/components/ui/icons";

export interface SpinnerProps {
  size?: 16 | 20 | 24 | 40;
  /** Announced to screen readers. Omit when the spinner sits inside a control that already says it is busy. */
  label?: string;
  className?: string;
}

export function Spinner({ size = 24, label, className = "" }: SpinnerProps) {
  return (
    <span role={label ? "status" : undefined} className={`inline-flex ${className}`}>
      <Icon name="loader" size={size} className="animate-spin" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export default Spinner;
