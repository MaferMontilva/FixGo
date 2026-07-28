import { Inject, Injectable } from "@nestjs/common";
import { NOTIFICATIONS_REPOSITORY, NotificationsRepository } from "../domain/notifications.repository";

@Injectable()
export class MarkNotificationsReadUseCase {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repository: NotificationsRepository
  ) {}

  execute(userId: number): Promise<void> {
    return this.repository.markAllRead(userId);
  }
}
