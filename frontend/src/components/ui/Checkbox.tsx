import React, { forwardRef } from "react";
import { Icon } from "@/components/ui/icons";
import { useFieldIds } from "@/components/ui/Field";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: React.ReactNode;
  description?: string;
  error?: string;
  className?: string;
}

/** Checkbox with a 44px row hit area. The native input stays in the DOM for forms and screen readers. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, className = "", id: idProp, disabled, ...props },
  ref
) {
  const ids = useFieldIds(idProp);
  return (
    <div className={className}>
      <label htmlFor={ids.id} className={`flex min-h-touch items-start gap-3 py-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
        <span className="relative mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={ids.id}
            type="checkbox"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ids.messageId : description ? ids.helperId : undefined}
            className="peer absolute inset-0 h-full w-full cursor-[inherit] appearance-none rounded-input border-2 border-border-input bg-card transition-colors checked:border-brand-blue checked:bg-brand-blue hover:border-divider focus-visible:shadow-focus"
            {...props}
          />
          <Icon name="check" size={16} strokeWidth={3} className="pointer-events-none relative text-white opacity-0 peer-checked:opacity-100" />
        </span>
        <span className="min-w-0">
          <span className="block text-body text-text-primary">{label}</span>
          {description ? (
            <span id={ids.helperId} className="block text-meta text-text-secondary">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p id={ids.messageId} className="flex items-start gap-1.5 pl-9 text-meta font-medium text-status-problem-text">
          <Icon name="x-circle" size={16} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
});

export default Checkbox;
