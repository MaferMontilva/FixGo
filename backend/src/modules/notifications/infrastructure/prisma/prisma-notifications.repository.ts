import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { NotificationEntity, NotificationStatus } from "../../domain/notification.entity";
import { CreateNotificationData, NotificationsRepository } from "../../domain/notifications.repository";

type NotificationRecord = {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  dataJson: string | null;
  status: string;
  createdAt: string;
  readAt: string | null;
};

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationData): Promise<NotificationEntity> {
    const now = new Date().toISOString();

    const created = await this.prisma.notifications.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        dataJson: input.dataJson ?? null,
        channel: "IN_APP",
        status: "SENT",
        sentAt: now,
        createdAt: now
      }
    });

    return this.toEntity(created as NotificationRecord);
  }

  async findByUserId(userId: number, limit: number): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notifications.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
      take: limit
    });

    return (notifications as NotificationRecord[]).map((notification) => this.toEntity(notification));
  }

  async countUnread(userId: number): Promise<number> {
    return this.prisma.notifications.count({ where: { userId, status: { not: "READ" } } });
  }

  async markAllRead(userId: number): Promise<void> {
    const now = new Date().toISOString();

    await this.prisma.notifications.updateMany({
      where: { userId, status: { not: "READ" } },
      data: { status: "READ", readAt: now }
    });
  }

  async markRead(id: number, userId: number): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notifications.findFirst({ where: { id, userId } });
    if (!notification) return null;

    const now = new Date().toISOString();

    await this.prisma.notifications.update({
      where: { id },
      data: { status: "READ", readAt: now }
    });

    const updated = await this.prisma.notifications.findUnique({ where: { id } });
    return this.toEntity(updated as NotificationRecord);
  }

  private toEntity(record: NotificationRecord): NotificationEntity {
    return {
      id: record.id,
      userId: record.userId,
      type: record.type,
      title: record.title,
      body: record.body,
      dataJson: record.dataJson,
      status: record.status as NotificationStatus,
      createdAt: record.createdAt,
      readAt: record.readAt
    };
  }
}
