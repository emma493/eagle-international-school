import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "./useToast";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: "payment" | "canteen" | "credit" | "report" | "system";
  link_path?: string;
  is_read: number;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    try {
      const res = await apiRequest(`/api/notifications${unreadOnly ? "?unread_only=1" : ""}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      // Non-fatal — notifications may not be available yet
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiRequest("/api/notifications/unread");
      const data = await res.json();
      setUnreadCount(data.unread_count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PUT" });
      await fetchNotifications();
      await fetchUnreadCount();
      showToast("info", "Notification marked as read");
    } catch (err: any) {
      showToast("error", "Failed to mark as read", err.message);
    }
  }, [fetchNotifications, fetchUnreadCount, showToast]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
}
