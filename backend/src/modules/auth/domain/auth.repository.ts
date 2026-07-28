import { AuthSessionEntity } from "./auth-session.entity";
import { AuthUser } from "./auth-user";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export type RegisterClientData = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
};

export type RegisterProfessionalData = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  businessName?: string | null;
  phone?: string | null;
};

export type UserWithPassword = AuthUser & {
  passwordHash: string | null;
  status: string;
};

export abstract class AuthRepository {
  abstract findUserByEmail(email: string): Promise<UserWithPassword | null>;
  abstract findUserById(userId: number): Promise<AuthUser | null>;
  abstract updatePasswordByEmail(email: string, passwordHash: string): Promise<boolean>;
  abstract setPasswordById(userId: number, passwordHash: string): Promise<void>;
  abstract registerClient(data: RegisterClientData): Promise<AuthUser>;
  abstract registerProfessional(data: RegisterProfessionalData): Promise<AuthUser>;
  abstract createSession(userId: number, refreshTokenHash: string, expiresAt: string): Promise<AuthSessionEntity>;
  abstract findSessionByRefreshHash(refreshTokenHash: string): Promise<AuthSessionEntity | null>;
  abstract revokeSession(sessionId: number, revokedAt: string): Promise<void>;
}
