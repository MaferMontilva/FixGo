import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepository } from "../domain/auth.repository";
import { PASSWORD_HASHER, PasswordHasher } from "../domain/password-hasher";
import { AuthResponse } from "./auth-response";
import { AuthTokenFactory } from "./auth-token-factory";

export type RegisterClientCommand = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  addressLine1: string;
  postalCode: string;
  city: string;
};

@Injectable()
export class RegisterClientUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    private readonly authTokenFactory: AuthTokenFactory
  ) {}

  async execute(command: RegisterClientCommand): Promise<AuthResponse> {
    const email = command.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException("Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.");
    }

    const user = await this.authRepository.registerClient({
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      email,
      passwordHash: await this.passwordHasher.hash(command.password),
      phone: command.phone.trim(),
      address: {
        addressLine1: command.addressLine1.trim(),
        postalCode: command.postalCode.trim(),
        city: command.city.trim()
      }
    });

    return this.authTokenFactory.createForUser(user);
  }
}
