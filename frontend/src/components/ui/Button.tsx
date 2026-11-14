import React, { forwardRef } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

export type ButtonVariant = "primary" | "success" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "compact";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** md = 48px, compact = 36px */
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner and ignores clicks. The label stays so the button does not change width. */
  loading?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
}

const BASE =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-input font-bold transition-colors duration-100 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:brightness-100";

const SIZE: Record<ButtonSize, string> = {
  md: "h-btn px-4 text-body-lg",
  compact: "h-btn-sm px-3 text-body",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand-blue text-white enabled:hover:bg-brand-blue-hover",
  success: "bg-success-green text-white enabled:hover:bg-success-green-hover",
  secondary: "bg-neutral-secondary text-text-primary enabled:hover:bg-neutral-secondary-hover",
  ghost: "bg-transparent text-brand-blue enabled:hover:bg-brand-blue-tint",
  // Uses the darker problem red so white text keeps enough contrast.
  danger: "bg-status-problem-text text-white enabled:hover:brightness-90",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    className = "",
    children,
    disabled,
    onClick,
    ...props
  },
  ref
) {
  const iconSize = size === "compact" ? 16 : 20;
  return (
    <button
      ref={ref}
      className={`${BASE} ${SIZE[size]} ${VARIANT[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {loading ? <Icon name="loader" size={iconSize} className="animate-spin" /> : leadingIcon ? <Icon name={leadingIcon} size={iconSize} /> : null}
      {children}
      {trailingIcon && !loading ? <Icon name={trailingIcon} size={iconSize} /> : null}
    </button>
  );
});

export default Button;
