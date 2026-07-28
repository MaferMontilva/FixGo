import { Inject, Injectable } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { PASSWORD_HASHER, PasswordHasher } from "../domain/password-hasher";

export type ChangePasswordCommand = {
  userId: number;
  password: string;
};

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(command: ChangePasswordCommand): Promise<{ changed: true }> {
    const passwordHash = await this.passwordHasher.hash(command.password);
    await this.authRepository.setPasswordById(command.userId, passwordHash);
    return { changed: true };
  }
}
