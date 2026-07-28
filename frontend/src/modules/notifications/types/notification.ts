export type NotificationStatus = "PENDING" | "SENT" | "READ" | "FAILED";

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  status: NotificationStatus;
  createdAt: string;
  readAt: string | null;
};

export type UnreadCount = {
  count: number;
};
