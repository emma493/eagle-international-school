import { useState, useEffect, useCallback } from "react";
import { db, SyncQueueEntry } from "@/dexie/db";
import { apiRequest } from "@/lib/api";
import { auth } from "@/firebase/config";
import { useToast } from "@/hooks/useToast";
import { markServerContact } from "@/lib/syncStatus";

export function useSync() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { showToast } = useToast();

  const countPending = useCallback(async () => {
    try {
      const uid = auth.currentUser?.uid;
      const pending = (await db.getPendingSync()).filter((m) => m.owner_uid === uid);
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    countPending();

    const handleOnline = () => {
      setIsOnline(true);
      flushSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(countPending, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [countPending]);

  const enqueue = useCallback(async (
    method: SyncQueueEntry["method"],
    path: string,
    body: any,
    idempotency_key: string
  ) => {
    await db.enqueueSync({ method, path, body, idempotency_key, created_at: 0, attempts: 0, owner_uid: auth.currentUser?.uid });
    await countPending();
    showToast("info", "Saved locally", "Will sync when connection returns", 3000);
  }, [countPending, showToast]);

  const flushSyncQueue = useCallback(async () => {
    if (!navigator.onLine || syncing) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const pending = (await db.getPendingSync()).filter((m) => m.owner_uid === uid);
    if (pending.length === 0) return;

    setSyncing(true);
    try {
      const res = await apiRequest("/api/sync/batch", {
        method: "POST",
        body: JSON.stringify({ mutations: pending.map(({ method, path, body, idempotency_key }) => ({ method, path, body, idempotency_key })) }),
      });

      if (!res.ok) {
        showToast("error", "Sync failed", "Server rejected batch. Will retry.", 4000);
        return;
      }

      const result = await res.json();
      markServerContact();
      const okKeys = (result.results || []).filter((r: any) => r.ok).map((r: any) => r.idempotency_key);
      if (okKeys.length) await db.sync_queue.where("idempotency_key").anyOf(okKeys).delete();
      if (result.failed === 0) {
        showToast("success", "Synced", `${result.processed} entries synchronized`, 3000);
      } else {
        showToast("warning", "Partial sync", `${result.failed} of ${result.processed} entries failed`, 4000);
      }
      await countPending();
    } catch (err: any) {
      showToast("error", "Sync error", err.message, 4000);
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
