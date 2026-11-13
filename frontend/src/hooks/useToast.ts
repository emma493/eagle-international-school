import { useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export function useToast() {
  const showToast = useCallback(
    (type: ToastType, title: string, body?: string, duration?: number) => {
      if (typeof window !== "undefined" && (window as any).__showToast) {
        (window as any).__showToast({ type, title, body, duration });
      }
    },
    []
  );

  return { showToast };
}
