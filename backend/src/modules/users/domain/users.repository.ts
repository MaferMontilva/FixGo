import { UserEntity } from "./user.entity";

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");

export abstract class UsersRepository {
  abstract findById(userId: number): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
}
