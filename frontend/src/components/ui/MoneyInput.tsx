import React, { forwardRef } from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { formatGHS, parseMoney, sanitizeMoneyInput } from "@/lib/money";

export interface MoneyInputProps extends Omit<InputProps, "value" | "onChange" | "type" | "leading" | "leadingText" | "trailing" | "rows" | "max" | "min"> {
  /** The text in the box, for example "125.50". Keep it as a string while typing. */
  value: string;
  /** `amount` is the parsed number, or null while the box is empty. */
  onValueChange: (value: string, amount: number | null) => void;
  /** Upper limit, for example the amount still owing. Going over shows an error. */
  max?: number;
}

/** GHS amount field: "GHS" prefix, numeric keypad, two decimals, tabular numerals. */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onValueChange, max, label = "Amount", error, ...props },
  ref
) {
  const amount = parseMoney(value);
  const overMax = max !== undefined && amount !== null && amount > max;
  return (
    <Input
      ref={ref}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0.00"
      value={value}
      label={label}
      leadingText="GHS"
      error={error ?? (overMax ? `Cannot be more than ${formatGHS(max!)}.` : undefined)}
      onChange={(e) => {
        const next = sanitizeMoneyInput(e.target.value);
        onValueChange(next, parseMoney(next));
      }}
      inputClassName="tabular-nums"
      {...props}
    />
  );
});

export default MoneyInput;
