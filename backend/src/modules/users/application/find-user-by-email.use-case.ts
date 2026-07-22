import { Inject, Injectable } from "@nestjs/common";
import { USERS_REPOSITORY, UsersRepository } from "../domain/users.repository";

@Injectable()
export class FindUserByEmailUseCase {
  constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository) {}

  execute(email: string) {
    return this.usersRepository.findByEmail(email.trim().toLowerCase());
  }
}
