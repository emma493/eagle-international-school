import React from "react";
import { formatGHS } from "@/lib/money";

export type MoneyKind = "neutral" | "owing" | "credit";
export type MoneySize = "body" | "lg" | "title" | "display";

const SIZE: Record<MoneySize, string> = {
  body: "text-body font-semibold",
  lg: "text-body-lg font-bold",
  title: "text-title font-bold",
  display: "text-display font-bold",
};

const KIND: Record<MoneyKind, string> = {
  neutral: "text-text-primary",
  owing: "text-status-problem-text",
  credit: "text-status-good-text",
};

export interface MoneyProps {
  amount: number;
  /** owing and credit add a visible word, so colour is never the only signal. A negative neutral amount shows a minus sign and the problem colour. */
  kind?: MoneyKind;
  size?: MoneySize;
  /** Show the "owing" / "credit" word after the figure. Default true. */
  showLabel?: boolean;
  className?: string;
}

/** GHS figure with tabular numerals, so columns of amounts line up. */
export function Money({ amount, kind = "neutral", size = "body", showLabel = true, className = "" }: MoneyProps) {
  const negative = kind === "neutral" && amount < 0;
  const tone = negative ? KIND.owing : KIND[kind];
  return (
    <span className={`inline-flex items-baseline gap-1.5 tabular-nums ${SIZE[size]} ${tone} ${className}`}>
      <span>{formatGHS(amount)}</span>
      {showLabel && kind !== "neutral" ? <span className="text-meta font-semibold">{kind === "owing" ? "owing" : "credit"}</span> : null}
    </span>
  );
}

export default Money;
