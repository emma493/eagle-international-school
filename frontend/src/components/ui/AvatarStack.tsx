import React from "react";
import { Avatar, type AvatarSize } from "@/components/ui/Avatar";

export interface AvatarStackPerson {
  name?: string | null;
  src?: string | null;
}

export interface AvatarStackProps {
  people: AvatarStackPerson[];
  /** Avatars drawn before the "+N" bubble. */
  max?: number;
  size?: Extract<AvatarSize, 24 | 32 | 40>;
  className?: string;
}

const OVERLAP: Record<24 | 32 | 40, string> = {
  24: "-space-x-1",
  32: "-space-x-2",
  40: "-space-x-2",
};

const BUBBLE: Record<24 | 32 | 40, string> = {
  24: "h-6 w-6",
  32: "h-8 w-8",
  40: "h-10 w-10",
};

/** Overlapping avatars with a "+N" bubble. Announces the names as one phrase. */
export function AvatarStack({ people, max = 4, size = 32, className = "" }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const names = people.map((p) => p.name).filter(Boolean) as string[];
  const label = names.length
    ? names.length <= max
      ? names.join(", ")
      : `${names.slice(0, max).join(", ")} and ${extra} more`
    : `${people.length} people`;
  return (
    <div role="group" aria-label={label} className={`flex items-center ${OVERLAP[size]} ${className}`}>
      {shown.map((p, i) => (
        <span key={i} className="inline-flex rounded-full ring-2 ring-card">
          <Avatar name={p.name} src={p.src} size={size} />
        </span>
      ))}
      {extra > 0 ? (
        <span
          aria-hidden="true"
          className={`inline-flex items-center justify-center rounded-full bg-neutral-secondary text-caption font-bold text-text-secondary ring-2 ring-card ${BUBBLE[size]}`}
        >
          {`+${extra}`}
        </span>
      ) : null}
    </div>
  );
}

export default AvatarStack;
