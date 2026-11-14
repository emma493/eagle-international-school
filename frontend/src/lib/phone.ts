// Ghana mobile number helpers (local format 024XXXXXXX, 10 digits).
// Pure functions: no firebase or React imports, so they are safe to use anywhere.

const NETWORK_PREFIXES = ["020", "023", "024", "025", "026", "027", "028", "029", "050", "053", "054", "055", "056", "057", "059"];

export type PhoneStatus = "empty" | "partial" | "valid" | "invalid";

export interface PhoneCheck {
  status: PhoneStatus;
  /** Digits in local format (024XXXXXXX) when the input could be converted. */
  local: string;
  /** Plain-language reason for "partial" and "invalid". */
  message?: string;
}

/** Converts +233 / 233 / 00233 forms to the local 0XXXXXXXXX form. Leaves anything else alone. */
export function toLocalGhana(raw: string): string {
  const s = raw.replace(/[\s\-().]/g, "");
  const m = s.match(/^(?:\+|00)?233(\d*)$/);
  return m ? "0" + m[1] : s;
}

export function checkGhanaPhone(raw: string): PhoneCheck {
  const local = toLocalGhana(raw);
  if (local === "") return { status: "empty", local };
  if (!/^\d+$/.test(local)) return { status: "invalid", local, message: "Use digits only, for example 0241234567." };
  if (local[0] !== "0") return { status: "invalid", local, message: "Start with 0, for example 0241234567." };
  if (local.length > 10) return { status: "invalid", local, message: "That is more than 10 digits." };
  if (local.length >= 3 && !NETWORK_PREFIXES.includes(local.slice(0, 3))) {
    return { status: "invalid", local, message: "That network prefix is not recognised." };
  }
  if (local.length < 10) {
    const left = 10 - local.length;
    return { status: "partial", local, message: `${left} more ${left === 1 ? "digit" : "digits"} needed.` };
  }
  return { status: "valid", local };
}
