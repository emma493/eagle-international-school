import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "border-none rounded-input font-bold text-17 px-4 transition-colors duration-100 focus:outline-none focus:ring-2 ring-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary:
      "bg-brand-blue text-white hover:bg-brand-blue-hover",
    secondary:
      "bg-neutral-secondary text-text-primary hover:bg-neutral-hover",
    success:
      "bg-success-green text-white hover:bg-success-green-hover",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
