import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { GetMyClientProfileUseCase } from "../../application/get-my-client-profile.use-case";
import { UpdateMyClientProfileUseCase } from "../../application/update-my-client-profile.use-case";
import { UpdateMyClientProfileDto } from "../dto/update-my-client-profile.dto";

@Controller("clients")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("CLIENT")
export class ClientsController {
  constructor(
    private readonly getMyClientProfileUseCase: GetMyClientProfileUseCase,
    private readonly updateMyClientProfileUseCase: UpdateMyClientProfileUseCase
  ) {}

  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return this.getMyClientProfileUseCase.execute(user.id);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateMyClientProfileDto) {
    return this.updateMyClientProfileUseCase.execute(user.id, dto);
  }
}
