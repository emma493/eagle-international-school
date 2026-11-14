import React from "react";
import { Icon } from "@/components/ui/icons";

export interface ListRowProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned text such as an amount or a time. */
  meta?: React.ReactNode;
  /** Right-aligned node such as a StatusPill or CountBadge. */
  trailing?: React.ReactNode;
  /** Show a chevron to signal the row opens something. */
  chevron?: boolean;
  /** Marks the current choice with a check icon and a blue tint. */
  selected?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Render as a link instead of a button. */
  href?: string;
  /** Render with another element or component, for example a router Link (pass its props alongside). */
  as?: React.ElementType;
  className?: string;
  [extra: string]: unknown;
}

/** A 48px+ list item: leading avatar or icon, title and subtitle, right-side meta, optional chevron. */
export function ListRow({ leading, title, subtitle, meta, trailing, chevron, selected, disabled, onClick, href, as, className = "", ...rest }: ListRowProps) {
  const interactive = Boolean(onClick || href || as);
  const Tag: React.ElementType = as ?? (href ? "a" : onClick ? "button" : "div");
  const tagProps: Record<string, unknown> = { ...rest };
  if (Tag === "button") {
    tagProps.type = "button";
    tagProps.disabled = disabled;
  } else if (disabled) {
    tagProps["aria-disabled"] = true;
  }
  if (href) tagProps.href = href;
  if (selected) tagProps["aria-current"] = "true";

  const tone = selected ? "bg-brand-blue-tint" : interactive && !disabled ? "hover:bg-neutral-hover" : "";
  return (
    <Tag
      onClick={disabled ? undefined : onClick}
      className={`flex min-h-btn w-full items-center gap-3 rounded-card px-3 py-2 text-left transition-colors ${tone} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      {...tagProps}
    >
      {leading ? <span className="flex-shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-body font-semibold ${selected ? "text-brand-blue" : "text-text-primary"}`}>{title}</span>
        {subtitle ? <span className="block truncate text-meta text-text-secondary">{subtitle}</span> : null}
      </span>
      {meta ? <span className="flex-shrink-0 text-meta text-text-secondary tabular-nums">{meta}</span> : null}
      {trailing ? <span className="flex-shrink-0">{trailing}</span> : null}
      {selected ? <Icon name="check-circle" size={20} className="text-brand-blue" title="Selected" /> : chevron ? <Icon name="chevron-right" size={20} className="text-text-secondary" /> : null}
    </Tag>
  );
}

export default ListRow;
