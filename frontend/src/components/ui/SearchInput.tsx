import React, { forwardRef } from "react";
import { Icon } from "@/components/ui/icons";
import { Input, type InputProps } from "@/components/ui/Input";

export interface SearchInputProps extends Omit<InputProps, "value" | "onChange" | "type" | "leading" | "leadingText" | "trailing" | "rows"> {
  value: string;
  onValueChange: (value: string) => void;
}

/** 52px search field with a search icon and a clear button once something is typed. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onValueChange, placeholder = "Search", className = "mb-0", "aria-label": ariaLabel, label, ...props },
  ref
) {
  return (
    <Input
      ref={ref}
      type="search"
      inputMode="search"
      autoComplete="off"
      enterKeyHint="search"
      value={value}
      placeholder={placeholder}
      label={label}
      aria-label={label ? undefined : ariaLabel ?? placeholder}
      onChange={(e) => onValueChange(e.target.value)}
      leading={<Icon name="search" size={20} />}
      trailing={
        value ? (
          <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => onValueChange("")}>
            <Icon name="close" size={20} />
          </button>
        ) : undefined
      }
      className={className}
      {...props}
    />
  );
});

export default SearchInput;
