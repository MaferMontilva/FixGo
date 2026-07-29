import { Module } from "@nestjs/common";
import { CreateNotificationService } from "./application/create-notification.use-case";
import { GetMyNotificationsUseCase } from "./application/get-my-notifications.use-case";
import { GetUnreadCountUseCase } from "./application/get-unread-count.use-case";
import { MarkNotificationReadUseCase } from "./application/mark-notification-read.use-case";
import { MarkNotificationsReadUseCase } from "./application/mark-notifications-read.use-case";
import { NOTIFICATIONS_REPOSITORY } from "./domain/notifications.repository";
import { PrismaNotificationsRepository } from "./infrastructure/prisma/prisma-notifications.repository";
import { NotificationsController } from "./presentation/http/notifications.controller";

@Module({
  controllers: [NotificationsController],
  providers: [
    CreateNotificationService,
    GetMyNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationsReadUseCase,
    MarkNotificationReadUseCase,
    {
      provide: NOTIFICATIONS_REPOSITORY,
      useClass: PrismaNotificationsRepository
    }
  ],
  exports: [CreateNotificationService]
})
export class NotificationsModule {}
