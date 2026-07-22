import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USERS_REPOSITORY, UsersRepository } from "../domain/users.repository";

@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  async execute(userId: number) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException("Usuario no encontrado.");
    }

    return user;
  }
}
