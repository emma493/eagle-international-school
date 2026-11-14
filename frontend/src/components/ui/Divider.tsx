import React from "react";

export interface DividerProps {
  /** Indent the line so it starts under the text, past a leading avatar or icon. */
  inset?: boolean;
  className?: string;
}

export function Divider({ inset = false, className = "" }: DividerProps) {
  return <div role="separator" className={`h-px bg-divider ${inset ? "ml-16" : ""} ${className}`} />;
}

export default Divider;
