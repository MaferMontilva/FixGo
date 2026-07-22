import { AuthUser } from "../domain/auth-user";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
