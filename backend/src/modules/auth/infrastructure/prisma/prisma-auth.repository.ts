import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { AuthSessionEntity } from "../../domain/auth-session.entity";
import { AuthUser } from "../../domain/auth-user";
import { AuthRepository, RegisterClientData, UserWithPassword } from "../../domain/auth.repository";

type UserRecord = {
  id: number;
  email: string | null;
  passwordHash?: string | null;
  firstName: string;
  lastName: string;
};

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) return null;

    return {
      ...this.toAuthUser(user, await this.findRolesByUserId(user.id)),
      passwordHash: user.passwordHash
    };
  }

  async findUserById(userId: number): Promise<AuthUser | null> {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) return null;

    return this.toAuthUser(user, await this.findRolesByUserId(user.id));
  }

  async registerClient(data: RegisterClientData): Promise<AuthUser> {
    const now = new Date().toISOString();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          preferredLanguage: "es",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now
        }
      });

      const clientRole = await tx.roles.findUnique({ where: { code: "CLIENT" } });
      if (!clientRole) throw new Error("El rol CLIENT no existe.");

      await tx.userRoles.create({
        data: {
          userId: user.id,
          roleId: clientRole.id,
          assignedAt: now
        }
      });

      await tx.clientProfiles.create({
        data: {
          userId: user.id,
          displayName: `${data.firstName} ${data.lastName}`,
          createdAt: now,
          updatedAt: now
        }
      });

      return this.toAuthUser(user, ["CLIENT"]);
    });
  }

  async createSession(userId: number, refreshTokenHash: string, expiresAt: string): Promise<AuthSessionEntity> {
    const now = new Date().toISOString();
    const session = await this.prisma.authSessions.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
        createdAt: now
      }
    });

    return session;
  }

  async findSessionByRefreshHash(refreshTokenHash: string): Promise<AuthSessionEntity | null> {
    return this.prisma.authSessions.findUnique({ where: { refreshTokenHash } });
  }

  async revokeSession(sessionId: number, revokedAt: string): Promise<void> {
    await this.prisma.authSessions.update({
      where: { id: sessionId },
      data: { revokedAt }
    });
  }

  private async findRolesByUserId(userId: number) {
    const userRoles = await this.prisma.userRoles.findMany({ where: { userId } });
    const roles = await this.prisma.roles.findMany({
      where: { id: { in: userRoles.map((userRole) => userRole.roleId) } }
    });

    return roles.map((role) => role.code);
  }

  private toAuthUser(user: UserRecord, roles: string[]): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles
    };
  }
}
