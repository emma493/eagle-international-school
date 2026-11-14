import { useEffect, useState } from "react";

/** Tracks a CSS media query. Reads the real value on first render so layouts don't flash. */
export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Breakpoints used by the app shell (Tailwind md = 768px, lg = 1024px). */
export const MQ_MD = "(min-width: 768px)";
export const MQ_LG = "(min-width: 1024px)";
