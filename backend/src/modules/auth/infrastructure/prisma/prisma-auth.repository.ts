import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { AuthSessionEntity } from "../../domain/auth-session.entity";
import { AuthUser } from "../../domain/auth-user";
import {
  AuthRepository,
  RegisterClientData,
  RegisterProfessionalData,
  UserWithPassword
} from "../../domain/auth.repository";

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
      ...this.toAuthUser(user, await this.findRolesByUserId(user.id), await this.readMustChangePassword(user.id)),
      passwordHash: user.passwordHash,
      status: user.status
    };
  }

  async findUserById(userId: number): Promise<AuthUser | null> {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) return null;

    return this.toAuthUser(user, await this.findRolesByUserId(user.id), await this.readMustChangePassword(user.id));
  }

  async updatePasswordByEmail(email: string, passwordHash: string): Promise<boolean> {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) return false;

    await this.prisma.users.update({
      where: { id: user.id },
      data: { passwordHash, updatedAt: new Date().toISOString() }
    });

    return true;
  }

  async setPasswordById(userId: number, passwordHash: string): Promise<void> {
    await this.prisma.users.update({
      where: { id: userId },
      data: { passwordHash, updatedAt: new Date().toISOString() }
    });
    // Al cambiar la clave se limpia la obligacion de cambiarla (SQL directo).
    await this.prisma.$executeRawUnsafe("UPDATE users SET must_change_password = 0 WHERE id = ?", userId);
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
          phoneNumber: data.phone,
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

      await tx.addresses.create({
        data: {
          userId: user.id,
          addressLine1: data.address.addressLine1,
          postalCode: data.address.postalCode,
          cityText: data.address.city,
          isDefault: 1,
          createdAt: now,
          updatedAt: now
        }
      });

      return this.toAuthUser(user, ["CLIENT"]);
    });
  }

  async registerProfessional(data: RegisterProfessionalData): Promise<AuthUser> {
    const now = new Date().toISOString();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phone,
          preferredLanguage: "es",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now
        }
      });

      const professionalRole = await tx.roles.findUnique({ where: { code: "PROFESSIONAL" } });
      if (!professionalRole) throw new Error("El rol PROFESSIONAL no existe.");

      await tx.userRoles.create({
        data: {
          userId: user.id,
          roleId: professionalRole.id,
          assignedAt: now
        }
      });

      const displayName = (data.businessName?.trim() || `${data.firstName} ${data.lastName}`).trim();
      const slugBase =
        displayName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "profesional";

      await tx.professionalProfiles.create({
        data: {
          userId: user.id,
          slug: `${slugBase}-${user.id}`,
          displayName,
          businessName: data.businessName?.trim() || null,
          phone: data.phone?.trim() || null,
          verificationStatus: "PENDING",
          profileStatus: "INCOMPLETE",
          ratingAverage: 0,
          createdAt: now,
          updatedAt: now
        }
      });

      await tx.addresses.create({
        data: {
          userId: user.id,
          addressLine1: data.address.addressLine1,
          postalCode: data.address.postalCode,
          cityText: data.address.city,
          isDefault: 1,
          createdAt: now,
          updatedAt: now
        }
      });

      return this.toAuthUser(user, ["PROFESSIONAL"]);
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

  private toAuthUser(user: UserRecord, roles: string[], mustChangePassword = false): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      mustChangePassword
    };
  }

  // El flag must_change_password se lee con SQL directo para no depender de
  // regenerar el cliente Prisma (la columna existe en la base).
  private async readMustChangePassword(userId: number): Promise<boolean> {
    const rows = await this.prisma.$queryRawUnsafe<{ must_change_password: number | bigint }[]>(
      "SELECT must_change_password FROM users WHERE id = ? LIMIT 1",
      userId
    );
    return rows.length > 0 && Number(rows[0].must_change_password) === 1;
  }
}
