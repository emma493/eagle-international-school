import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="mb-4" className={className}>
      {label && (
        <label
          className="block text-text-secondary text-xs font-500 mb-1.5 sentence-case"
        >
          {label}
        </label>
      )}
      <input
        className={`w-full h-52 px-4 text-17 border border-border-input rounded-input bg-card text-text-primary focus:border-brand-blue focus:ring-2 ring-brand-blue/20 focus:outline-none transition-colors duration-100 placeholder:text-text-placeholder ${error ? "border-alert-red" : ""}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-alert-red font-500">{error}</p>
      )}
    </div>
  );
}
