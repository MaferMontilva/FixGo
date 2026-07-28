export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS";

export type NotificationStatus = "PENDING" | "SENT" | "READ" | "FAILED";

export type NotificationEntity = {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  dataJson: string | null;
  status: NotificationStatus;
  createdAt: string;
  readAt: string | null;
};
