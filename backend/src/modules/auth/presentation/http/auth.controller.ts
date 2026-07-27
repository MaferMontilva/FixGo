import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { LoginUseCase } from "../../application/login.use-case";
import { LogoutUseCase } from "../../application/logout.use-case";
import { RefreshSessionUseCase } from "../../application/refresh-token.use-case";
import { RegisterClientUseCase } from "../../application/register-client.use-case";
import { RegisterProfessionalUseCase } from "../../application/register-professional.use-case";
import { CurrentUser, RequestUser } from "../current-user";
import { JwtAuthGuard } from "../jwt-auth.guard";
import { LoginDto } from "../dto/login.dto";
import { LogoutDto } from "../dto/logout.dto";
import { RefreshSessionDto } from "../dto/refresh-session.dto";
import { RegisterClientDto } from "../dto/register-client.dto";
import { RegisterProfessionalDto } from "../dto/register-professional.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly registerProfessionalUseCase: RegisterProfessionalUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) {}

  @Post("register")
  register(@Body() dto: RegisterClientDto) {
    return this.registerClientUseCase.execute(dto);
  }

  @Post("register-professional")
  registerProfessional(@Body() dto: RegisterProfessionalDto) {
    return this.registerProfessionalUseCase.execute(dto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post("refresh")
  @HttpCode(200)
  refresh(@Body() dto: RefreshSessionDto) {
    return this.refreshSessionUseCase.execute(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: RequestUser, @Body() dto: LogoutDto) {
    return this.logoutUseCase.execute(user.id, dto.refreshToken);
  }
}
