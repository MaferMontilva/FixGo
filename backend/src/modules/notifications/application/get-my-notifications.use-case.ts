import { Inject, Injectable } from "@nestjs/common";
import { NotificationEntity } from "../domain/notification.entity";
import { NOTIFICATIONS_REPOSITORY, NotificationsRepository } from "../domain/notifications.repository";

const DEFAULT_LIMIT = 30;

@Injectable()
export class GetMyNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repository: NotificationsRepository
  ) {}

  execute(userId: number): Promise<NotificationEntity[]> {
    return this.repository.findByUserId(userId, DEFAULT_LIMIT);
  }
}
