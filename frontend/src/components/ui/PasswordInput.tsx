import React, { forwardRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Input, type InputProps } from "@/components/ui/Input";

export type PasswordInputProps = Omit<InputProps, "type" | "trailing" | "leading" | "leadingText" | "rows">;

/** 52px password field with a show / hide eye button. The button is 40px inside the 52px field and named for screen readers. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button type="button" className="icon-btn" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
          <Icon name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      }
      {...props}
    />
  );
});

export default PasswordInput;
