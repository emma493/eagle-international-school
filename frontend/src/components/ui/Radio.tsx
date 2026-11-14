import React, { useId } from "react";
import { Icon } from "@/components/ui/icons";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group heading, also the accessible name. */
  label: string;
  name?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  disabled?: boolean;
  /** Lay options out in a row from 640px up. */
  inline?: boolean;
  className?: string;
}

/** Pick-one list (payment method). Native radio inputs, so arrow keys and forms work as usual. */
export function RadioGroup({ label, name, options, value, onChange, error, helper, disabled, inline = false, className = "mb-4" }: RadioGroupProps) {
  const auto = useId();
  const groupName = name ?? auto;
  const msgId = `${groupName}-msg`;
  return (
    <fieldset className={className} aria-describedby={error || helper ? msgId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 text-meta font-semibold text-text-secondary">{label}</legend>
      <div className={`flex flex-col ${inline ? "sm:flex-row sm:flex-wrap sm:gap-x-6" : ""}`}>
        {options.map((o) => {
          const off = disabled || o.disabled;
          const id = `${groupName}-${o.value}`;
          return (
            <label key={o.value} htmlFor={id} className={`flex min-h-touch items-start gap-3 py-2 ${off ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
              <span className="relative mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center">
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={o.value}
                  checked={value === o.value}
                  disabled={off}
                  onChange={() => onChange(o.value)}
                  className="peer absolute inset-0 h-full w-full cursor-[inherit] appearance-none rounded-full border-2 border-border-input bg-card transition-colors checked:border-brand-blue hover:border-divider focus-visible:shadow-focus"
                />
                <span aria-hidden="true" className="pointer-events-none relative h-3 w-3 rounded-full bg-brand-blue opacity-0 peer-checked:opacity-100" />
              </span>
              <span className="min-w-0">
                <span className="block text-body text-text-primary">{o.label}</span>
                {o.description ? <span className="block text-meta text-text-secondary">{o.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={msgId} className="mt-1 flex items-start gap-1.5 text-meta font-medium text-status-problem-text">
          <Icon name="x-circle" size={16} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p id={msgId} className="mt-1 text-meta text-text-secondary">
          {helper}
        </p>
      ) : null}
    </fieldset>
  );
}

export default RadioGroup;
