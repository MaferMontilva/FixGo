import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationEntity } from "../domain/notification.entity";
import { NOTIFICATIONS_REPOSITORY, NotificationsRepository } from "../domain/notifications.repository";

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repository: NotificationsRepository
  ) {}

  async execute(id: number, userId: number): Promise<NotificationEntity> {
    const notification = await this.repository.markRead(id, userId);

    if (!notification) {
      throw new NotFoundException("La notificacion no existe.");
    }

    return notification;
  }
}
