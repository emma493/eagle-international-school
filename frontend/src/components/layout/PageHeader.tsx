import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/icons";

export interface Crumb {
  label: string;
  /** Omit on the current page (the last crumb). */
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Right-aligned primary action(s); wraps under the title on phones. */
  actions?: React.ReactNode;
  /** Shown from 768px up. */
  breadcrumbs?: Crumb[];
}

/**
 * Standard page heading: the one <h1> on the page (it receives focus on navigation),
 * optional subtitle, breadcrumb on desktop, and a right-aligned action slot.
 */
export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-4 md:mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 hidden md:block">
          <ol className="flex flex-wrap items-center gap-1 text-meta text-text-secondary">
            {breadcrumbs.map((c, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                  {c.to && !last ? (
                    <Link to={c.to} className="rounded font-semibold text-brand-blue hover:underline">{c.label}</Link>
                  ) : (
                    <span aria-current={last ? "page" : undefined}>{c.label}</span>
                  )}
                  {!last && <Icon name="chevron-right" size={16} />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="break-words text-display font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-body text-text-secondary">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
