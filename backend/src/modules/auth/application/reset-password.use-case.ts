import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { PASSWORD_HASHER, PasswordHasher } from "../domain/password-hasher";

export type ResetPasswordCommand = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ updated: boolean }> {
    const email = command.email.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(email);

    const identityMatches =
      user !== null &&
      normalize(user.firstName) === normalize(command.firstName) &&
      normalize(user.lastName) === normalize(command.lastName);

    if (!identityMatches) {
      throw new UnauthorizedException("Los datos no coinciden con ninguna cuenta. Verifica tu nombre, apellido y correo.");
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const updated = await this.authRepository.updatePasswordByEmail(email, passwordHash);

    return { updated };
  }
}
