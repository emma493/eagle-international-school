import React from "react";

const bar = "rounded bg-neutral-secondary";

/** Placeholder shown while a route loads. Same outer spacing as PageContainer so nothing jumps when content arrives. */
export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-page px-4 py-4 md:px-6 md:py-6">
      <span className="sr-only">Loading page</span>
      <div className="motion-safe:animate-pulse" aria-hidden="true">
        <div className={`${bar} mb-2 h-8 w-1/3`} />
        <div className={`${bar} mb-6 h-4 w-1/2`} />
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card h-24" />
          <div className="card h-24" />
          <div className="card h-24" />
        </div>
        <div className="card h-48" />
      </div>
    </div>
  );
}

export default PageSkeleton;
