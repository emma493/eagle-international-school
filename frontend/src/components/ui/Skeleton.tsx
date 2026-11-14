import React from "react";

/** Grey pulsing block. Decorative: hidden from screen readers. Size it with classes (h-4 w-1/2). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-input bg-neutral-secondary ${className}`} />;
}

export function SkeletonCircle({ size = 40 }: { size?: 24 | 32 | 40 | 56 | 80 }) {
  const cls = { 24: "h-6 w-6", 32: "h-8 w-8", 40: "h-10 w-10", 56: "h-14 w-14", 80: "h-20 w-20" }[size];
  return <span aria-hidden="true" className={`block flex-shrink-0 animate-pulse rounded-full bg-neutral-secondary ${cls}`} />;
}

/** Lines of text; the last line is shorter. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** Placeholder for an avatar row (ListRow shape). */
export function SkeletonRow() {
  return (
    <div aria-hidden="true" className="flex min-h-btn items-center gap-3 px-3 py-2">
      <SkeletonCircle />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-pill" />
    </div>
  );
}

export interface SkeletonListProps {
  rows?: number;
  /** Spoken to screen readers while loading. */
  label?: string;
  className?: string;
}

/** A list of placeholder rows with one polite "Loading" announcement. */
export function SkeletonList({ rows = 5, label = "Loading", className = "" }: SkeletonListProps) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

/** Placeholder for a stat card (icon, figure, caption). */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`card shadow-card space-y-3 p-4 ${className}`}>
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export default Skeleton;
