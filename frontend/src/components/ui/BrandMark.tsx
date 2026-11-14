import React from "react";

/**
 * School mark. Shows the uploaded crest (Cloudinary logo_url) when one is set,
 * otherwise the built-in SVG eagle crest. Same artwork as public/icon.svg.
 */
export const EAGLE_PATH =
  "M32 22 L35 24 L43 19.5 L50 13.5 L49 19.5 L52.5 21.5 L48.5 24.5 L50.5 28.5 L45.5 28.5 L46 32.5 L40 32 L36.5 37 L37.5 47 L32 52 L26.5 47 L27.5 37 L24 32 L18 32.5 L18.5 28.5 L13.5 28.5 L15.5 24.5 L11.5 21.5 L15 19.5 L14 13.5 L21 19.5 L29 24z M32 12.5a3.6 3.6 0 1 0 0 7.2a3.6 3.6 0 1 0 0-7.2z";

export interface BrandMarkProps {
  size?: number;
  logoUrl?: string | null;
  className?: string;
  /** Accessible name; defaults to the school name. Pass "" for decorative use. */
  title?: string;
}

export function BrandMark({ size = 32, logoUrl, className = "", title = "Eagle International School" }: BrandMarkProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        width={size}
        height={size}
        alt={title}
        className={`object-contain flex-shrink-0 ${className}`}
      />
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`flex-shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      focusable="false"
    >
      <path d="M32 3.5l23 8.5v17c0 14.5-9.8 25.2-23 31.5C18.800 54.200 9 43.500 9 29V12z" fill="#1877F2" />
      <path d="M32 3.5l23 8.5v17c0 14.5-9.8 25.2-23 31.5C18.800 54.200 9 43.500 9 29V12z" fill="none" stroke="#166FE5" strokeWidth="1.5" />
      <path d={EAGLE_PATH} fill="#FFFFFF" />
    </svg>
  );
}

export default BrandMark;
