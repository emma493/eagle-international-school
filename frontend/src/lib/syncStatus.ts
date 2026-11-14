import { useSyncExternalStore } from "react";

/**
 * Time of the last successful contact with the server (any API response or a queue flush).
 * Read by the sync indicator tooltip. Module-level so every hook instance shares it.
 */
let lastSyncAt: number | null = null;
const listeners = new Set<() => void>();

export function markServerContact(at: number = Date.now()) {
  lastSyncAt = at;
  listeners.forEach((l) => l());
}

export function useLastSyncAt(): number | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => lastSyncAt,
    () => null
  );
}
