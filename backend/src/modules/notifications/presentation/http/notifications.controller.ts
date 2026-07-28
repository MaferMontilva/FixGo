import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { GetMyNotificationsUseCase } from "../../application/get-my-notifications.use-case";
import { GetUnreadCountUseCase } from "../../application/get-unread-count.use-case";
import { MarkNotificationReadUseCase } from "../../application/mark-notification-read.use-case";
import { MarkNotificationsReadUseCase } from "../../application/mark-notifications-read.use-case";
import { NotificationEntity } from "../../domain/notification.entity";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly getMyNotificationsUseCase: GetMyNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markNotificationsReadUseCase: MarkNotificationsReadUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase
  ) {}

  @Get()
  async findMine(@CurrentUser() user: RequestUser) {
    const notifications = await this.getMyNotificationsUseCase.execute(user.id);
    return notifications.map((notification) => this.toResponse(notification));
  }

  @Get("unread-count")
  async unreadCount(@CurrentUser() user: RequestUser) {
    const count = await this.getUnreadCountUseCase.execute(user.id);
    return { count };
  }

  @Post("read")
  @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser() user: RequestUser) {
    await this.markNotificationsReadUseCase.execute(user.id);
    return { success: true };
  }

  @Post(":id/read")
  @HttpCode(HttpStatus.OK)
  async markRead(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    return this.toResponse(await this.markNotificationReadUseCase.execute(id, user.id));
  }

  private toResponse(notification: NotificationEntity) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.dataJson ? JSON.parse(notification.dataJson) : null,
      status: notification.status,
      createdAt: notification.createdAt,
      readAt: notification.readAt
    };
  }
}
