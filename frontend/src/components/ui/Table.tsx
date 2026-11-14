import React, { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/StateViews";

export interface Column<T> {
  key: string;
  header: string;
  /** Cell content. Defaults to row[key]. */
  render?: (row: T) => React.ReactNode;
  /** Value used for sorting. Defaults to row[key]. Setting this (or sortable) makes the header a button. */
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  /** Right-align and use tabular numerals (money, counts). */
  numeric?: boolean;
  /** Hide this column in the stacked card layout. */
  hideOnCard?: boolean;
  /** Use as the card title below 640px. First column is used when none is marked. */
  primary?: boolean;
  className?: string;
}

export interface SortState {
  key: string;
  dir: "asc" | "desc";
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Accessible name for the table. */
  caption: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  /** Controlled sort. Omit to let the table sort itself. */
  sort?: SortState | null;
  onSortChange?: (s: SortState | null) => void;
  className?: string;
}

function cellValue<T>(col: Column<T>, row: T): React.ReactNode {
  if (col.render) return col.render(row);
  const v = (row as unknown as Record<string, unknown>)[col.key];
  return v === undefined || v === null ? "" : String(v);
}

function sortKey<T>(col: Column<T>, row: T): string | number {
  if (col.sortValue) return col.sortValue(row);
  const v = (row as unknown as Record<string, unknown>)[col.key];
  return typeof v === "number" ? v : String(v ?? "").toLowerCase();
}

/**
 * Data table: sticky header, row hover, sortable headers (aria-sort), no zebra. Below 640px each
 * row becomes a stacked card with "Label: value" lines, so nothing scrolls sideways at 360px.
 * Loading, empty and error states are built in.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  onRowClick,
  loading = false,
  error = false,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  sort: sortProp,
  onSortChange,
  className = "",
}: TableProps<T>) {
  const [inner, setInner] = useState<SortState | null>(null);
  const sort = sortProp !== undefined ? sortProp : inner;
  const setSort = (s: SortState | null) => (onSortChange ? onSortChange(s) : setInner(s));

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = sortKey(col, a);
      const y = sortKey(col, b);
      return x < y ? -dir : x > y ? dir : 0;
    });
  }, [rows, sort, columns]);

  const toggle = (key: string) => {
    if (!sort || sort.key !== key) setSort({ key, dir: "asc" });
    else if (sort.dir === "asc") setSort({ key, dir: "desc" });
    else setSort(null);
  };

  if (error) return <ErrorState onRetry={onRetry} />;
  if (loading) return <SkeletonList rows={6} label={`Loading ${caption}`} />;
  if (sorted.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} actionLabel={emptyActionLabel} onAction={onEmptyAction} />;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const cardCols = columns.filter((c) => c !== primary && !c.hideOnCard);
  const clickable = Boolean(onRowClick);

  const onRowKey = (e: React.KeyboardEvent, row: T) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <div className={className}>
      {/* 640px and up: real table */}
      <div className="hidden max-h-[70vh] overflow-auto rounded-card border border-divider bg-card sm:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => {
                const canSort = Boolean(c.sortable || c.sortValue);
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : canSort ? "none" : undefined}
                    className={`sticky top-0 z-10 border-b border-divider bg-card px-4 py-0 text-meta font-semibold text-text-secondary ${c.numeric ? "text-right" : ""}`}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className={`-mx-2 inline-flex h-touch items-center gap-1 rounded-input px-2 font-semibold hover:bg-neutral-hover ${c.numeric ? "flex-row-reverse" : ""} ${active ? "text-brand-blue" : ""}`}
                      >
                        {c.header}
                        <Icon name={active ? (sort?.dir === "asc" ? "chevron-up" : "chevron-down") : "arrow-up-down"} size={16} />
                      </button>
                    ) : (
                      <span className="inline-flex h-touch items-center">{c.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={clickable ? () => onRowClick?.(row) : undefined}
                onKeyDown={clickable ? (e) => onRowKey(e, row) : undefined}
                tabIndex={clickable ? 0 : undefined}
                className={`border-b border-divider last:border-b-0 ${clickable ? "cursor-pointer hover:bg-neutral-hover" : "hover:bg-neutral-hover"}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`min-h-btn px-4 py-3 text-body text-text-primary ${c.numeric ? "text-right tabular-nums" : ""} ${c.className ?? ""}`}>
                    {cellValue(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Below 640px: stacked cards */}
      <ul className="space-y-2 sm:hidden" aria-label={caption}>
        {sorted.map((row) => {
          const body = (
            <>
              <div className="text-body-lg font-bold text-text-primary">{cellValue(primary, row)}</div>
              <dl className="mt-2 space-y-1">
                {cardCols.map((c) => (
                  <div key={c.key} className="flex items-start justify-between gap-3">
                    <dt className="text-meta text-text-secondary">{c.header}</dt>
                    <dd className={`min-w-0 text-right text-body text-text-primary ${c.numeric ? "tabular-nums" : ""}`}>{cellValue(c, row)}</dd>
                  </div>
                ))}
              </dl>
            </>
          );
          return (
            <li key={rowKey(row)} className="card shadow-card">
              {clickable ? (
                <button type="button" onClick={() => onRowClick?.(row)} className="block min-h-touch w-full rounded-card p-4 text-left hover:bg-neutral-hover">
                  {body}
                </button>
              ) : (
                <div className="p-4">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Table;
