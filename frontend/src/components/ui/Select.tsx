import React, { forwardRef } from "react";
import { Icon } from "@/components/ui/icons";
import { FieldShell, controlClass, describedBy, useFieldIds, type FieldMessages } from "@/components/ui/Field";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, FieldMessages {
  /** Greyed first option with an empty value, shown until something is chosen. */
  placeholder?: string;
  className?: string;
}

/** Native select (best on phones) with the same 52px look as Input. Pass <option> children. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helper, error, success, required, placeholder, className, id: idProp, children, value, defaultValue, ...props },
  ref
) {
  const ids = useFieldIds(idProp);
  const empty = placeholder !== undefined && (value === "" || (value === undefined && (defaultValue === undefined || defaultValue === "")));
  return (
    <FieldShell {...ids} label={label} helper={helper} error={error} success={success} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={ids.id}
          required={required}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helper, error, success })}
          className={controlClass(Boolean(error), `h-input appearance-none pr-12 ${empty ? "text-text-placeholder" : ""}`)}
          {...props}
        >
          {placeholder !== undefined ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary">
          <Icon name="chevron-down" size={20} />
        </span>
      </div>
    </FieldShell>
  );
});

export default Select;
