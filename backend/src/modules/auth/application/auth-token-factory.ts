import { Inject, Injectable } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import {
  ACCESS_TOKEN_SERVICE,
  AccessTokenService,
  REFRESH_TOKEN_GENERATOR,
  REFRESH_TOKEN_HASHER,
  RefreshTokenGenerator,
  RefreshTokenHasher
} from "../domain/token-services";
import { AuthUser } from "../domain/auth-user";
import { AuthResponse } from "./auth-response";

@Injectable()
export class AuthTokenFactory {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(ACCESS_TOKEN_SERVICE) private readonly accessTokenService: AccessTokenService,
    @Inject(REFRESH_TOKEN_GENERATOR) private readonly refreshTokenGenerator: RefreshTokenGenerator,
    @Inject(REFRESH_TOKEN_HASHER) private readonly refreshTokenHasher: RefreshTokenHasher
  ) {}

  async createForUser(user: AuthUser): Promise<AuthResponse> {
    const refreshToken = this.refreshTokenGenerator.generate();
    const refreshTokenHash = this.refreshTokenHasher.hash(refreshToken);
    const expiresAt = this.getRefreshExpiresAt();

    await this.authRepository.createSession(user.id, refreshTokenHash, expiresAt);

    return {
      accessToken: await this.accessTokenService.sign(user),
      refreshToken,
      user
    };
  }

  private getRefreshExpiresAt() {
    const ttlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);
    return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  }
}
