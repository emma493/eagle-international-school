import React, { useCallback, useEffect, useState } from "react";
import { Toast } from "./Toast";

export interface ToastState extends Omit<Toast, "id"> {
  id: string;
}

let toastId = 0;
const MAX_VISIBLE = 4;

/**
 * Stack of toasts: top-centre on phones, top-right from 768px. Newest at the bottom of the stack,
 * at most four at once. Anything can call `useToast().showToast(...)`, which reaches this through
 * window.__showToast (kept so existing callers do not change).
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback((toast: Omit<ToastState, "id">) => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { ...toast, id }].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    (window as any).__showToast = addToast;
    return () => {
      if ((window as any).__showToast === addToast) delete (window as any).__showToast;
    };
  }, [addToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-topbar z-[60] flex flex-col items-center gap-2 p-4 md:inset-x-auto md:right-0 md:items-end">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

export default ToastContainer;
