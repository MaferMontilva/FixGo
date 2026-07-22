import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ClientProfileEntity } from "../../domain/client-profile.entity";
import { ClientsRepository, UpdateClientProfileData } from "../../domain/clients.repository";

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProfileByUserId(userId: number): Promise<ClientProfileEntity | null> {
    return this.prisma.clientProfiles.findUnique({ where: { userId } });
  }

  async updateProfile(userId: number, data: UpdateClientProfileData): Promise<ClientProfileEntity> {
    return this.prisma.clientProfiles.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      }
    });
  }
}
