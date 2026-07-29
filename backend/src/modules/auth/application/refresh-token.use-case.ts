import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { REFRESH_TOKEN_HASHER, RefreshTokenHasher } from "../domain/token-services";
import { AuthResponse } from "./auth-response";
import { AuthTokenFactory } from "./auth-token-factory";

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(REFRESH_TOKEN_HASHER) private readonly refreshTokenHasher: RefreshTokenHasher,
    private readonly authTokenFactory: AuthTokenFactory
  ) {}

  async execute(refreshToken: string): Promise<AuthResponse> {
    const session = await this.authRepository.findSessionByRefreshHash(this.refreshTokenHasher.hash(refreshToken));

    if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new UnauthorizedException("Sesión inválida.");
    }

    const user = await this.authRepository.findUserById(session.userId);

    if (!user) {
      throw new UnauthorizedException("Sesión inválida.");
    }

    await this.authRepository.revokeSession(session.id, new Date().toISOString());
    return this.authTokenFactory.createForUser(user);
  }
}
