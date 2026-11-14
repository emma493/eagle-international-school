import React, { useState } from "react";

const SIZES = {
  24: "h-6 w-6 text-caption",
  32: "h-8 w-8 text-caption",
  40: "h-10 w-10 text-meta",
  56: "h-14 w-14 text-body-lg",
  80: "h-20 w-20 text-title",
  96: "h-24 w-24 text-title",
} as const;
export type AvatarSize = keyof typeof SIZES;

export function initialsOf(name?: string | null): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Cloudinary delivery URL with automatic format and quality, sized for the avatar (2x for sharp screens). */
export function optimisedPhoto(url: string, px: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/") || /\/upload\/[^/]*f_auto/.test(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${px * 2},h_${px * 2},c_fill,g_face/`);
}

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: AvatarSize;
  /** "neutral" grey (default) or "brand" blue tint, used for the signed-in user. */
  tone?: "neutral" | "brand";
  className?: string;
}

/** Round photo with an initials fallback. Decorative: the person's name is always shown beside it. */
export function Avatar({ name, src, size = 40, tone = "neutral", className = "" }: AvatarProps) {
  const toneClass = tone === "brand" ? "bg-brand-blue-tint text-brand-blue" : "bg-neutral-secondary text-text-secondary";
  const box = `${SIZES[size]} flex-shrink-0 overflow-hidden rounded-full ${className}`;
  // A broken or blocked photo falls back to initials instead of a broken-image icon.
  const [failed, setFailed] = useState<string | null>(null);
  if (src && failed !== src) {
    return (
      <img src={optimisedPhoto(src, size)} width={size} height={size} alt="" loading="lazy" decoding="async" onError={() => setFailed(src)} className={`${box} bg-neutral-secondary object-cover`} />
    );
  }
  return (
    <span aria-hidden="true" className={`${box} inline-flex items-center justify-center font-bold ${toneClass}`}>
      {initialsOf(name)}
    </span>
  );
}

export default Avatar;
