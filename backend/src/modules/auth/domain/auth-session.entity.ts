export type AuthSessionEntity = {
  id: number;
  userId: number;
  refreshTokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};
