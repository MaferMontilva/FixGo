import { AuthUser } from "./auth-user";

export const ACCESS_TOKEN_SERVICE = Symbol("ACCESS_TOKEN_SERVICE");
export const REFRESH_TOKEN_GENERATOR = Symbol("REFRESH_TOKEN_GENERATOR");
export const REFRESH_TOKEN_HASHER = Symbol("REFRESH_TOKEN_HASHER");

export type AccessTokenPayload = {
  sub: number;
  email: string | null;
  roles: string[];
};

export abstract class AccessTokenService {
  abstract sign(user: AuthUser): Promise<string>;
}

export abstract class RefreshTokenGenerator {
  abstract generate(): string;
}

export abstract class RefreshTokenHasher {
  abstract hash(token: string): string;
}
