import React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";

export interface PaginationProps {
  /** Current page, starting at 1. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Page list with ellipses: 1 ... 4 5 6 ... 12. Phones show Previous, "Page x of y" and Next only. */
function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);
  if (start > 2) out.push("gap");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < count - 1) out.push("gap");
  out.push(count);
  return out;
}

export function Pagination({ page, pageCount, onChange, className = "" }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className={`flex items-center justify-between gap-2 ${className}`}>
      <Button variant="secondary" size="compact" leadingIcon="chevron-left" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <p className="text-meta font-semibold text-text-secondary sm:hidden" aria-live="polite">
        Page {page} of {pageCount}
      </p>
      <ul className="hidden items-center gap-1 sm:flex">
        {pageList(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-text-secondary">
              ...
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`h-touch min-w-touch rounded-input px-2 text-body font-semibold tabular-nums transition-colors ${
                  p === page ? "bg-brand-blue-tint text-brand-blue" : "text-text-primary hover:bg-neutral-hover"
                }`}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>
      <Button variant="secondary" size="compact" trailingIcon="chevron-right" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}

export interface LoadMoreProps {
  shown: number;
  total: number;
  onLoadMore: () => void;
  loading?: boolean;
  /** Noun for the count line, for example "students". */
  noun?: string;
  className?: string;
}

/** "Showing 20 of 84 students" with a Load more button. Renders only the count once all are shown. */
export function LoadMore({ shown, total, onLoadMore, loading = false, noun = "items", className = "" }: LoadMoreProps) {
  const done = shown >= total;
  return (
    <div className={`flex flex-col items-center gap-2 py-4 ${className}`}>
      <p className="flex items-center gap-1.5 text-meta text-text-secondary" aria-live="polite">
        {done ? <Icon name="check-circle" size={16} /> : null}
        {done ? `All ${total} ${noun} shown` : `Showing ${shown} of ${total} ${noun}`}
      </p>
      {!done ? (
        <Button variant="secondary" onClick={onLoadMore} loading={loading}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}

export default Pagination;
