import { useState, useEffect, useCallback } from "react";
import { db, SyncQueueEntry } from "@/dexie/db";
import { apiRequest } from "@/lib/api";
import { useToast } from "./useToast";

export function useSync() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { showToast } = useToast();

  const countPending = useCallback(async () => {
    try {
      const pending = await db.getPendingSync();
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    // Initial count
    countPending();

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      flushSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic refresh of pending count when online
    const interval = setInterval(countPending, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [countPending]);

  // Enqueue a mutation for offline sync
  const enqueue = useCallback(async (
    method: SyncQueueEntry["method"],
    path: string,
    body: any,
    idempotency_key: string
  ) => {
    await db.enqueueSync({ method, path, body, idempotency_key, created_at: 0, attempts: 0 });
    await countPending();
    showToast("info", "Saved locally", "Will sync when connection returns");
  }, [countPending, showToast]);

  // Flush the sync queue to the server
  const flushSyncQueue = useCallback(async () => {
    if (!isOnline || syncing) return;

    const pending = await db.getPendingSync();
    if (pending.length === 0) return;

    setSyncing(true);
    try {
      const res = await apiRequest("/api/sync/batch", {
        method: "POST",
        body: JSON.stringify({ mutations: pending }),
      });

      if (!res.ok) {
        showToast("error", "Sync failed", "Server rejected batch. Will retry.");
        return;
      }

      const result = await res.json();
      if (result.failed === 0) {
        await db.clearSync();
        showToast("success", "Synced", `${result.processed} entries synchronized`);
      } else {
        showToast("warning", "Partial sync", `${result.failed} of ${result.processed} entries failed`);
      }
      await countPending();
    } catch (err: any) {
      showToast("error", "Sync error", err.message);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing, countPending, showToast]);

  return {
    isOnline,
    pendingCount,
    syncing,
    enqueue,
    flushSyncQueue,
    countPending,
  };
}
