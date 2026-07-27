import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { PASSWORD_HASHER, PasswordHasher } from "../domain/password-hasher";
import { AuthResponse } from "./auth-response";
import { AuthTokenFactory } from "./auth-token-factory";

export type RegisterProfessionalCommand = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName?: string | null;
  phone?: string | null;
};

@Injectable()
export class RegisterProfessionalUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    private readonly authTokenFactory: AuthTokenFactory
  ) {}

  async execute(command: RegisterProfessionalCommand): Promise<AuthResponse> {
    const email = command.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException("No se pudo completar el registro.");
    }

    const user = await this.authRepository.registerProfessional({
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      email,
      passwordHash: await this.passwordHasher.hash(command.password),
      businessName: command.businessName?.trim() || null,
      phone: command.phone?.trim() || null
    });

    return this.authTokenFactory.createForUser(user);
  }
}
