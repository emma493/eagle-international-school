import React, { useState, useEffect, useCallback } from "react";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { app } from "@/firebase/config";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

export interface FCMState {
  permission: "granted" | "denied" | "default" | "unsupported";
  token: string | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useFCM() {
  const [state, setState] = useState<FCMState>({
    permission: "default",
    token: null,
    isSupported: false,
    isLoading: false,
    error: null,
  });
  const { showToast } = useToast();

  useEffect(() => {
    let messaging: Messaging | null = null;

    const initFCM = async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          setState((prev) => ({ ...prev, isSupported: false }));
          return;
        }

        setState((prev) => ({ ...prev, isSupported: true, isLoading: true }));

        messaging = getMessaging(app);
        // Never opens the browser prompt by itself: the custom NotificationPrompt asks first,
        // then calls requestPermission(). Here we only resume when permission was already granted.
        const permission = Notification.permission;
        setState((prev) => ({ ...prev, permission }));

        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
          });

          if (token) {
            setState((prev) => ({ ...prev, token }));

            // Register token with the worker
            try {
              await apiRequest("/api/live-signals/fcm/register", {
                method: "POST",
                body: JSON.stringify({ token }),
              });
            } catch (err) {
              // Non-fatal: token registration with worker failed
              console.warn("FCM token registration with worker failed:", err);
            }
          }
        }

        // Listen for incoming FCM messages while in foreground
        onMessage(messaging, (payload) => {
          const notification = payload.notification;
          if (notification) {
            showToast("info", notification.title || "New update", notification.body || undefined, 6000);
          }
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err?.message || "FCM initialization failed",
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initFCM();

    return () => {
      if (messaging) {
        // Unsubscribe handlers would go here if needed
      }
    };
  }, [showToast]);

  const requestPermission = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
        });
        if (token) {
          setState((prev) => ({ ...prev, token }));
          try {
            await apiRequest("/api/live-signals/fcm/register", {
              method: "POST",
              body: JSON.stringify({ token }),
            });
          } catch (err) {
            console.warn("FCM token registration failed:", err);
          }
        }
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err?.message || "Failed to request permission",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [showToast]);

  return { ...state, requestPermission };
}
