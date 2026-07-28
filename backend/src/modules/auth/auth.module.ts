import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthTokenFactory } from "./application/auth-token-factory";
import { ChangePasswordUseCase } from "./application/change-password.use-case";
import { LoginUseCase } from "./application/login.use-case";
import { LogoutUseCase } from "./application/logout.use-case";
import { RefreshSessionUseCase } from "./application/refresh-token.use-case";
import { RegisterClientUseCase } from "./application/register-client.use-case";
import { RegisterProfessionalUseCase } from "./application/register-professional.use-case";
import { ResetPasswordUseCase } from "./application/reset-password.use-case";
import { AUTH_REPOSITORY } from "./domain/auth.repository";
import { PASSWORD_HASHER } from "./domain/password-hasher";
import {
  ACCESS_TOKEN_SERVICE,
  REFRESH_TOKEN_GENERATOR,
  REFRESH_TOKEN_HASHER
} from "./domain/token-services";
import { BcryptjsPasswordHasher } from "./infrastructure/bcryptjs-password-hasher";
import { JwtAccessTokenService } from "./infrastructure/jwt-access-token.service";
import { JwtStrategy } from "./infrastructure/jwt.strategy";
import { NodeRefreshTokenGenerator } from "./infrastructure/node-refresh-token-generator";
import { PrismaAuthRepository } from "./infrastructure/prisma/prisma-auth.repository";
import { Sha256RefreshTokenHasher } from "./infrastructure/sha256-refresh-token-hasher";
import { AuthController } from "./presentation/http/auth.controller";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard";
import { RolesGuard } from "./presentation/roles.guard";

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthTokenFactory,
    LoginUseCase,
    LogoutUseCase,
    RefreshSessionUseCase,
    RegisterClientUseCase,
    RegisterProfessionalUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptjsPasswordHasher
    },
    {
      provide: ACCESS_TOKEN_SERVICE,
      useClass: JwtAccessTokenService
    },
    {
      provide: REFRESH_TOKEN_GENERATOR,
      useClass: NodeRefreshTokenGenerator
    },
    {
      provide: REFRESH_TOKEN_HASHER,
      useClass: Sha256RefreshTokenHasher
    }
  ],
  exports: [JwtAuthGuard, RolesGuard]
})
export class AuthModule {}
