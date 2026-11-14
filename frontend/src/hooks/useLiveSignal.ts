import { useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "@/firebase/config";

/** Subscribes to live_signals/{entityId}; calls onChange whenever the worker bumps the timestamp. */
export function useLiveSignal(entityId: string | null | undefined, onChange: () => void) {
  useEffect(() => {
    if (!entityId || !import.meta.env.VITE_FIREBASE_DATABASE_URL) return;
    let first = true;
    const off = onValue(ref(getDatabase(app), `live_signals/${entityId}`), () => {
      if (first) { first = false; return; }
      onChange();
    });
    return () => off();
  }, [entityId]);
}
