import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { FindUserByEmailUseCase } from "./application/find-user-by-email.use-case";
import { GetCurrentUserUseCase } from "./application/get-current-user.use-case";
import { USERS_REPOSITORY } from "./domain/users.repository";
import { PrismaUsersRepository } from "./infrastructure/prisma/prisma-users.repository";
import { UsersController } from "./presentation/http/users.controller";

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    FindUserByEmailUseCase,
    GetCurrentUserUseCase,
    {
      provide: USERS_REPOSITORY,
      useClass: PrismaUsersRepository
    }
  ]
})
export class UsersModule {}
