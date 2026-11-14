import React, { forwardRef } from "react";
import { Icon } from "@/components/ui/icons";
import { FieldShell, controlClass, describedBy, useFieldIds, type FieldMessages } from "@/components/ui/Field";

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">, FieldMessages {
  /** ISO date, YYYY-MM-DD. Empty string for no date. */
  value: string;
  onValueChange: (value: string) => void;
  /** ISO bounds, YYYY-MM-DD. */
  min?: string;
  max?: string;
  className?: string;
}

/**
 * Native date input (best picker on phones) in the 52px field look, with a calendar icon.
 * Value is always an ISO string, so it can be stored and compared as text.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, helper, error, success, required, value, onValueChange, min, max, className, id: idProp, ...props },
  ref
) {
  const ids = useFieldIds(idProp);
  return (
    <FieldShell {...ids} label={label} helper={helper} error={error} success={success} required={required} className={className}>
      <div className="relative">
        <input
          ref={ref}
          id={ids.id}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helper, error, success })}
          onChange={(e) => onValueChange(e.target.value)}
          className={controlClass(Boolean(error), "h-input appearance-none pr-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0")}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary">
          <Icon name="calendar" size={20} />
        </span>
      </div>
    </FieldShell>
  );
});

export default DatePicker;
