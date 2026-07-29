import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ClientProfileSummary, UserEntity } from "../../domain/user.entity";
import { UsersRepository } from "../../domain/users.repository";

type UserRecord = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  status: string;
};

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: number): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) return null;

    return this.toUserEntity(user, await this.findRoles(user.id), await this.findClientProfile(user.id));
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) return null;

    return this.toUserEntity(user, await this.findRoles(user.id), await this.findClientProfile(user.id));
  }

  private async findRoles(userId: number): Promise<string[]> {
    const userRoles = await this.prisma.userRoles.findMany({ where: { userId } });
    const roles = await this.prisma.roles.findMany({
      where: { id: { in: userRoles.map((userRole) => userRole.roleId) } }
    });

    return roles.map((role) => role.code);
  }

  private async findClientProfile(userId: number): Promise<ClientProfileSummary | null> {
    const profile = await this.prisma.clientProfiles.findUnique({ where: { userId } });

    if (!profile) return null;

    return {
      id: profile.id,
      displayName: profile.displayName,
      notes: profile.notes
    };
  }

  private toUserEntity(user: UserRecord, roles: string[], clientProfile: ClientProfileSummary | null): UserEntity {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles,
      clientProfile
    };
  }
}
