import React, { forwardRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Input, type InputProps } from "@/components/ui/Input";
import { checkGhanaPhone } from "@/lib/phone";

export interface PhoneInputProps extends Omit<InputProps, "value" | "onChange" | "type" | "leading" | "leadingText" | "trailing" | "rows" | "error" | "success"> {
  value: string;
  /** `valid` is true only for a complete Ghana mobile number. `local` is the 0XXXXXXXXX form (also for +233 input). */
  onValueChange: (value: string, info: { valid: boolean; local: string }) => void;
  /** Extra error from the caller (for example "already registered"). Shown instead of the format checks. */
  error?: string;
}

/**
 * Ghana mobile number field. Typing 024XXXXXXX (or +233...) is checked live:
 * clear mistakes show at once, "x more digits" shows after the person leaves the field.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onValueChange, label = "Phone number", helper = "Format: 024XXXXXXX", error, onBlur, ...props },
  ref
) {
  const [touched, setTouched] = useState(false);
  const check = checkGhanaPhone(value);
  const formatError = check.status === "invalid" || (check.status === "partial" && touched) ? check.message : undefined;
  const success = check.status === "valid" && !error ? "Valid number" : undefined;
  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      maxLength={16}
      placeholder="0241234567"
      value={value}
      label={label}
      helper={helper}
      error={error ?? formatError}
      success={success}
      leading={<Icon name="phone" size={20} />}
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d+\s]/g, "");
        const c = checkGhanaPhone(next);
        onValueChange(next, { valid: c.status === "valid", local: c.local });
      }}
      onBlur={(e) => {
        setTouched(true);
        onBlur?.(e);
      }}
      {...props}
    />
  );
});

export default PhoneInput;
