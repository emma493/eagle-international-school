import React, { useState, useCallback } from "react";
import { Toast } from "./Toast";

export interface ToastState extends Omit<Toast, "id"> {
  id: string;
}

let toastId = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastState, "id">) => {
      const id = String(++toastId);
      setToasts((prev) => [...prev, { ...toast, id }]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose globally for components to use
  if (typeof window !== "undefined") {
    (window as any).__showToast = addToast;
  }

  return (
    <div className="pointer-events-none fixed top-0 right-0 z-[60] p-4 flex flex-col gap-2 w-full max-w-md">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
