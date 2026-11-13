import React from "react";

export const ROLE_PATHS: Record<string, string> = {
  admin: "/admin",
  headmaster: "/headmaster",
  teacher: "/teacher",
  parent: "/parent",
};

export function getRolePath(role: string | null): string {
  return ROLE_PATHS[role || ""] || "/login";
}
