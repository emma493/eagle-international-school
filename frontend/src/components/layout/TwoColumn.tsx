import React from "react";

/** Main feed plus a right rail. Stacks below 1280px (rail content follows the feed); side by side at 1280px and up. */
export function TwoColumn({
  children,
  aside,
  asideLabel = "Related information",
  className = "",
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  asideLabel?: string;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:gap-6 ${aside ? "xl:grid-cols-feed-aside" : ""} ${className}`}>
      <div className="min-w-0 space-y-4 md:space-y-6">{children}</div>
      {aside && (
        <aside aria-label={asideLabel} className="min-w-0 space-y-4 md:space-y-6">
          {aside}
        </aside>
      )}
    </div>
  );
}

export default TwoColumn;
