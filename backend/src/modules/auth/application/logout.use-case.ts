import { Inject, Injectable } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { REFRESH_TOKEN_HASHER, RefreshTokenHasher } from "../domain/token-services";

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(REFRESH_TOKEN_HASHER) private readonly refreshTokenHasher: RefreshTokenHasher
  ) {}

  async execute(userId: number, refreshToken: string): Promise<{ success: true }> {
    const session = await this.authRepository.findSessionByRefreshHash(this.refreshTokenHasher.hash(refreshToken));

    if (session && session.userId === userId && !session.revokedAt) {
      await this.authRepository.revokeSession(session.id, new Date().toISOString());
    }

    return { success: true };
  }
}
