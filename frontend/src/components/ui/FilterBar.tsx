import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";
import { SearchInput } from "@/components/ui/SearchInput";

export interface FilterBarProps {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string };
  /** Filter controls: FilterChip, Select or SegmentedControl. */
  children?: React.ReactNode;
  /** How many filters are active. Shows "Clear filters" when above zero. */
  activeCount?: number;
  onClear?: () => void;
  /** Result line, for example "24 students". Announced politely when it changes. */
  resultLabel?: string;
  className?: string;
}

/** Search field, filter controls, a clear button and a result count in one row that wraps on phones. */
export function FilterBar({ search, children, activeCount = 0, onClear, resultLabel, className = "" }: FilterBarProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {search ? (
          <div className="min-w-0 md:max-w-sm md:flex-1">
            <SearchInput value={search.value} onValueChange={search.onChange} placeholder={search.placeholder} label={search.label} aria-label={search.label ? undefined : search.placeholder ?? "Search"} />
          </div>
        ) : null}
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
        {activeCount > 0 && onClear ? (
          <Button variant="ghost" size="compact" leadingIcon="close" onClick={onClear}>
            Clear filters ({activeCount})
          </Button>
        ) : null}
      </div>
      {resultLabel ? (
        <p className="text-meta text-text-secondary" role="status" aria-live="polite">
          {resultLabel}
        </p>
      ) : null}
    </div>
  );
}

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** Optional count of matching items. */
  count?: number;
  disabled?: boolean;
}

/** Toggle chip (a department, a fee state). Selected shows a check, so state is not colour only. */
export function FilterChip({ label, selected, onToggle, count, disabled }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      className={`inline-flex h-touch items-center gap-1.5 rounded-pill border px-3 text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? "border-brand-blue bg-brand-blue-tint text-brand-blue" : "border-border-input bg-card text-text-primary enabled:hover:bg-neutral-hover"
      }`}
    >
      {selected ? <Icon name="check" size={16} /> : <Icon name="filter" size={16} className="text-text-secondary" />}
      {label}
      {count !== undefined ? <span className="text-meta tabular-nums text-text-secondary">{count}</span> : null}
    </button>
  );
}

export default FilterBar;
