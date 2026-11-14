import React, { forwardRef } from "react";
import { FieldShell, controlClass, describedBy, useFieldIds, type FieldMessages } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix">, FieldMessages {
  /** Icon node shown inside the left edge, for example <Icon name="search" />. */
  leading?: React.ReactNode;
  /** Short text shown inside the left edge, for example "GHS". */
  leadingText?: string;
  /** Node inside the right edge. May be interactive (a clear or show-password button). */
  trailing?: React.ReactNode;
  /** Legacy: when set, renders a Textarea with this many rows. */
  rows?: number;
  /** Margin and layout classes for the whole field (label + control + message). */
  className?: string;
  /** Extra classes for the <input> itself, for example "tabular-nums". */
  inputClassName?: string;
}

/** 52px text input with stacked label, helper / error text and optional inside icons. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, success, required, leading, leadingText, trailing, rows, className, inputClassName = "", id: idProp, ...props },
  ref
) {
  const ids = useFieldIds(idProp);
  if (rows) {
    return <Textarea label={label} helper={helper} error={error} success={success} required={required} rows={rows} className={className} id={idProp} {...(props as any)} />;
  }
  const hasLeading = Boolean(leading || leadingText);
  const pad = [leadingText ? "pl-16" : hasLeading ? "pl-12" : "", trailing ? "pr-12" : ""].join(" ");
  return (
    <FieldShell {...ids} label={label} helper={helper} error={error} success={success} required={required} className={className}>
      <div className="relative">
        {hasLeading ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-secondary">
            {leadingText ? <span className="text-body font-bold tabular-nums">{leadingText}</span> : leading}
          </span>
        ) : null}
        <input
          ref={ref}
          id={ids.id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helper, error, success })}
          className={controlClass(Boolean(error), `h-input ${pad} ${inputClassName}`)}
          {...props}
        />
        {trailing ? <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-text-secondary">{trailing}</span> : null}
      </div>
    </FieldShell>
  );
});

export default Input;
