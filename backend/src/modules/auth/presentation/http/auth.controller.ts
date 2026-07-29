import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ChangePasswordUseCase } from "../../application/change-password.use-case";
import { LoginUseCase } from "../../application/login.use-case";
import { LogoutUseCase } from "../../application/logout.use-case";
import { RefreshSessionUseCase } from "../../application/refresh-token.use-case";
import { RegisterClientUseCase } from "../../application/register-client.use-case";
import { RegisterProfessionalUseCase } from "../../application/register-professional.use-case";
import { ResetPasswordUseCase } from "../../application/reset-password.use-case";
import { CurrentUser, RequestUser } from "../current-user";
import { JwtAuthGuard } from "../jwt-auth.guard";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { LoginDto } from "../dto/login.dto";
import { LogoutDto } from "../dto/logout.dto";
import { RefreshSessionDto } from "../dto/refresh-session.dto";
import { RegisterClientDto } from "../dto/register-client.dto";
import { RegisterProfessionalDto } from "../dto/register-professional.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly registerProfessionalUseCase: RegisterProfessionalUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase
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

  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto);
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

  @Post("change-password")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    return this.changePasswordUseCase.execute({ userId: user.id, password: dto.password });
  }
}
