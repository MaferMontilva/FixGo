import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { GetCurrentUserUseCase } from "../../application/get-current-user.use-case";

@Controller("users")
export class UsersController {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.getCurrentUserUseCase.execute(user.id);
  }
}
