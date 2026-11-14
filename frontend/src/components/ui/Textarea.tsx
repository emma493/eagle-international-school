import React, { forwardRef } from "react";
import { FieldShell, controlClass, describedBy, useFieldIds, type FieldMessages } from "@/components/ui/Field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldMessages {
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helper, error, success, required, className, id: idProp, rows = 4, ...props },
  ref
) {
  const ids = useFieldIds(idProp);
  return (
    <FieldShell {...ids} label={label} helper={helper} error={error} success={success} required={required} className={className}>
      <textarea
        ref={ref}
        id={ids.id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, { helper, error, success })}
        className={controlClass(Boolean(error), "min-h-input resize-y py-3")}
        {...props}
      />
    </FieldShell>
  );
});

export default Textarea;
