import React, { useId } from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Extra line under the label, for example what turning it on does. */
  description?: string;
  disabled?: boolean;
  /** Label left, switch right (settings rows). Default true. */
  spread?: boolean;
  className?: string;
}

/** On/off switch (maintenance mode, notifications). 44px tall hit area; state is also spoken as On or Off. */
export function Toggle({ checked, onChange, label, description, disabled = false, spread = true, className = "" }: ToggleProps) {
  const labelId = useId();
  const descId = useId();
  return (
    <div className={`flex min-h-touch items-center gap-3 ${spread ? "justify-between" : ""} ${className}`}>
      <div className="min-w-0">
        <span id={labelId} className="block text-body font-semibold text-text-primary">
          {label}
        </span>
        {description ? (
          <span id={descId} className="block text-meta text-text-secondary">
            {description}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="group inline-flex h-touch w-14 flex-shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`relative h-7 w-12 rounded-full transition-colors duration-150 ${checked ? "bg-brand-blue" : "bg-divider"}`}>
          <span
            className={`absolute left-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-card transition-transform duration-150 ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          >
            <span aria-hidden="true" className={`block rounded-full ${checked ? "h-2 w-2 bg-brand-blue" : "h-2 w-2 border-2 border-text-secondary bg-transparent"}`} />
          </span>
          <span className="sr-only">{checked ? "On" : "Off"}</span>
        </span>
      </button>
    </div>
  );
}

export default Toggle;
