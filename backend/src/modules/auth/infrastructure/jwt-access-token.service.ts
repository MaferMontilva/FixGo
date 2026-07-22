import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthUser } from "../domain/auth-user";
import { AccessTokenPayload, AccessTokenService } from "../domain/token-services";

@Injectable()
export class JwtAccessTokenService implements AccessTokenService {
  constructor(private readonly jwtService: JwtService) {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET es obligatorio para iniciar autenticación.");
    }
  }

  async sign(user: AuthUser): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900)
    });
  }
}
