import { NotificationEntity } from "./notification.entity";

export const NOTIFICATIONS_REPOSITORY = Symbol("NOTIFICATIONS_REPOSITORY");

export type CreateNotificationData = {
  userId: number;
  type: string;
  title: string;
  body: string;
  dataJson?: string | null;
};

export abstract class NotificationsRepository {
  abstract create(input: CreateNotificationData): Promise<NotificationEntity>;
  abstract findByUserId(userId: number, limit: number): Promise<NotificationEntity[]>;
  abstract countUnread(userId: number): Promise<number>;
  abstract markAllRead(userId: number): Promise<void>;
  abstract markRead(id: number, userId: number): Promise<NotificationEntity | null>;
}
