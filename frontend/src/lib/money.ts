// Money helpers. All amounts in the app are Ghana cedis (GHS).

const NUMBER = new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "GHS 1,250.00". Negative amounts keep a leading minus so the sign is readable without colour. */
export function formatGHS(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${n < 0 ? "-" : ""}GHS ${NUMBER.format(Math.abs(n))}`;
}

/** Keeps digits and one decimal point, at most two decimals. Used while the person types. */
export function sanitizeMoneyInput(raw: string): string {
  let s = raw.replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  return s.replace(/^0+(?=\d)/, "");
}

/** Parses sanitised input. Returns null for empty or "." so callers can tell "nothing entered". */
export function parseMoney(value: string): number | null {
  if (value === "" || value === ".") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
