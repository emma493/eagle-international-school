import React, { useId } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  /** Right-aligned control in the card header (button, link, filter). */
  action?: React.ReactNode;
  /** false for tables and lists that run edge to edge. */
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** White card (8px radius, card shadow) with an optional titled header. */
export function SectionCard({ title, description, action, padded = true, className = "", children }: SectionCardProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={title ? headingId : undefined} className={`card shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-divider px-4 py-3 md:px-6">
          <div className="min-w-0">
            {title && <h2 id={headingId} className="text-body-lg font-bold text-text-primary">{title}</h2>}
            {description && <p className="text-meta text-text-secondary">{description}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? "p-4 md:p-6" : ""}>{children}</div>
    </section>
  );
}

export default SectionCard;
