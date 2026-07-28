import { httpGet, httpPost } from "../../../shared/http/httpClient";
import type { NotificationItem, UnreadCount } from "../types/notification";

export function getNotifications() {
  return httpGet<NotificationItem[]>("/notifications");
}

export function getUnreadCount() {
  return httpGet<UnreadCount>("/notifications/unread-count");
}

export function markAllRead() {
  return httpPost<{ success: boolean }, Record<string, never>>("/notifications/read", {});
}

export function markRead(id: number) {
  return httpPost<NotificationItem, Record<string, never>>(`/notifications/${id}/read`, {});
}
