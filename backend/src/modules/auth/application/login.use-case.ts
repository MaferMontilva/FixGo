import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { PASSWORD_HASHER, PasswordHasher } from "../domain/password-hasher";
import { AuthResponse } from "./auth-response";
import { AuthTokenFactory } from "./auth-token-factory";

export type LoginCommand = {
  email: string;
  password: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    private readonly authTokenFactory: AuthTokenFactory
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmail(command.email.trim().toLowerCase());

    if (!user?.passwordHash || !(await this.passwordHasher.compare(command.password, user.passwordHash))) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    if (user.status === "SUSPENDED") {
      throw new UnauthorizedException("Tu cuenta está suspendida. Contacta con la administración de FixGo.");
    }

    const { passwordHash: _passwordHash, status: _status, ...safeUser } = user;
    return this.authTokenFactory.createForUser(safeUser);
  }
}
