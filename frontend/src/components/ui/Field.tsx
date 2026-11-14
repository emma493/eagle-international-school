import React, { useId } from "react";
import { Icon } from "@/components/ui/icons";

/** Ids that tie a control to its label, helper text and error message. */
export function useFieldIds(id?: string) {
  const auto = useId();
  const base = id ?? auto;
  return { id: base, helperId: `${base}-help`, messageId: `${base}-msg` };
}

export interface FieldMessages {
  label?: string;
  /** Always-visible hint under the control. Replaced by `error` or `success` when those are set. */
  helper?: string;
  error?: string;
  success?: string;
  required?: boolean;
}

/** Space-separated ids for aria-describedby, or undefined when there is nothing to describe. */
export function describedBy(ids: { helperId: string; messageId: string }, m: FieldMessages): string | undefined {
  if (m.error || m.success) return ids.messageId;
  return m.helper ? ids.helperId : undefined;
}

/** The look shared by Input, Select and Textarea. */
export function controlClass(invalid: boolean, extra = ""): string {
  return [
    "w-full rounded-input border bg-card px-4 text-body-lg text-text-primary transition-colors duration-100",
    "placeholder:text-text-placeholder hover:border-divider focus:outline-none focus:shadow-focus",
    "disabled:cursor-not-allowed disabled:bg-neutral-hover disabled:text-text-secondary",
    invalid ? "border-alert-red focus:border-alert-red" : "border-border-input focus:border-brand-blue",
    extra,
  ].join(" ");
}

export interface FieldShellProps extends FieldMessages {
  id: string;
  helperId: string;
  messageId: string;
  /** Outer spacing and layout classes. Defaults to a 16px bottom margin. */
  className?: string;
  children: React.ReactNode;
}

/** Stacked label above the control, helper / error / success text below it. */
export function FieldShell({ id, helperId, messageId, label, helper, error, success, required, className = "mb-4", children }: FieldShellProps) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-meta font-semibold text-text-secondary">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-status-problem-text">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      <div aria-live="polite">
        {error ? (
          <p id={messageId} className="mt-1.5 flex items-start gap-1.5 text-meta font-medium text-status-problem-text">
            <Icon name="x-circle" size={16} className="mt-px" />
            <span>{error}</span>
          </p>
        ) : success ? (
          <p id={messageId} className="mt-1.5 flex items-start gap-1.5 text-meta font-medium text-status-good-text">
            <Icon name="check-circle" size={16} className="mt-px" />
            <span>{success}</span>
          </p>
        ) : helper ? (
          <p id={helperId} className="mt-1.5 text-meta text-text-secondary">
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}
