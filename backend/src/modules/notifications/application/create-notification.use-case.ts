import { Inject, Injectable } from "@nestjs/common";
import { NotificationEntity } from "../domain/notification.entity";
import { NOTIFICATIONS_REPOSITORY, NotificationsRepository } from "../domain/notifications.repository";

export type CreateNotificationCommand = {
  userId: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
};

@Injectable()
export class CreateNotificationService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repository: NotificationsRepository
  ) {}

  execute(command: CreateNotificationCommand): Promise<NotificationEntity> {
    return this.repository.create({
      userId: command.userId,
      type: command.type,
      title: command.title,
      body: command.body,
      dataJson: command.data ? JSON.stringify(command.data) : null
    });
  }
}
